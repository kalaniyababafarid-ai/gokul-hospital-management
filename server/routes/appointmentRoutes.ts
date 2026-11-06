import { Router } from 'express';
import { getDb, runTransaction, createId, appendAuditLog } from '../services/db.ts';
import {
  extractUser,
  requireAuth,
  sanitizeString,
  type AuthenticatedRequest,
} from '../services/cryptoAuth.ts';
import type { AppointmentStatus } from '../../src/types/hospital.ts';
import { createSimulatedEmail } from '../services/demoConfig.ts';

export const appointmentRouter = Router();

// Role-filtered appointments list
appointmentRouter.get('/', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const db = getDb();

  const statusFilter = sanitizeString(req.query.status, 30);
  const dateFilter = sanitizeString(req.query.date, 20);
  const searchFilter = sanitizeString(req.query.search, 100).toLowerCase();

  let list = db.appointments;

  if (user.role === 'patient') {
    list = list.filter(
      (a) => a.patientId === user.userId || a.patientEmail.toLowerCase() === user.email.toLowerCase()
    );
  } else if (user.role === 'doctor') {
    const linkedDoctor = db.doctors.find((d) => d.id === user.doctorId || d.userId === user.userId);
    const docId = linkedDoctor ? linkedDoctor.id : user.doctorId;
    list = list.filter((a) => a.doctorId === docId);
  }

  if (statusFilter && statusFilter !== 'ALL') {
    list = list.filter((a) => a.status === statusFilter);
  }
  if (dateFilter) {
    list = list.filter((a) => a.appointmentDate === dateFilter);
  }
  if (searchFilter) {
    list = list.filter(
      (a) =>
        a.appointmentNumber.toLowerCase().includes(searchFilter) ||
        a.patientName.toLowerCase().includes(searchFilter) ||
        a.doctorName.toLowerCase().includes(searchFilter) ||
        a.departmentName.toLowerCase().includes(searchFilter) ||
        a.patientPhone.toLowerCase().includes(searchFilter)
    );
  }

  return res.json({ appointments: list });
});

appointmentRouter.get('/my', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const db = getDb();
  const list = db.appointments.filter(
    (a) => a.patientId === user.userId || a.patientEmail.toLowerCase() === user.email.toLowerCase()
  );
  return res.json({ appointments: list });
});

appointmentRouter.get('/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const db = getDb();
  const appt = db.appointments.find(
    (a) => a.id === req.params.id || a.appointmentNumber === req.params.id
  );
  if (!appt) {
    return res.status(404).json({ error: 'Appointment not found.' });
  }

  if (
    user.role === 'patient' &&
    appt.patientId !== user.userId &&
    appt.patientEmail.toLowerCase() !== user.email.toLowerCase()
  ) {
    return res.status(403).json({ error: 'You are only authorized to view your own appointments.' });
  }

  if (user.role === 'doctor') {
    const linkedDoctor = db.doctors.find((d) => d.id === user.doctorId || d.userId === user.userId);
    if (linkedDoctor && appt.doctorId !== linkedDoctor.id) {
      return res.status(403).json({ error: 'Doctors may only view appointments assigned to them.' });
    }
  }

  return res.json({ appointment: appt });
});

// Concurrency-safe appointment booking
appointmentRouter.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    const currentUser = extractUser(req);
    const departmentId = sanitizeString(req.body.departmentId, 80);
    const doctorId = sanitizeString(req.body.doctorId, 80);
    const appointmentDate = sanitizeString(req.body.appointmentDate, 20);
    const timeSlot = sanitizeString(req.body.timeSlot, 30);
    const patientName = sanitizeString(req.body.patientName, 120);
    const patientEmail = sanitizeString(req.body.patientEmail, 160).toLowerCase();
    const patientPhone = sanitizeString(req.body.patientPhone, 30);
    const patientDob = sanitizeString(req.body.patientDob, 20);
    const reason = sanitizeString(req.body.reason, 500);
    const notes = sanitizeString(req.body.notes, 500);
    const requestedPatientId = sanitizeString(req.body.patientId, 80);
    const paymentChoice =
      req.body.paymentChoice === 'DemoPaymentSimulation'
        ? 'DemoPaymentSimulation'
        : 'PayAtHospital';

    if (
      !departmentId ||
      !doctorId ||
      !appointmentDate ||
      !timeSlot ||
      !patientName ||
      !patientEmail ||
      !patientPhone ||
      !reason
    ) {
      return res.status(400).json({
        error: 'All required booking fields (Department, Doctor, Date, Time Slot, Patient Details, and Reason) must be provided.',
      });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate)) {
      return res.status(400).json({ error: 'Invalid appointment date format. Expected YYYY-MM-DD.' });
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    if (appointmentDate < todayStr) {
      return res.status(400).json({ error: 'Cannot book an appointment in the past.' });
    }

    const result = await runTransaction((db) => {
      const department = db.departments.find((d) => d.id === departmentId && d.isActive);
      if (!department) {
        return { status: 404, error: 'Selected medical department is not found or inactive.' } as const;
      }

      const doctor = db.doctors.find((d) => d.id === doctorId);
      if (!doctor || !doctor.isAvailable) {
        return { status: 400, error: 'Selected doctor is currently unavailable for booking.' } as const;
      }

      const parsedDate = new Date(`${appointmentDate}T00:00:00`);
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayOfWeek = dayNames[parsedDate.getDay()];

      if (!doctor.availableDays.includes(dayOfWeek)) {
        return {
          status: 400,
          error: `${doctor.name} does not consult on ${dayOfWeek}s. Available days: ${doctor.availableDays.join(', ')}.`,
        } as const;
      }

      if (!doctor.availableTimeSlots.includes(timeSlot)) {
        return { status: 400, error: `Selected time slot (${timeSlot}) is not part of the doctor's schedule.` } as const;
      }

      // Check for duplicate / conflicting slot
      const conflicting = db.appointments.find(
        (a) =>
          a.doctorId === doctor.id &&
          a.appointmentDate === appointmentDate &&
          a.timeSlot === timeSlot &&
          (a.status === 'Pending' || a.status === 'Confirmed')
      );

      if (conflicting) {
        return {
          status: 409,
          error: `The ${timeSlot} slot with ${doctor.name} on ${appointmentDate} is already booked. Please choose another available slot.`,
        } as const;
      }

      const seq = db.appointmentSequence++;
      const year = appointmentDate.slice(0, 4);
      const appointmentNumber = `GKH-${year}-${seq}`;
      const now = new Date().toISOString();

      let resolvedPatientId = currentUser?.role === 'patient' ? currentUser.userId : requestedPatientId;
      if (!resolvedPatientId) {
        const matchedPatient = db.users.find(
          (u) => u.role === 'patient' && u.email.toLowerCase() === patientEmail
        );
        resolvedPatientId = matchedPatient ? matchedPatient.id : createId('guest-pat');
      }

      const isDemoPaid = paymentChoice === 'DemoPaymentSimulation';
      const paymentReference = isDemoPaid
        ? `DEMO-SIM-RZP-${Date.now().toString().slice(-6)} (DEMO TEST ONLY - NO REAL CHARGE)`
        : undefined;

      const demoEmailPreview = createSimulatedEmail({
        to: patientEmail,
        patientName,
        subject: `[DEMO EMAIL MODE] Appointment Confirmation — ${appointmentNumber} | GOKUL HOSPITAL`,
        bodyLines: [
          `Dear ${patientName},`,
          ``,
          `Your outpatient consultation at GOKUL HOSPITAL has been scheduled.`,
          `- Appointment ID: ${appointmentNumber}`,
          `- Department: ${department.name} (${department.floorLocation})`,
          `- Consulting Doctor: ${doctor.name} (${doctor.specialization})`,
          `- Date & Time Slot: ${appointmentDate} at ${timeSlot}`,
          `- Consultation Fee: ₹${doctor.consultationFee} INR`,
          `- Payment Mode: ${
            isDemoPaid
              ? `DEMO PAYMENT MODE (Simulated Test Reference: ${paymentReference} — Not a Real Payment)`
              : 'Pay at Gokul Hospital OPD Counter upon arrival'
          }`,
          ``,
          `Please arrive 15 minutes before your scheduled slot with your Appointment ID.`,
          `Note: Dispatched via GOKUL HOSPITAL Demo Email Mode (In-App Simulation — No Gmail/SMTP credentials required).`,
        ],
      });

      const newAppointment = {
        id: createId('appt'),
        appointmentNumber,
        patientId: resolvedPatientId,
        patientName,
        patientEmail,
        patientPhone,
        patientDob: patientDob || undefined,
        departmentId: department.id,
        departmentName: department.name,
        doctorId: doctor.id,
        doctorName: doctor.name,
        consultationFee: doctor.consultationFee,
        appointmentDate,
        timeSlot,
        reason,
        notes: notes || undefined,
        status: (currentUser?.role === 'receptionist' || currentUser?.role === 'admin'
          ? 'Confirmed'
          : 'Pending') as AppointmentStatus,
        paymentStatus: (isDemoPaid ? 'PaidSandbox' : 'PayAtHospital') as
          | 'PayAtHospital'
          | 'PaidSandbox',
        paymentReference,
        demoEmailPreview,
        bookedByRole: currentUser ? currentUser.role : ('public' as const),
        createdAt: now,
        updatedAt: now,
      };

      db.appointments.unshift(newAppointment);

      // Notify Patient (including Demo Email Simulation notice)
      db.notifications.unshift({
        id: createId('notif'),
        userId: resolvedPatientId,
        title: `Appointment Booked & Demo Email Simulated — ${appointmentNumber}`,
        message: `Your appointment with ${doctor.name} (${department.name}) on ${appointmentDate} at ${timeSlot} is recorded (${newAppointment.status}). [DEMO EMAIL MODE: Confirmation email simulated to ${patientEmail}].`,
        eventType: 'APPOINTMENT_BOOKING',
        isRead: false,
        relatedId: newAppointment.id,
        createdAt: now,
      });

      // Notify Doctor if linked to a user account
      if (doctor.userId) {
        db.notifications.unshift({
          id: createId('notif'),
          userId: doctor.userId,
          title: `New Appointment — ${appointmentNumber}`,
          message: `Patient ${patientName} booked ${appointmentDate} at ${timeSlot} for: ${reason}.`,
          eventType: 'APPOINTMENT_BOOKING',
          isRead: false,
          relatedId: newAppointment.id,
          createdAt: now,
        });
      }

      // Notify Receptionist Desk
      db.notifications.unshift({
        id: createId('notif'),
        userId: 'ROLE:receptionist',
        targetRole: 'receptionist',
        title: `New Appointment ${appointmentNumber}`,
        message: `${patientName} booked ${doctor.name} (${department.name}) for ${appointmentDate} at ${timeSlot}.`,
        eventType: 'APPOINTMENT_BOOKING',
        isRead: false,
        relatedId: newAppointment.id,
        createdAt: now,
      });

      appendAuditLog(db, {
        actorId: currentUser?.userId || resolvedPatientId,
        actorName: currentUser?.fullName || patientName,
        actorRole: currentUser?.role || 'public',
        action: 'APPOINTMENT_BOOKED',
        entityType: 'appointment',
        entityId: newAppointment.id,
        details: `Booked ${appointmentNumber} with ${doctor.name} on ${appointmentDate} at ${timeSlot}.`,
      });

      return { status: 201, appointment: newAppointment } as const;
    });

    if ('error' in result) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(201).json({
      message: 'Appointment booked successfully.',
      appointment: result.appointment,
    });
  } catch (err) {
    console.error('Appointment booking error:', err);
    return res.status(500).json({ error: 'Unable to complete appointment booking.' });
  }
});

// Cancel appointment (Supports both PATCH and POST)
const handleCancelAppointment = async (req: AuthenticatedRequest, res: import('express').Response) => {
  try {
    const user = req.user!;
    const cancellationReason = sanitizeString(req.body.reason, 300) || 'Cancelled by user';

    const result = await runTransaction((db) => {
      const appt = db.appointments.find((a) => a.id === req.params.id || a.appointmentNumber === req.params.id);
      if (!appt) return { status: 404, error: 'Appointment not found.' } as const;

      if (
        user.role === 'patient' &&
        appt.patientId !== user.userId &&
        appt.patientEmail.toLowerCase() !== user.email.toLowerCase()
      ) {
        return { status: 403, error: 'You can only cancel your own appointments.' } as const;
      }

      if (appt.status === 'Completed' || appt.status === 'Cancelled') {
        return { status: 400, error: `Cannot cancel an appointment that is already ${appt.status}.` } as const;
      }

      appt.status = 'Cancelled';
      appt.cancellationReason = cancellationReason;
      appt.updatedAt = new Date().toISOString();

      db.notifications.unshift({
        id: createId('notif'),
        userId: appt.patientId,
        title: `Appointment Cancelled — ${appt.appointmentNumber}`,
        message: `Appointment ${appt.appointmentNumber} with ${appt.doctorName} on ${appt.appointmentDate} (${appt.timeSlot}) was cancelled. Reason: ${cancellationReason}`,
        eventType: 'APPOINTMENT_CANCELLATION',
        isRead: false,
        relatedId: appt.id,
        createdAt: appt.updatedAt,
      });

      appendAuditLog(db, {
        actorId: user.userId,
        actorName: user.fullName,
        actorRole: user.role,
        action: 'APPOINTMENT_CANCELLED',
        entityType: 'appointment',
        entityId: appt.id,
        details: `Cancelled ${appt.appointmentNumber}. Reason: ${cancellationReason}`,
      });

      return { status: 200, appointment: appt } as const;
    });

    if ('error' in result) {
      return res.status(result.status).json({ error: result.error });
    }
    return res.json({ message: 'Appointment cancelled.', appointment: result.appointment });
  } catch (err) {
    console.error('Cancel appointment error:', err);
    return res.status(500).json({ error: 'Unable to cancel appointment.' });
  }
};
appointmentRouter.patch('/:id/cancel', requireAuth, handleCancelAppointment);
appointmentRouter.post('/:id/cancel', requireAuth, handleCancelAppointment);

// Reschedule appointment (Supports both PATCH and POST)
const handleRescheduleAppointment = async (req: AuthenticatedRequest, res: import('express').Response) => {
  try {
    const user = req.user!;
    const newDate = sanitizeString(req.body.appointmentDate, 20);
    const newTimeSlot = sanitizeString(req.body.timeSlot || req.body.appointmentTime, 30);

    if (!newDate || !newTimeSlot || !/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
      return res.status(400).json({ error: 'Valid new date (YYYY-MM-DD) and time slot are required.' });
    }

    const result = await runTransaction((db) => {
      if (!db.websiteSettings.allowRescheduling && user.role === 'patient') {
        return { status: 403, error: 'Online rescheduling is currently disabled by hospital policy.' } as const;
      }

      const appt = db.appointments.find((a) => a.id === req.params.id || a.appointmentNumber === req.params.id);
      if (!appt) return { status: 404, error: 'Appointment not found.' } as const;

      if (
        user.role === 'patient' &&
        appt.patientId !== user.userId &&
        appt.patientEmail.toLowerCase() !== user.email.toLowerCase()
      ) {
        return { status: 403, error: 'You can only reschedule your own appointments.' } as const;
      }

      if (appt.status === 'Completed' || appt.status === 'Cancelled') {
        return { status: 400, error: `Cannot reschedule a ${appt.status} appointment.` } as const;
      }

      const doctor = db.doctors.find((d) => d.id === appt.doctorId);
      if (!doctor) return { status: 404, error: 'Assigned doctor not found.' } as const;

      const parsedDate = new Date(`${newDate}T00:00:00`);
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayOfWeek = dayNames[parsedDate.getDay()];

      if (!doctor.availableDays.includes(dayOfWeek)) {
        return {
          status: 400,
          error: `${doctor.name} is not scheduled on ${dayOfWeek}s (${doctor.availableDays.join(', ')}).`,
        } as const;
      }

      const conflict = db.appointments.find(
        (a) =>
          a.id !== appt.id &&
          a.doctorId === appt.doctorId &&
          a.appointmentDate === newDate &&
          a.timeSlot === newTimeSlot &&
          (a.status === 'Pending' || a.status === 'Confirmed')
      );

      if (conflict) {
        return {
          status: 409,
          error: `Slot ${newTimeSlot} on ${newDate} is already booked for ${doctor.name}.`,
        } as const;
      }

      const previousSlot = `${appt.appointmentDate} ${appt.timeSlot}`;
      appt.appointmentDate = newDate;
      appt.timeSlot = newTimeSlot;
      appt.status = user.role === 'patient' ? 'Pending' : 'Confirmed';
      appt.updatedAt = new Date().toISOString();

      db.notifications.unshift({
        id: createId('notif'),
        userId: appt.patientId,
        title: `Appointment Rescheduled — ${appt.appointmentNumber}`,
        message: `Appointment ${appt.appointmentNumber} with ${appt.doctorName} moved from ${previousSlot} to ${newDate} at ${newTimeSlot}.`,
        eventType: 'APPOINTMENT_RESCHEDULED',
        isRead: false,
        relatedId: appt.id,
        createdAt: appt.updatedAt,
      });

      appendAuditLog(db, {
        actorId: user.userId,
        actorName: user.fullName,
        actorRole: user.role,
        action: 'APPOINTMENT_RESCHEDULED',
        entityType: 'appointment',
        entityId: appt.id,
        details: `Rescheduled ${appt.appointmentNumber} from ${previousSlot} to ${newDate} ${newTimeSlot}.`,
      });

      return { status: 200, appointment: appt } as const;
    });

    if ('error' in result) {
      return res.status(result.status).json({ error: result.error });
    }
    return res.json({ message: 'Appointment rescheduled successfully.', appointment: result.appointment });
  } catch (err) {
    console.error('Reschedule error:', err);
    return res.status(500).json({ error: 'Unable to reschedule appointment.' });
  }
};
appointmentRouter.patch('/:id/reschedule', requireAuth, handleRescheduleAppointment);
appointmentRouter.post('/:id/reschedule', requireAuth, handleRescheduleAppointment);

// Status & Doctor assignment update (Doctor, Receptionist, Admin)
appointmentRouter.patch('/:id/status', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    if (user.role === 'patient') {
      return res.status(403).json({ error: 'Patients cannot directly override clinical appointment status.' });
    }

    const newStatus = sanitizeString(req.body.status, 30) as AppointmentStatus;
    const newDoctorId = sanitizeString(req.body.doctorId, 80);
    const allowedStatuses: AppointmentStatus[] = ['Pending', 'Confirmed', 'Cancelled', 'Completed', 'No-show'];

    if (newStatus && !allowedStatuses.includes(newStatus)) {
      return res.status(400).json({ error: 'Invalid appointment status.' });
    }

    const result = await runTransaction((db) => {
      const appt = db.appointments.find((a) => a.id === req.params.id || a.appointmentNumber === req.params.id);
      if (!appt) return { status: 404, error: 'Appointment not found.' } as const;

      if (newDoctorId && (user.role === 'admin' || user.role === 'receptionist')) {
        const doc = db.doctors.find((d) => d.id === newDoctorId);
        if (doc) {
          appt.doctorId = doc.id;
          appt.doctorName = doc.name;
          appt.consultationFee = doc.consultationFee;
        }
      }

      if (newStatus) {
        appt.status = newStatus;
      }
      appt.updatedAt = new Date().toISOString();

      db.notifications.unshift({
        id: createId('notif'),
        userId: appt.patientId,
        title: `Appointment Status Updated — ${appt.appointmentNumber}`,
        message: `Your appointment ${appt.appointmentNumber} with ${appt.doctorName} on ${appt.appointmentDate} (${appt.timeSlot}) is now ${appt.status}.`,
        eventType:
          appt.status === 'Confirmed' ? 'APPOINTMENT_CONFIRMATION' : 'APPOINTMENT_BOOKING',
        isRead: false,
        relatedId: appt.id,
        createdAt: appt.updatedAt,
      });

      appendAuditLog(db, {
        actorId: user.userId,
        actorName: user.fullName,
        actorRole: user.role,
        action: 'APPOINTMENT_STATUS_UPDATED',
        entityType: 'appointment',
        entityId: appt.id,
        details: `Updated ${appt.appointmentNumber} status to ${appt.status}.`,
      });

      return { status: 200, appointment: appt } as const;
    });

    if ('error' in result) {
      return res.status(result.status).json({ error: result.error });
    }
    return res.json({ message: 'Appointment updated.', appointment: result.appointment });
  } catch (err) {
    console.error('Update status error:', err);
    return res.status(500).json({ error: 'Unable to update appointment status.' });
  }
});
