import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type {
  UserAccount,
  Department,
  Doctor,
  Appointment,
  HospitalService,
  HospitalFacility,
  HealthPackage,
  PackageBookingRequest,
  MedicalRecord,
  Prescription,
  LabReport,
  NotificationItem,
  InquiryItem,
  TestimonialItem,
  BlogItem,
  GalleryItem,
  AuditLogItem,
  WebsiteSettings,
  UserRole,
} from '../../src/types/hospital.ts';
import { hashPassword } from './cryptoAuth.ts';
import {
  INITIAL_SETTINGS,
  INITIAL_DEPARTMENTS,
  INITIAL_DOCTORS,
  INITIAL_SERVICES,
  INITIAL_FACILITIES,
  INITIAL_HEALTH_PACKAGES,
  INITIAL_TESTIMONIALS,
  INITIAL_BLOGS,
  INITIAL_GALLERY,
} from './seedData.ts';

export interface StoredUser extends UserAccount {
  passwordHash: string;
}

export interface PasswordResetToken {
  token: string;
  userId: string;
  email: string;
  expiresAt: number;
  used: boolean;
}

export interface HospitalDatabaseSchema {
  users: StoredUser[];
  departments: Department[];
  doctors: Doctor[];
  appointments: Appointment[];
  hospitalServices: HospitalService[];
  facilities: HospitalFacility[];
  healthPackages: HealthPackage[];
  packageBookings: PackageBookingRequest[];
  medicalRecords: MedicalRecord[];
  prescriptions: Prescription[];
  labReports: LabReport[];
  notifications: NotificationItem[];
  inquiries: InquiryItem[];
  testimonials: TestimonialItem[];
  blogs: BlogItem[];
  gallery: GalleryItem[];
  websiteSettings: WebsiteSettings;
  auditLogs: AuditLogItem[];
  passwordResetTokens: PasswordResetToken[];
  appointmentSequence: number;
}

const DATA_DIR = path.resolve(process.cwd(), 'server', 'data');
const DB_FILE = path.join(DATA_DIR, 'gokul_hospital_db.json');

let memoryDb: HospitalDatabaseSchema | null = null;
let writeQueue: Promise<void> = Promise.resolve();

function createInitialDatabase(): HospitalDatabaseSchema {
  const now = new Date().toISOString();
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const nextWeek = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const lastWeek = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const users: StoredUser[] = [
    {
      id: 'user-admin-1',
      fullName: 'Gokul Hospital Chief Administrator',
      email: 'admin@gokulhospital.in',
      phone: '+91-98000-00001',
      role: 'admin',
      isActive: true,
      emailVerified: true,
      privacyConsent: true,
      termsAccepted: true,
      passwordHash: hashPassword('Admin@123'),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'user-doctor-1',
      fullName: 'Dr. Rajeshwar Sharma',
      email: 'dr.sharma@gokulhospital.in',
      phone: '+91-98000-00002',
      role: 'doctor',
      doctorId: 'doc-1',
      isActive: true,
      emailVerified: true,
      privacyConsent: true,
      termsAccepted: true,
      passwordHash: hashPassword('Doctor@123'),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'user-receptionist-1',
      fullName: 'Anjali Verma (OPD Front Desk)',
      email: 'reception@gokulhospital.in',
      phone: '+91-98000-00003',
      role: 'receptionist',
      isActive: true,
      emailVerified: true,
      privacyConsent: true,
      termsAccepted: true,
      passwordHash: hashPassword('Reception@123'),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'user-patient-1',
      fullName: 'Aarav Patel',
      email: 'patient@gokulhospital.in',
      phone: '+91-98765-43210',
      role: 'patient',
      isActive: true,
      emailVerified: true,
      dateOfBirth: '1988-05-14',
      gender: 'Male',
      bloodGroup: 'O+',
      address: '14 Shanti Niketan Society, India',
      emergencyContact: '+91-98765-43211 (Spouse)',
      allergies: 'Penicillin (Mild Rash)',
      chronicConditions: 'Borderline Hypertension',
      privacyConsent: true,
      termsAccepted: true,
      allowDataSharingWithDoctors: true,
      passwordHash: hashPassword('Patient@123'),
      createdAt: now,
      updatedAt: now,
    },
  ];

  const appointments: Appointment[] = [
    {
      id: 'appt-1001',
      appointmentNumber: 'GKH-2026-1001',
      patientId: 'user-patient-1',
      patientName: 'Aarav Patel',
      patientEmail: 'patient@gokulhospital.in',
      patientPhone: '+91-98765-43210',
      patientDob: '1988-05-14',
      departmentId: 'dept-cardiology',
      departmentName: 'Cardiology',
      doctorId: 'doc-1',
      doctorName: 'Dr. Rajeshwar Sharma',
      consultationFee: 800,
      appointmentDate: tomorrow,
      timeSlot: '10:00 AM',
      reason: 'Annual Blood Pressure & Preventive Cardiac Review',
      notes: 'Bringing home BP monitor log for the last 2 weeks.',
      status: 'Confirmed',
      paymentStatus: 'PayAtHospital',
      bookedByRole: 'patient',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'appt-1002',
      appointmentNumber: 'GKH-2026-1002',
      patientId: 'user-patient-1',
      patientName: 'Aarav Patel',
      patientEmail: 'patient@gokulhospital.in',
      patientPhone: '+91-98765-43210',
      patientDob: '1988-05-14',
      departmentId: 'dept-general-medicine',
      departmentName: 'General Medicine',
      doctorId: 'doc-6',
      doctorName: 'Dr. Arvind Iyer',
      consultationFee: 550,
      appointmentDate: nextWeek,
      timeSlot: '11:00 AM',
      reason: 'Fasting Metabolic & Thyroid Profile Follow-up',
      status: 'Pending',
      paymentStatus: 'PayAtHospital',
      bookedByRole: 'patient',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'appt-1000',
      appointmentNumber: 'GKH-2026-1000',
      patientId: 'user-patient-1',
      patientName: 'Aarav Patel',
      patientEmail: 'patient@gokulhospital.in',
      patientPhone: '+91-98765-43210',
      patientDob: '1988-05-14',
      departmentId: 'dept-cardiology',
      departmentName: 'Cardiology',
      doctorId: 'doc-1',
      doctorName: 'Dr. Rajeshwar Sharma',
      consultationFee: 800,
      appointmentDate: lastWeek,
      timeSlot: '09:30 AM',
      reason: 'Initial Blood Pressure Evaluation & Resting ECG',
      status: 'Completed',
      paymentStatus: 'PayAtHospital',
      bookedByRole: 'patient',
      createdAt: lastWeek,
      updatedAt: lastWeek,
    },
  ];

  const medicalRecords: MedicalRecord[] = [
    {
      id: 'mr-1',
      patientId: 'user-patient-1',
      patientName: 'Aarav Patel',
      doctorId: 'doc-1',
      doctorName: 'Dr. Rajeshwar Sharma',
      appointmentId: 'appt-1000',
      visitDate: lastWeek,
      diagnosis: 'Stage 1 Essential Hypertension (Controlled)',
      clinicalNotes:
        'Patient presented for baseline cardiac checkup. Resting 12-lead ECG shows normal sinus rhythm (HR 74 bpm). Advised low-sodium DASH diet, 30 mins brisk walking daily, and morning blood pressure monitoring.',
      vitalSigns: {
        bloodPressure: '132/84 mmHg',
        heartRate: '74 bpm',
        temperature: '98.4 °F',
        weightKg: '74.5 kg',
        spo2: '99%',
      },
      followUpDate: tomorrow,
      createdAt: lastWeek,
      updatedAt: lastWeek,
    },
  ];

  const prescriptions: Prescription[] = [
    {
      id: 'rx-1',
      patientId: 'user-patient-1',
      patientName: 'Aarav Patel',
      doctorId: 'doc-1',
      doctorName: 'Dr. Rajeshwar Sharma',
      departmentName: 'Cardiology',
      appointmentId: 'appt-1000',
      issuedDate: lastWeek,
      diagnosis: 'Stage 1 Essential Hypertension & Vitamin D3 Insufficiency',
      medications: [
        {
          medicineName: 'Tab. Telmisartan 20 mg',
          dosage: '20 mg',
          frequency: 'Once Daily (Morning)',
          duration: '30 Days',
          instructions: 'Take after breakfast with water.',
        },
        {
          medicineName: 'Cholecalciferol (Vitamin D3) 60,000 IU',
          dosage: '1 Sachet / Capsule',
          frequency: 'Once Weekly',
          duration: '8 Weeks',
          instructions: 'Take with milk after lunch on Sundays.',
        },
      ],
      generalAdvice: 'Restrict dietary salt to < 5g/day. Maintain 7–8 hours of sleep. Repeat BP check in 2 weeks.',
      createdAt: lastWeek,
    },
  ];

  const labReports: LabReport[] = [
    {
      id: 'lab-1',
      reportNumber: 'GKH-LAB-2026-0891',
      patientId: 'user-patient-1',
      patientName: 'Aarav Patel',
      orderedByDoctorName: 'Dr. Rajeshwar Sharma',
      testName: 'Complete Lipid Profile & Fasting Glucose',
      category: 'Biochemistry',
      sampleDate: lastWeek,
      reportDate: lastWeek,
      status: 'Verified',
      summaryResult: 'Fasting Blood Glucose within normal limits. Mildly borderline LDL cholesterol.',
      parameters: [
        { parameter: 'Fasting Blood Glucose (FBS)', observedValue: '92', unit: 'mg/dL', referenceRange: '70 – 100' },
        { parameter: 'Total Cholesterol', observedValue: '188', unit: 'mg/dL', referenceRange: '< 200' },
        { parameter: 'Triglycerides', observedValue: '134', unit: 'mg/dL', referenceRange: '< 150' },
        { parameter: 'HDL Cholesterol', observedValue: '48', unit: 'mg/dL', referenceRange: '> 40' },
        { parameter: 'LDL Cholesterol', observedValue: '113', unit: 'mg/dL', referenceRange: '< 100' },
      ],
      uploadedByRole: 'admin',
      createdAt: lastWeek,
    },
  ];

  const notifications: NotificationItem[] = [
    {
      id: 'notif-1',
      userId: 'user-patient-1',
      title: 'Appointment Confirmed — GKH-2026-1001',
      message: `Your Cardiology consultation with Dr. Rajeshwar Sharma on ${tomorrow} at 10:00 AM is confirmed.`,
      eventType: 'APPOINTMENT_CONFIRMATION',
      isRead: false,
      relatedId: 'appt-1001',
      createdAt: now,
    },
    {
      id: 'notif-2',
      userId: 'user-patient-1',
      title: 'Lab Report Ready — GKH-LAB-2026-0891',
      message: 'Your Complete Lipid Profile & Fasting Glucose report has been verified and is available for download.',
      eventType: 'LAB_REPORT_READY',
      isRead: false,
      relatedId: 'lab-1',
      createdAt: now,
    },
    {
      id: 'notif-3',
      userId: 'user-doctor-1',
      title: 'Upcoming Consultation — Aarav Patel',
      message: `Confirmed Cardiology appointment GKH-2026-1001 scheduled for ${tomorrow} at 10:00 AM.`,
      eventType: 'APPOINTMENT_BOOKING',
      isRead: false,
      relatedId: 'appt-1001',
      createdAt: now,
    },
    {
      id: 'notif-4',
      userId: 'ROLE:receptionist',
      targetRole: 'receptionist',
      title: 'OPD Pending Confirmation — GKH-2026-1002',
      message: `Patient Aarav Patel booked General Medicine appointment GKH-2026-1002 for ${nextWeek} at 11:00 AM.`,
      eventType: 'APPOINTMENT_BOOKING',
      isRead: false,
      relatedId: 'appt-1002',
      createdAt: now,
    },
  ];

  const auditLogs: AuditLogItem[] = [
    {
      id: 'audit-1',
      actorId: 'system',
      actorName: 'Gokul Hospital System',
      actorRole: 'system',
      action: 'DATABASE_INITIALIZED',
      entityType: 'system',
      entityId: 'gokul-hospital-core',
      details: 'Initialized Gokul Hospital database with 15 medical departments, 8 demonstration doctor profiles, and RBAC accounts.',
      createdAt: now,
    },
  ];

  return {
    users,
    departments: INITIAL_DEPARTMENTS,
    doctors: INITIAL_DOCTORS,
    appointments,
    hospitalServices: INITIAL_SERVICES,
    facilities: INITIAL_FACILITIES,
    healthPackages: INITIAL_HEALTH_PACKAGES,
    packageBookings: [],
    medicalRecords,
    prescriptions,
    labReports,
    notifications,
    inquiries: [],
    testimonials: INITIAL_TESTIMONIALS,
    blogs: INITIAL_BLOGS,
    gallery: INITIAL_GALLERY,
    websiteSettings: INITIAL_SETTINGS,
    auditLogs,
    passwordResetTokens: [],
    appointmentSequence: 1003,
  };
}

export function getDb(): HospitalDatabaseSchema {
  if (memoryDb) return memoryDb;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      memoryDb = JSON.parse(raw) as HospitalDatabaseSchema;
      return memoryDb;
    } catch (err) {
      console.error('Error reading hospital DB file, re-initializing:', err);
    }
  }

  memoryDb = createInitialDatabase();
  fs.writeFileSync(DB_FILE, JSON.stringify(memoryDb, null, 2), 'utf-8');
  return memoryDb;
}

export async function runTransaction<T>(mutator: (db: HospitalDatabaseSchema) => Promise<T> | T): Promise<T> {
  const previous = writeQueue;
  let release!: () => void;
  writeQueue = new Promise<void>((resolve) => {
    release = resolve;
  });

  await previous;
  try {
    const db = getDb();
    const result = await mutator(db);
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
    return result;
  } finally {
    release();
  }
}

export function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}`;
}

export function appendAuditLog(
  db: HospitalDatabaseSchema,
  params: {
    actorId: string;
    actorName: string;
    actorRole: UserRole | 'system' | 'public';
    action: string;
    entityType: string;
    entityId: string;
    details: string;
  }
) {
  db.auditLogs.unshift({
    id: createId('audit'),
    actorId: params.actorId,
    actorName: params.actorName,
    actorRole: params.actorRole,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    details: params.details,
    createdAt: new Date().toISOString(),
  });
  if (db.auditLogs.length > 500) {
    db.auditLogs.length = 500;
  }
}

export function sanitizeUser(user: StoredUser): UserAccount {
  const { passwordHash: _removed, ...rest } = user;
  return rest;
}
