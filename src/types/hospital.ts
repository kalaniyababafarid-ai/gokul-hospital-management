export type UserRole = 'patient' | 'doctor' | 'receptionist' | 'admin';

export type AppointmentStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed' | 'No-show';

export interface UserAccount {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  allergies?: string;
  chronicConditions?: string;
  privacyConsent: boolean;
  termsAccepted: boolean;
  allowDataSharingWithDoctors?: boolean;
  doctorId?: string; // Linked doctor record if role === 'doctor'
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  headOfDepartment: string;
  floorLocation: string;
  contactExtension: string;
  keyProcedures: string[];
  equipmentHighlights: string[];
  isActive: boolean;
  isDemoContent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
  id: string;
  slug: string;
  userId?: string;
  name: string;
  departmentId: string;
  departmentName: string;
  specialization: string;
  qualifications: string;
  experienceYears: number;
  consultationFee: number; // in INR
  languages: string[];
  availableDays: string[]; // e.g. ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  availableTimeSlots: string[]; // e.g. ['09:00 AM', '09:30 AM', '10:00 AM', ...]
  biography: string;
  registrationNumber: string;
  isAvailable: boolean;
  isDemoProfile: boolean;
  avatarColor: string;
  createdAt: string;
  updatedAt: string;
}

export interface SimulatedEmailPreview {
  id: string;
  to: string;
  from: string;
  subject: string;
  body: string;
  sentAt: string;
  mode: 'DEMO_EMAIL_MODE' | 'LIVE_SMTP';
  disclaimer: string;
}

export interface Appointment {
  id: string;
  appointmentNumber: string; // e.g. GKH-2026-1001
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientDob?: string;
  departmentId: string;
  departmentName: string;
  doctorId: string;
  doctorName: string;
  consultationFee: number;
  appointmentDate: string; // YYYY-MM-DD
  timeSlot: string; // e.g. '10:00 AM'
  reason: string;
  notes?: string;
  status: AppointmentStatus;
  paymentStatus: 'Unpaid' | 'PayAtHospital' | 'PaidSandbox';
  paymentReference?: string;
  demoEmailPreview?: SimulatedEmailPreview;
  cancellationReason?: string;
  bookedByRole: UserRole | 'public';
  createdAt: string;
  updatedAt: string;
}

export interface HospitalService {
  id: string;
  slug: string;
  title: string;
  category: 'Clinical' | 'Diagnostic' | 'Emergency' | 'Support' | 'Preventive';
  shortDescription: string;
  fullDescription: string;
  timings: string;
  keyFeatures: string[];
  is24x7: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HospitalFacility {
  id: string;
  title: string;
  category: string;
  description: string;
  location: string;
  specifications: string[];
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HealthPackage {
  id: string;
  slug: string;
  name: string;
  targetAudience: string;
  priceInr: number;
  discountedPriceInr?: number;
  includedTests: string[];
  preparationInstructions: string;
  turnaroundTime: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PackageBookingRequest {
  id: string;
  packageId: string;
  packageName: string;
  priceInr: number;
  patientId?: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  preferredDate: string;
  notes?: string;
  status: 'Requested' | 'Confirmed' | 'Completed' | 'Cancelled';
  createdAt: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  appointmentId?: string;
  visitDate: string;
  diagnosis: string;
  clinicalNotes: string;
  vitalSigns: {
    bloodPressure?: string;
    heartRate?: string;
    temperature?: string;
    weightKg?: string;
    spo2?: string;
  };
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  departmentName: string;
  appointmentId?: string;
  issuedDate: string;
  diagnosis: string;
  medications: {
    medicineName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }[];
  generalAdvice: string;
  createdAt: string;
}

export interface LabReport {
  id: string;
  reportNumber: string;
  patientId: string;
  patientName: string;
  orderedByDoctorName: string;
  testName: string;
  category: 'Pathology' | 'Biochemistry' | 'Microbiology' | 'Radiology' | 'Cardiology';
  sampleDate: string;
  reportDate: string;
  status: 'Processing' | 'Verified';
  summaryResult: string;
  parameters: {
    parameter: string;
    observedValue: string;
    unit: string;
    referenceRange: string;
  }[];
  fileName?: string;
  fileDataUrl?: string; // Authorized base64 PDF/Text report
  uploadedByRole: UserRole;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string; // specific user ID or 'ROLE:admin', 'ROLE:receptionist'
  targetRole?: UserRole;
  title: string;
  message: string;
  eventType:
    | 'PATIENT_REGISTRATION'
    | 'APPOINTMENT_BOOKING'
    | 'APPOINTMENT_CONFIRMATION'
    | 'APPOINTMENT_CANCELLATION'
    | 'APPOINTMENT_RESCHEDULED'
    | 'APPOINTMENT_REMINDER'
    | 'HOSPITAL_ANNOUNCEMENT'
    | 'LAB_REPORT_READY'
    | 'PRESCRIPTION_ISSUED';
  isRead: boolean;
  relatedId?: string;
  createdAt: string;
}

export interface InquiryItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  department?: string;
  message: string;
  status: 'New' | 'InProgress' | 'Resolved';
  responseNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestimonialItem {
  id: string;
  patientName: string;
  patientRoleOrCity: string;
  departmentName: string;
  doctorName?: string;
  treatmentSummary: string;
  outcomeQuote: string;
  isDemoContent: boolean;
  isApproved: boolean;
  createdAt: string;
}

export interface BlogItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  authorName: string;
  authorRole: string;
  readTimeMinutes: number;
  excerpt: string;
  contentSections: {
    heading: string;
    body: string;
  }[];
  medicalDisclaimer: string;
  isPublished: boolean;
  publishedAt: string;
  updatedAt: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Infrastructure' | 'OperationTheatres' | 'Diagnostics' | 'PatientRooms' | 'Emergency';
  description: string;
  floorLocation: string;
  isVerifiedFacility: boolean;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole | 'system' | 'public';
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  ipAddress?: string;
  createdAt: string;
}

export interface WebsiteSettings {
  hospitalName: string;
  tagline: string;
  heroHeadline: string;
  heroSubheading: string;
  aboutSummary: string;
  missionStatement: string;
  visionStatement: string;
  addressLine1: string;
  cityStatePin: string;
  country: string;
  contactPhone: string;
  emergencyPhone: string;
  ambulancePhone: string;
  emailAddress: string;
  supportEmail: string;
  opdHours: string;
  visitingHours: string;
  emergencyHours: string;
  currencyCode: string;
  currencySymbol: string;
  cancellationWindowHours: number;
  allowRescheduling: boolean;
  socialLinks: {
    facebook: string;
    twitter: string;
    linkedin: string;
    instagram: string;
    youtube: string;
  };
  isPlaceholderContactInfo: boolean;
  updatedAt: string;
}
