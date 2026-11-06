import React, { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Search,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Clock,
  Stethoscope,
  SlidersHorizontal,
  ShieldCheck,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext.tsx';
import { usePageSeo } from '../layouts/PublicLayout.tsx';
import {
  DepartmentMedicalVisual,
  DoctorPortraitVisual,
} from '../components/MedicalVisuals.tsx';

export function DepartmentsPage() {
  const { departments, doctors } = useHospital();
  const [search, setSearch] = useState('');

  usePageSeo(
    'Medical Departments',
    'Explore 15 specialized medical departments at Gokul Hospital including Cardiology, Neurology, Orthopedics, Pediatrics, Gynecology, and 24/7 Emergency Medicine.'
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return departments;
    return departments.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.shortDescription.toLowerCase().includes(q) ||
        d.keyProcedures.some((p) => p.toLowerCase().includes(q))
    );
  }, [departments, search]);

  return (
    <div className="hospital-container py-10 sm:py-14 space-y-10">
      {/* Wide Page Header Banner */}
      <div className="bg-gradient-to-r from-[#123B67] via-[#154B80] to-[#1685B8] text-white rounded-3xl p-7 sm:p-10 shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-3 max-w-2xl">
          <p className="text-xs sm:text-sm font-bold text-[#19B7A5] uppercase tracking-wider">
            Gokul Hospital · Clinical Specialties
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-display font-extrabold text-white leading-tight">
            Medical Departments &amp; Specialty Centers
          </h1>
          <p className="text-base sm:text-lg text-white/90 leading-relaxed">
            Browse our {departments.length} specialized departments equipped with dedicated outpatient consultation chambers, advanced diagnostics, and inpatient recovery wards.
          </p>
        </div>

        <div className="w-full lg:w-96 relative shrink-0">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter departments or procedures..."
            className="w-full pl-11 pr-4 py-3.5 bg-white text-[#243447] border border-white/30 rounded-2xl text-[15px] shadow-md focus:outline-none focus:ring-2 focus:ring-[#19B7A5]"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
          <p className="text-xl font-display font-bold text-[#123B67]">
            No departments matched “{search}”
          </p>
          <button
            onClick={() => setSearch('')}
            className="px-5 py-2.5 rounded-xl bg-[#123B67] text-white text-sm font-bold cursor-pointer"
          >
            Reset Search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {filtered.map((dept, index) => {
            const deptDoctors = doctors.filter((d) => d.departmentId === dept.id);
            return (
              <div
                key={dept.id}
                className="hospital-card-hover bg-white rounded-3xl p-5 border border-slate-200/90 flex flex-col justify-between gap-5 shadow-xs"
              >
                <div className="space-y-4">
                  <DepartmentMedicalVisual
                    slug={dept.slug}
                    name={dept.name}
                    heightClass="h-44"
                  />

                  <div className="px-1 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-[#1685B8]">
                      <span>
                        #{String(index + 1).padStart(2, '0')} · {dept.floorLocation}
                      </span>
                      <span>Ext: {dept.contactExtension}</span>
                    </div>
                    <h2 className="text-2xl font-display font-bold text-[#123B67]">
                      {dept.name}
                    </h2>
                    <p className="text-[15px] text-slate-600 leading-relaxed">
                      {dept.shortDescription}
                    </p>

                    <div className="pt-2 space-y-1.5">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#123B67]">
                        Key Clinical Procedures:
                      </p>
                      <ul className="text-sm text-slate-600 space-y-1.5">
                        {dept.keyProcedures.slice(0, 3).map((proc, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#19B7A5] shrink-0 mt-0.5" />
                            <span>{proc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="px-1 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <Link
                    to={`/departments/${dept.slug}`}
                    className="text-sm font-bold text-[#1685B8] hover:text-[#123B67] inline-flex items-center gap-1.5"
                  >
                    <span>Explore ({deptDoctors.length} Doctors)</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to={`/appointment?departmentId=${dept.id}`}
                    className="px-4 py-2.5 rounded-xl bg-[#123B67] text-white hover:bg-[#1685B8] text-sm font-bold whitespace-nowrap transition-colors"
                  >
                    Book OPD
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function DepartmentDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { departments, doctors } = useHospital();

  const department = departments.find((d) => d.slug === slug || d.id === slug);

  usePageSeo(
    department ? `${department.name} Department` : 'Department Details',
    department?.shortDescription
  );

  if (!department) {
    return (
      <div className="hospital-container py-16 text-center space-y-4">
        <h1 className="text-3xl font-display font-bold text-[#123B67]">
          Medical Department Not Found
        </h1>
        <Link
          to="/departments"
          className="inline-block px-6 py-3 rounded-xl bg-[#123B67] text-white text-base font-bold"
        >
          Back to All Departments
        </Link>
      </div>
    );
  }

  const deptDoctors = doctors.filter((d) => d.departmentId === department.id);

  return (
    <div className="hospital-container py-10 sm:py-14 space-y-10">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 space-y-6 shadow-xs">
        <div className="text-sm font-medium text-slate-500">
          <Link to="/departments" className="text-[#1685B8] font-bold hover:underline">
            Medical Departments
          </Link>
          <span aria-hidden="true"> / </span>
          <span className="text-[#123B67] font-semibold">{department.name}</span>
          <span aria-hidden="true"> · </span>
          <span>{department.floorLocation}</span>
          <span aria-hidden="true"> · </span>
          <span>{department.contactExtension}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-[#123B67]">
              Department of {department.name}
            </h1>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              {department.fullDescription}
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <span className="px-4 py-2 rounded-xl bg-[#EAF5FC] text-[#123B67] text-sm font-bold">
                Head of Department: {department.headOfDepartment}
              </span>
              <Link
                to={`/appointment?departmentId=${department.id}`}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#123B67] hover:bg-[#1685B8] text-white font-bold text-[15px] whitespace-nowrap transition-colors shadow-sm"
              >
                <Calendar className="w-4 h-4 text-[#19B7A5]" />
                <span>Book {department.name} Appointment</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <DepartmentMedicalVisual
              slug={department.slug}
              name={department.name}
              heightClass="h-56"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl p-7 border border-slate-200 space-y-4">
          <h2 className="text-2xl font-display font-bold text-[#123B67]">
            Clinical Procedures &amp; Treatments
          </h2>
          <ul className="space-y-3 text-base text-slate-700">
            {department.keyProcedures.map((proc, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#19B7A5] shrink-0 mt-0.5" />
                <span>{proc}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-3xl p-7 border border-slate-200 space-y-4">
          <h2 className="text-2xl font-display font-bold text-[#123B67]">
            Diagnostic &amp; Clinical Equipment
          </h2>
          <ul className="space-y-3 text-base text-slate-700">
            {department.equipmentHighlights.map((eq, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <Stethoscope className="w-5 h-5 text-[#1685B8] shrink-0 mt-0.5" />
                <span>{eq}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-[#123B67]">
          Consulting Specialists in {department.name}
        </h2>
        {deptDoctors.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-base text-slate-600">
            On-call visiting consultants are available for {department.name}. You can book an appointment slot directly using the button above.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {deptDoctors.map((doc) => (
              <div
                key={doc.id}
                className="hospital-card-hover bg-white rounded-3xl p-5 border border-slate-200 flex flex-col justify-between gap-5"
              >
                <div className="space-y-4">
                  <DoctorPortraitVisual
                    name={doc.name}
                    specialization={doc.specialization}
                    departmentName={doc.departmentName}
                    size="md"
                  />
                  <div>
                    <h3 className="text-xl font-display font-bold text-[#123B67]">
                      {doc.name}
                    </h3>
                    <p className="text-sm text-slate-600 mt-0.5">{doc.specialization}</p>
                    <p className="text-sm text-[#1685B8] font-bold mt-1.5 tabular-nums">
                      Consultation Fee: ₹{doc.consultationFee} · {doc.experienceYears} Yrs Exp
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <Link
                    to={`/doctors/${doc.slug}`}
                    className="flex-1 text-center px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-[#123B67] hover:bg-slate-50"
                  >
                    View Profile
                  </Link>
                  <Link
                    to={`/appointment?departmentId=${department.id}&doctorId=${doc.id}`}
                    className="flex-1 text-center px-4 py-2.5 rounded-xl bg-[#123B67] hover:bg-[#1685B8] text-white text-sm font-bold"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function DoctorsPage() {
  const { doctors, departments } = useHospital();
  const [searchName, setSearchName] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [dayFilter, setDayFilter] = useState('ALL');
  const [maxFee, setMaxFee] = useState<number>(2000);

  usePageSeo(
    'Our Doctors & Specialists Directory',
    'Search and filter consulting doctors at Gokul Hospital by department, specialization, available day, and consultation fee in INR.'
  );

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const q = searchName.trim().toLowerCase();
      if (
        q &&
        !doc.name.toLowerCase().includes(q) &&
        !doc.specialization.toLowerCase().includes(q) &&
        !doc.qualifications.toLowerCase().includes(q)
      ) {
        return false;
      }
      if (
        departmentFilter !== 'ALL' &&
        String(doc.departmentId) !== String(departmentFilter)
      ) {
        return false;
      }
      if (dayFilter !== 'ALL' && !doc.availableDays.includes(dayFilter)) {
        return false;
      }
      if (doc.consultationFee > maxFee) {
        return false;
      }
      return true;
    });
  }, [doctors, searchName, departmentFilter, dayFilter, maxFee]);

  return (
    <div className="hospital-container py-10 sm:py-14 space-y-10">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 space-y-6 shadow-xs">
        <div className="space-y-2 max-w-3xl">
          <p className="text-sm font-bold text-[#1685B8] uppercase tracking-wider">
            Gokul Hospital · Specialist Directory
          </p>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-[#123B67]">
            Find &amp; Book Our Consulting Doctors
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            Filter doctors by name, medical department, day of availability, or consultation fee (INR ₹). Demonstration profiles are clearly marked and editable via the Hospital Admin Console.
          </p>
        </div>

        {/* Search and Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-2">
          <div>
            <label className="block text-sm font-bold text-[#123B67] mb-1.5">
              Doctor Name or Specialization
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="e.g. Dr. Sharma, Cardiologist..."
                className="w-full pl-10 pr-3.5 py-3 bg-[#F5F9FC] border border-slate-300 rounded-xl text-[15px] focus:outline-none focus:border-[#1685B8]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#123B67] mb-1.5">
              Medical Department
            </label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3.5 py-3 bg-[#F5F9FC] border border-slate-300 rounded-xl text-[15px] focus:outline-none focus:border-[#1685B8]"
            >
              <option value="ALL">All Departments ({departments.length})</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#123B67] mb-1.5">
              Consultation Day
            </label>
            <select
              value={dayFilter}
              onChange={(e) => setDayFilter(e.target.value)}
              className="w-full px-3.5 py-3 bg-[#F5F9FC] border border-slate-300 rounded-xl text-[15px] focus:outline-none focus:border-[#1685B8]"
            >
              <option value="ALL">Any Day of Week</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#123B67] mb-1.5 tabular-nums">
              Max Consultation Fee: ₹{maxFee}
            </label>
            <input
              type="range"
              min={300}
              max={2000}
              step={50}
              value={maxFee}
              onChange={(e) => setMaxFee(Number(e.target.value))}
              className="w-full accent-[#123B67] mt-3"
            />
          </div>
        </div>
      </div>

      {filteredDoctors.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
          <SlidersHorizontal className="w-10 h-10 text-slate-400 mx-auto" />
          <p className="text-xl font-display font-bold text-[#123B67]">
            No doctors match your active filters
          </p>
          <button
            onClick={() => {
              setSearchName('');
              setDepartmentFilter('ALL');
              setDayFilter('ALL');
              setMaxFee(2000);
            }}
            className="px-5 py-2.5 rounded-xl bg-[#123B67] text-white text-sm font-bold cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {filteredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="hospital-card-hover bg-white rounded-3xl p-5 border border-slate-200/90 flex flex-col justify-between gap-5 shadow-xs"
            >
              <div className="space-y-4">
                <DoctorPortraitVisual
                  name={doc.name}
                  specialization={doc.specialization}
                  departmentName={doc.departmentName}
                  size="md"
                />

                <div className="px-1 space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#1685B8]">
                    {doc.departmentName}
                    {doc.isDemoProfile ? ' · Demo Profile' : ''}
                  </div>
                  <h2 className="text-2xl font-display font-bold text-[#123B67]">
                    {doc.name}
                  </h2>
                  <p className="text-[15px] font-medium text-slate-600">
                    {doc.specialization}
                  </p>
                </div>

                <div className="px-1 space-y-2 text-sm text-slate-600 pt-3 border-t border-slate-100">
                  <p>
                    <strong className="text-[#123B67]">Qualifications:</strong>{' '}
                    {doc.qualifications}
                  </p>
                  <p className="tabular-nums">
                    <strong className="text-[#123B67]">Experience:</strong>{' '}
                    {doc.experienceYears} Years ·{' '}
                    <strong className="text-[#123B67]">OPD Fee:</strong>{' '}
                    <span className="text-[#1685B8] font-bold">₹{doc.consultationFee}</span>
                  </p>
                  <p>
                    <strong className="text-[#123B67]">Available Days:</strong>{' '}
                    {doc.availableDays.join(', ')}
                  </p>
                  <p>
                    <strong className="text-[#123B67]">Status:</strong>{' '}
                    <span className="text-emerald-700 font-semibold">
                      {doc.isAvailable ? 'Available for Booking' : 'On Leave'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Link
                  to={`/doctors/${doc.slug}`}
                  className="flex-1 text-center px-4 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-sm font-bold text-[#123B67] whitespace-nowrap transition-colors"
                >
                  Doctor Profile
                </Link>
                <Link
                  to={`/appointment?departmentId=${doc.departmentId}&doctorId=${doc.id}`}
                  className="flex-1 text-center px-4 py-3 rounded-xl bg-[#123B67] hover:bg-[#1685B8] text-sm font-bold text-white whitespace-nowrap transition-colors"
                >
                  Book Appointment
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function DoctorProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const { doctors } = useHospital();

  const doctor = doctors.find((d) => d.slug === slug || d.id === slug);

  usePageSeo(
    doctor ? `${doctor.name} — ${doctor.specialization}` : 'Doctor Profile',
    doctor?.biography
  );

  if (!doctor) {
    return (
      <div className="hospital-container py-16 text-center space-y-4">
        <h1 className="text-3xl font-display font-bold text-[#123B67]">
          Doctor Profile Not Found
        </h1>
        <Link
          to="/doctors"
          className="inline-block px-6 py-3 rounded-xl bg-[#123B67] text-white text-base font-bold"
        >
          Back to Doctor Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="hospital-container py-10 sm:py-14 space-y-8">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 space-y-8 shadow-xs">
        <div className="text-sm font-medium text-slate-500">
          <Link to="/doctors" className="text-[#1685B8] font-bold hover:underline">
            Our Doctors
          </Link>
          <span aria-hidden="true"> / </span>
          <span>{doctor.departmentName}</span>
          <span aria-hidden="true"> / </span>
          <span className="text-[#123B67] font-semibold">{doctor.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-4">
            <DoctorPortraitVisual
              name={doctor.name}
              specialization={doctor.specialization}
              departmentName={doctor.departmentName}
              size="lg"
            />
          </div>

          <div className="lg:col-span-8 space-y-5">
            <div className="space-y-2">
              <p className="text-sm font-bold text-[#1685B8] uppercase tracking-wider">
                {doctor.departmentName} · Reg. {doctor.registrationNumber}
              </p>
              <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-[#123B67]">
                {doctor.name}
              </h1>
              <p className="text-lg font-semibold text-slate-700">
                {doctor.specialization}
              </p>
              <p className="text-base text-slate-600">{doctor.qualifications}</p>
            </div>

            <p className="text-[16px] text-slate-600 leading-relaxed">
              {doctor.biography}
            </p>

            <div className="bg-[#EAF5FC]/70 rounded-2xl p-5 border border-[#1685B8]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-600 font-medium">
                  Standard OPD Consultation Charge
                </p>
                <p className="text-3xl font-display font-extrabold text-[#123B67] tabular-nums">
                  ₹{doctor.consultationFee}{' '}
                  <span className="text-sm font-normal text-slate-500">(INR)</span>
                </p>
              </div>
              <Link
                to={`/appointment?departmentId=${doctor.departmentId}&doctorId=${doctor.id}`}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl bg-[#123B67] hover:bg-[#1685B8] text-white text-base font-bold transition-colors whitespace-nowrap shadow-md"
              >
                <Calendar className="w-5 h-5 text-[#19B7A5]" />
                <span>
                  Book Appointment with {doctor.name.split(' ').slice(0, 2).join(' ')}
                </span>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4 border-t border-slate-200">
          <div className="bg-[#F5F9FC] rounded-2xl p-5 border border-slate-200">
            <p className="text-sm text-slate-500 font-medium">Clinical Experience</p>
            <p className="text-xl font-display font-extrabold text-[#123B67] tabular-nums mt-1">
              {doctor.experienceYears} Years
            </p>
          </div>
          <div className="bg-[#F5F9FC] rounded-2xl p-5 border border-slate-200">
            <p className="text-sm text-slate-500 font-medium">Languages Spoken</p>
            <p className="text-xl font-display font-extrabold text-[#123B67] mt-1">
              {doctor.languages.join(', ')}
            </p>
          </div>
          <div className="bg-[#F5F9FC] rounded-2xl p-5 border border-slate-200">
            <p className="text-sm text-slate-500 font-medium">Profile Verification Status</p>
            <p className="text-xl font-display font-extrabold text-[#1685B8] mt-1 inline-flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-[#19B7A5]" />
              <span>{doctor.isDemoProfile ? 'Editable Demo Profile' : 'Hospital Verified'}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-3">
            <h3 className="text-base font-display font-bold text-[#123B67] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#1685B8]" />
              <span>Available OPD Days</span>
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {doctor.availableDays.map((day) => (
                <span
                  key={day}
                  className="px-4 py-2 rounded-xl bg-[#F5F9FC] border border-slate-200 text-sm font-bold text-[#123B67]"
                >
                  {day}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-display font-bold text-[#123B67] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#19B7A5]" />
              <span>Standard Consultation Slots</span>
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {doctor.availableTimeSlots.map((slot) => (
                <span
                  key={slot}
                  className="px-3.5 py-2 rounded-xl bg-[#F5F9FC] border border-slate-200 text-sm font-mono-tabular font-semibold text-slate-700"
                >
                  {slot}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
