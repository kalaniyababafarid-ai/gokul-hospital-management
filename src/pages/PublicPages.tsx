import React, { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  CheckCircle2,
  PhoneCall,
  Calendar,
  MapPin,
  Mail,
  Clock,
  ArrowRight,
  Search,
  AlertTriangle,
  ShieldCheck,
  Building2,
  ChevronDown,
  X,
  ZoomIn,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext.tsx';
import { apiRequest } from '../services/api.ts';
import { usePageSeo } from '../layouts/PublicLayout.tsx';
import {
  AboutHospitalVisual,
  FacilityVisualBanner,
  BlogThumbnailVisual,
} from '../components/MedicalVisuals.tsx';
import type {
  Doctor,
  Department,
  HospitalService,
  HealthPackage,
  BlogItem,
  GalleryItem,
} from '../types/hospital.ts';

export function AboutPage() {
  const { settings, departments, doctors, services } = useHospital();
  usePageSeo('About Gokul Hospital', settings?.aboutSummary);

  return (
    <div className="hospital-container py-10 sm:py-14 space-y-12">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center shadow-xs">
        <div className="lg:col-span-7 space-y-5">
          <p className="text-sm font-bold text-[#1685B8] uppercase tracking-wider">
            Official Institution Profile
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-display font-extrabold text-[#123B67] leading-tight">
            About {settings?.hospitalName || 'GOKUL HOSPITAL'}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            {settings?.aboutSummary}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-[#F5F9FC] rounded-2xl p-5 border border-slate-200">
              <p className="text-sm text-slate-500 font-medium">Medical Specialties</p>
              <p className="text-2xl sm:text-3xl font-display font-extrabold text-[#123B67] tabular-nums mt-1">
                {departments.length} Active
              </p>
            </div>
            <div className="bg-[#F5F9FC] rounded-2xl p-5 border border-slate-200">
              <p className="text-sm text-slate-500 font-medium">Clinical Consultants</p>
              <p className="text-2xl sm:text-3xl font-display font-extrabold text-[#1685B8] tabular-nums mt-1">
                {doctors.length} Specialists
              </p>
            </div>
            <div className="bg-[#F5F9FC] rounded-2xl p-5 border border-slate-200">
              <p className="text-sm text-slate-500 font-medium">Patient Care Units</p>
              <p className="text-2xl sm:text-3xl font-display font-extrabold text-[#19B7A5] tabular-nums mt-1">
                {services.length} Services
              </p>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap gap-3.5">
            <Link
              to="/overview"
              className="px-6 py-3.5 rounded-xl bg-[#123B67] hover:bg-[#1685B8] text-white text-[15px] font-bold transition-colors"
            >
              Hospital Overview
            </Link>
            <Link
              to="/mission-vision"
              className="px-6 py-3.5 rounded-xl border border-[#123B67] text-[#123B67] hover:bg-[#EAF5FC] text-[15px] font-bold transition-colors"
            >
              Mission &amp; Vision
            </Link>
            <Link
              to="/appointment"
              className="px-6 py-3.5 rounded-xl bg-[#19B7A5] text-[#123B67] hover:bg-[#159e8e] text-[15px] font-bold transition-colors"
            >
              Book Appointment
            </Link>
          </div>
        </div>

        <div className="lg:col-span-5">
          <AboutHospitalVisual />
        </div>
      </div>
    </div>
  );
}

export function OverviewPage() {
  const { departments, facilities } = useHospital();
  usePageSeo('Hospital Overview & Clinical Governance');

  return (
    <div className="hospital-container py-10 sm:py-14 space-y-8">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 space-y-6 shadow-xs">
        <p className="text-sm font-bold text-[#1685B8] uppercase tracking-wider">
          Gokul Hospital · Institutional Overview
        </p>
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-[#123B67]">
          Hospital Overview &amp; Care Architecture
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-4xl">
          Gokul Hospital is structured to deliver integrated outpatient, inpatient, diagnostic, surgical, and emergency care. Every department operates with standardized clinical protocols, digital prescription tracking, and role-based patient privacy safeguards.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="bg-[#F5F9FC] rounded-2xl p-6 sm:p-7 border border-slate-200 space-y-3">
            <h2 className="text-xl font-display font-bold text-[#123B67]">
              Outpatient &amp; Diagnostic Workflow
            </h2>
            <p className="text-[15px] text-slate-600 leading-relaxed">
              Patients can book time slots online across {departments.length} departments, receive a unique Appointment ID, complete ground-floor pathology or imaging tests, and access verified reports directly in the Patient Portal.
            </p>
          </div>
          <div className="bg-[#F5F9FC] rounded-2xl p-6 sm:p-7 border border-slate-200 space-y-3">
            <h2 className="text-xl font-display font-bold text-[#123B67]">
              Inpatient &amp; Critical Care Readiness
            </h2>
            <p className="text-[15px] text-slate-600 leading-relaxed">
              Supported by {facilities.length} core facility blocks including monitored Intensive Care Units (ICU), laminar-airflow modular operation theatres, and 24/7 emergency triage bays.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-amber-900">
          <strong>Transparency Disclosure:</strong> Until verified registration certificates, accreditation numbers, and physical address coordinates are entered by the Hospital Administrator in Website Settings, placeholder contact details are clearly labeled.
        </div>
      </div>
    </div>
  );
}

export function MissionVisionPage() {
  const { settings } = useHospital();
  usePageSeo('Mission, Vision & Core Clinical Values');

  return (
    <div className="hospital-container py-10 sm:py-14 space-y-8">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 space-y-8 shadow-xs">
        <div className="space-y-2">
          <p className="text-sm font-bold text-[#1685B8] uppercase tracking-wider">
            Gokul Hospital · Guiding Principles
          </p>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-[#123B67]">
            Our Mission, Vision &amp; Clinical Ethics
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
          <div className="bg-[#F5F9FC] rounded-3xl p-7 border border-slate-200 space-y-3">
            <h2 className="text-2xl font-display font-bold text-[#123B67]">Our Mission</h2>
            <p className="text-base text-slate-600 leading-relaxed">
              {settings?.missionStatement}
            </p>
          </div>
          <div className="bg-[#F5F9FC] rounded-3xl p-7 border border-slate-200 space-y-3">
            <h2 className="text-2xl font-display font-bold text-[#1685B8]">Our Vision</h2>
            <p className="text-base text-slate-600 leading-relaxed">
              {settings?.visionStatement}
            </p>
          </div>
        </div>

        <div className="pt-4 space-y-4">
          <h3 className="text-xl font-display font-bold text-[#123B67]">
            Core Commitments to Every Patient
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[15px] text-slate-700">
            <li className="flex items-start gap-3 bg-[#F5F9FC] p-4 rounded-2xl border border-slate-200/80">
              <CheckCircle2 className="w-5 h-5 text-[#19B7A5] shrink-0 mt-0.5" />
              <span>Evidence-based medical and surgical decision making</span>
            </li>
            <li className="flex items-start gap-3 bg-[#F5F9FC] p-4 rounded-2xl border border-slate-200/80">
              <CheckCircle2 className="w-5 h-5 text-[#19B7A5] shrink-0 mt-0.5" />
              <span>Complete fee transparency in Indian Rupees (₹)</span>
            </li>
            <li className="flex items-start gap-3 bg-[#F5F9FC] p-4 rounded-2xl border border-slate-200/80">
              <CheckCircle2 className="w-5 h-5 text-[#19B7A5] shrink-0 mt-0.5" />
              <span>Strict confidentiality of patient medical records</span>
            </li>
            <li className="flex items-start gap-3 bg-[#F5F9FC] p-4 rounded-2xl border border-slate-200/80">
              <CheckCircle2 className="w-5 h-5 text-[#19B7A5] shrink-0 mt-0.5" />
              <span>Dignified, compassionate care for patients and families</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export function ServicesPage() {
  const { services } = useHospital();
  const [category, setCategory] = useState('ALL');

  usePageSeo(
    'Medical Services',
    'Comprehensive outpatient (OPD), inpatient (IPD), 24/7 emergency, diagnostic imaging, pathology lab, pharmacy, and ambulance services at Gokul Hospital.'
  );

  const categories = ['ALL', 'Clinical', 'Diagnostic', 'Emergency', 'Preventive', 'Support'];
  const filtered =
    category === 'ALL' ? services : services.filter((s) => s.category === category);

  return (
    <div className="hospital-container py-10 sm:py-14 space-y-10">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2 max-w-2xl">
          <p className="text-sm font-bold text-[#1685B8] uppercase tracking-wider">
            Gokul Hospital · Clinical &amp; Diagnostic Capabilities
          </p>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-[#123B67]">
            Medical Services
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            Explore our {services.length} hospital services spanning emergency care, outpatient clinics, inpatient recovery, diagnostics, laboratory, and pharmacy support.
          </p>
        </div>

        {/* Interactive Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-2 bg-[#F5F9FC] rounded-2xl border border-slate-200">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors whitespace-nowrap cursor-pointer ${
                category === cat
                  ? 'bg-[#123B67] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#123B67]'
              }`}
            >
              {cat === 'ALL' ? 'All Services' : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
        {filtered.map((srv) => (
          <div
            key={srv.id}
            className="hospital-card-hover bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 flex flex-col justify-between gap-5 shadow-xs"
          >
            <div className="space-y-4">
              <FacilityVisualBanner
                category={srv.category}
                title={srv.title}
                heightClass="h-44"
              />
              <div className="flex items-center justify-between text-xs font-bold text-[#1685B8]">
                <span className="px-3 py-1 rounded-full bg-[#EAF5FC]">{srv.category}</span>
                <span>{srv.timings}</span>
              </div>
              <h2 className="text-2xl font-display font-bold text-[#123B67]">
                {srv.title}
              </h2>
              <p className="text-[15px] text-slate-600 leading-relaxed">
                {srv.fullDescription}
              </p>
              <ul className="space-y-2 pt-3 border-t border-slate-100 text-sm text-slate-600">
                {srv.keyFeatures.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#19B7A5] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-sm font-bold">
              <Link to="/appointment" className="text-[#123B67] hover:text-[#1685B8]">
                Book Appointment →
              </Link>
              <Link to="/contact" className="text-slate-500 hover:text-[#123B67]">
                Inquire
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FacilitiesPage() {
  const { facilities } = useHospital();
  usePageSeo('Hospital Facilities & Infrastructure');

  return (
    <div className="hospital-container py-10 sm:py-14 space-y-10">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 space-y-3 shadow-xs">
        <p className="text-sm font-bold text-[#1685B8] uppercase tracking-wider">
          Gokul Hospital · Campus Infrastructure
        </p>
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-[#123B67]">
          Hospital Facilities &amp; Patient Amenities
        </h1>
        <p className="text-base text-slate-600 max-w-3xl leading-relaxed">
          All hospital facilities listed below are configurable through the Admin Dashboard. Each clinical block is designed for patient safety, infection control, and seamless emergency access.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {facilities.map((fac) => (
          <div
            key={fac.id}
            className="hospital-card-hover bg-white rounded-3xl p-6 border border-slate-200 space-y-5 shadow-xs"
          >
            <FacilityVisualBanner
              category={fac.category}
              title={fac.title}
              heightClass="h-52"
            />
            <div className="px-1 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-[#1685B8]">
                <span>{fac.category}</span>
                <span aria-hidden="true"> · </span>
                <span>{fac.location}</span>
                <span aria-hidden="true"> · </span>
                <span>
                  {fac.isVerified ? 'Hospital Verified' : 'Admin Configurable Template'}
                </span>
              </div>
              <h2 className="text-2xl font-display font-bold text-[#123B67]">
                {fac.title}
              </h2>
              <p className="text-[15px] text-slate-600 leading-relaxed">
                {fac.description}
              </p>
              <div className="pt-3 border-t border-slate-100">
                <p className="text-sm font-bold text-[#123B67] mb-2.5">
                  Key Clinical Specifications:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm text-slate-600">
                  {fac.specifications.map((spec, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#19B7A5] shrink-0" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EmergencyPage() {
  const { settings } = useHospital();
  usePageSeo('24/7 Emergency & Trauma Care Services');

  return (
    <div className="hospital-container py-10 sm:py-14 space-y-10">
      <div className="bg-gradient-to-r from-[#123B67] via-[#154B80] to-[#1685B8] text-white rounded-3xl p-8 sm:p-12 space-y-5 shadow-xl">
        <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#19B7A5] uppercase tracking-wider">
          <AlertTriangle className="w-5 h-5" />
          <span>24 Hours × 7 Days Acute Emergency &amp; Trauma Care</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white">
          Gokul Hospital Emergency Department
        </h1>
        <p className="text-base sm:text-lg text-white/90 max-w-3xl leading-relaxed">
          For life-threatening medical, cardiac, neurological, pediatric, or trauma emergencies, proceed directly to the Ground Floor Emergency Entrance or call our emergency helpline immediately.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4">
          <div className="bg-white/10 border border-white/20 rounded-2xl p-5">
            <p className="text-sm text-white/80">24/7 Emergency Helpline</p>
            <p className="text-2xl font-display font-extrabold tabular-nums text-[#19B7A5] mt-1">
              {settings?.emergencyPhone || '+91-00000-10800'}
            </p>
          </div>
          <div className="bg-white/10 border border-white/20 rounded-2xl p-5">
            <p className="text-sm text-white/80">Ambulance Dispatch</p>
            <p className="text-2xl font-display font-extrabold tabular-nums text-white mt-1">
              {settings?.ambulancePhone || '108 / +91-00000-10200'}
            </p>
          </div>
          <div className="bg-white/10 border border-white/20 rounded-2xl p-5">
            <p className="text-sm text-white/80">OPD / Reception Desk</p>
            <p className="text-2xl font-display font-extrabold tabular-nums text-white mt-1">
              {settings?.contactPhone || '+91-00000-00000'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
        <FacilityVisualBanner
          category="Emergency"
          title="24/7 Emergency & Trauma Resuscitation Bay"
          heightClass="h-64"
        />
        <FacilityVisualBanner
          category="ICU"
          title="Critical Care & Multipara Telemetry ICU Backup"
          heightClass="h-64"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
        <div className="bg-white rounded-3xl p-7 border border-slate-200 space-y-3">
          <h2 className="text-xl font-display font-bold text-[#123B67]">
            01. Rapid Clinical Triage
          </h2>
          <p className="text-[15px] text-slate-600 leading-relaxed">
            Upon arrival at the Emergency Bay, patients are immediately assessed by the duty Emergency Medical Officer and prioritized by clinical acuity (Red / Yellow / Green zones).
          </p>
        </div>
        <div className="bg-white rounded-3xl p-7 border border-slate-200 space-y-3">
          <h2 className="text-xl font-display font-bold text-[#123B67]">
            02. Cardiac &amp; Stroke Protocol
          </h2>
          <p className="text-[15px] text-slate-600 leading-relaxed">
            Immediate 12-lead ECG, crash-cart defibrillation, oxygen support, and stat point-of-care diagnostics for acute chest pain or neurological deficits.
          </p>
        </div>
        <div className="bg-white rounded-3xl p-7 border border-slate-200 space-y-3">
          <h2 className="text-xl font-display font-bold text-[#123B67]">
            03. Trauma &amp; Surgical Backup
          </h2>
          <p className="text-[15px] text-slate-600 leading-relaxed">
            Direct stretcher elevator access to the 1st Floor Modular Operation Theatres and Intensive Care Unit (ICU) for fractures, burns, and acute surgical emergencies.
          </p>
        </div>
      </div>
    </div>
  );
}

export function HealthPackagesPage() {
  const { healthPackages, user, showToast } = useHospital();
  const [selectedPkg, setSelectedPkg] = useState<HealthPackage | null>(null);
  const [patientName, setPatientName] = useState(user?.fullName || '');
  const [patientEmail, setPatientEmail] = useState(user?.email || '');
  const [patientPhone, setPatientPhone] = useState(user?.phone || '');
  const [preferredDate, setPreferredDate] = useState(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  usePageSeo(
    'Preventive Health Checkup Packages',
    'Compare Master Health Checkup, Cardiac, Diabetic, and Senior Citizen screening packages at Gokul Hospital with transparent INR pricing.'
  );

  const handleBookPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPkg || submitting) return;
    setSubmitting(true);
    try {
      await apiRequest('/api/public/package-bookings', {
        method: 'POST',
        body: JSON.stringify({
          packageId: selectedPkg.id,
          patientId: user?.id,
          patientName,
          patientEmail,
          patientPhone,
          preferredDate,
          notes,
        }),
      });
      showToast(`Health Package request submitted for ${selectedPkg.name}!`, 'success');
      setSelectedPkg(null);
      setNotes('');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Unable to book package.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="hospital-container py-10 sm:py-14 space-y-10">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 space-y-3 shadow-xs">
        <p className="text-sm font-bold text-[#1685B8] uppercase tracking-wider">
          Gokul Hospital · Preventive Wellness
        </p>
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-[#123B67]">
          Preventive Health Checkup Packages
        </h1>
        <p className="text-base text-slate-600 max-w-3xl leading-relaxed">
          Early screening helps prevent chronic lifestyle conditions. Select any package below to view all included laboratory and imaging tests and request a morning fasting appointment.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {healthPackages.map((pkg) => (
          <div
            key={pkg.id}
            className="hospital-card-hover bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 flex flex-col justify-between gap-6 shadow-xs"
          >
            <div className="space-y-4">
              <FacilityVisualBanner
                category="Diagnostics & Lab"
                title={pkg.name}
                heightClass="h-44"
              />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="px-3 py-1 rounded-full bg-[#EAF5FC] text-[#123B67] text-xs font-bold">
                    Turnaround: {pkg.turnaroundTime}
                  </span>
                  <h2 className="text-2xl font-display font-bold text-[#123B67] mt-2">
                    {pkg.name}
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">{pkg.targetAudience}</p>
                </div>
                <div className="text-right tabular-nums shrink-0">
                  <p className="text-3xl font-display font-extrabold text-[#123B67]">
                    ₹{pkg.discountedPriceInr || pkg.priceInr}
                  </p>
                  {pkg.discountedPriceInr && pkg.discountedPriceInr < pkg.priceInr && (
                    <p className="text-sm text-slate-400 line-through">₹{pkg.priceInr}</p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-2.5">
                <p className="text-sm font-bold text-[#123B67]">
                  Included Diagnostic &amp; Clinical Tests ({pkg.includedTests.length}):
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm text-slate-600">
                  {pkg.includedTests.map((t, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#19B7A5] shrink-0 mt-0.5" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-[#F5F9FC] border border-slate-200 text-sm text-slate-600">
                <strong className="text-[#123B67]">Preparation:</strong>{' '}
                {pkg.preparationInstructions}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedPkg(pkg)}
              className="w-full py-3.5 px-5 rounded-xl bg-[#123B67] hover:bg-[#1685B8] text-white text-[15px] font-bold transition-colors cursor-pointer"
            >
              Book {pkg.name} (₹{pkg.discountedPriceInr || pkg.priceInr})
            </button>
          </div>
        ))}
      </div>

      {/* Package Booking Modal */}
      {selectedPkg && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#1685B8]">
                  Preventive Health Checkup Request
                </p>
                <h3 className="text-xl font-display font-bold text-[#123B67] mt-1">
                  {selectedPkg.name} — ₹{selectedPkg.discountedPriceInr || selectedPkg.priceInr}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPkg(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookPackage} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#123B67] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F5F9FC] border border-slate-300 rounded-xl text-[15px]"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-sm font-bold text-[#123B67] mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F5F9FC] border border-slate-300 rounded-xl text-[15px]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#123B67] mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F5F9FC] border border-slate-300 rounded-xl text-[15px]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#123B67] mb-1">
                  Preferred Morning Fasting Date *
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().slice(0, 10)}
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F5F9FC] border border-slate-300 rounded-xl text-[15px] font-mono-tabular"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#123B67] mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any specific health questions..."
                  className="w-full px-4 py-2.5 bg-[#F5F9FC] border border-slate-300 rounded-xl text-[15px]"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPkg(null)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-[#123B67] text-white text-sm font-bold hover:bg-[#1685B8]"
                >
                  {submitting ? 'Submitting...' : 'Confirm Package Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export function TestimonialsPage() {
  const { testimonials } = useHospital();
  usePageSeo('Patient Testimonials & Feedback');

  return (
    <div className="hospital-container py-10 sm:py-14 space-y-10">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 space-y-3 shadow-xs">
        <p className="text-sm font-bold text-[#1685B8] uppercase tracking-wider">
          Gokul Hospital · Patient Experiences
        </p>
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-[#123B67]">
          Patient Testimonials
        </h1>
        <p className="text-sm text-slate-500">
          Note: Entries labeled [Demo Feedback] are sample demonstration placeholders managed via the Admin Dashboard until verified patient consent statements are uploaded.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
        {testimonials.map((t) => (
          <div
            key={t.id}
            className="hospital-card-hover bg-white rounded-3xl p-7 border border-slate-200 flex flex-col justify-between gap-5 shadow-xs"
          >
            <p className="text-base text-slate-700 leading-relaxed italic">
              “{t.outcomeQuote}”
            </p>
            <div className="pt-4 border-t border-slate-100 text-sm space-y-1">
              <p className="font-display font-bold text-lg text-[#123B67]">
                {t.patientName}
              </p>
              <p className="text-slate-600">
                {t.departmentName} · {t.treatmentSummary}
              </p>
              {t.doctorName && (
                <p className="text-[#1685B8] font-semibold">
                  Consulting Doctor: {t.doctorName}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function GalleryPage() {
  const { gallery } = useHospital();
  const [filter, setFilter] = useState('ALL');
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);
  usePageSeo('Hospital Gallery & Campus Tour');

  const categories = [
    'ALL',
    'Infrastructure',
    'OperationTheatres',
    'Diagnostics',
    'PatientRooms',
    'Emergency',
  ];

  const filtered =
    filter === 'ALL' ? gallery : gallery.filter((g) => g.category === filter);

  return (
    <div className="hospital-container py-10 sm:py-14 space-y-10">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2">
          <p className="text-sm font-bold text-[#1685B8] uppercase tracking-wider">
            Gokul Hospital · Visual Campus Tour
          </p>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-[#123B67]">
            Hospital Infrastructure Gallery
          </h1>
          <p className="text-base text-slate-600">
            Click any campus card below to open the full-screen clinical facility preview.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 p-2 bg-[#F5F9FC] rounded-2xl border border-slate-200">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                filter === cat
                  ? 'bg-[#123B67] text-white'
                  : 'text-slate-600 hover:text-[#123B67]'
              }`}
            >
              {cat === 'ALL' ? 'All Areas' : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => setLightboxItem(item)}
            className="hospital-card-hover bg-white rounded-3xl p-5 border border-slate-200 flex flex-col justify-between gap-4 cursor-pointer group"
          >
            <div className="space-y-4">
              <div className="relative">
                <FacilityVisualBanner
                  category={item.category}
                  title={item.title}
                  heightClass="h-48"
                />
                <span className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-white/95 text-[#123B67] text-xs font-bold inline-flex items-center gap-1.5 shadow-sm group-hover:bg-[#19B7A5] transition-colors">
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </span>
              </div>
              <div className="px-1 space-y-1.5">
                <div className="text-xs font-bold uppercase tracking-wider text-[#1685B8]">
                  {item.category} · {item.floorLocation}
                </div>
                <h2 className="text-xl font-display font-bold text-[#123B67]">
                  {item.title}
                </h2>
                <p className="text-[15px] text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Preview Modal */}
      {lightboxItem && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxItem(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="px-3 py-1 rounded-full bg-[#EAF5FC] text-[#1685B8] text-xs font-bold uppercase tracking-wider">
                  {lightboxItem.category} · {lightboxItem.floorLocation}
                </span>
                <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-[#123B67] mt-2">
                  {lightboxItem.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setLightboxItem(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                aria-label="Close preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <FacilityVisualBanner
              category={lightboxItem.category}
              title={lightboxItem.title}
              heightClass="h-72"
            />

            <p className="text-base text-slate-700 leading-relaxed">
              {lightboxItem.description}
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-sm text-slate-500">
                Location: <strong className="text-[#123B67]">{lightboxItem.floorLocation}</strong>
              </span>
              <Link
                to="/appointment"
                className="px-5 py-2.5 rounded-xl bg-[#123B67] text-white text-sm font-bold hover:bg-[#1685B8]"
              >
                Book Hospital Visit
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function BlogsPage() {
  const { blogs } = useHospital();
  usePageSeo('Health Blog & Patient Education Articles');

  return (
    <div className="hospital-container py-10 sm:py-14 space-y-10">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 space-y-2 shadow-xs">
        <p className="text-sm font-bold text-[#1685B8] uppercase tracking-wider">
          Gokul Hospital · Medical Education
        </p>
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-[#123B67]">
          Health Blog &amp; Preventive Guides
        </h1>
        <p className="text-base text-slate-600">
          Evidence-based wellness articles authored by Gokul Hospital clinical consultants.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
        {blogs.map((blog) => (
          <article
            key={blog.id}
            className="hospital-card-hover bg-white rounded-3xl p-5 border border-slate-200 flex flex-col justify-between gap-5 shadow-xs"
          >
            <div className="space-y-4">
              <BlogThumbnailVisual category={blog.category} title={blog.title} />
              <div className="px-1 space-y-2">
                <div className="text-xs font-bold text-[#1685B8]">
                  <span>{blog.category}</span>
                  <span aria-hidden="true"> · </span>
                  <span className="tabular-nums">{blog.readTimeMinutes} min read</span>
                </div>
                <h2 className="text-xl font-display font-bold text-[#123B67]">
                  <Link to={`/blogs/${blog.slug}`} className="hover:text-[#1685B8]">
                    {blog.title}
                  </Link>
                </h2>
                <p className="text-[15px] text-slate-600 leading-relaxed">
                  {blog.excerpt}
                </p>
              </div>
            </div>

            <div className="px-1 pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
              <span className="text-slate-600 font-medium">{blog.authorName}</span>
              <Link
                to={`/blogs/${blog.slug}`}
                className="font-bold text-[#1685B8] hover:text-[#123B67] inline-flex items-center gap-1"
              >
                <span>Read Article</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { blogs } = useHospital();
  const blog = blogs.find((b) => b.slug === slug || b.id === slug);

  usePageSeo(blog ? blog.title : 'Health Article', blog?.excerpt);

  if (!blog) {
    return (
      <div className="hospital-container py-16 text-center space-y-4">
        <h1 className="text-3xl font-display font-bold text-[#123B67]">Article Not Found</h1>
        <Link
          to="/blogs"
          className="inline-block px-6 py-3 rounded-xl bg-[#123B67] text-white text-sm font-bold"
        >
          Back to Health Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="hospital-container py-10 sm:py-14">
      <article className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 space-y-7 shadow-xs">
        <div className="text-sm font-medium text-slate-500">
          <Link to="/blogs" className="text-[#1685B8] font-bold hover:underline">
            Health Blog
          </Link>
          <span aria-hidden="true"> · </span>
          <span>{blog.category}</span>
          <span aria-hidden="true"> · </span>
          <span className="tabular-nums">{blog.readTimeMinutes} min read</span>
        </div>

        <BlogThumbnailVisual category={blog.category} title={blog.title} />

        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-[#123B67]">
          {blog.title}
        </h1>

        <div className="text-sm text-slate-600 pb-4 border-b border-slate-200">
          Authored by <strong className="text-[#123B67]">{blog.authorName}</strong> ({blog.authorRole})
        </div>

        <div className="space-y-6">
          {blog.contentSections.map((sec, idx) => (
            <div key={idx} className="space-y-2.5">
              <h2 className="text-2xl font-display font-bold text-[#123B67]">
                {sec.heading}
              </h2>
              <p className="text-base text-slate-700 leading-relaxed">
                {sec.body}
              </p>
            </div>
          ))}
        </div>

        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-amber-900">
          <strong>Medical Disclaimer:</strong> {blog.medicalDisclaimer}
        </div>
      </article>
    </div>
  );
}

export function FaqPage() {
  usePageSeo('Frequently Asked Questions');
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How do I book an appointment with a specialist at Gokul Hospital?',
      a: 'Navigate to the Book Appointment page, choose your medical department and consulting doctor, select your date, click an open time slot, and confirm your booking to receive a unique GKH-YYYY-XXXX Appointment ID.',
    },
    {
      q: 'Can I cancel or reschedule my appointment online?',
      a: 'Yes. Log in to the Patient Dashboard, open My Appointments, and click Reschedule or Cancel on any Pending or Confirmed appointment.',
    },
    {
      q: 'Are my medical records and lab reports private?',
      a: 'Yes. Role-Based Access Control ensures that patients can only view their own records, doctors can only view records of patients assigned to them, and receptionists only handle operational scheduling without access to clinical notes.',
    },
    {
      q: 'What payment methods are accepted for consultations?',
      a: 'All consultation fees and health checkup packages are priced in Indian Rupees (₹) and can be tested online using Demo Payment Mode or paid at the Gokul Hospital OPD Billing Counter.',
    },
    {
      q: 'Does Gokul Hospital provide 24/7 emergency and ambulance services?',
      a: 'Yes. Our Emergency Medicine department, ICU, Diagnostics, and Pharmacy operate 24 hours a day, 7 days a week.',
    },
  ];

  return (
    <div className="hospital-container py-10 sm:py-14 space-y-8">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 space-y-2 shadow-xs">
        <p className="text-sm font-bold text-[#1685B8] uppercase tracking-wider">
          Gokul Hospital · Help Center
        </p>
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-[#123B67]">
          Frequently Asked Questions
        </h1>
      </div>

      <div className="space-y-4">
        {faqs.map((item, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 text-lg font-display font-bold text-[#123B67] cursor-pointer hover:bg-slate-50"
            >
              <span>{item.q}</span>
              <ChevronDown
                className={`w-5 h-5 transition-transform shrink-0 ${
                  openIdx === idx ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openIdx === idx && (
              <div className="px-6 pb-6 pt-3 border-t border-slate-100 text-base text-slate-600 leading-relaxed">
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ContactPage() {
  const { settings, departments, showToast } = useHospital();
  usePageSeo('Contact Us & Hospital Directions');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await apiRequest('/api/public/inquiries', {
        method: 'POST',
        body: JSON.stringify({
          fullName,
          email,
          phone,
          department,
          subject,
          message,
        }),
      });
      setSubmitted(true);
      showToast('Your inquiry has been recorded by the Gokul Hospital Helpdesk.', 'success');
      setFullName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Unable to send inquiry.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="hospital-container py-10 sm:py-14 space-y-10">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 space-y-2 shadow-xs">
        <p className="text-sm font-bold text-[#1685B8] uppercase tracking-wider">
          Gokul Hospital · Patient Helpdesk &amp; Location
        </p>
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-[#123B67]">
          Contact Gokul Hospital
        </h1>
        <p className="text-base text-slate-600">
          Reach our OPD reception desk, 24/7 emergency dispatch, or submit an online patient inquiry below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-7 border border-slate-200 space-y-5 text-[15px]">
            <h2 className="text-2xl font-display font-bold text-[#123B67]">
              Hospital Directory &amp; Timings
            </h2>
            <div className="flex items-start gap-3.5">
              <MapPin className="w-5 h-5 text-[#1685B8] shrink-0 mt-1" />
              <div>
                <strong className="text-[#123B67] block text-base">Address</strong>
                <span className="text-slate-600">{settings?.addressLine1}</span>
                <br />
                <span className="text-slate-600">{settings?.cityStatePin}</span>
              </div>
            </div>
            <div className="flex items-start gap-3.5">
              <PhoneCall className="w-5 h-5 text-[#19B7A5] shrink-0 mt-1" />
              <div>
                <strong className="text-[#123B67] block text-base">Phone Numbers</strong>
                <span className="text-slate-600">Reception: {settings?.contactPhone}</span>
                <br />
                <span className="text-[#1685B8] font-bold">
                  24/7 Emergency: {settings?.emergencyPhone}
                </span>
              </div>
            </div>
            <div className="flex items-start gap-3.5">
              <Mail className="w-5 h-5 text-[#123B67] shrink-0 mt-1" />
              <div>
                <strong className="text-[#123B67] block text-base">Email Addresses</strong>
                <span className="text-slate-600">General: {settings?.emailAddress}</span>
                <br />
                <span className="text-slate-600">Appointments: {settings?.supportEmail}</span>
              </div>
            </div>
            <div className="flex items-start gap-3.5">
              <Clock className="w-5 h-5 text-[#1685B8] shrink-0 mt-1" />
              <div>
                <strong className="text-[#123B67] block text-base">Working Hours</strong>
                <span className="text-slate-600">OPD: {settings?.opdHours}</span>
                <br />
                <span className="text-slate-600">Emergency: {settings?.emergencyHours}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white rounded-3xl p-7 sm:p-9 border border-slate-200 space-y-6">
          <h2 className="text-2xl font-display font-bold text-[#123B67]">
            Send a Patient Inquiry to Reception &amp; Admin Desk
          </h2>

          {submitted && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-900 font-medium">
              Thank you! Your inquiry has been saved to the Gokul Hospital database and routed to our Receptionist &amp; Admin team.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-[#123B67] mb-1.5">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F5F9FC] border border-slate-300 rounded-xl text-[15px]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#123B67] mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F5F9FC] border border-slate-300 rounded-xl text-[15px]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#123B67] mb-1.5">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F5F9FC] border border-slate-300 rounded-xl text-[15px]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#123B67] mb-1.5">
                  Department (Optional)
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F5F9FC] border border-slate-300 rounded-xl text-[15px]"
                >
                  <option value="">General Hospital Inquiry</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#123B67] mb-1.5">
                Inquiry Subject *
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Inpatient room tariff, insurance query, specialist timing..."
                className="w-full px-4 py-3 bg-[#F5F9FC] border border-slate-300 rounded-xl text-[15px]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#123B67] mb-1.5">
                Message *
              </label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3 bg-[#F5F9FC] border border-slate-300 rounded-xl text-[15px]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-7 py-3.5 rounded-xl bg-[#123B67] hover:bg-[#1685B8] text-white text-[15px] font-bold cursor-pointer"
            >
              {submitting ? 'Submitting Inquiry...' : 'Submit Inquiry'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [queryInput, setQueryInput] = useState(initialQuery);
  const [results, setResults] = useState<{
    query: string;
    doctors: Doctor[];
    departments: Department[];
    services: HospitalService[];
    packages: HealthPackage[];
    blogs: BlogItem[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  usePageSeo('Search Hospital Directory');

  useEffect(() => {
    const q = searchParams.get('q') || '';
    setQueryInput(q);
    if (!q.trim()) {
      setResults(null);
      return;
    }
    setLoading(true);
    apiRequest<{
      query: string;
      doctors: Doctor[];
      departments: Department[];
      services: HospitalService[];
      packages: HealthPackage[];
      blogs: BlogItem[];
    }>(`/api/public/search?q=${encodeURIComponent(q)}`)
      .then(setResults)
      .finally(() => setLoading(false));
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: queryInput.trim() });
  };

  return (
    <div className="hospital-container py-10 sm:py-14 space-y-8">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 space-y-4">
        <h1 className="text-3xl font-display font-extrabold text-[#123B67]">
          Search Gokul Hospital Directory
        </h1>
        <form onSubmit={handleSearch} className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Search doctors, departments, services, or health checkup packages..."
              className="w-full pl-11 pr-4 py-3.5 bg-[#F5F9FC] border border-slate-300 rounded-xl text-[15px]"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3.5 rounded-xl bg-[#123B67] text-white text-[15px] font-bold"
          >
            Search
          </button>
        </form>
      </div>

      {loading && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 text-base text-slate-500">
          Searching Gokul Hospital database...
        </div>
      )}

      {results && !loading && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-7 border border-slate-200 space-y-4">
            <h2 className="text-xl font-display font-bold text-[#123B67]">
              Matching Doctors ({results.doctors.length})
            </h2>
            {results.doctors.length === 0 ? (
              <p className="text-sm text-slate-500">No matching doctors found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.doctors.map((d) => (
                  <Link
                    key={d.id}
                    to={`/doctors/${d.slug}`}
                    className="p-5 rounded-2xl bg-[#F5F9FC] border border-slate-200 hover:border-[#1685B8] flex items-center justify-between"
                  >
                    <div>
                      <p className="font-display font-bold text-base text-[#123B67]">
                        {d.name}
                      </p>
                      <p className="text-sm text-slate-600">
                        {d.departmentName} · {d.specialization}
                      </p>
                    </div>
                    <span className="text-sm font-mono-tabular font-bold text-[#1685B8]">
                      ₹{d.consultationFee} →
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl p-7 border border-slate-200 space-y-4">
            <h2 className="text-xl font-display font-bold text-[#123B67]">
              Matching Departments ({results.departments.length})
            </h2>
            {results.departments.length === 0 ? (
              <p className="text-sm text-slate-500">No matching departments found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.departments.map((dep) => (
                  <Link
                    key={dep.id}
                    to={`/departments/${dep.slug}`}
                    className="p-5 rounded-2xl bg-[#F5F9FC] border border-slate-200 hover:border-[#1685B8]"
                  >
                    <p className="font-display font-bold text-base text-[#123B67]">
                      {dep.name}
                    </p>
                    <p className="text-sm text-slate-600 mt-1">{dep.shortDescription}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function PrivacyPolicyPage() {
  usePageSeo('Privacy Policy & Patient Data Protection');
  return (
    <div className="hospital-container py-10 sm:py-14">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 space-y-5 text-base text-slate-700 leading-relaxed">
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-[#123B67]">
          Privacy Policy — Gokul Hospital
        </h1>
        <p className="text-sm text-slate-500">Effective Date: October 2026</p>
        <p>
          <strong>1. Data Minimization &amp; Purpose:</strong> Gokul Hospital collects only the personal and clinical information necessary to schedule appointments, maintain continuity of medical care, issue prescriptions, and deliver verified laboratory reports.
        </p>
        <p>
          <strong>2. Role-Based Access Control (RBAC):</strong> Patient medical records, prescriptions, and diagnostic reports are strictly isolated. Patients can access only their own records; doctors can access records only for patients assigned to their care; receptionists are restricted to scheduling and front-desk operations.
        </p>
        <p>
          <strong>3. Credential Security:</strong> Passwords are never stored in plain text. All credentials are salted and hashed using cryptographic key derivation, and all sensitive mutations are recorded in the administrative Audit Log.
        </p>
        <p>
          <strong>4. Independent Compliance Review Notice:</strong> Before deploying this system for live clinical use with real patient Protected Health Information (PHI), the hospital administration must complete an independent legal, cybersecurity, and regulatory compliance review under applicable Indian healthcare data protection laws (including the Digital Personal Data Protection Act).
        </p>
      </div>
    </div>
  );
}

export function TermsPage() {
  usePageSeo('Terms and Conditions');
  return (
    <div className="hospital-container py-10 sm:py-14">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 space-y-5 text-base text-slate-700 leading-relaxed">
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-[#123B67]">
          Terms and Conditions — Gokul Hospital
        </h1>
        <p>
          <strong>1. Outpatient Appointment Scheduling:</strong> Online appointment slots are subject to clinical prioritization in the event of an acute medical or surgical emergency requiring the consulting specialist’s immediate attention.
        </p>
        <p>
          <strong>2. Non-Emergency Portal Usage:</strong> The online booking portal and AI Hospital Guide are intended strictly for non-emergency outpatient navigation and scheduling. For acute medical emergencies, patients must contact the 24/7 Emergency Department immediately.
        </p>
        <p>
          <strong>3. Accurate Patient Identification:</strong> Users agree to provide accurate patient identification and contact details when registering or booking appointments. Public registration grants Patient-tier access only.
        </p>
      </div>
    </div>
  );
}

export function CancellationPolicyPage() {
  const { settings } = useHospital();
  usePageSeo('Appointment Cancellation & Rescheduling Policy');
  return (
    <div className="hospital-container py-10 sm:py-14">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 space-y-5 text-base text-slate-700 leading-relaxed">
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-[#123B67]">
          Cancellation &amp; Rescheduling Policy
        </h1>
        <p>
          <strong>1. Standard Cancellation Window:</strong> Patients may cancel or reschedule an outpatient appointment up to{' '}
          <strong>{settings?.cancellationWindowHours || 4} hours</strong> prior to the scheduled time slot via the Patient Dashboard or by calling the OPD Reception Desk.
        </p>
        <p>
          <strong>2. Slot Release:</strong> When an appointment is cancelled, the reserved time slot is immediately released back into the doctor’s live availability calendar so other patients in need of care can book it.
        </p>
        <p>
          <strong>3. Rescheduling Rules:</strong> Rescheduling is currently{' '}
          <strong>{settings?.allowRescheduling ? 'Enabled' : 'Managed by Reception'}</strong> and verifies real-time slot availability on the newly selected date.
        </p>
      </div>
    </div>
  );
}

export function UnauthorizedPage() {
  usePageSeo('Unauthorized Access');
  return (
    <div className="hospital-container py-20 text-center">
      <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 space-y-5">
        <ShieldCheck className="w-14 h-14 text-red-600 mx-auto" />
        <h1 className="text-3xl font-display font-extrabold text-[#123B67]">
          Unauthorized Role Access
        </h1>
        <p className="text-base text-slate-600">
          Your current account role does not have permission to view this hospital portal. Each dashboard (Patient, Doctor, Receptionist, and Admin) is strictly isolated by Role-Based Access Control.
        </p>
        <div className="flex justify-center gap-3.5 pt-2">
          <Link
            to="/"
            className="px-6 py-3 rounded-xl border border-slate-300 text-sm font-bold text-[#123B67]"
          >
            Return Home
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 rounded-xl bg-[#123B67] text-white text-sm font-bold"
          >
            Switch Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  usePageSeo('404 Page Not Found');
  return (
    <div className="hospital-container py-20 text-center">
      <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 space-y-5">
        <p className="text-4xl font-mono-tabular font-extrabold text-[#1685B8]">404</p>
        <h1 className="text-3xl font-display font-extrabold text-[#123B67]">
          Page Not Found
        </h1>
        <p className="text-base text-slate-600">
          The page you are looking for does not exist or has been moved. Use the navigation links below to continue exploring Gokul Hospital.
        </p>
        <div className="flex justify-center gap-3.5 pt-2">
          <Link
            to="/"
            className="px-6 py-3 rounded-xl bg-[#123B67] text-white text-sm font-bold"
          >
            Go to Homepage
          </Link>
          <Link
            to="/appointment"
            className="px-6 py-3 rounded-xl border border-[#123B67] text-[#123B67] text-sm font-bold"
          >
            Book Appointment
          </Link>
        </div>
      </div>
    </div>
  );
}
