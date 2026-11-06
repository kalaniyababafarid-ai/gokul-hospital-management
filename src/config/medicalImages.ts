/**
 * Centralized Photorealistic Medical Photography Registry for GOKUL HOSPITAL
 * All images are stored locally under /public/assets/medical/ and served from /assets/medical/
 * Strictly zero cartoon / vector human illustrations.
 */

export const HOSPITAL_PHOTOGRAPHY = {
  heroMedicalTeam: '/assets/medical/hero-medical-team.jpg',
  hospitalExterior: '/assets/medical/hospital-building-exterior.jpg',
  receptionLounge: '/assets/medical/hospital-reception-lounge.jpg',
  doctorConsultation: '/assets/medical/doctor-patient-consultation.jpg',
  healthCheckupPackage: '/assets/medical/health-checkup-package.jpg',
  modularOperationTheatre: '/assets/medical/dept-general-surgery.jpg',
  diagnosticMriSuite: '/assets/medical/dept-radiology.jpg',
  pathologyLaboratory: '/assets/medical/facility-laboratory.jpg',
  intensiveCareUnit: '/assets/medical/facility-icu.jpg',
  deluxePatientRoom: '/assets/medical/facility-patient-room.jpg',
  pharmacyCounter: '/assets/medical/facility-pharmacy.jpg',
  emergencyTraumaBay: '/assets/medical/dept-emergency.jpg',
} as const;

export const DEPARTMENT_PHOTOGRAPHY: Record<string, { src: string; caption: string }> = {
  cardiology: {
    src: '/assets/medical/dept-cardiology.jpg',
    caption: 'Interventional Cardiology & Non-Invasive Echo / ECG Telemetry Suite',
  },
  neurology: {
    src: '/assets/medical/dept-neurology.jpg',
    caption: 'Neurosciences, Stroke Unit & High-Resolution Brain Neuro-Imaging',
  },
  orthopedics: {
    src: '/assets/medical/dept-orthopedics.jpg',
    caption: 'Joint Replacement, Arthroscopy & Musculoskeletal Trauma Care',
  },
  pediatrics: {
    src: '/assets/medical/dept-pediatrics.jpg',
    caption: 'Child Health, Neonatal Care & Pediatric Immunization Clinic',
  },
  gynecology: {
    src: '/assets/medical/dept-gynecology.jpg',
    caption: 'Obstetrics, Maternity Suites & Comprehensive Women’s Healthcare',
  },
  dermatology: {
    src: '/assets/medical/dept-dermatology.jpg',
    caption: 'Clinical Dermatology, Dermatoscopy & Skin Therapeutics',
  },
  'general-medicine': {
    src: '/assets/medical/dept-general-medicine.jpg',
    caption: 'Internal Medicine, Metabolic Disorders & Chronic Disease Management',
  },
  'general-surgery': {
    src: '/assets/medical/dept-general-surgery.jpg',
    caption: 'Minimally Invasive Laparoscopic & Modular Surgical Suites',
  },
  dentistry: {
    src: '/assets/medical/dept-dentistry.jpg',
    caption: 'Advanced Dental Chairs, Endodontics & Maxillofacial Care',
  },
  ophthalmology: {
    src: '/assets/medical/dept-ophthalmology.jpg',
    caption: 'Precision Slit-Lamp Biomicroscopy, Cataract & Retina Clinic',
  },
  oncology: {
    src: '/assets/medical/dept-oncology.jpg',
    caption: 'Multidisciplinary Medical & Surgical Oncology Day-Care Unit',
  },
  radiology: {
    src: '/assets/medical/dept-radiology.jpg',
    caption: 'Multi-Slice CT, Digital MRI, 4D Ultrasound & PACS Imaging',
  },
  'emergency-medicine': {
    src: '/assets/medical/dept-emergency.jpg',
    caption: '24/7 Emergency Triage, Trauma Resuscitation & Cardiac Life Support',
  },
  emergency: {
    src: '/assets/medical/dept-emergency.jpg',
    caption: '24/7 Emergency Triage, Trauma Resuscitation & Cardiac Life Support',
  },
  ent: {
    src: '/assets/medical/dept-ent.jpg',
    caption: 'Otorhinolaryngology (ENT), Video Endoscopy & Audiology Clinic',
  },
  physiotherapy: {
    src: '/assets/medical/dept-physiotherapy.jpg',
    caption: 'Post-Operative Rehabilitation, Electrotherapy & Mobility Recovery',
  },
};

const FEMALE_DOCTOR_PORTRAITS = [
  '/assets/medical/doctor-female-1.jpg',
  '/assets/medical/doctor-female-2.jpg',
  '/assets/medical/doctor-female-3.jpg',
  '/assets/medical/doctor-female-4.jpg',
];

const MALE_DOCTOR_PORTRAITS = [
  '/assets/medical/doctor-male-1.jpg',
  '/assets/medical/doctor-male-2.jpg',
  '/assets/medical/doctor-male-3.jpg',
  '/assets/medical/doctor-male-4.jpg',
];

const FEMALE_FIRST_NAMES = [
  'ananya',
  'priya',
  'meera',
  'kavita',
  'sneha',
  'nandini',
  'pooja',
  'divya',
  'ritika',
  'shreya',
  'sunita',
  'neha',
  'aditi',
  'radhika',
  'swati',
  'anjali',
];

export function getDoctorPortraitPhoto(name: string): { src: string; isFemale: boolean } {
  const normalized = name.toLowerCase();
  const isFemale = FEMALE_FIRST_NAMES.some((fn) => normalized.includes(fn));
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash * 31 + normalized.charCodeAt(i)) >>> 0;
  }
  const pool = isFemale ? FEMALE_DOCTOR_PORTRAITS : MALE_DOCTOR_PORTRAITS;
  return {
    src: pool[hash % pool.length],
    isFemale,
  };
}

export function getDepartmentPhoto(slug: string, name?: string): { src: string; caption: string } {
  const key = (slug || '').toLowerCase();
  if (DEPARTMENT_PHOTOGRAPHY[key]) {
    return DEPARTMENT_PHOTOGRAPHY[key];
  }
  const combined = `${key} ${(name || '').toLowerCase()}`;
  if (combined.includes('cardio')) return DEPARTMENT_PHOTOGRAPHY.cardiology;
  if (combined.includes('neuro')) return DEPARTMENT_PHOTOGRAPHY.neurology;
  if (combined.includes('ortho') || combined.includes('bone')) return DEPARTMENT_PHOTOGRAPHY.orthopedics;
  if (combined.includes('pedia') || combined.includes('child')) return DEPARTMENT_PHOTOGRAPHY.pediatrics;
  if (combined.includes('gynec') || combined.includes('obstet') || combined.includes('matern'))
    return DEPARTMENT_PHOTOGRAPHY.gynecology;
  if (combined.includes('derma') || combined.includes('skin')) return DEPARTMENT_PHOTOGRAPHY.dermatology;
  if (combined.includes('surg')) return DEPARTMENT_PHOTOGRAPHY['general-surgery'];
  if (combined.includes('dent')) return DEPARTMENT_PHOTOGRAPHY.dentistry;
  if (combined.includes('ophthal') || combined.includes('eye')) return DEPARTMENT_PHOTOGRAPHY.ophthalmology;
  if (combined.includes('onco') || combined.includes('cancer')) return DEPARTMENT_PHOTOGRAPHY.oncology;
  if (combined.includes('radio') || combined.includes('imag') || combined.includes('mri'))
    return DEPARTMENT_PHOTOGRAPHY.radiology;
  if (combined.includes('emerg') || combined.includes('trauma'))
    return DEPARTMENT_PHOTOGRAPHY['emergency-medicine'];
  if (combined.includes('ent') || combined.includes('ear')) return DEPARTMENT_PHOTOGRAPHY.ent;
  if (combined.includes('physio') || combined.includes('rehab')) return DEPARTMENT_PHOTOGRAPHY.physiotherapy;
  return DEPARTMENT_PHOTOGRAPHY['general-medicine'];
}

export function getFacilityPhoto(category: string, title: string): string {
  const key = `${category} ${title}`.toLowerCase();
  if (key.includes('icu') || key.includes('intensive') || key.includes('critical')) {
    return HOSPITAL_PHOTOGRAPHY.intensiveCareUnit;
  }
  if (key.includes('operation') || key.includes('surgical') || key.includes('theatre') || key.includes('ot')) {
    return HOSPITAL_PHOTOGRAPHY.modularOperationTheatre;
  }
  if (key.includes('lab') || key.includes('pathology') || key.includes('biochem')) {
    return HOSPITAL_PHOTOGRAPHY.pathologyLaboratory;
  }
  if (key.includes('diag') || key.includes('mri') || key.includes('ct') || key.includes('radiology') || key.includes('xray')) {
    return HOSPITAL_PHOTOGRAPHY.diagnosticMriSuite;
  }
  if (key.includes('room') || key.includes('ward') || key.includes('inpatient') || key.includes('suite')) {
    return HOSPITAL_PHOTOGRAPHY.deluxePatientRoom;
  }
  if (key.includes('pharm') || key.includes('medicin')) {
    return HOSPITAL_PHOTOGRAPHY.pharmacyCounter;
  }
  if (key.includes('emerg') || key.includes('trauma') || key.includes('ambulance')) {
    return HOSPITAL_PHOTOGRAPHY.emergencyTraumaBay;
  }
  if (key.includes('recep') || key.includes('lobby') || key.includes('waiting') || key.includes('atrium')) {
    return HOSPITAL_PHOTOGRAPHY.receptionLounge;
  }
  if (key.includes('consult') || key.includes('opd')) {
    return HOSPITAL_PHOTOGRAPHY.doctorConsultation;
  }
  return HOSPITAL_PHOTOGRAPHY.hospitalExterior;
}

export function getBlogPhoto(category: string, title: string): string {
  const key = `${category} ${title}`.toLowerCase();
  if (key.includes('heart') || key.includes('cardiac') || key.includes('cardio') || key.includes('bp')) {
    return DEPARTMENT_PHOTOGRAPHY.cardiology.src;
  }
  if (key.includes('child') || key.includes('pediatric') || key.includes('immuniz')) {
    return DEPARTMENT_PHOTOGRAPHY.pediatrics.src;
  }
  if (key.includes('joint') || key.includes('bone') || key.includes('ortho') || key.includes('posture')) {
    return DEPARTMENT_PHOTOGRAPHY.orthopedics.src;
  }
  if (key.includes('brain') || key.includes('stroke') || key.includes('neuro')) {
    return DEPARTMENT_PHOTOGRAPHY.neurology.src;
  }
  if (key.includes('checkup') || key.includes('preventive') || key.includes('screen') || key.includes('diabetes')) {
    return HOSPITAL_PHOTOGRAPHY.healthCheckupPackage;
  }
  return HOSPITAL_PHOTOGRAPHY.doctorConsultation;
}
