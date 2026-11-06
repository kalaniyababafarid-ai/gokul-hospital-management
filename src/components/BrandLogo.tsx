import React, { useState, useEffect } from 'react';
import { GOKUL_HOSPITAL_BRANDING } from '../config/branding.ts';
import { getDoctorPortraitPhoto, HOSPITAL_PHOTOGRAPHY } from '../config/medicalImages.ts';

export const CUSTOM_LOGO_STORAGE_KEY = 'gokul_hospital_official_logo_data_url';

export interface GokulHospitalLogoProps {
  hospitalName?: string;
  variant?: 'full' | 'compact' | 'emblem';
  size?: 'sm' | 'md' | 'lg';
  light?: boolean;
  compact?: boolean;
  className?: string;
}

export function GokulHospitalLogo({
  hospitalName = GOKUL_HOSPITAL_BRANDING.name,
  variant = 'full',
  size = 'md',
  light = false,
  compact = false,
  className = '',
}: GokulHospitalLogoProps) {
  const effectiveVariant = compact ? 'compact' : variant;
  const [customLogoSrc, setCustomLogoSrc] = useState<string | null>(() => {
    try {
      return typeof window !== 'undefined'
        ? window.localStorage.getItem(CUSTOM_LOGO_STORAGE_KEY)
        : null;
    } catch {
      return null;
    }
  });
  const [imgSrc, setImgSrc] = useState<string>(
    customLogoSrc || GOKUL_HOSPITAL_BRANDING.fullLogoSvg
  );

  useEffect(() => {
    const syncCustomLogo = () => {
      try {
        const stored = window.localStorage.getItem(CUSTOM_LOGO_STORAGE_KEY);
        setCustomLogoSrc(stored);
        setImgSrc(stored || GOKUL_HOSPITAL_BRANDING.fullLogoSvg);
      } catch {
        // ignore storage errors
      }
    };
    window.addEventListener('gokul-logo-updated', syncCustomLogo);
    window.addEventListener('storage', syncCustomLogo);
    return () => {
      window.removeEventListener('gokul-logo-updated', syncCustomLogo);
      window.removeEventListener('storage', syncCustomLogo);
    };
  }, []);

  if (effectiveVariant === 'emblem') {
    const emblemSize =
      size === 'lg' ? 'w-14 h-14' : size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
    return (
      <div
        className={`inline-flex items-center justify-center rounded-xl bg-white p-1 shadow-xs border border-slate-200/80 shrink-0 ${emblemSize} ${className}`}
      >
        <img
          src={customLogoSrc || GOKUL_HOSPITAL_BRANDING.favicon}
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src !== GOKUL_HOSPITAL_BRANDING.fullLogo) {
              target.src = GOKUL_HOSPITAL_BRANDING.fullLogo;
            }
          }}
          alt={GOKUL_HOSPITAL_BRANDING.altText}
          width={48}
          height={48}
          className="w-full h-full object-contain select-none"
        />
      </div>
    );
  }

  const heightClasses =
    effectiveVariant === 'compact'
      ? 'h-9 sm:h-10'
      : size === 'lg'
      ? 'h-13 sm:h-15'
      : size === 'sm'
      ? 'h-9 sm:h-10'
      : 'h-11 sm:h-12';

  // Official logo has a white background. Keep it on white or place inside an elegant white container on dark surfaces.
  const surfaceContainerClasses = light
    ? 'bg-white px-3 py-1.5 rounded-xl shadow-sm border border-white/30'
    : 'bg-white px-2 py-1 rounded-xl';

  return (
    <div
      className={`inline-flex items-center gap-2.5 select-none shrink-0 ${surfaceContainerClasses} ${className}`}
      title={hospitalName}
    >
      <img
        src={imgSrc}
        onError={() => {
          if (imgSrc !== GOKUL_HOSPITAL_BRANDING.fullLogo) {
            setImgSrc(GOKUL_HOSPITAL_BRANDING.fullLogo);
          }
        }}
        alt={GOKUL_HOSPITAL_BRANDING.altText}
        width={effectiveVariant === 'compact' ? 168 : 220}
        height={effectiveVariant === 'compact' ? 42 : 55}
        className={`${heightClasses} w-auto object-contain shrink-0`}
      />
    </div>
  );
}

// Preserve BrandLogo alias so all existing imports automatically render GokulHospitalLogo
export function BrandLogo(props: GokulHospitalLogoProps) {
  return <GokulHospitalLogo {...props} />;
}

export function DoctorAvatarSvg({
  name,
  size = 'md',
  className = '',
}: {
  name: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const portrait = getDoctorPortraitPhoto(name);
  const dims =
    size === 'lg' ? 'w-24 h-24' : size === 'sm' ? 'w-10 h-10' : 'w-16 h-16';

  return (
    <div
      className={`${dims} ${className} rounded-2xl overflow-hidden border border-slate-200 shadow-xs shrink-0 relative bg-[#EAF5FC]`}
    >
      <img
        src={portrait.src}
        alt={name}
        loading="lazy"
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover object-top"
      />
    </div>
  );
}

export function HospitalHeroVisual() {
  return (
    <div className="relative rounded-2xl bg-gradient-to-br from-[#123B67] via-[#167DB5] to-[#1685B8] p-6 sm:p-8 text-white shadow-xl border border-white/15 overflow-hidden">
      <div className="relative z-10 flex flex-col justify-between gap-6">
        <div className="flex items-center justify-between border-b border-white/15 pb-4 gap-3">
          <div>
            <p className="text-xs text-[#19B7A5] font-semibold tracking-wide">
              GOKUL HOSPITAL · MULTI-SPECIALTY CAMPUS
            </p>
            <h3 className="text-xl font-display font-bold text-white mt-0.5">
              Integrated Clinical &amp; Diagnostic Center
            </h3>
          </div>
          <GokulHospitalLogo variant="emblem" size="md" />
        </div>

        <div className="rounded-xl overflow-hidden border border-white/20 h-48 sm:h-56 relative image-hover-zoom">
          <img
            src={HOSPITAL_PHOTOGRAPHY.hospitalExterior}
            alt="Gokul Hospital Multi-Specialty Campus Exterior"
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#123B67]/80 via-transparent to-transparent" />
        </div>

        <div className="grid grid-cols-3 gap-4 pt-2 border-t border-white/15 text-left">
          <div>
            <p className="text-xs text-white/75">Specialties</p>
            <p className="text-lg font-display font-bold tabular-nums text-white">15 Departments</p>
          </div>
          <div>
            <p className="text-xs text-white/75">Emergency &amp; Lab</p>
            <p className="text-lg font-display font-bold tabular-nums text-[#19B7A5]">24 × 7 Care</p>
          </div>
          <div>
            <p className="text-xs text-white/75">Appointments</p>
            <p className="text-lg font-display font-bold tabular-nums text-white">Instant Slot ID</p>
          </div>
        </div>
      </div>
    </div>
  );
}
