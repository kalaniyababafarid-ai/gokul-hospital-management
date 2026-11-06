import { Router } from 'express';
import { getDb, runTransaction, createId, appendAuditLog } from '../services/db.ts';
import { sanitizeString } from '../services/cryptoAuth.ts';

export const publicRouter = Router();

publicRouter.get('/bootstrap', (_req, res) => {
  const db = getDb();
  const activeDepartments = db.departments.filter((d) => d.isActive);
  const activeDoctors = db.doctors;
  const activeServices = db.hospitalServices.filter((s) => s.isActive);
  const activeFacilities = db.facilities.filter((f) => f.isActive);
  const activePackages = db.healthPackages.filter((p) => p.isActive);
  const approvedTestimonials = db.testimonials.filter((t) => t.isApproved);
  const publishedBlogs = db.blogs.filter((b) => b.isPublished);

  return res.json({
    settings: db.websiteSettings,
    departments: activeDepartments,
    doctors: activeDoctors,
    services: activeServices,
    facilities: activeFacilities,
    healthPackages: activePackages,
    testimonials: approvedTestimonials,
    blogs: publishedBlogs,
    gallery: db.gallery,
    stats: {
      departmentsCount: activeDepartments.length,
      doctorsCount: activeDoctors.length,
      servicesCount: activeServices.length,
      packagesCount: activePackages.length,
    },
  });
});

publicRouter.get('/departments', (_req, res) => {
  const db = getDb();
  return res.json({
    departments: db.departments.filter((d) => d.isActive),
  });
});

publicRouter.get('/doctors', (req, res) => {
  const db = getDb();
  const departmentId = sanitizeString(req.query.departmentId, 80);
  const doctors = departmentId
    ? db.doctors.filter((d) => d.departmentId === departmentId || d.departmentName.toLowerCase() === departmentId.toLowerCase())
    : db.doctors;
  return res.json({ doctors });
});

publicRouter.get('/doctors/:doctorId/availability', (req, res) => {
  const { doctorId } = req.params;
  const dateStr = sanitizeString(req.query.date, 20);
  const db = getDb();

  const doctor = db.doctors.find((d) => d.id === doctorId || d.slug === doctorId);
  if (!doctor) {
    return res.status(404).json({ error: 'Doctor profile not found.' });
  }

  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return res.status(400).json({ error: 'Valid date (YYYY-MM-DD) is required.' });
  }

  const parsedDate = new Date(`${dateStr}T00:00:00`);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayOfWeek = dayNames[parsedDate.getDay()];

  const isDoctorWorkingDay = doctor.isAvailable && doctor.availableDays.includes(dayOfWeek);

  const bookedSlots = db.appointments
    .filter(
      (a) =>
        a.doctorId === doctor.id &&
        a.appointmentDate === dateStr &&
        (a.status === 'Pending' || a.status === 'Confirmed')
    )
    .map((a) => a.timeSlot);

  const slots = isDoctorWorkingDay
    ? doctor.availableTimeSlots.map((slot) => ({
        timeSlot: slot,
        isAvailable: !bookedSlots.includes(slot),
      }))
    : [];

  return res.json({
    doctorId: doctor.id,
    doctorName: doctor.name,
    date: dateStr,
    dayOfWeek,
    isDoctorWorkingDay,
    availableDays: doctor.availableDays,
    slots,
  });
});

publicRouter.get('/search', (req, res) => {
  const q = sanitizeString(req.query.q, 100).toLowerCase();
  const db = getDb();

  if (!q) {
    return res.json({
      query: '',
      doctors: [],
      departments: [],
      services: [],
      packages: [],
      blogs: [],
    });
  }

  const doctors = db.doctors.filter(
    (d) =>
      d.name.toLowerCase().includes(q) ||
      d.specialization.toLowerCase().includes(q) ||
      d.departmentName.toLowerCase().includes(q)
  );

  const departments = db.departments.filter(
    (dep) =>
      dep.isActive &&
      (dep.name.toLowerCase().includes(q) ||
        dep.shortDescription.toLowerCase().includes(q) ||
        dep.keyProcedures.some((p) => p.toLowerCase().includes(q)))
  );

  const services = db.hospitalServices.filter(
    (s) =>
      s.isActive &&
      (s.title.toLowerCase().includes(q) ||
        s.shortDescription.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q))
  );

  const packages = db.healthPackages.filter(
    (p) =>
      p.isActive &&
      (p.name.toLowerCase().includes(q) ||
        p.targetAudience.toLowerCase().includes(q) ||
        p.includedTests.some((t) => t.toLowerCase().includes(q)))
  );

  const blogs = db.blogs.filter(
    (b) =>
      b.isPublished &&
      (b.title.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.excerpt.toLowerCase().includes(q))
  );

  return res.json({
    query: q,
    doctors,
    departments,
    services,
    packages,
    blogs,
  });
});

publicRouter.post('/inquiries', async (req, res) => {
  try {
    const fullName = sanitizeString(req.body.fullName, 120);
    const email = sanitizeString(req.body.email, 160);
    const phone = sanitizeString(req.body.phone, 30);
    const subject = sanitizeString(req.body.subject, 160);
    const department = sanitizeString(req.body.department, 100);
    const message = sanitizeString(req.body.message, 1500);

    if (!fullName || !email || !phone || !subject || !message) {
      return res.status(400).json({ error: 'Please complete all required inquiry fields.' });
    }

    const inquiry = await runTransaction((db) => {
      const now = new Date().toISOString();
      const item = {
        id: createId('inq'),
        fullName,
        email,
        phone,
        subject,
        department: department || undefined,
        message,
        status: 'New' as const,
        createdAt: now,
        updatedAt: now,
      };
      db.inquiries.unshift(item);

      db.notifications.unshift({
        id: createId('notif'),
        userId: 'ROLE:receptionist',
        targetRole: 'receptionist',
        title: `New Patient Inquiry: ${subject}`,
        message: `${fullName} (${phone}) submitted an inquiry regarding ${department || 'General Hospital Info'}.`,
        eventType: 'HOSPITAL_ANNOUNCEMENT',
        isRead: false,
        relatedId: item.id,
        createdAt: now,
      });

      appendAuditLog(db, {
        actorId: 'public',
        actorName: fullName,
        actorRole: 'public',
        action: 'INQUIRY_SUBMITTED',
        entityType: 'inquiry',
        entityId: item.id,
        details: `Submitted inquiry: ${subject}`,
      });

      return item;
    });

    return res.status(201).json({
      message: 'Your inquiry has been recorded by the Gokul Hospital Helpdesk.',
      inquiry,
    });
  } catch (err) {
    console.error('Submit inquiry error:', err);
    return res.status(500).json({ error: 'Unable to submit inquiry.' });
  }
});

publicRouter.post('/package-bookings', async (req, res) => {
  try {
    const packageId = sanitizeString(req.body.packageId, 80);
    const patientName = sanitizeString(req.body.patientName, 120);
    const patientEmail = sanitizeString(req.body.patientEmail, 160);
    const patientPhone = sanitizeString(req.body.patientPhone, 30);
    const preferredDate = sanitizeString(req.body.preferredDate, 20);
    const notes = sanitizeString(req.body.notes, 500);
    const patientId = sanitizeString(req.body.patientId, 80);

    if (!packageId || !patientName || !patientEmail || !patientPhone || !preferredDate) {
      return res.status(400).json({ error: 'Please complete all required health package booking fields.' });
    }

    const result = await runTransaction((db) => {
      const pkg = db.healthPackages.find((p) => p.id === packageId);
      if (!pkg) return { error: 'Selected health checkup package not found.' };

      const now = new Date().toISOString();
      const booking = {
        id: createId('pkg-bk'),
        packageId: pkg.id,
        packageName: pkg.name,
        priceInr: pkg.discountedPriceInr || pkg.priceInr,
        patientId: patientId || undefined,
        patientName,
        patientEmail,
        patientPhone,
        preferredDate,
        notes: notes || undefined,
        status: 'Requested' as const,
        createdAt: now,
      };
      db.packageBookings.unshift(booking);

      db.notifications.unshift({
        id: createId('notif'),
        userId: 'ROLE:receptionist',
        targetRole: 'receptionist',
        title: `Health Package Request: ${pkg.name}`,
        message: `${patientName} requested ${pkg.name} for ${preferredDate}.`,
        eventType: 'APPOINTMENT_BOOKING',
        isRead: false,
        relatedId: booking.id,
        createdAt: now,
      });

      return { booking };
    });

    if ('error' in result) {
      return res.status(404).json({ error: result.error });
    }

    return res.status(201).json({
      message: 'Health Checkup Package request saved. Our Preventive Care desk will confirm your fasting slot.',
      booking: result.booking,
    });
  } catch (err) {
    console.error('Package booking error:', err);
    return res.status(500).json({ error: 'Unable to submit health package booking.' });
  }
});
