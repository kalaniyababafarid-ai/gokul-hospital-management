import { Router } from 'express';
import { getDb, runTransaction, createId, appendAuditLog, sanitizeUser } from '../services/db.ts';
import {
  requireRoles,
  hashPassword,
  sanitizeString,
  type AuthenticatedRequest,
} from '../services/cryptoAuth.ts';
import type { UserRole } from '../../src/types/hospital.ts';

export const adminRouter = Router();

// Overview Metrics & Analytics (Admin & Receptionist operational view)
adminRouter.get(
  '/overview',
  requireRoles(['admin', 'receptionist']),
  (_req: AuthenticatedRequest, res) => {
    const db = getDb();
    const todayStr = new Date().toISOString().slice(0, 10);

    const totalPatients = db.users.filter((u) => u.role === 'patient').length;
    const totalDoctors = db.doctors.length;
    const totalReceptionists = db.users.filter((u) => u.role === 'receptionist').length;
    const totalAppointments = db.appointments.length;
    const todaysAppointments = db.appointments.filter((a) => a.appointmentDate === todayStr).length;
    const pendingAppointments = db.appointments.filter((a) => a.status === 'Pending').length;
    const confirmedAppointments = db.appointments.filter((a) => a.status === 'Confirmed').length;
    const completedAppointments = db.appointments.filter((a) => a.status === 'Completed').length;
    const cancelledAppointments = db.appointments.filter((a) => a.status === 'Cancelled').length;

    const departmentBreakdown = db.departments.map((dept) => ({
      departmentId: dept.id,
      departmentName: dept.name,
      doctorsCount: db.doctors.filter((d) => d.departmentId === dept.id).length,
      appointmentsCount: db.appointments.filter((a) => a.departmentId === dept.id).length,
    }));

    return res.json({
      stats: {
        totalPatients,
        totalDoctors,
        totalReceptionists,
        totalAppointments,
        todaysAppointments,
        pendingAppointments,
        confirmedAppointments,
        completedAppointments,
        cancelledAppointments,
        openInquiries: db.inquiries.filter((i) => i.status !== 'Resolved').length,
        packageRequests: db.packageBookings.length,
      },
      departmentBreakdown,
      recentAuditLogs: db.auditLogs.slice(0, 30),
    });
  }
);

// Users & Staff Management (Admin only)
adminRouter.get('/users', requireRoles(['admin']), (_req, res) => {
  const db = getDb();
  return res.json({ users: db.users.map(sanitizeUser) });
});

adminRouter.post('/users', requireRoles(['admin']), async (req: AuthenticatedRequest, res) => {
  try {
    const actor = req.user!;
    const fullName = sanitizeString(req.body.fullName, 120);
    const email = sanitizeString(req.body.email, 160).toLowerCase();
    const phone = sanitizeString(req.body.phone, 30);
    const role = sanitizeString(req.body.role, 30) as UserRole;
    const password = typeof req.body.password === 'string' ? req.body.password : 'GokulStaff@123';
    const doctorId = sanitizeString(req.body.doctorId, 80);

    if (!fullName || !email || !phone || !['patient', 'doctor', 'receptionist', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Valid name, email, phone, and role are required.' });
    }

    const result = await runTransaction((db) => {
      if (db.users.some((u) => u.email.toLowerCase() === email)) {
        return { error: 'Email is already registered.' } as const;
      }
      const now = new Date().toISOString();
      const newUser = {
        id: createId(`user-${role}`),
        fullName,
        email,
        phone,
        role,
        doctorId: doctorId || undefined,
        isActive: true,
        emailVerified: true,
        privacyConsent: true,
        termsAccepted: true,
        passwordHash: hashPassword(password),
        createdAt: now,
        updatedAt: now,
      };
      db.users.push(newUser);

      appendAuditLog(db, {
        actorId: actor.userId,
        actorName: actor.fullName,
        actorRole: actor.role,
        action: 'STAFF_OR_USER_CREATED',
        entityType: 'user',
        entityId: newUser.id,
        details: `Created ${role} account for ${fullName} (${email}).`,
      });

      return { user: sanitizeUser(newUser) } as const;
    });

    if ('error' in result) return res.status(409).json({ error: result.error });
    return res.status(201).json({ user: result.user });
  } catch (err) {
    console.error('Create user error:', err);
    return res.status(500).json({ error: 'Unable to create user account.' });
  }
});

adminRouter.patch('/users/:id', requireRoles(['admin']), async (req: AuthenticatedRequest, res) => {
  try {
    const actor = req.user!;
    const result = await runTransaction((db) => {
      const user = db.users.find((u) => u.id === req.params.id);
      if (!user) return null;

      if (typeof req.body.isActive === 'boolean') user.isActive = req.body.isActive;
      if (req.body.role && ['patient', 'doctor', 'receptionist', 'admin'].includes(req.body.role)) {
        user.role = req.body.role;
      }
      if (req.body.fullName) user.fullName = sanitizeString(req.body.fullName, 120);
      if (req.body.phone) user.phone = sanitizeString(req.body.phone, 30);
      if (typeof req.body.allowDataSharingWithDoctors === 'boolean') {
        user.allowDataSharingWithDoctors = req.body.allowDataSharingWithDoctors;
      }
      user.updatedAt = new Date().toISOString();

      appendAuditLog(db, {
        actorId: actor.userId,
        actorName: actor.fullName,
        actorRole: actor.role,
        action: 'USER_ACCOUNT_MODIFIED',
        entityType: 'user',
        entityId: user.id,
        details: `Modified user ${user.fullName} (role=${user.role}, active=${user.isActive}).`,
      });

      return sanitizeUser(user);
    });

    if (!result) return res.status(404).json({ error: 'User not found.' });
    return res.json({ user: result });
  } catch (err) {
    console.error('Modify user error:', err);
    return res.status(500).json({ error: 'Unable to update user.' });
  }
});

// Doctors Management (Admin)
adminRouter.post('/doctors', requireRoles(['admin']), async (req: AuthenticatedRequest, res) => {
  try {
    const actor = req.user!;
    const name = sanitizeString(req.body.name, 120);
    const departmentId = sanitizeString(req.body.departmentId, 80);
    const specialization = sanitizeString(req.body.specialization, 120);
    const qualifications = sanitizeString(req.body.qualifications, 200);
    const experienceYears = Number(req.body.experienceYears) || 5;
    const consultationFee = Number(req.body.consultationFee) || 500;
    const biography = sanitizeString(req.body.biography, 1000);
    const registrationNumber = sanitizeString(req.body.registrationNumber, 60) || 'PENDING-VERIFICATION';

    if (!name || !departmentId || !specialization || !qualifications) {
      return res.status(400).json({ error: 'Name, department, specialization, and qualifications are required.' });
    }

    const doctor = await runTransaction((db) => {
      const dept = db.departments.find((d) => d.id === departmentId);
      const now = new Date().toISOString();
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const newDoc = {
        id: createId('doc'),
        slug: `${slug}-${Date.now().toString(36)}`,
        name,
        departmentId,
        departmentName: dept ? dept.name : 'General Medicine',
        specialization,
        qualifications,
        experienceYears,
        consultationFee,
        languages: Array.isArray(req.body.languages)
          ? req.body.languages.map((l: unknown) => sanitizeString(l, 30))
          : ['English', 'Hindi'],
        availableDays: Array.isArray(req.body.availableDays)
          ? req.body.availableDays.map((d: unknown) => sanitizeString(d, 20))
          : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        availableTimeSlots: [
          '09:00 AM',
          '09:30 AM',
          '10:00 AM',
          '10:30 AM',
          '11:00 AM',
          '02:00 PM',
          '03:00 PM',
          '04:00 PM',
        ],
        biography: biography || `${name} is a specialist in ${dept ? dept.name : specialization} at Gokul Hospital.`,
        registrationNumber,
        isAvailable: true,
        isDemoProfile: Boolean(req.body.isDemoProfile ?? false),
        avatarColor: '#123B67',
        createdAt: now,
        updatedAt: now,
      };
      db.doctors.push(newDoc);

      appendAuditLog(db, {
        actorId: actor.userId,
        actorName: actor.fullName,
        actorRole: actor.role,
        action: 'DOCTOR_ADDED',
        entityType: 'doctor',
        entityId: newDoc.id,
        details: `Added doctor ${newDoc.name} (${newDoc.departmentName}).`,
      });
      return newDoc;
    });

    return res.status(201).json({ doctor });
  } catch (err) {
    console.error('Add doctor error:', err);
    return res.status(500).json({ error: 'Unable to add doctor.' });
  }
});

adminRouter.put('/doctors/:id', requireRoles(['admin']), async (req: AuthenticatedRequest, res) => {
  try {
    const actor = req.user!;
    const updated = await runTransaction((db) => {
      const doc = db.doctors.find((d) => d.id === req.params.id);
      if (!doc) return null;

      if (req.body.name) doc.name = sanitizeString(req.body.name, 120);
      if (req.body.departmentId) {
        const dept = db.departments.find((d) => d.id === req.body.departmentId);
        if (dept) {
          doc.departmentId = dept.id;
          doc.departmentName = dept.name;
        }
      }
      if (req.body.specialization) doc.specialization = sanitizeString(req.body.specialization, 120);
      if (req.body.qualifications) doc.qualifications = sanitizeString(req.body.qualifications, 200);
      if (req.body.experienceYears !== undefined) doc.experienceYears = Number(req.body.experienceYears);
      if (req.body.consultationFee !== undefined) doc.consultationFee = Number(req.body.consultationFee);
      if (req.body.biography) doc.biography = sanitizeString(req.body.biography, 1000);
      if (typeof req.body.isAvailable === 'boolean') doc.isAvailable = req.body.isAvailable;
      if (Array.isArray(req.body.availableDays)) {
        doc.availableDays = req.body.availableDays.map((d: unknown) => sanitizeString(d, 20));
      }
      if (Array.isArray(req.body.availableTimeSlots)) {
        doc.availableTimeSlots = req.body.availableTimeSlots.map((s: unknown) => sanitizeString(s, 20));
      }
      doc.updatedAt = new Date().toISOString();

      appendAuditLog(db, {
        actorId: actor.userId,
        actorName: actor.fullName,
        actorRole: actor.role,
        action: 'DOCTOR_UPDATED',
        entityType: 'doctor',
        entityId: doc.id,
        details: `Updated doctor profile for ${doc.name}.`,
      });
      return doc;
    });

    if (!updated) return res.status(404).json({ error: 'Doctor not found.' });
    return res.json({ doctor: updated });
  } catch (err) {
    console.error('Update doctor error:', err);
    return res.status(500).json({ error: 'Unable to update doctor.' });
  }
});

// Departments Management (Admin)
adminRouter.get('/departments', requireRoles(['admin']), (_req, res) => {
  return res.json({ departments: getDb().departments });
});

adminRouter.post('/departments', requireRoles(['admin']), async (req: AuthenticatedRequest, res) => {
  try {
    const actor = req.user!;
    const name = sanitizeString(req.body.name, 100);
    const shortDescription = sanitizeString(req.body.shortDescription, 300);
    const fullDescription = sanitizeString(req.body.fullDescription, 1200);
    const headOfDepartment = sanitizeString(req.body.headOfDepartment, 120);
    const floorLocation = sanitizeString(req.body.floorLocation, 80);

    if (!name || !shortDescription) {
      return res.status(400).json({ error: 'Department name and short description are required.' });
    }

    const dept = await runTransaction((db) => {
      const now = new Date().toISOString();
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const newDept = {
        id: createId('dept'),
        slug,
        name,
        shortDescription,
        fullDescription: fullDescription || shortDescription,
        headOfDepartment: headOfDepartment || 'Clinical Specialist Team',
        floorLocation: floorLocation || 'Main Hospital Block',
        contactExtension: sanitizeString(req.body.contactExtension, 30) || 'Ext. 100',
        keyProcedures: Array.isArray(req.body.keyProcedures)
          ? req.body.keyProcedures.map((p: unknown) => sanitizeString(p, 100))
          : ['Specialist OPD Consultation', 'Diagnostic Evaluation'],
        equipmentHighlights: Array.isArray(req.body.equipmentHighlights)
          ? req.body.equipmentHighlights.map((e: unknown) => sanitizeString(e, 100))
          : ['Modern Clinical Equipment'],
        isActive: true,
        isDemoContent: false,
        createdAt: now,
        updatedAt: now,
      };
      db.departments.push(newDept);

      appendAuditLog(db, {
        actorId: actor.userId,
        actorName: actor.fullName,
        actorRole: actor.role,
        action: 'DEPARTMENT_CREATED',
        entityType: 'department',
        entityId: newDept.id,
        details: `Created department ${newDept.name}.`,
      });
      return newDept;
    });

    return res.status(201).json({ department: dept });
  } catch (err) {
    console.error('Create department error:', err);
    return res.status(500).json({ error: 'Unable to create department.' });
  }
});

adminRouter.put('/departments/:id', requireRoles(['admin']), async (req: AuthenticatedRequest, res) => {
  try {
    const actor = req.user!;
    const updated = await runTransaction((db) => {
      const dept = db.departments.find((d) => d.id === req.params.id);
      if (!dept) return null;

      if (req.body.name) dept.name = sanitizeString(req.body.name, 100);
      if (req.body.shortDescription) dept.shortDescription = sanitizeString(req.body.shortDescription, 300);
      if (req.body.fullDescription) dept.fullDescription = sanitizeString(req.body.fullDescription, 1200);
      if (req.body.headOfDepartment) dept.headOfDepartment = sanitizeString(req.body.headOfDepartment, 120);
      if (req.body.floorLocation) dept.floorLocation = sanitizeString(req.body.floorLocation, 80);
      if (typeof req.body.isActive === 'boolean') dept.isActive = req.body.isActive;
      dept.updatedAt = new Date().toISOString();

      appendAuditLog(db, {
        actorId: actor.userId,
        actorName: actor.fullName,
        actorRole: actor.role,
        action: 'DEPARTMENT_UPDATED',
        entityType: 'department',
        entityId: dept.id,
        details: `Updated department ${dept.name} (active=${dept.isActive}).`,
      });
      return dept;
    });

    if (!updated) return res.status(404).json({ error: 'Department not found.' });
    return res.json({ department: updated });
  } catch (err) {
    console.error('Update department error:', err);
    return res.status(500).json({ error: 'Unable to update department.' });
  }
});

// Services, Facilities, Health Packages, Blogs, Testimonials, Gallery CRUD
adminRouter.post('/services', requireRoles(['admin']), async (req: AuthenticatedRequest, res) => {
  const actor = req.user!;
  const title = sanitizeString(req.body.title, 120);
  const category = sanitizeString(req.body.category, 40) as
    | 'Clinical'
    | 'Diagnostic'
    | 'Emergency'
    | 'Support'
    | 'Preventive';
  const shortDescription = sanitizeString(req.body.shortDescription, 300);
  const timings = sanitizeString(req.body.timings, 100) || 'Mon – Sat: 09:00 AM – 06:00 PM';

  if (!title || !shortDescription) {
    return res.status(400).json({ error: 'Service title and description are required.' });
  }

  const item = await runTransaction((db) => {
    const now = new Date().toISOString();
    const srv = {
      id: createId('srv'),
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title,
      category: category || 'Clinical',
      shortDescription,
      fullDescription: sanitizeString(req.body.fullDescription, 1000) || shortDescription,
      timings,
      keyFeatures: ['Verified Hospital Protocol', 'Qualified Clinical Staff'],
      is24x7: Boolean(req.body.is24x7),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    db.hospitalServices.push(srv);
    appendAuditLog(db, {
      actorId: actor.userId,
      actorName: actor.fullName,
      actorRole: actor.role,
      action: 'SERVICE_ADDED',
      entityType: 'service',
      entityId: srv.id,
      details: `Added hospital service: ${srv.title}.`,
    });
    return srv;
  });
  return res.status(201).json({ service: item });
});

adminRouter.post('/facilities', requireRoles(['admin']), async (req: AuthenticatedRequest, res) => {
  const actor = req.user!;
  const title = sanitizeString(req.body.title, 120);
  const category = sanitizeString(req.body.category, 80);
  const description = sanitizeString(req.body.description, 600);
  const location = sanitizeString(req.body.location, 100);

  if (!title || !description) {
    return res.status(400).json({ error: 'Facility title and description are required.' });
  }

  const item = await runTransaction((db) => {
    const now = new Date().toISOString();
    const fac = {
      id: createId('fac'),
      title,
      category: category || 'Hospital Infrastructure',
      description,
      location: location || 'Main Campus',
      specifications: ['Hygienic Clinical Standard', 'Regular Maintenance & Audit'],
      isVerified: Boolean(req.body.isVerified),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    db.facilities.push(fac);
    appendAuditLog(db, {
      actorId: actor.userId,
      actorName: actor.fullName,
      actorRole: actor.role,
      action: 'FACILITY_ADDED',
      entityType: 'facility',
      entityId: fac.id,
      details: `Added hospital facility: ${fac.title}.`,
    });
    return fac;
  });
  return res.status(201).json({ facility: item });
});

adminRouter.post('/packages', requireRoles(['admin']), async (req: AuthenticatedRequest, res) => {
  const actor = req.user!;
  const name = sanitizeString(req.body.name, 120);
  const targetAudience = sanitizeString(req.body.targetAudience, 200);
  const priceInr = Number(req.body.priceInr) || 1500;
  const discountedPriceInr = Number(req.body.discountedPriceInr) || priceInr;
  const includedTests = Array.isArray(req.body.includedTests)
    ? req.body.includedTests.map((t: unknown) => sanitizeString(t, 120)).filter(Boolean)
    : ['Complete Blood Count', 'Fasting Blood Sugar', 'Physician Consultation'];

  if (!name) return res.status(400).json({ error: 'Package name is required.' });

  const pkg = await runTransaction((db) => {
    const now = new Date().toISOString();
    const item = {
      id: createId('pkg'),
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name,
      targetAudience: targetAudience || 'All Adults',
      priceInr,
      discountedPriceInr,
      includedTests,
      preparationInstructions:
        sanitizeString(req.body.preparationInstructions, 300) || '10–12 hours overnight fasting.',
      turnaroundTime: sanitizeString(req.body.turnaroundTime, 60) || 'Same Day',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    db.healthPackages.push(item);
    appendAuditLog(db, {
      actorId: actor.userId,
      actorName: actor.fullName,
      actorRole: actor.role,
      action: 'HEALTH_PACKAGE_CREATED',
      entityType: 'healthPackage',
      entityId: item.id,
      details: `Created health package ${item.name} (₹${item.discountedPriceInr}).`,
    });
    return item;
  });
  return res.status(201).json({ healthPackage: pkg });
});

adminRouter.post('/blogs', requireRoles(['admin']), async (req: AuthenticatedRequest, res) => {
  const actor = req.user!;
  const title = sanitizeString(req.body.title, 160);
  const category = sanitizeString(req.body.category, 80);
  const authorName = sanitizeString(req.body.authorName, 100);
  const excerpt = sanitizeString(req.body.excerpt, 400);
  const body = sanitizeString(req.body.body, 3000);

  if (!title || !excerpt || !body) {
    return res.status(400).json({ error: 'Blog title, excerpt, and article body are required.' });
  }

  const blog = await runTransaction((db) => {
    const now = new Date().toISOString();
    const item = {
      id: createId('blog'),
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title,
      category: category || 'Health Education',
      authorName: authorName || 'Gokul Hospital Medical Editorial Team',
      authorRole: 'Gokul Hospital Specialist',
      readTimeMinutes: 4,
      excerpt,
      contentSections: [{ heading: 'Clinical Overview', body }],
      medicalDisclaimer:
        'Educational article only. Does not replace an in-person consultation with a qualified doctor.',
      isPublished: true,
      publishedAt: now,
      updatedAt: now,
    };
    db.blogs.unshift(item);
    appendAuditLog(db, {
      actorId: actor.userId,
      actorName: actor.fullName,
      actorRole: actor.role,
      action: 'BLOG_PUBLISHED',
      entityType: 'blog',
      entityId: item.id,
      details: `Published health blog: ${item.title}.`,
    });
    return item;
  });
  return res.status(201).json({ blog });
});

adminRouter.post('/testimonials', requireRoles(['admin']), async (req: AuthenticatedRequest, res) => {
  const actor = req.user!;
  const patientName = sanitizeString(req.body.patientName, 100);
  const departmentName = sanitizeString(req.body.departmentName, 100);
  const outcomeQuote = sanitizeString(req.body.outcomeQuote, 600);

  if (!patientName || !outcomeQuote) {
    return res.status(400).json({ error: 'Patient name and feedback text are required.' });
  }

  const item = await runTransaction((db) => {
    const t = {
      id: createId('test'),
      patientName,
      patientRoleOrCity: sanitizeString(req.body.patientRoleOrCity, 100) || 'Verified Patient Visit',
      departmentName: departmentName || 'General Medicine',
      doctorName: sanitizeString(req.body.doctorName, 100) || undefined,
      treatmentSummary: sanitizeString(req.body.treatmentSummary, 120) || 'Outpatient Care',
      outcomeQuote,
      isDemoContent: Boolean(req.body.isDemoContent),
      isApproved: true,
      createdAt: new Date().toISOString(),
    };
    db.testimonials.unshift(t);
    appendAuditLog(db, {
      actorId: actor.userId,
      actorName: actor.fullName,
      actorRole: actor.role,
      action: 'TESTIMONIAL_ADDED',
      entityType: 'testimonial',
      entityId: t.id,
      details: `Added patient testimonial from ${t.patientName}.`,
    });
    return t;
  });
  return res.status(201).json({ testimonial: item });
});

adminRouter.post('/gallery', requireRoles(['admin']), async (req: AuthenticatedRequest, res) => {
  const actor = req.user!;
  const title = sanitizeString(req.body.title, 120);
  const category = sanitizeString(req.body.category, 60) as
    | 'Infrastructure'
    | 'OperationTheatres'
    | 'Diagnostics'
    | 'PatientRooms'
    | 'Emergency';
  const description = sanitizeString(req.body.description, 400);
  const floorLocation = sanitizeString(req.body.floorLocation, 80);

  if (!title || !description) {
    return res.status(400).json({ error: 'Gallery item title and description are required.' });
  }

  const item = await runTransaction((db) => {
    const g = {
      id: createId('gal'),
      title,
      category: category || 'Infrastructure',
      description,
      floorLocation: floorLocation || 'Main Campus',
      isVerifiedFacility: Boolean(req.body.isVerifiedFacility),
      createdAt: new Date().toISOString(),
    };
    db.gallery.unshift(g);
    appendAuditLog(db, {
      actorId: actor.userId,
      actorName: actor.fullName,
      actorRole: actor.role,
      action: 'GALLERY_ITEM_ADDED',
      entityType: 'gallery',
      entityId: g.id,
      details: `Added gallery item: ${g.title}.`,
    });
    return g;
  });
  return res.status(201).json({ galleryItem: item });
});

// Inquiries management (Receptionist & Admin)
adminRouter.get(
  '/inquiries',
  requireRoles(['admin', 'receptionist']),
  (_req, res) => {
    const db = getDb();
    return res.json({ inquiries: db.inquiries, packageBookings: db.packageBookings });
  }
);

adminRouter.patch(
  '/inquiries/:id',
  requireRoles(['admin', 'receptionist']),
  async (req: AuthenticatedRequest, res) => {
    const actor = req.user!;
    const status = sanitizeString(req.body.status, 30) as 'New' | 'InProgress' | 'Resolved';
    const responseNote = sanitizeString(req.body.responseNote, 500);

    const updated = await runTransaction((db) => {
      const inq = db.inquiries.find((i) => i.id === req.params.id);
      if (!inq) return null;
      if (status) inq.status = status;
      if (responseNote !== undefined) inq.responseNote = responseNote;
      inq.updatedAt = new Date().toISOString();

      appendAuditLog(db, {
        actorId: actor.userId,
        actorName: actor.fullName,
        actorRole: actor.role,
        action: 'INQUIRY_UPDATED',
        entityType: 'inquiry',
        entityId: inq.id,
        details: `Updated inquiry ${inq.id} status to ${inq.status}.`,
      });
      return inq;
    });

    if (!updated) return res.status(404).json({ error: 'Inquiry not found.' });
    return res.json({ inquiry: updated });
  }
);

// Hospital Announcement Broadcast
adminRouter.post(
  '/announcements',
  requireRoles(['admin']),
  async (req: AuthenticatedRequest, res) => {
    const actor = req.user!;
    const title = sanitizeString(req.body.title, 120);
    const message = sanitizeString(req.body.message, 500);
    const targetRole = sanitizeString(req.body.targetRole, 30);

    if (!title || !message) {
      return res.status(400).json({ error: 'Announcement title and message are required.' });
    }

    const notif = await runTransaction((db) => {
      const now = new Date().toISOString();
      const item = {
        id: createId('notif'),
        userId: targetRole && targetRole !== 'ALL' ? `ROLE:${targetRole}` : 'ALL',
        targetRole:
          targetRole && targetRole !== 'ALL' ? (targetRole as UserRole) : undefined,
        title,
        message,
        eventType: 'HOSPITAL_ANNOUNCEMENT' as const,
        isRead: false,
        createdAt: now,
      };
      db.notifications.unshift(item);

      appendAuditLog(db, {
        actorId: actor.userId,
        actorName: actor.fullName,
        actorRole: actor.role,
        action: 'ANNOUNCEMENT_BROADCASTED',
        entityType: 'notification',
        entityId: item.id,
        details: `Broadcasted announcement "${title}" to ${targetRole || 'ALL'}.`,
      });
      return item;
    });

    return res.status(201).json({ notification: notif });
  }
);

// Website Settings (Admin)
adminRouter.put('/settings', requireRoles(['admin']), async (req: AuthenticatedRequest, res) => {
  try {
    const actor = req.user!;
    const settings = await runTransaction((db) => {
      const s = db.websiteSettings;
      if (req.body.hospitalName) s.hospitalName = sanitizeString(req.body.hospitalName, 100);
      if (req.body.tagline) s.tagline = sanitizeString(req.body.tagline, 160);
      if (req.body.heroHeadline) s.heroHeadline = sanitizeString(req.body.heroHeadline, 160);
      if (req.body.heroSubheading) s.heroSubheading = sanitizeString(req.body.heroSubheading, 300);
      if (req.body.aboutSummary) s.aboutSummary = sanitizeString(req.body.aboutSummary, 1000);
      if (req.body.missionStatement) s.missionStatement = sanitizeString(req.body.missionStatement, 600);
      if (req.body.visionStatement) s.visionStatement = sanitizeString(req.body.visionStatement, 600);
      if (req.body.addressLine1) s.addressLine1 = sanitizeString(req.body.addressLine1, 200);
      if (req.body.cityStatePin) s.cityStatePin = sanitizeString(req.body.cityStatePin, 120);
      if (req.body.contactPhone) s.contactPhone = sanitizeString(req.body.contactPhone, 60);
      if (req.body.emergencyPhone) s.emergencyPhone = sanitizeString(req.body.emergencyPhone, 60);
      if (req.body.ambulancePhone) s.ambulancePhone = sanitizeString(req.body.ambulancePhone, 60);
      if (req.body.emailAddress) s.emailAddress = sanitizeString(req.body.emailAddress, 120);
      if (req.body.supportEmail) s.supportEmail = sanitizeString(req.body.supportEmail, 120);
      if (req.body.opdHours) s.opdHours = sanitizeString(req.body.opdHours, 160);
      if (req.body.visitingHours) s.visitingHours = sanitizeString(req.body.visitingHours, 160);
      if (req.body.emergencyHours) s.emergencyHours = sanitizeString(req.body.emergencyHours, 160);
      if (req.body.cancellationWindowHours !== undefined) {
        s.cancellationWindowHours = Number(req.body.cancellationWindowHours) || 4;
      }
      if (typeof req.body.allowRescheduling === 'boolean') {
        s.allowRescheduling = req.body.allowRescheduling;
      }
      if (typeof req.body.isPlaceholderContactInfo === 'boolean') {
        s.isPlaceholderContactInfo = req.body.isPlaceholderContactInfo;
      }
      s.updatedAt = new Date().toISOString();

      appendAuditLog(db, {
        actorId: actor.userId,
        actorName: actor.fullName,
        actorRole: actor.role,
        action: 'WEBSITE_SETTINGS_UPDATED',
        entityType: 'websiteSettings',
        entityId: 'global',
        details: 'Updated Gokul Hospital website configuration and contact details.',
      });
      return s;
    });

    return res.json({ settings });
  } catch (err) {
    console.error('Update settings error:', err);
    return res.status(500).json({ error: 'Unable to update website settings.' });
  }
});

adminRouter.get('/audit-logs', requireRoles(['admin']), (_req, res) => {
  return res.json({ auditLogs: getDb().auditLogs });
});
