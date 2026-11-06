import { Router } from 'express';
import { getDb, runTransaction, createId, appendAuditLog, sanitizeUser } from '../services/db.ts';
import {
  requireAuth,
  requireRoles,
  hashPassword,
  sanitizeString,
  type AuthenticatedRequest,
} from '../services/cryptoAuth.ts';

export const clinicalRouter = Router();

// Authorized Patient Directory for Doctors (assigned patients), Receptionists, and Admins
clinicalRouter.get(
  '/patients',
  requireRoles(['doctor', 'receptionist', 'admin']),
  (req: AuthenticatedRequest, res) => {
    const user = req.user!;
    const db = getDb();
    const q = sanitizeString(req.query.q, 100).toLowerCase();

    let patients = db.users.filter((u) => u.role === 'patient').map(sanitizeUser);

    if (user.role === 'doctor') {
      const linkedDoctor = db.doctors.find((d) => d.id === user.doctorId || d.userId === user.userId);
      const docId = linkedDoctor ? linkedDoctor.id : user.doctorId;
      const assignedPatientIds = new Set(
        db.appointments.filter((a) => a.doctorId === docId).map((a) => a.patientId)
      );
      patients = patients.filter(
        (p) => assignedPatientIds.has(p.id) && p.allowDataSharingWithDoctors !== false
      );
    }

    if (q) {
      patients = patients.filter(
        (p) =>
          p.fullName.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          p.phone.toLowerCase().includes(q)
      );
    }

    return res.json({ patients });
  }
);

// Receptionist / Admin Walk-in Patient Registration
clinicalRouter.post(
  '/patients',
  requireRoles(['receptionist', 'admin']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const actor = req.user!;
      const fullName = sanitizeString(req.body.fullName, 120);
      const email = sanitizeString(req.body.email, 160).toLowerCase();
      const phone = sanitizeString(req.body.phone, 30);
      const dateOfBirth = sanitizeString(req.body.dateOfBirth, 20);
      const gender = sanitizeString(req.body.gender, 30);
      const bloodGroup = sanitizeString(req.body.bloodGroup, 15);
      const address = sanitizeString(req.body.address, 300);
      const tempPassword =
        typeof req.body.password === 'string' && req.body.password.length >= 8
          ? req.body.password
          : 'GokulPat@123';

      if (!fullName || !email || !phone) {
        return res.status(400).json({ error: 'Patient full name, email, and mobile number are required.' });
      }

      const result = await runTransaction((db) => {
        const exists = db.users.find((u) => u.email.toLowerCase() === email);
        if (exists) return { error: 'A user with this email already exists.' } as const;

        const now = new Date().toISOString();
        const newPatient = {
          id: createId('user-pat'),
          fullName,
          email,
          phone,
          role: 'patient' as const,
          isActive: true,
          emailVerified: true,
          dateOfBirth: dateOfBirth || undefined,
          gender: gender || undefined,
          bloodGroup: bloodGroup || undefined,
          address: address || undefined,
          privacyConsent: true,
          termsAccepted: true,
          allowDataSharingWithDoctors: true,
          passwordHash: hashPassword(tempPassword),
          createdAt: now,
          updatedAt: now,
        };
        db.users.push(newPatient);

        appendAuditLog(db, {
          actorId: actor.userId,
          actorName: actor.fullName,
          actorRole: actor.role,
          action: 'WALKIN_PATIENT_REGISTERED',
          entityType: 'user',
          entityId: newPatient.id,
          details: `Registered walk-in patient ${fullName} (${phone}).`,
        });

        return { patient: sanitizeUser(newPatient) } as const;
      });

      if ('error' in result) {
        return res.status(409).json({ error: result.error });
      }
      return res.status(201).json({
        message: 'Patient registered successfully.',
        patient: result.patient,
      });
    } catch (err) {
      console.error('Walk-in registration error:', err);
      return res.status(500).json({ error: 'Unable to register patient.' });
    }
  }
);

// Medical Records (Patients view own, Doctors view/create for assigned patients, Admins view/manage)
clinicalRouter.get('/medical-records', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const db = getDb();

  if (user.role === 'receptionist') {
    return res.status(403).json({
      error: 'Receptionists do not have access to confidential clinical medical records.',
    });
  }

  let records = db.medicalRecords;
  if (user.role === 'patient') {
    records = records.filter((r) => r.patientId === user.userId);
  } else if (user.role === 'doctor') {
    const linkedDoctor = db.doctors.find((d) => d.id === user.doctorId || d.userId === user.userId);
    const docId = linkedDoctor ? linkedDoctor.id : user.doctorId;
    records = records.filter((r) => r.doctorId === docId);
  }

  return res.json({ medicalRecords: records });
});

clinicalRouter.post(
  '/medical-records',
  requireRoles(['doctor', 'admin']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      const patientId = sanitizeString(req.body.patientId, 80);
      const diagnosis = sanitizeString(req.body.diagnosis, 300);
      const clinicalNotes = sanitizeString(req.body.clinicalNotes, 1500);
      const followUpDate = sanitizeString(req.body.followUpDate, 20);
      const bloodPressure = sanitizeString(req.body.bloodPressure, 30);
      const heartRate = sanitizeString(req.body.heartRate, 30);
      const temperature = sanitizeString(req.body.temperature, 30);
      const weightKg = sanitizeString(req.body.weightKg, 30);
      const spo2 = sanitizeString(req.body.spo2, 30);

      if (!patientId || !diagnosis || !clinicalNotes) {
        return res.status(400).json({ error: 'Patient, diagnosis, and clinical notes are required.' });
      }

      const result = await runTransaction((db) => {
        const patient = db.users.find((u) => u.id === patientId && u.role === 'patient');
        if (!patient) return { error: 'Patient record not found.' } as const;

        const linkedDoctor =
          db.doctors.find((d) => d.id === user.doctorId || d.userId === user.userId) ||
          db.doctors.find((d) => d.id === req.body.doctorId) ||
          db.doctors[0];

        const now = new Date().toISOString();
        const record = {
          id: createId('mr'),
          patientId: patient.id,
          patientName: patient.fullName,
          doctorId: linkedDoctor.id,
          doctorName: linkedDoctor.name,
          visitDate: now.slice(0, 10),
          diagnosis,
          clinicalNotes,
          vitalSigns: {
            bloodPressure: bloodPressure || undefined,
            heartRate: heartRate || undefined,
            temperature: temperature || undefined,
            weightKg: weightKg || undefined,
            spo2: spo2 || undefined,
          },
          followUpDate: followUpDate || undefined,
          createdAt: now,
          updatedAt: now,
        };

        db.medicalRecords.unshift(record);

        appendAuditLog(db, {
          actorId: user.userId,
          actorName: user.fullName,
          actorRole: user.role,
          action: 'MEDICAL_RECORD_CREATED',
          entityType: 'medicalRecord',
          entityId: record.id,
          details: `Created clinical medical record for ${patient.fullName}.`,
        });

        return { record } as const;
      });

      if ('error' in result) {
        return res.status(404).json({ error: result.error });
      }
      return res.status(201).json({ message: 'Medical record saved.', medicalRecord: result.record });
    } catch (err) {
      console.error('Create medical record error:', err);
      return res.status(500).json({ error: 'Failed to create medical record.' });
    }
  }
);

// Prescriptions
clinicalRouter.get('/prescriptions', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const db = getDb();

  if (user.role === 'receptionist') {
    return res.status(403).json({
      error: 'Receptionists are not authorized to view clinical prescriptions.',
    });
  }

  let list = db.prescriptions;
  if (user.role === 'patient') {
    list = list.filter((p) => p.patientId === user.userId);
  } else if (user.role === 'doctor') {
    const linkedDoctor = db.doctors.find((d) => d.id === user.doctorId || d.userId === user.userId);
    const docId = linkedDoctor ? linkedDoctor.id : user.doctorId;
    list = list.filter((p) => p.doctorId === docId);
  }

  return res.json({ prescriptions: list });
});

clinicalRouter.post(
  '/prescriptions',
  requireRoles(['doctor', 'admin']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      const patientId = sanitizeString(req.body.patientId, 80);
      const diagnosis = sanitizeString(req.body.diagnosis, 300);
      const generalAdvice = sanitizeString(req.body.generalAdvice, 1000);
      const rawMeds = Array.isArray(req.body.medications) ? req.body.medications : [];

      if (!patientId || !diagnosis || rawMeds.length === 0) {
        return res.status(400).json({
          error: 'Patient, diagnosis, and at least one prescribed medication are required.',
        });
      }

      const medications = rawMeds.slice(0, 15).map((m: Record<string, unknown>) => ({
        medicineName: sanitizeString(m.medicineName, 120),
        dosage: sanitizeString(m.dosage, 60),
        frequency: sanitizeString(m.frequency, 60),
        duration: sanitizeString(m.duration, 60),
        instructions: sanitizeString(m.instructions, 200),
      }));

      const result = await runTransaction((db) => {
        const patient = db.users.find((u) => u.id === patientId && u.role === 'patient');
        if (!patient) return { error: 'Patient not found.' } as const;

        const linkedDoctor =
          db.doctors.find((d) => d.id === user.doctorId || d.userId === user.userId) ||
          db.doctors.find((d) => d.id === req.body.doctorId) ||
          db.doctors[0];

        const now = new Date().toISOString();
        const rx = {
          id: createId('rx'),
          patientId: patient.id,
          patientName: patient.fullName,
          doctorId: linkedDoctor.id,
          doctorName: linkedDoctor.name,
          departmentName: linkedDoctor.departmentName,
          issuedDate: now.slice(0, 10),
          diagnosis,
          medications,
          generalAdvice: generalAdvice || 'Follow dosage schedule strictly.',
          createdAt: now,
        };

        db.prescriptions.unshift(rx);

        db.notifications.unshift({
          id: createId('notif'),
          userId: patient.id,
          title: `New Prescription Issued by ${linkedDoctor.name}`,
          message: `A new digital prescription for "${diagnosis}" is available in your Patient Portal.`,
          eventType: 'PRESCRIPTION_ISSUED',
          isRead: false,
          relatedId: rx.id,
          createdAt: now,
        });

        appendAuditLog(db, {
          actorId: user.userId,
          actorName: user.fullName,
          actorRole: user.role,
          action: 'PRESCRIPTION_ISSUED',
          entityType: 'prescription',
          entityId: rx.id,
          details: `Issued prescription to ${patient.fullName} (${medications.length} medicines).`,
        });

        return { rx } as const;
      });

      if ('error' in result) {
        return res.status(404).json({ error: result.error });
      }
      return res.status(201).json({ message: 'Prescription issued.', prescription: result.rx });
    } catch (err) {
      console.error('Create prescription error:', err);
      return res.status(500).json({ error: 'Unable to issue prescription.' });
    }
  }
);

// Lab Reports (with secure file upload validation)
clinicalRouter.get('/lab-reports', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const db = getDb();

  if (user.role === 'receptionist') {
    return res.status(403).json({
      error: 'Receptionists do not have access to diagnostic lab reports.',
    });
  }

  let reports = db.labReports;
  if (user.role === 'patient') {
    reports = reports.filter((r) => r.patientId === user.userId);
  }
  return res.json({ labReports: reports });
});

clinicalRouter.post(
  '/lab-reports',
  requireRoles(['doctor', 'admin']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      const patientId = sanitizeString(req.body.patientId, 80);
      const testName = sanitizeString(req.body.testName, 160);
      const category = sanitizeString(req.body.category, 60) as
        | 'Pathology'
        | 'Biochemistry'
        | 'Microbiology'
        | 'Radiology'
        | 'Cardiology';
      const summaryResult = sanitizeString(req.body.summaryResult, 800);
      const fileName = sanitizeString(req.body.fileName, 120);
      const fileDataUrl = typeof req.body.fileDataUrl === 'string' ? req.body.fileDataUrl : undefined;
      const rawParams = Array.isArray(req.body.parameters) ? req.body.parameters : [];

      if (!patientId || !testName || !summaryResult) {
        return res.status(400).json({ error: 'Patient, test name, and summary result are required.' });
      }

      if (fileDataUrl) {
        if (fileDataUrl.length > 750_000) {
          return res.status(400).json({ error: 'Uploaded report file exceeds maximum 500 KB limit.' });
        }
        const validPrefix =
          fileDataUrl.startsWith('data:application/pdf;base64,') ||
          fileDataUrl.startsWith('data:text/plain;base64,') ||
          fileDataUrl.startsWith('data:image/png;base64,') ||
          fileDataUrl.startsWith('data:image/jpeg;base64,');
        if (!validPrefix) {
          return res.status(400).json({
            error: 'Invalid file format. Only PDF, TXT, PNG, or JPEG diagnostic attachments are permitted.',
          });
        }
      }

      const parameters = rawParams.slice(0, 20).map((p: Record<string, unknown>) => ({
        parameter: sanitizeString(p.parameter, 100),
        observedValue: sanitizeString(p.observedValue, 60),
        unit: sanitizeString(p.unit, 40),
        referenceRange: sanitizeString(p.referenceRange, 80),
      }));

      const result = await runTransaction((db) => {
        const patient = db.users.find((u) => u.id === patientId && u.role === 'patient');
        if (!patient) return { error: 'Patient not found.' } as const;

        const now = new Date().toISOString();
        const report = {
          id: createId('lab'),
          reportNumber: `GKH-LAB-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          patientId: patient.id,
          patientName: patient.fullName,
          orderedByDoctorName: user.fullName,
          testName,
          category: category || 'Biochemistry',
          sampleDate: now.slice(0, 10),
          reportDate: now.slice(0, 10),
          status: 'Verified' as const,
          summaryResult,
          parameters,
          fileName: fileName || undefined,
          fileDataUrl,
          uploadedByRole: user.role,
          createdAt: now,
        };

        db.labReports.unshift(report);

        db.notifications.unshift({
          id: createId('notif'),
          userId: patient.id,
          title: `Lab Report Verified — ${report.reportNumber}`,
          message: `Your diagnostic report for ${testName} is now verified and ready for download.`,
          eventType: 'LAB_REPORT_READY',
          isRead: false,
          relatedId: report.id,
          createdAt: now,
        });

        appendAuditLog(db, {
          actorId: user.userId,
          actorName: user.fullName,
          actorRole: user.role,
          action: 'LAB_REPORT_UPLOADED',
          entityType: 'labReport',
          entityId: report.id,
          details: `Uploaded lab report ${report.reportNumber} (${testName}) for ${patient.fullName}.`,
        });

        return { report } as const;
      });

      if ('error' in result) {
        return res.status(404).json({ error: result.error });
      }
      return res.status(201).json({ message: 'Lab report uploaded.', labReport: result.report });
    } catch (err) {
      console.error('Upload lab report error:', err);
      return res.status(500).json({ error: 'Unable to upload lab report.' });
    }
  }
);

// Doctor Schedule & Availability Management
clinicalRouter.put(
  '/doctor-schedule',
  requireRoles(['doctor', 'admin']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      const targetDoctorId = sanitizeString(req.body.doctorId, 80);

      const result = await runTransaction((db) => {
        const doctor =
          user.role === 'admin' && targetDoctorId
            ? db.doctors.find((d) => d.id === targetDoctorId)
            : db.doctors.find((d) => d.id === user.doctorId || d.userId === user.userId);

        if (!doctor) return { error: 'Doctor profile not found.' } as const;

        if (Array.isArray(req.body.availableDays)) {
          doctor.availableDays = req.body.availableDays
            .map((d: unknown) => sanitizeString(d, 20))
            .filter(Boolean);
        }
        if (Array.isArray(req.body.availableTimeSlots)) {
          doctor.availableTimeSlots = req.body.availableTimeSlots
            .map((s: unknown) => sanitizeString(s, 20))
            .filter(Boolean);
        }
        if (typeof req.body.isAvailable === 'boolean') {
          doctor.isAvailable = req.body.isAvailable;
        }
        if (typeof req.body.consultationFee === 'number' && req.body.consultationFee >= 0) {
          doctor.consultationFee = req.body.consultationFee;
        }
        if (typeof req.body.biography === 'string') {
          doctor.biography = sanitizeString(req.body.biography, 1000);
        }
        if (typeof req.body.qualifications === 'string') {
          doctor.qualifications = sanitizeString(req.body.qualifications, 200);
        }
        doctor.updatedAt = new Date().toISOString();

        appendAuditLog(db, {
          actorId: user.userId,
          actorName: user.fullName,
          actorRole: user.role,
          action: 'DOCTOR_SCHEDULE_UPDATED',
          entityType: 'doctor',
          entityId: doctor.id,
          details: `Updated schedule & availability for ${doctor.name}.`,
        });

        return { doctor } as const;
      });

      if ('error' in result) {
        return res.status(404).json({ error: result.error });
      }
      return res.json({ message: 'Doctor schedule updated.', doctor: result.doctor });
    } catch (err) {
      console.error('Update doctor schedule error:', err);
      return res.status(500).json({ error: 'Unable to update doctor schedule.' });
    }
  }
);

// Notifications
clinicalRouter.get('/notifications', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const db = getDb();

  const items = db.notifications.filter(
    (n) =>
      n.userId === user.userId ||
      n.userId === `ROLE:${user.role}` ||
      n.targetRole === user.role ||
      n.userId === 'ALL'
  );

  return res.json({ notifications: items });
});

clinicalRouter.patch('/notifications/:id/read', requireAuth, async (req: AuthenticatedRequest, res) => {
  const updated = await runTransaction((db) => {
    const item = db.notifications.find((n) => n.id === req.params.id);
    if (!item) return null;
    item.isRead = true;
    return item;
  });
  if (!updated) return res.status(404).json({ error: 'Notification not found.' });
  return res.json({ notification: updated });
});

clinicalRouter.post('/notifications/read-all', requireAuth, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  await runTransaction((db) => {
    db.notifications.forEach((n) => {
      if (
        n.userId === user.userId ||
        n.userId === `ROLE:${user.role}` ||
        n.targetRole === user.role ||
        n.userId === 'ALL'
      ) {
        n.isRead = true;
      }
    });
  });
  return res.json({ message: 'All notifications marked as read.' });
});
