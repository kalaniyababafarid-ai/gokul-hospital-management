import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  ArrowRight,
  ShieldCheck,
  Clock,
  HeartPulse,
  Stethoscope,
  CheckCircle2,
  PhoneCall,
  FileText,
  ChevronDown,
  MapPin,
  Cpu,
  Microscope,
  MonitorCheck,
  ClipboardCheck,
  Sparkles,
  Award,
  Users,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext.tsx';
import { usePageSeo } from '../layouts/PublicLayout.tsx';
import { DoctorAvatarSvg } from '../components/BrandLogo.tsx';
import {
  HeroMedicalTeamScene,
  AboutHospitalVisual,
  DepartmentMedicalVisual,
  DoctorPortraitVisual,
  FacilityVisualBanner,
  BlogThumbnailVisual,
} from '../components/MedicalVisuals.tsx';
import { HOSPITAL_PHOTOGRAPHY } from '../config/medicalImages.ts';

export { DoctorAvatarSvg };

const HOME_FAQS = [
  {
    q: 'How do I book an outpatient (OPD) appointment at Gokul Hospital?',
    a: 'Use the Quick Appointment Booking bar above or visit the Appointment page. Select your medical department, choose a specialist doctor, pick an available date and time slot, and receive an instant booking reference.',
  },
  {
    q: 'Are emergency and ambulance services available 24/7?',
    a: 'Yes. Gokul Hospital operates a 24/7 Emergency & Trauma Care unit on the Ground Floor with dedicated triage beds, cardiac life-support ambulances, and on-duty intensivists.',
  },
  {
    q: 'How can patients view their prescriptions and diagnostic lab reports?',
    a: 'Register or log in to the Patient Portal using your email address. Under Medical Records and Prescriptions, you can view and print clinical notes and lab reports issued by your consulting doctor.',
  },
  {
    q: 'What is the consultation fee currency and payment policy?',
    a: 'All consultation fees and preventive health checkup packages are listed transparently in Indian Rupees (INR ₹). You can test online booking using Demo Payment Mode or opt to pay at the Hospital Reception Desk.',
  },
];

const WHY_CHOOSE_PILLARS = [
  {
    number: '01',
    title: 'Senior Board-Certified Consultants',
    description:
      'Every outpatient and inpatient case is led by senior specialists across cardiology, neurology, orthopedics, pediatrics, surgery, and critical care.',
    image: HOSPITAL_PHOTOGRAPHY.doctorConsultation,
    badge: '15+ Clinical Specialties',
  },
  {
    number: '02',
    title: 'Class-100 Modular OTs & 24/7 ICU',
    description:
      'HEPA-filtered laminar airflow operation theatres and multipara-monitored intensive care beds ensure international infection-control standards.',
    image: HOSPITAL_PHOTOGRAPHY.intensiveCareUnit,
    badge: 'Zero-Infection Protocol',
  },
  {
    number: '03',
    title: 'NABL-Grade 24/7 Diagnostics & Imaging',
    description:
      'High-field MRI, multi-slice CT, 4D Ultrasound, Digital X-Ray, and automated biochemistry analyzers under one roof for rapid clinical diagnosis.',
    image: HOSPITAL_PHOTOGRAPHY.diagnosticMriSuite,
    badge: 'Same-Day Reporting',
  },
];

const HEALTHCARE_TECHNOLOGIES = [
  {
    title: 'Electronic Health Records (EHR)',
    badge: 'Digital Continuity',
    description:
      'Longitudinal digital patient history linking OPD consultations, diagnostic parameters, and medication charts securely across all 15 departments.',
    icon: FileText,
  },
  {
    title: 'High-Precision Digital Diagnostics',
    badge: 'NABL-Grade Workflow',
    description:
      'Automated biochemistry analyzers, multi-slice CT imaging, 4D Ultrasound, and low-radiation Digital X-Ray with PACS cloud archiving.',
    icon: Microscope,
  },
  {
    title: 'Class-100 Modular Operation Theatres',
    badge: 'Zero-Infection Standard',
    description:
      'Laminar airflow surgical suites with HEPA filtration, antimicrobial seamless walls, C-Arm fluoroscopy, and central anesthesia workstations.',
    icon: Cpu,
  },
  {
    title: '24/7 Telemetry & ICU Monitoring',
    badge: 'Critical Care',
    description:
      'Centralized multipara cardiac and respiratory telemetry stations enabling continuous bedside and nursing-station surveillance.',
    icon: MonitorCheck,
  },
  {
    title: 'Smart Real-Time Slot Engine',
    badge: 'Zero Double-Booking',
    description:
      'Concurrency-checked OPD scheduling system that verifies live doctor availability and eliminates waiting-hall overcrowding.',
    icon: Calendar,
  },
  {
    title: 'Digital Prescriptions & Smart Reports',
    badge: 'Instant Portal Access',
    description:
      'Structured electronic prescriptions with dosage schedules and downloadable diagnostic summaries accessible 24/7 from the Patient Portal.',
    icon: ClipboardCheck,
  },
];

export function HomePage() {
  usePageSeo(
    'Multi-Specialty Hospital & Healthcare Management System',
    'Gokul Hospital provides 24/7 Emergency Care, 15+ Specialized Medical Departments, Expert Doctors, Preventive Health Checkups, and Online Appointment Booking in India.'
  );

  const {
    settings,
    departments,
    doctors,
    services,
    facilities,
    healthPackages,
    testimonials,
    blogs,
  } = useHospital();

  const navigate = useNavigate();
  const [quickDept, setQuickDept] = useState('');
  const [quickDoc, setQuickDoc] = useState('');
  const [quickDate, setQuickDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const filteredDoctors = quickDept
    ? doctors.filter((d) => String(d.departmentId) === String(quickDept))
    : doctors;

  const handleQuickBook = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (quickDept) params.set('departmentId', quickDept);
    if (quickDoc) params.set('doctorId', quickDoc);
    if (quickDate) params.set('date', quickDate);
    navigate(`/appointment?${params.toString()}`);
  };

  const emergencyPhone = settings?.emergencyPhone || '108 / +91-00000-10800';
  const contactPhone = settings?.contactPhone || '+91-00000-00000';

  return (
    <div className="space-y-20 sm:space-y-24 pb-16">
      {/* 1. WIDE SPLIT HERO BANNER */}
      <section className="relative bg-gradient-to-br from-[#0D2E52] via-[#123B67] to-[#167DB5] text-white overflow-hidden border-b border-white/10">
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 20%, #19B7A5 0%, transparent 45%), radial-gradient(circle at 85% 75%, #1685B8 0%, transparent 50%)',
          }}
        />
        <div className="hospital-container py-14 sm:py-20 lg:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Hospital Badge, Large Headline, Highlights & Action Buttons */}
            <div className="lg:col-span-6 space-y-6 animate-fade-up">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-semibold text-[#19B7A5]">
                <HeartPulse className="w-4 h-4 shrink-0" />
                <span>GOKUL HOSPITAL · MULTI-SPECIALTY HEALTHCARE INDIA</span>
              </div>

              <h1 className="heading-hero text-white text-balance">
                Advanced Clinical Care,{' '}
                <span className="text-[#19B7A5]">Built Around Every Patient.</span>
              </h1>

              <p className="text-base sm:text-lg text-white/90 leading-relaxed max-w-2xl">
                {settings?.aboutSummary ||
                  'Comprehensive outpatient, inpatient, surgical, diagnostic, and 24/7 emergency care across 15 specialized clinical departments with experienced doctors and transparent INR pricing.'}
              </p>

              {/* Key Clinical Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 border border-white/15">
                  <p className="text-2xl sm:text-3xl font-display font-extrabold text-[#19B7A5] font-mono-tabular">
                    {departments.length}+
                  </p>
                  <p className="text-sm font-semibold text-white mt-0.5">
                    Medical Specialties
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 border border-white/15">
                  <p className="text-2xl sm:text-3xl font-display font-extrabold text-[#19B7A5] font-mono-tabular">
                    {doctors.length}+
                  </p>
                  <p className="text-sm font-semibold text-white mt-0.5">
                    Specialist Doctors
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 border border-white/15">
                  <p className="text-2xl sm:text-3xl font-display font-extrabold text-[#19B7A5] font-mono-tabular">
                    24×7
                  </p>
                  <p className="text-sm font-semibold text-white mt-0.5">
                    Emergency &amp; ICU
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/appointment"
                  className="inline-flex items-center gap-2.5 px-7 py-4 rounded-xl bg-[#19B7A5] hover:bg-[#159e8e] text-[#123B67] font-display font-bold text-base transition-all shadow-lg hover:shadow-xl"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Book Appointment</span>
                </Link>
                <Link
                  to="/doctors"
                  className="inline-flex items-center gap-2 px-6 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/25 font-display font-semibold text-base transition-all"
                >
                  <span>Find a Doctor</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/emergency"
                  className="inline-flex items-center gap-2 px-5 py-4 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-white border border-red-300/30 font-display font-semibold text-base transition-all"
                >
                  <PhoneCall className="w-5 h-5 text-[#19B7A5]" />
                  <span>Emergency Care</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Photorealistic Medical Team & Hospital Showcase */}
            <div className="lg:col-span-6 animate-fade-up">
              <HeroMedicalTeamScene
                emergencyPhone={emergencyPhone}
                opdHours={settings?.opdHours}
              />
            </div>
          </div>
        </div>
      </section>

      {/* QUICK APPOINTMENT BOOKING BAR */}
      <section className="hospital-container -mt-12 sm:-mt-14 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/90 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#EAF5FC] text-[#123B67] flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#1685B8]" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-display font-bold text-[#123B67]">
                  Quick Outpatient (OPD) Appointment Finder
                </h2>
                <p className="text-sm text-slate-600">
                  Select a clinical department, specialist doctor, and preferred consultation date
                </p>
              </div>
            </div>
            <span className="text-xs sm:text-sm font-semibold text-[#1685B8] bg-[#EAF5FC] px-3.5 py-1.5 rounded-full self-start sm:self-auto">
              Instant Online Slot Verification
            </span>
          </div>

          <form
            onSubmit={handleQuickBook}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
          >
            <div>
              <label
                htmlFor="quick-dept"
                className="block text-sm font-semibold text-[#123B67] mb-2"
              >
                1. Medical Department
              </label>
              <select
                id="quick-dept"
                value={quickDept}
                onChange={(e) => {
                  setQuickDept(e.target.value);
                  setQuickDoc('');
                }}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-[15px] text-[#243447] focus:outline-none focus:border-[#1685B8] focus:bg-white"
              >
                <option value="">All {departments.length} Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="quick-doc"
                className="block text-sm font-semibold text-[#123B67] mb-2"
              >
                2. Consulting Doctor
              </label>
              <select
                id="quick-doc"
                value={quickDoc}
                onChange={(e) => setQuickDoc(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-[15px] text-[#243447] focus:outline-none focus:border-[#1685B8] focus:bg-white"
              >
                <option value="">Any Available Specialist</option>
                {filteredDoctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} — ₹{doc.consultationFee}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="quick-date"
                className="block text-sm font-semibold text-[#123B67] mb-2"
              >
                3. Preferred Visit Date
              </label>
              <input
                id="quick-date"
                type="date"
                value={quickDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setQuickDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-[15px] text-[#243447] focus:outline-none focus:border-[#1685B8] focus:bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3.5 rounded-xl bg-[#123B67] hover:bg-[#1685B8] text-white font-display font-bold text-[15px] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <span>Check Available Slots</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </section>

      {/* 2. HOSPITAL INTRODUCTION SECTION */}
      <section className="hospital-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF5FC] text-[#1685B8] text-xs sm:text-sm font-bold uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>01. Hospital Introduction</span>
            </div>
            <h2 className="heading-section text-[#123B67] text-balance">
              Patient-Centered Healthcare Built on Clinical Transparency &amp; Ethics
            </h2>
            <p className="text-[16px] text-[#243447]/90 leading-relaxed">
              {settings?.aboutSummary ||
                'Gokul Hospital is a premier multi-specialty healthcare institution dedicated to accessible, evidence-based medical treatment, modern surgical care, and compassionate patient recovery.'}
            </p>

            <div className="pt-2 space-y-4 text-[15px]">
              <div className="flex items-start gap-3.5 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                <CheckCircle2 className="w-6 h-6 text-[#19B7A5] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#123B67] block text-base font-display">
                    Multidisciplinary Clinical Collaboration
                  </strong>
                  <span className="text-slate-600">
                    Seamless coordination between cardiology, neurology, orthopedics, pediatrics, surgery, and critical care specialists.
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3.5 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                <CheckCircle2 className="w-6 h-6 text-[#19B7A5] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#123B67] block text-base font-display">
                    Transparent INR Consultation &amp; Package Tariffs
                  </strong>
                  <span className="text-slate-600">
                    Upfront display of specialist consultation fees and preventive health checkup packages with zero hidden charges.
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3.5 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                <CheckCircle2 className="w-6 h-6 text-[#19B7A5] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#123B67] block text-base font-display">
                    Role-Protected Digital HMS Portals
                  </strong>
                  <span className="text-slate-600">
                    Dedicated electronic workspaces for Patients, Consulting Doctors, Receptionists, and Hospital Administrators.
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 flex flex-wrap gap-4">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#123B67] text-white font-semibold text-[15px] hover:bg-[#1685B8] transition-colors"
              >
                <span>Read Hospital Overview</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/mission-vision"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-[#123B67] text-[#123B67] font-semibold text-[15px] hover:bg-[#EAF5FC] transition-colors"
              >
                <span>Our Mission &amp; Vision</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <AboutHospitalVisual />
          </div>
        </div>
      </section>

      {/* 3. WHY CHOOSE GOKUL HOSPITAL SECTION */}
      <section className="bg-white border-y border-slate-200/90 py-18 sm:py-20">
        <div className="hospital-container space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-[#1685B8] uppercase tracking-wider">
                02. Why Choose Gokul Hospital
              </p>
              <h2 className="heading-section text-[#123B67] mt-1">
                International Standards of Clinical Safety &amp; Patient Care
              </h2>
              <p className="text-[16px] text-slate-600 mt-1 max-w-2xl">
                Every clinical protocol at Gokul Hospital is engineered for rapid diagnosis, evidence-based surgical precision, and compassionate inpatient recovery.
              </p>
            </div>
            <Link
              to="/overview"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#EAF5FC] text-[#123B67] hover:bg-[#123B67] hover:text-white font-bold text-[15px] transition-colors self-start sm:self-auto"
            >
              <span>Clinical Governance</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {WHY_CHOOSE_PILLARS.map((item) => (
              <div
                key={item.number}
                className="hospital-card-hover bg-[#F5F9FC] rounded-3xl p-5 border border-slate-200/90 flex flex-col justify-between gap-5"
              >
                <div className="space-y-4">
                  <div className="relative h-52 rounded-2xl overflow-hidden border border-slate-200 image-hover-zoom">
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#123B67]/85 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-lg bg-white/95 text-[#123B67] text-xs font-extrabold font-mono-tabular">
                        {item.number}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <span className="px-2.5 py-1 rounded-md bg-[#19B7A5] text-[#123B67] text-[11px] font-extrabold uppercase tracking-wider">
                        {item.badge}
                      </span>
                    </div>
                  </div>
                  <div className="px-1 space-y-2">
                    <h3 className="heading-card text-[#123B67]">{item.title}</h3>
                    <p className="text-[15px] text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. MEDICAL DEPARTMENTS SECTION (WITH PHOTOREALISTIC BANNERS) */}
      <section className="hospital-container space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-[#1685B8] uppercase tracking-wider">
              03. Centers of Clinical Excellence
            </p>
            <h2 className="heading-section text-[#123B67] mt-1">
              Specialized Medical Departments
            </h2>
            <p className="text-[16px] text-slate-600 mt-1 max-w-2xl">
              Explore our {departments.length} specialized departments equipped with dedicated outpatient clinics, diagnostic support, and inpatient wards.
            </p>
          </div>
          <Link
            to="/departments"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#EAF5FC] text-[#123B67] hover:bg-[#123B67] hover:text-white font-bold text-[15px] transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            <span>Explore All {departments.length} Departments</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {departments.slice(0, 6).map((dept) => (
            <div
              key={dept.id}
              className="hospital-card-hover bg-white rounded-3xl p-5 border border-slate-200/90 flex flex-col justify-between gap-5 shadow-xs"
            >
              <div className="space-y-4">
                <DepartmentMedicalVisual slug={dept.slug} name={dept.name} heightClass="h-48" />

                <div className="px-1 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#1685B8]">
                    <span>{dept.floorLocation}</span>
                    <span>Ext: {dept.contactExtension}</span>
                  </div>
                  <h3 className="heading-card text-[#123B67]">
                    {dept.name}
                  </h3>
                  <p className="text-[15px] text-slate-600 leading-relaxed">
                    {dept.shortDescription}
                  </p>
                </div>
              </div>

              <div className="px-1 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <Link
                  to={`/departments/${dept.slug}`}
                  className="text-sm font-bold text-[#1685B8] hover:text-[#123B67] inline-flex items-center gap-1.5"
                >
                  <span>Department Details</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to={`/appointment?departmentId=${dept.id}`}
                  className="px-4 py-2 rounded-xl bg-[#EAF5FC] hover:bg-[#123B67] text-[#123B67] hover:text-white text-sm font-bold transition-colors"
                >
                  Book OPD
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. OUR DOCTORS SECTION (WITH PHOTOREALISTIC STUDIO PORTRAITS) */}
      <section className="bg-white border-y border-slate-200 py-20">
        <div className="hospital-container space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-[#1685B8] uppercase tracking-wider">
                04. Specialist Directory
              </p>
              <h2 className="heading-section text-[#123B67] mt-1">
                Meet Our Consulting Doctors
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Note: Profiles marked [Demo Profile] are realistic demonstration templates managed via the Hospital Admin Console.
              </p>
            </div>
            <Link
              to="/doctors"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#123B67] text-white hover:bg-[#1685B8] font-bold text-[15px] transition-colors whitespace-nowrap self-start sm:self-auto"
            >
              <span>View All {doctors.length} Doctors</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
            {doctors.slice(0, 4).map((doc) => (
              <div
                key={doc.id}
                className="hospital-card-hover bg-[#F5F9FC] rounded-3xl p-5 border border-slate-200/90 flex flex-col justify-between gap-5"
              >
                <div className="space-y-4">
                  <DoctorPortraitVisual
                    name={doc.name}
                    specialization={doc.specialization}
                    departmentName={doc.departmentName}
                    size="md"
                  />

                  <div className="space-y-1.5">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#1685B8]">
                      {doc.departmentName}
                    </p>
                    <h3 className="heading-card text-[#123B67]">
                      {doc.name}
                    </h3>
                    <p className="text-sm font-medium text-slate-600">
                      {doc.specialization}
                    </p>
                  </div>

                  <div className="text-sm text-slate-600 space-y-1.5 pt-3 border-t border-slate-200/80">
                    <p>
                      <strong className="text-[#123B67]">Qualifications:</strong>{' '}
                      {doc.qualifications}
                    </p>
                    <p className="tabular-nums">
                      <strong className="text-[#123B67]">Experience:</strong>{' '}
                      {doc.experienceYears} Years ·{' '}
                      <strong className="text-[#123B67]">Fee:</strong>{' '}
                      <span className="text-[#1685B8] font-bold">₹{doc.consultationFee}</span>
                    </p>
                    <p>
                      <strong className="text-[#123B67]">OPD Days:</strong>{' '}
                      {doc.availableDays.slice(0, 3).join(', ')}
                      {doc.availableDays.length > 3 ? ` +${doc.availableDays.length - 3}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 pt-2">
                  <Link
                    to={`/doctors/${doc.slug}`}
                    className="flex-1 text-center px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-sm font-bold text-[#123B67] whitespace-nowrap transition-colors"
                  >
                    View Profile
                  </Link>
                  <Link
                    to={`/appointment?departmentId=${doc.departmentId}&doctorId=${doc.id}`}
                    className="flex-1 text-center px-3.5 py-2.5 rounded-xl bg-[#123B67] hover:bg-[#1685B8] text-sm font-bold text-white whitespace-nowrap transition-colors"
                  >
                    Book Slot
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6 & 7. MEDICAL SERVICES & ADVANCED HOSPITAL FACILITIES */}
      <section className="hospital-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Services */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm font-bold text-[#1685B8] uppercase tracking-wider">
                  05. Clinical &amp; Diagnostic Services
                </p>
                <h2 className="heading-section text-[#123B67] mt-1">
                  Comprehensive Medical Services
                </h2>
              </div>
              <Link
                to="/services"
                className="text-sm font-bold text-[#1685B8] hover:underline whitespace-nowrap"
              >
                All {services.length} Services →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {services.slice(0, 6).map((srv) => (
                <div
                  key={srv.id}
                  className="hospital-card-hover bg-white rounded-2xl p-6 border border-slate-200 space-y-2.5"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-[#1685B8]">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#EAF5FC]">
                      {srv.category}
                    </span>
                    <span>{srv.is24x7 ? '24/7 Service' : srv.timings}</span>
                  </div>
                  <h3 className="text-lg font-display font-bold text-[#123B67]">
                    {srv.title}
                  </h3>
                  <p className="text-[15px] text-slate-600 leading-relaxed">
                    {srv.shortDescription}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Facilities with Photorealistic Banners */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm font-bold text-[#1685B8] uppercase tracking-wider">
                  06. Campus Infrastructure
                </p>
                <h2 className="heading-section text-[#123B67] mt-1">
                  Advanced Facilities
                </h2>
              </div>
              <Link
                to="/facilities"
                className="text-sm font-bold text-[#1685B8] hover:underline whitespace-nowrap"
              >
                Explore Facilities →
              </Link>
            </div>

            <div className="space-y-5">
              {facilities.slice(0, 3).map((fac) => (
                <div
                  key={fac.id}
                  className="hospital-card-hover bg-white rounded-2xl p-4 border border-slate-200 space-y-3"
                >
                  <FacilityVisualBanner
                    category={fac.category}
                    title={fac.title}
                    heightClass="h-40"
                  />
                  <div className="px-1 space-y-1">
                    <div className="text-xs font-semibold text-[#1685B8]">
                      {fac.category} · {fac.location}
                    </div>
                    <p className="text-[15px] text-slate-600 leading-relaxed">
                      {fac.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 8. HEALTHCARE TECHNOLOGY SECTION */}
      <section className="hospital-container space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-[#1685B8] uppercase tracking-wider">
              07. Next-Generation Clinical Systems
            </p>
            <h2 className="heading-section text-[#123B67] mt-1">
              Healthcare Technology &amp; Digital HMS
            </h2>
            <p className="text-[16px] text-slate-600 mt-1 max-w-2xl">
              Gokul Hospital integrates modern medical equipment with a unified digital hospital information architecture for safer, faster clinical outcomes.
            </p>
          </div>
          <Link
            to="/facilities"
            className="inline-flex items-center gap-2 text-[15px] font-bold text-[#1685B8] hover:text-[#123B67]"
          >
            <span>Explore Campus Technology</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {HEALTHCARE_TECHNOLOGIES.map((tech, idx) => {
            const IconComp = tech.icon;
            return (
              <div
                key={idx}
                className="hospital-card-hover bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 space-y-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#EAF5FC] text-[#123B67] flex items-center justify-center">
                    <IconComp className="w-6 h-6 text-[#1685B8]" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#EAF5FC] text-[#123B67] text-xs font-bold">
                    {tech.badge}
                  </span>
                </div>
                <h3 className="heading-card text-[#123B67]">
                  {tech.title}
                </h3>
                <p className="text-[15px] text-slate-600 leading-relaxed">
                  {tech.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 9. BOOK APPOINTMENT CTA SECTION (WITH PHOTOREALISTIC CONSULTATION PHOTO) */}
      <section className="hospital-container">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-7 p-8 sm:p-12 space-y-5 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF5FC] text-[#1685B8] text-xs font-bold uppercase tracking-wider self-start">
              <Calendar className="w-4 h-4" />
              <span>08. Online OPD Scheduling</span>
            </div>
            <h2 className="heading-section text-[#123B67]">
              Schedule Your Specialist Consultation Without Waiting in Queue
            </h2>
            <p className="text-[16px] text-slate-600 leading-relaxed">
              Choose from {departments.length} clinical departments and {doctors.length}+ specialist doctors. Our real-time slot verification engine locks your appointment immediately and generates a printable OPD slip.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1 text-sm text-[#123B67] font-semibold">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#19B7A5] shrink-0" />
                <span>Real-time doctor availability check</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#19B7A5] shrink-0" />
                <span>Instant Appointment ID (GKH-YYYY-XXXX)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#19B7A5] shrink-0" />
                <span>Pay at Hospital or Demo Payment Mode</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#19B7A5] shrink-0" />
                <span>In-app confirmation &amp; Patient Portal sync</span>
              </div>
            </div>
            <div className="pt-3 flex flex-wrap gap-4">
              <Link
                to="/appointment"
                className="inline-flex items-center gap-2.5 px-7 py-4 rounded-xl bg-[#123B67] hover:bg-[#1685B8] text-white font-display font-bold text-base transition-all shadow-md"
              >
                <Calendar className="w-5 h-5 text-[#19B7A5]" />
                <span>Book Outpatient Appointment</span>
              </Link>
              <Link
                to="/doctors"
                className="inline-flex items-center gap-2 px-6 py-4 rounded-xl border border-[#123B67] text-[#123B67] hover:bg-[#EAF5FC] font-display font-bold text-base transition-all"
              >
                <span>Browse Doctor Timings</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 relative min-h-[280px] sm:min-h-[360px] image-hover-zoom">
            <img
              src={HOSPITAL_PHOTOGRAPHY.doctorConsultation}
              alt="Doctor consulting patient at Gokul Hospital"
              loading="lazy"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#123B67]/85 via-[#123B67]/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
              <span className="px-3 py-1 rounded-md bg-[#19B7A5] text-[#123B67] text-xs font-extrabold uppercase tracking-wider">
                Outpatient Clinic
              </span>
              <p className="text-lg font-display font-bold pt-1">
                Compassionate, Evidence-Based Medical Consultations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 10. 24/7 EMERGENCY SERVICES SECTION */}
      <section className="hospital-container">
        <div className="rounded-3xl bg-gradient-to-r from-[#123B67] via-[#154B80] to-[#1685B8] text-white p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-xl">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#19B7A5]/20 border border-[#19B7A5]/40 text-xs font-bold uppercase tracking-wider text-[#19B7A5]">
              09. 24/7 Emergency &amp; Trauma Response
            </div>
            <h2 className="heading-section text-white">
              Immediate Medical Attention When Every Minute Counts
            </h2>
            <p className="text-base text-white/90 leading-relaxed">
              Our Ground Floor Emergency &amp; Trauma Triage unit is staffed round-the-clock with emergency medical officers, cardiac defibrillators, ventilator ambulances, and direct lift access to ICU and Modular OTs.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <div className="bg-white/10 border border-white/20 rounded-2xl px-6 py-4">
                <p className="text-xs text-white/80 font-medium">24/7 Emergency Helpline</p>
                <p className="text-xl sm:text-2xl font-display font-extrabold tabular-nums text-[#19B7A5]">
                  {emergencyPhone}
                </p>
              </div>
              <Link
                to="/emergency"
                className="px-6 py-4 rounded-2xl bg-white text-[#123B67] hover:bg-[#EAF5FC] font-display font-bold text-base transition-colors whitespace-nowrap shadow-md"
              >
                Emergency Protocol Guide
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative h-60 rounded-2xl overflow-hidden border border-white/20 shadow-lg image-hover-zoom">
              <img
                src={HOSPITAL_PHOTOGRAPHY.emergencyTraumaBay}
                alt="24/7 Emergency and Trauma Care Unit at Gokul Hospital"
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D2E52]/85 via-transparent to-transparent" />
              <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#19B7A5]">
                  Ground Floor Trauma Bay
                </span>
                <span className="text-xs font-mono-tabular bg-white/15 px-2.5 py-1 rounded-md">
                  ALS Ambulance Ready
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11. HEALTH CHECKUP PACKAGES */}
      <section className="hospital-container space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-[#1685B8] uppercase tracking-wider">
              10. Preventive Healthcare
            </p>
            <h2 className="heading-section text-[#123B67] mt-1">
              Preventive Health Checkup Packages (INR ₹)
            </h2>
            <p className="text-[16px] text-slate-600 mt-1">
              Comprehensive full-body screening packages with NABL-grade pathology and specialist physician consultation.
            </p>
          </div>
          <Link
            to="/packages"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#EAF5FC] text-[#123B67] hover:bg-[#123B67] hover:text-white font-bold text-[15px] transition-colors self-start sm:self-auto"
          >
            <span>Compare All Packages &amp; Book</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {healthPackages.map((pkg) => (
            <div
              key={pkg.id}
              className="hospital-card-hover bg-white rounded-3xl p-6 border border-slate-200 flex flex-col justify-between gap-6"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-[#EAF5FC] text-[#123B67] text-xs font-bold">
                    {pkg.turnaroundTime}
                  </span>
                  <Sparkles className="w-4 h-4 text-[#19B7A5]" />
                </div>
                <h3 className="heading-card text-[#123B67]">
                  {pkg.name}
                </h3>
                <p className="text-sm text-slate-600">{pkg.targetAudience}</p>
                <div className="pt-2 flex items-baseline gap-2.5 tabular-nums">
                  <span className="text-3xl font-display font-extrabold text-[#123B67]">
                    ₹{pkg.discountedPriceInr || pkg.priceInr}
                  </span>
                  {pkg.discountedPriceInr && pkg.discountedPriceInr < pkg.priceInr && (
                    <span className="text-sm text-slate-400 line-through">
                      ₹{pkg.priceInr}
                    </span>
                  )}
                </div>
                <ul className="space-y-2 pt-3 border-t border-slate-100 text-sm text-slate-600">
                  {pkg.includedTests.slice(0, 4).map((test, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#19B7A5] shrink-0 mt-0.5" />
                      <span>{test}</span>
                    </li>
                  ))}
                  {pkg.includedTests.length > 4 && (
                    <li className="text-[#1685B8] font-semibold pt-1">
                      + {pkg.includedTests.length - 4} additional parameters
                    </li>
                  )}
                </ul>
              </div>

              <Link
                to="/packages"
                className="w-full text-center px-4 py-3 rounded-xl bg-[#123B67] hover:bg-[#1685B8] text-white text-sm font-bold transition-colors"
              >
                Request Package Slot
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 12 & 13. PATIENT TESTIMONIALS & LATEST HEALTH BLOGS */}
      <section className="hospital-container grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Testimonials */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-bold text-[#1685B8] uppercase tracking-wider">
                11. Patient Stories
              </p>
              <h2 className="heading-section text-[#123B67] mt-1">
                Patient Testimonials
              </h2>
            </div>
            <Link
              to="/testimonials"
              className="text-sm font-bold text-[#1685B8] hover:underline"
            >
              View All →
            </Link>
          </div>

          <div className="space-y-4">
            {testimonials.slice(0, 3).map((t) => (
              <div
                key={t.id}
                className="hospital-card-hover bg-white rounded-3xl p-6 border border-slate-200 space-y-3.5"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md bg-[#EAF5FC] text-[#123B67] text-xs font-bold">
                    {t.departmentName}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Verified Demo Feedback
                  </span>
                </div>
                <p className="text-[15px] text-slate-700 leading-relaxed italic">
                  “{t.outcomeQuote}”
                </p>
                <div className="text-sm text-slate-600 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <strong className="text-[#123B67]">{t.patientName}</strong>
                  <span className="text-xs text-slate-500">{t.treatmentSummary}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Health Blogs */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-bold text-[#1685B8] uppercase tracking-wider">
                12. Clinical Education
              </p>
              <h2 className="heading-section text-[#123B67] mt-1">
                Latest Health Blogs
              </h2>
            </div>
            <Link to="/blog" className="text-sm font-bold text-[#1685B8] hover:underline">
              All Articles →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {blogs.slice(0, 2).map((blog) => (
              <div
                key={blog.id}
                className="hospital-card-hover bg-white rounded-3xl p-5 border border-slate-200 flex flex-col justify-between gap-4"
              >
                <div className="space-y-3.5">
                  <BlogThumbnailVisual category={blog.category} title={blog.title} />
                  <div className="text-xs font-semibold text-slate-500">
                    <span>{blog.authorName}</span>
                    <span aria-hidden="true"> · </span>
                    <span className="tabular-nums">{blog.readTimeMinutes} min read</span>
                  </div>
                  <h3 className="text-lg font-display font-bold text-[#123B67]">
                    <Link to={`/blog/${blog.slug}`} className="hover:text-[#1685B8]">
                      {blog.title}
                    </Link>
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                    {blog.excerpt}
                  </p>
                </div>
                <Link
                  to={`/blog/${blog.slug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-[#1685B8] hover:text-[#123B67] pt-2"
                >
                  <span>Read Clinical Guide</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 14 & 15. FREQUENTLY ASKED QUESTIONS & CONTACT INFORMATION */}
      <section className="hospital-container grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-6">
          <div>
            <p className="text-sm font-bold text-[#1685B8] uppercase tracking-wider">
              13. Patient Guidance
            </p>
            <h2 className="heading-section text-[#123B67] mt-1">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3.5">
            {HOME_FAQS.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 text-base font-display font-bold text-[#123B67] hover:bg-slate-50 cursor-pointer"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-500 transition-transform shrink-0 ${
                      openFaq === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-5 text-[15px] text-slate-600 leading-relaxed border-t border-slate-100 pt-3.5">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white rounded-3xl p-7 sm:p-8 border border-slate-200 space-y-6 flex flex-col justify-between">
          <div className="space-y-5">
            <div>
              <p className="text-sm font-bold text-[#1685B8] uppercase tracking-wider">
                14. Contact Information &amp; Hours
              </p>
              <h2 className="heading-section text-[#123B67] mt-1">
                Visit Gokul Hospital
              </h2>
            </div>

            <div className="space-y-4 text-[15px] text-slate-600">
              <div className="flex items-start gap-3.5">
                <MapPin className="w-5 h-5 text-[#1685B8] shrink-0 mt-1" />
                <div>
                  <strong className="text-[#123B67] block text-base font-display">
                    Campus Address
                  </strong>
                  <span>{settings?.addressLine1}</span>
                  <br />
                  <span>{settings?.cityStatePin}</span>
                </div>
              </div>
              <div className="flex items-start gap-3.5">
                <Clock className="w-5 h-5 text-[#19B7A5] shrink-0 mt-1" />
                <div>
                  <strong className="text-[#123B67] block text-base font-display">
                    Outpatient &amp; Visiting Hours
                  </strong>
                  <span>OPD: {settings?.opdHours}</span>
                  <br />
                  <span>Visiting: {settings?.visitingHours}</span>
                </div>
              </div>
              <div className="flex items-start gap-3.5">
                <PhoneCall className="w-5 h-5 text-[#123B67] shrink-0 mt-1" />
                <div>
                  <strong className="text-[#123B67] block text-base font-display">
                    Direct Hospital Helplines
                  </strong>
                  <span>Reception Desk: {contactPhone}</span>
                  <br />
                  <span className="text-[#1685B8] font-semibold">
                    24/7 Emergency: {emergencyPhone}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-3">
            <Link
              to="/contact"
              className="flex-1 text-center px-5 py-3.5 rounded-xl bg-[#123B67] hover:bg-[#1685B8] text-white text-sm font-bold transition-colors"
            >
              Contact &amp; Inquiry Form
            </Link>
            <Link
              to="/appointment"
              className="flex-1 text-center px-5 py-3.5 rounded-xl border border-[#123B67] text-[#123B67] hover:bg-[#EAF5FC] text-sm font-bold transition-colors"
            >
              Book Consultation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
