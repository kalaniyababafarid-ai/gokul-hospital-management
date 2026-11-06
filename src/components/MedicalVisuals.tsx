import React from 'react';
import {
  ShieldCheck,
  Clock,
  PhoneCall,
  CheckCircle2,
  Stethoscope,
  Building2,
  Award,
  HeartPulse,
} from 'lucide-react';
import { GokulHospitalLogo } from './BrandLogo.tsx';
import {
  HOSPITAL_PHOTOGRAPHY,
  getDepartmentPhoto,
  getDoctorPortraitPhoto,
  getFacilityPhoto,
  getBlogPhoto,
} from '../config/medicalImages.ts';

/**
 * 1. HERO MEDICAL TEAM SCENE (Photorealistic Multi-Specialty Hospital Showcase)
 * Strictly uses real medical photography — zero cartoon or vector human drawings.
 */
export function HeroMedicalTeamScene({
  emergencyPhone = '108 / +91-00000-10800',
  opdHours = 'Mon – Sat: 08:30 AM – 08:00 PM',
}: {
  emergencyPhone?: string;
  opdHours?: string;
}) {
  return (
    <div className="relative rounded-3xl bg-white/10 backdrop-blur-md p-4 sm:p-6 border border-white/20 shadow-2xl overflow-hidden">
      {/* Top Hospital Attribution Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-white/15">
        <div className="flex items-center gap-3">
          <GokulHospitalLogo variant="emblem" size="sm" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#19B7A5]">
              GOKUL HOSPITAL · CLINICAL EXCELLENCE
            </p>
            <h2 className="text-sm sm:text-base font-display font-bold text-white">
              24/7 Multi-Specialty Medical &amp; Surgical Team
            </h2>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#19B7A5]/20 border border-[#19B7A5]/45 text-xs font-bold text-[#19B7A5]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>NABH-Aligned Protocols</span>
        </span>
      </div>

      {/* Main Photorealistic Medical Team & Specialist Grid */}
      <div className="grid grid-cols-12 gap-3.5 items-stretch">
        {/* Dominant Hero Photo */}
        <div className="col-span-12 sm:col-span-8 relative rounded-2xl overflow-hidden border border-white/20 shadow-lg image-hover-zoom min-h-[260px] sm:min-h-[320px]">
          <img
            src={HOSPITAL_PHOTOGRAPHY.heroMedicalTeam}
            alt="Gokul Hospital specialist doctor in white lab coat with stethoscope in modern hospital corridor"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D2E52]/90 via-[#123B67]/25 to-transparent" />
          <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-end justify-between gap-2 text-white">
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#19B7A5] text-[#123B67] text-[11px] font-extrabold uppercase tracking-wider mb-1">
                Senior Clinical Faculty
              </span>
              <p className="text-sm sm:text-base font-display font-bold leading-snug">
                Dedicated Consultants Across 15 Specialties
              </p>
              <p className="text-xs text-white/80">
                Outpatient, Inpatient, Modular OT &amp; Critical Care
              </p>
            </div>
          </div>
        </div>

        {/* Right Side Stacked Photorealistic Clinical Cards */}
        <div className="col-span-12 sm:col-span-4 flex flex-row sm:flex-col gap-3.5">
          <div className="flex-1 relative rounded-2xl overflow-hidden border border-white/20 shadow-md image-hover-zoom min-h-[120px] sm:min-h-[152px]">
            <img
              src={HOSPITAL_PHOTOGRAPHY.doctorConsultation}
              alt="Doctor consulting with patient in Gokul Hospital outpatient department"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D2E52]/90 via-transparent to-transparent" />
            <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
              <p className="text-[11px] font-bold text-[#19B7A5] uppercase tracking-wider">
                OPD Consultation
              </p>
              <p className="text-xs font-display font-bold leading-tight">
                Patient-First Diagnostics
              </p>
            </div>
          </div>

          <div className="flex-1 relative rounded-2xl overflow-hidden border border-white/20 shadow-md image-hover-zoom min-h-[120px] sm:min-h-[152px]">
            <img
              src={HOSPITAL_PHOTOGRAPHY.hospitalExterior}
              alt="Gokul Hospital modern multi-specialty campus exterior"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D2E52]/90 via-transparent to-transparent" />
            <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
              <p className="text-[11px] font-bold text-[#19B7A5] uppercase tracking-wider">
                Modern Campus
              </p>
              <p className="text-xs font-display font-bold leading-tight">
                24/7 Trauma &amp; ICU Wing
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Live Operational Telemetry Bar */}
      <div className="mt-4 pt-3.5 border-t border-white/15 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="flex items-center gap-2.5 bg-white/10 rounded-xl px-3.5 py-2.5 border border-white/15">
          <PhoneCall className="w-4 h-4 text-[#19B7A5] shrink-0" />
          <div className="truncate">
            <span className="text-white/75 block text-[11px]">24/7 Emergency Helpline</span>
            <strong className="text-white font-mono-tabular text-xs sm:text-sm">
              {emergencyPhone}
            </strong>
          </div>
        </div>
        <div className="flex items-center gap-2.5 bg-white/10 rounded-xl px-3.5 py-2.5 border border-white/15">
          <Clock className="w-4 h-4 text-[#19B7A5] shrink-0" />
          <div className="truncate">
            <span className="text-white/75 block text-[11px]">Outpatient (OPD) Timings</span>
            <strong className="text-white text-xs sm:text-sm truncate">{opdHours}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 2. ABOUT HOSPITAL VISUAL (Photorealistic Campus & Clinical Care Bento)
 */
export function AboutHospitalVisual() {
  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-lg space-y-4">
      {/* Main Architectural Exterior Photograph */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-64 sm:h-72 image-hover-zoom">
        <img
          src={HOSPITAL_PHOTOGRAPHY.hospitalExterior}
          alt="Gokul Hospital modern multi-specialty healthcare building exterior"
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#123B67]/90 via-[#123B67]/25 to-transparent" />
        <div className="absolute top-3.5 left-3.5">
          <GokulHospitalLogo variant="full" size="sm" />
        </div>
        <div className="absolute bottom-4 left-4 right-4 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="px-2.5 py-1 rounded-md bg-[#19B7A5] text-[#123B67] text-xs font-extrabold uppercase tracking-wider">
              Integrated Healthcare Campus
            </span>
            <h3 className="text-lg sm:text-xl font-display font-bold mt-1.5">
              Modern Infrastructure &amp; Patient-First Architecture
            </h3>
          </div>
          <span className="text-xs font-mono-tabular bg-white/15 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/20 shrink-0">
            15 Clinical Specialties
          </span>
        </div>
      </div>

      {/* Secondary Two-Column Clinical Photography */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-44 image-hover-zoom">
          <img
            src={HOSPITAL_PHOTOGRAPHY.modularOperationTheatre}
            alt="Class-100 Modular Operation Theatre at Gokul Hospital"
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#123B67]/85 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#19B7A5]">
              Surgical Excellence
            </p>
            <p className="text-sm font-display font-bold">
              Class-100 Modular Operation Theatres
            </p>
          </div>
        </div>

        <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-44 image-hover-zoom">
          <img
            src={HOSPITAL_PHOTOGRAPHY.pathologyLaboratory}
            alt="24/7 Automated NABL-Grade Diagnostic Laboratory at Gokul Hospital"
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#123B67]/85 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#19B7A5]">
              Precision Diagnostics
            </p>
            <p className="text-sm font-display font-bold">
              24/7 Automated Pathology &amp; Imaging
            </p>
          </div>
        </div>
      </div>

      {/* Clinical Assurance Strip */}
      <div className="grid grid-cols-3 gap-2.5 pt-1 text-center">
        <div className="bg-[#F5F9FC] rounded-xl p-3 border border-slate-200/80">
          <p className="text-xs text-slate-500 font-medium">Infection Control</p>
          <p className="text-sm font-display font-bold text-[#123B67] mt-0.5">HEPA Laminar OT</p>
        </div>
        <div className="bg-[#F5F9FC] rounded-xl p-3 border border-slate-200/80">
          <p className="text-xs text-slate-500 font-medium">Critical Care</p>
          <p className="text-sm font-display font-bold text-[#1685B8] mt-0.5">24/7 Monitored ICU</p>
        </div>
        <div className="bg-[#F5F9FC] rounded-xl p-3 border border-slate-200/80">
          <p className="text-xs text-slate-500 font-medium">Tariff Policy</p>
          <p className="text-sm font-display font-bold text-[#19B7A5] mt-0.5">100% Transparent ₹</p>
        </div>
      </div>
    </div>
  );
}

/**
 * 3. DEPARTMENT MEDICAL VISUAL (Photorealistic Specialty Banner)
 */
export function DepartmentMedicalVisual({
  slug,
  name,
  heightClass = 'h-48',
}: {
  slug: string;
  name: string;
  heightClass?: string;
}) {
  const photo = getDepartmentPhoto(slug, name);

  return (
    <div
      className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-slate-200/90 bg-[#123B67] image-hover-zoom shadow-xs`}
    >
      <img
        src={photo.src}
        alt={`${name} Department at Gokul Hospital — ${photo.caption}`}
        loading="lazy"
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#123B67]/90 via-[#123B67]/25 to-transparent" />

      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
        <span className="px-2.5 py-1 rounded-lg bg-white/95 text-[#123B67] text-[11px] font-extrabold uppercase tracking-wider shadow-xs">
          {name}
        </span>
        <span className="px-2.5 py-1 rounded-lg bg-[#123B67]/85 backdrop-blur-xs text-[#19B7A5] border border-white/15 text-[11px] font-bold">
          Gokul Hospital
        </span>
      </div>

      <div className="absolute bottom-3 left-3 right-3 text-white">
        <p className="text-xs font-medium text-white/90 line-clamp-1">{photo.caption}</p>
      </div>
    </div>
  );
}

/**
 * 4. DOCTOR PORTRAIT VISUAL (Photorealistic Studio Portrait for Demonstration Doctor Profiles)
 */
export function DoctorPortraitVisual({
  name,
  specialization,
  departmentName,
  size = 'md',
}: {
  name: string;
  specialization: string;
  departmentName?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const portrait = getDoctorPortraitPhoto(name);
  const heightClass =
    size === 'lg' ? 'h-80 sm:h-96' : size === 'sm' ? 'h-48' : 'h-60';

  return (
    <div
      className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-slate-200/90 bg-[#EAF5FC] image-hover-zoom shadow-xs`}
    >
      <img
        src={portrait.src}
        alt={`${name} — ${specialization} (${departmentName || 'Clinical Specialist'}) at Gokul Hospital`}
        loading="lazy"
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover object-top"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#123B67]/90 via-[#123B67]/15 to-transparent" />

      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
        {departmentName && (
          <span className="px-2.5 py-1 rounded-lg bg-white/95 text-[#123B67] text-[11px] font-extrabold uppercase tracking-wider shadow-xs truncate">
            {departmentName}
          </span>
        )}
        <span
          className="px-2.5 py-1 rounded-lg bg-[#123B67]/85 backdrop-blur-xs text-[#19B7A5] text-[11px] font-semibold border border-white/15 shrink-0"
          title="Illustrative studio portrait for demonstration doctor profile"
        >
          Verified OPD Slot
        </span>
      </div>

      <div className="absolute bottom-3 left-3 right-3 text-white flex items-center justify-between gap-2">
        <div className="truncate">
          <p className="text-xs font-bold text-[#19B7A5] uppercase tracking-wider truncate">
            {specialization}
          </p>
        </div>
        <Stethoscope className="w-4 h-4 text-white/90 shrink-0" />
      </div>
    </div>
  );
}

/**
 * 5. FACILITY VISUAL BANNER (Photorealistic Hospital Infrastructure & Equipment)
 */
export function FacilityVisualBanner({
  category,
  title,
  heightClass = 'h-48',
}: {
  category: string;
  title: string;
  heightClass?: string;
}) {
  const photoSrc = getFacilityPhoto(category, title);

  return (
    <div
      className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-slate-200/90 bg-[#123B67] image-hover-zoom shadow-xs`}
    >
      <img
        src={photoSrc}
        alt={`${title} (${category}) at Gokul Hospital`}
        loading="lazy"
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#123B67]/90 via-[#123B67]/25 to-transparent" />

      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
        <span className="px-2.5 py-1 rounded-lg bg-white/95 text-[#123B67] text-[11px] font-extrabold uppercase tracking-wider shadow-xs">
          {category}
        </span>
        <span className="px-2.5 py-1 rounded-lg bg-[#19B7A5] text-[#123B67] text-[11px] font-extrabold">
          24/7 Ready
        </span>
      </div>

      <div className="absolute bottom-3 left-3 right-3 text-white">
        <p className="text-sm sm:text-base font-display font-bold leading-snug">{title}</p>
      </div>
    </div>
  );
}

/**
 * 6. BLOG THUMBNAIL VISUAL (Photorealistic Editorial Health Guide Cover)
 */
export function BlogThumbnailVisual({
  category,
  title,
  heightClass = 'h-48',
}: {
  category: string;
  title: string;
  heightClass?: string;
}) {
  const photoSrc = getBlogPhoto(category, title);

  return (
    <div
      className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-slate-200/90 bg-[#123B67] image-hover-zoom shadow-xs`}
    >
      <img
        src={photoSrc}
        alt={`${title} — Gokul Hospital Health Education`}
        loading="lazy"
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#123B67]/90 via-[#123B67]/20 to-transparent" />

      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
        <span className="px-2.5 py-1 rounded-lg bg-white/95 text-[#123B67] text-[11px] font-extrabold uppercase tracking-wider shadow-xs">
          {category}
        </span>
        <span className="px-2.5 py-1 rounded-lg bg-[#123B67]/85 text-[#19B7A5] text-[11px] font-bold border border-white/15">
          Clinical Guide
        </span>
      </div>

      <div className="absolute bottom-3 left-3 right-3 text-white">
        <p className="text-xs font-semibold text-white/90 line-clamp-1">
          Gokul Hospital Medical Editorial Board
        </p>
      </div>
    </div>
  );
}

/**
 * 7. CONSULTATION BOOKING SIDEBAR VISUAL (Doctor Consulting Patient Photograph)
 * Used on the Appointment Booking page & Homepage Appointment CTA section.
 */
export function ConsultationBookingVisual() {
  return (
    <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3.5">
      <div className="relative h-52 rounded-2xl overflow-hidden border border-slate-200 image-hover-zoom">
        <img
          src={HOSPITAL_PHOTOGRAPHY.doctorConsultation}
          alt="Senior doctor consulting patient at Gokul Hospital outpatient clinic"
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#123B67]/90 via-[#123B67]/20 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <span className="px-2.5 py-0.5 rounded-md bg-[#19B7A5] text-[#123B67] text-[11px] font-extrabold uppercase tracking-wider">
            Direct Specialist Consultation
          </span>
          <p className="text-sm font-display font-bold mt-1">
            One-on-One Clinical Evaluation &amp; Digital Prescription
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 text-xs">
        <div className="p-3 rounded-xl bg-[#F5F9FC] border border-slate-200/80 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#19B7A5] shrink-0" />
          <span className="font-semibold text-[#123B67]">Instant Slot Lock</span>
        </div>
        <div className="p-3 rounded-xl bg-[#F5F9FC] border border-slate-200/80 flex items-center gap-2">
          <HeartPulse className="w-4 h-4 text-[#1685B8] shrink-0" />
          <span className="font-semibold text-[#123B67]">EHR Portal Linked</span>
        </div>
      </div>
    </div>
  );
}
