import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  FileText,
  Printer,
  ArrowRight,
  RefreshCw,
  Stethoscope,
  ShieldCheck,
  Award,
  ExternalLink,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext.tsx';
import { apiRequest } from '../services/api.ts';
import type { Appointment } from '../types/hospital.ts';
import { usePageSeo } from '../layouts/PublicLayout.tsx';
import { GokulHospitalLogo } from '../components/BrandLogo.tsx';
import {
  DoctorPortraitVisual,
  ConsultationBookingVisual,
} from '../components/MedicalVisuals.tsx';

interface AvailabilityResponse {
  doctorId: string;
  doctorName: string;
  date: string;
  dayOfWeek: string;
  isDoctorWorkingDay: boolean;
  availableDays: string[];
  slots: { timeSlot: string; isAvailable: boolean }[];
}

export function AppointmentPage() {
  const { departments, doctors, user, settings, showToast } = useHospital();
  const [searchParams] = useSearchParams();

  usePageSeo(
    'Book Outpatient Appointment',
    'Book a confirmed outpatient consultation slot with a specialist doctor at Gokul Hospital with real-time slot verification.'
  );

  const tomorrowDefault = new Date(Date.now() + 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  // Step 1-3 State
  const [departmentId, setDepartmentId] = useState(searchParams.get('departmentId') || '');
  const [doctorId, setDoctorId] = useState(searchParams.get('doctorId') || '');
  const [appointmentDate, setAppointmentDate] = useState(
    searchParams.get('date') || tomorrowDefault
  );

  // Step 4 Live Slot State
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

  // Step 5 Patient Details
  const [patientName, setPatientName] = useState(user?.fullName || '');
  const [patientEmail, setPatientEmail] = useState(user?.email || '');
  const [patientPhone, setPatientPhone] = useState(user?.phone || '');
  const [patientDob, setPatientDob] = useState(user?.dateOfBirth || '');
  const [patientGender, setPatientGender] = useState(user?.gender || 'Male');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(true);

  // Step 6-7 Submission, Demo Payment & Confirmation State
  const [paymentChoice, setPaymentChoice] = useState<'PayAtHospital' | 'DemoPaymentSimulation'>(
    'PayAtHospital'
  );
  const [submitting, setSubmitting] = useState(false);
  const [simulatingPayment, setSimulatingPayment] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    if (user) {
      setPatientName((prev) => prev || user.fullName);
      setPatientEmail((prev) => prev || user.email);
      setPatientPhone((prev) => prev || user.phone);
      setPatientDob((prev) => prev || user.dateOfBirth || '');
      if (user.gender) setPatientGender(user.gender);
    }
  }, [user]);

  const departmentDoctors = doctors.filter(
    (d) => !departmentId || String(d.departmentId) === String(departmentId)
  );

  const selectedDoctor = doctors.find((d) => String(d.id) === String(doctorId));
  const selectedDepartment = departments.find((d) => String(d.id) === String(departmentId));

  // Auto-select department if doctorId was passed in URL
  useEffect(() => {
    if (doctorId && !departmentId) {
      const doc = doctors.find((d) => String(d.id) === String(doctorId));
      if (doc) setDepartmentId(doc.departmentId);
    }
  }, [doctorId, departmentId, doctors]);

  // Step 4: Retrieve Doctor's Actual Availability from Server
  useEffect(() => {
    if (!doctorId || !appointmentDate) {
      setAvailability(null);
      setSelectedTimeSlot('');
      return;
    }

    let active = true;
    setLoadingSlots(true);
    setSelectedTimeSlot('');
    apiRequest<AvailabilityResponse>(
      `/api/doctors/${encodeURIComponent(doctorId)}/availability?date=${encodeURIComponent(
        appointmentDate
      )}`
    )
      .then((res) => {
        if (active) setAvailability(res);
      })
      .catch((err) => {
        if (active) {
          console.error('Availability error:', err);
          setAvailability(null);
        }
      })
      .finally(() => {
        if (active) setLoadingSlots(false);
      });

    return () => {
      active = false;
    };
  }, [doctorId, appointmentDate]);

  // Compute current active step for progress bar
  const currentStep = confirmedAppointment
    ? 6
    : !departmentId
    ? 1
    : !doctorId
    ? 2
    : !selectedTimeSlot
    ? 3
    : !patientName.trim() || !patientEmail.trim() || !patientPhone.trim() || !reason.trim()
    ? 4
    : 5;

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setBookingError('');

    if (!departmentId || !doctorId || !appointmentDate || !selectedTimeSlot) {
      setBookingError('Please select a Department, Doctor, Date, and Available Time Slot.');
      return;
    }
    if (!patientName.trim() || !patientEmail.trim() || !patientPhone.trim() || !reason.trim()) {
      setBookingError('Please fill in Patient Name, Email, Mobile Number, and Appointment Reason.');
      return;
    }
    if (!privacyConsent) {
      setBookingError('Please accept the Gokul Hospital Privacy Policy consent to proceed.');
      return;
    }

    setSubmitting(true);
    try {
      const combinedNotes = [
        patientGender ? `Gender: ${patientGender}` : '',
        notes.trim(),
      ]
        .filter(Boolean)
        .join(' | ');

      const res = await apiRequest<{ appointment: Appointment; message: string }>(
        '/api/appointments',
        {
          method: 'POST',
          body: JSON.stringify({
            departmentId,
            doctorId,
            appointmentDate,
            timeSlot: selectedTimeSlot,
            patientName: patientName.trim(),
            patientEmail: patientEmail.trim(),
            patientPhone: patientPhone.trim(),
            patientDob: patientDob || undefined,
            reason: reason.trim(),
            notes: combinedNotes || undefined,
            paymentChoice,
          }),
        }
      );

      setConfirmedAppointment(res.appointment);
      showToast(
        `Your appointment request (${res.appointment.appointmentNumber}) has been successfully submitted!`,
        'success'
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Unable to book appointment. Please try another slot.';
      setBookingError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSimulateDemoPayment = async () => {
    if (!confirmedAppointment || simulatingPayment) return;
    setSimulatingPayment(true);
    try {
      const res = await apiRequest<{ appointment: Appointment; message: string }>(
        '/api/payments/sandbox-order',
        {
          method: 'POST',
          body: JSON.stringify({
            appointmentId: confirmedAppointment.id,
            paymentMethod: 'Demo Razorpay UPI / Card Test',
          }),
        }
      );
      setConfirmedAppointment(res.appointment);
      showToast(res.message, 'info');
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Demo payment simulation failed.',
        'error'
      );
    } finally {
      setSimulatingPayment(false);
    }
  };

  // STEP 7: APPOINTMENT CONFIRMATION VIEW
  if (confirmedAppointment) {
    return (
      <div className="hospital-container py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-md space-y-7">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200 pb-6">
            <div className="space-y-2.5">
              <GokulHospitalLogo variant="full" size="sm" />
              <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#19B7A5] uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>GOKUL HOSPITAL · Official Booking Slip</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-[#123B67]">
                Your appointment request has been successfully submitted.
              </h1>
              <p className="text-sm sm:text-base text-slate-600">
                {confirmedAppointment.status === 'Pending'
                  ? 'Booking Status: Pending Confirmation (Submitted to OPD Reception Desk for verification).'
                  : `Booking Status: ${confirmedAppointment.status}. Please arrive 15 minutes before your scheduled slot.`}
              </p>
            </div>
            <div className="sm:text-right shrink-0 bg-[#EAF5FC] px-5 py-4 rounded-2xl border border-[#1685B8]/25">
              <p className="text-xs font-semibold text-slate-500">Appointment ID</p>
              <p className="text-xl font-mono-tabular font-extrabold text-[#123B67]">
                {confirmedAppointment.appointmentNumber}
              </p>
              <span className="inline-block mt-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-[#123B67] text-white">
                {confirmedAppointment.status === 'Pending'
                  ? 'Pending Confirmation'
                  : confirmedAppointment.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-[#F5F9FC] rounded-2xl p-6 border border-slate-200 text-sm sm:text-base">
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase">Hospital Name</p>
              <p className="font-bold text-[#123B67] mt-0.5">GOKUL HOSPITAL</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase">Patient Name</p>
              <p className="font-bold text-[#123B67] mt-0.5">{confirmedAppointment.patientName}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase">Contact Phone &amp; Email</p>
              <p className="font-semibold text-[#123B67] mt-0.5">
                {confirmedAppointment.patientPhone} · {confirmedAppointment.patientEmail}
              </p>
            </div>
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase">Medical Department</p>
              <p className="font-bold text-[#123B67] mt-0.5">{confirmedAppointment.departmentName}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase">Consulting Doctor</p>
              <p className="font-bold text-[#123B67] mt-0.5">{confirmedAppointment.doctorName}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase">Appointment Date &amp; Time (IST)</p>
              <p className="font-mono-tabular font-bold text-[#1685B8] mt-0.5">
                {confirmedAppointment.appointmentDate} at {confirmedAppointment.timeSlot}
              </p>
            </div>
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase">Consultation Fee</p>
              <p className="font-mono-tabular font-extrabold text-[#123B67] mt-0.5">
                ₹{confirmedAppointment.consultationFee} INR
              </p>
            </div>
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase">Booking Status</p>
              <p className="font-bold text-[#19B7A5] mt-0.5">
                {confirmedAppointment.status === 'Pending'
                  ? 'Pending Confirmation'
                  : confirmedAppointment.status}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-slate-500 text-xs font-semibold uppercase">Reason for Consultation</p>
              <p className="font-medium text-[#243447] mt-0.5">{confirmedAppointment.reason}</p>
            </div>
          </div>

          {/* DEMO PAYMENT MODE STATUS & ACTION */}
          <div className="rounded-2xl p-5 border border-[#1685B8]/30 bg-[#EAF5FC] space-y-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-[#123B67] uppercase tracking-wider">
                Payment Mode:{' '}
                {confirmedAppointment.paymentStatus === 'PaidSandbox'
                  ? 'DEMO PAYMENT MODE (Simulated Test — Not a Real Payment)'
                  : 'Pay at Hospital OPD Counter'}
              </span>
              {confirmedAppointment.paymentReference && (
                <span className="font-mono-tabular font-bold text-[#123B67] bg-white px-3 py-1 rounded-lg border border-[#1685B8]/30">
                  {confirmedAppointment.paymentReference}
                </span>
              )}
            </div>
            <p className="text-[#243447] leading-relaxed">
              {confirmedAppointment.paymentStatus === 'PaidSandbox'
                ? 'This booking uses DEMO PAYMENT MODE for testing. No real money was charged or processed. Real Razorpay checkout activates automatically when live RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET credentials are configured.'
                : 'You selected Pay at Hospital OPD Counter. Want to test the online checkout flow without real money? Click below to run a Demo Payment Simulation.'}
            </p>
            {confirmedAppointment.paymentStatus !== 'PaidSandbox' && (
              <button
                type="button"
                disabled={simulatingPayment}
                onClick={handleSimulateDemoPayment}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1685B8] hover:bg-[#123B67] text-white font-bold text-sm transition-colors cursor-pointer"
              >
                <span>
                  {simulatingPayment
                    ? 'Simulating Demo Payment...'
                    : 'Test Demo Payment Mode (Simulated Razorpay — ₹0 Real Charge)'}
                </span>
              </button>
            )}
          </div>

          {/* DEMO EMAIL MODE — SIMULATED IN-APP EMAIL CONFIRMATION */}
          {confirmedAppointment.demoEmailPreview && (
            <div className="rounded-2xl p-5 border border-[#19B7A5]/30 bg-[#F5F9FC] space-y-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-[#123B67] uppercase tracking-wider">
                  DEMO EMAIL MODE · Simulated Confirmation Email
                </span>
                <span className="px-3 py-1 rounded-lg bg-[#19B7A5]/15 text-[#123B67] font-bold text-xs">
                  In-App Email Simulation (No SMTP / Gmail Required)
                </span>
              </div>
              <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-1.5 font-mono text-xs text-slate-700">
                <div>
                  <strong>To:</strong> {confirmedAppointment.demoEmailPreview.to}
                </div>
                <div>
                  <strong>From:</strong> {confirmedAppointment.demoEmailPreview.from}
                </div>
                <div>
                  <strong>Subject:</strong> {confirmedAppointment.demoEmailPreview.subject}
                </div>
                <pre className="whitespace-pre-wrap pt-2 border-t border-slate-100 font-sans text-sm text-slate-700 leading-relaxed">
                  {confirmedAppointment.demoEmailPreview.body}
                </pre>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-300 text-sm font-bold text-[#123B67] hover:bg-slate-50 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Appointment Slip</span>
            </button>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setConfirmedAppointment(null);
                  setSelectedTimeSlot('');
                  setReason('');
                }}
                className="px-5 py-3 rounded-xl border border-[#123B67] text-sm font-bold text-[#123B67] hover:bg-slate-50 cursor-pointer"
              >
                Book Another Appointment
              </button>
              <Link
                to={user ? '/patient-dashboard' : '/login'}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#123B67] hover:bg-[#1685B8] text-white text-sm font-bold"
              >
                <span>{user ? 'Manage in Patient Dashboard' : 'Login to Patient Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hospital-container py-10 sm:py-14 space-y-8">
      {/* Header Banner + Step Progress Bar */}
      <div className="bg-gradient-to-r from-[#123B67] via-[#167DB5] to-[#1685B8] rounded-3xl p-6 sm:p-10 text-white shadow-md space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <p className="text-xs sm:text-sm font-bold text-[#19B7A5] uppercase tracking-wider">
              GOKUL HOSPITAL · Real-Time Outpatient Scheduling (Asia/Kolkata IST)
            </p>
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold">
              Book an Outpatient Consultation
            </h1>
            <p className="text-sm sm:text-base text-white/90 max-w-2xl leading-relaxed">
              Select a specialty department, review doctor profiles and fees, pick a live available time slot, and confirm your appointment with instant database verification.
            </p>
          </div>
          {!user && (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-sm space-y-2.5 shrink-0">
              <p className="font-bold text-white">Have a Gokul Hospital Patient Account?</p>
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl bg-white text-[#123B67] font-bold hover:bg-[#EAF5FC]"
                >
                  Patient Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-[#19B7A5] text-[#123B67] font-bold hover:opacity-95"
                >
                  Register
                </Link>
              </div>
              <p className="text-xs text-white/80">Or continue below using Guest Booking.</p>
            </div>
          )}
        </div>

        {/* Visual Step Progress Indicator */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-3 border-t border-white/15 text-sm">
          {[
            { step: 1, title: '1. Department' },
            { step: 2, title: '2. Select Doctor' },
            { step: 3, title: '3. Date & Time' },
            { step: 4, title: '4. Patient Info' },
            { step: 5, title: '5. Confirm Slip' },
          ].map((item) => {
            const active = currentStep === item.step;
            const completed = currentStep > item.step;
            return (
              <div
                key={item.step}
                className={`px-3.5 py-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                  completed
                    ? 'bg-[#19B7A5] text-[#123B67] border-[#19B7A5] font-bold'
                    : active
                    ? 'bg-white text-[#123B67] border-white font-bold shadow-sm'
                    : 'bg-white/10 text-white/85 border-white/15'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      {bookingError && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 text-red-900 rounded-2xl p-4 flex items-start gap-3 text-base font-medium"
        >
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <span>{bookingError}</span>
        </div>
      )}

      <form onSubmit={handleConfirmBooking} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Steps 1 to 5 */}
        <div className="lg:col-span-8 space-y-7">
          {/* STEP 1: SELECT DEPARTMENT */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-xl font-display font-bold text-[#123B67] flex items-center gap-2.5">
                <Stethoscope className="w-5 h-5 text-[#1685B8]" />
                <span>Step 1: Select Medical Department</span>
              </h2>
              <span className="text-sm font-semibold text-slate-500">
                {departments.length} Active Specialties
              </span>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#123B67] mb-2">
                Choose Specialty Department *
              </label>
              <select
                required
                value={departmentId}
                onChange={(e) => {
                  setDepartmentId(e.target.value);
                  setDoctorId('');
                  setSelectedTimeSlot('');
                }}
                className="w-full px-4 py-3 bg-[#F5F9FC] border border-slate-300 rounded-xl text-[15px] focus:outline-none focus:border-[#1685B8]"
              >
                <option value="">All Medical Departments (Select to Filter)...</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.floorLocation})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Department Selection Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-1">
              {departments.slice(0, 10).map((dept) => {
                const isSelected = String(departmentId) === String(dept.id);
                return (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => {
                      setDepartmentId(dept.id);
                      if (selectedDoctor && String(selectedDoctor.departmentId) !== String(dept.id)) {
                        setDoctorId('');
                        setSelectedTimeSlot('');
                      }
                    }}
                    className={`px-3.5 py-2.5 rounded-xl border text-sm font-bold text-left truncate transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#123B67] text-white border-[#123B67] shadow-sm'
                        : 'bg-[#F5F9FC] text-[#243447] border-slate-200 hover:border-[#1685B8] hover:bg-[#EAF5FC]'
                    }`}
                  >
                    {dept.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: SELECT DOCTOR WITH STUDIO PORTRAIT ILLUSTRATIONS */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-xl font-display font-bold text-[#123B67] flex items-center gap-2.5">
                <Award className="w-5 h-5 text-[#1685B8]" />
                <span>Step 2: Select Consulting Specialist Doctor</span>
              </h2>
              <span className="text-sm font-semibold text-slate-500">
                Showing {departmentDoctors.length} specialist
                {departmentDoctors.length === 1 ? '' : 's'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {departmentDoctors.map((doc) => {
                const isSelected = String(doctorId) === String(doc.id);
                return (
                  <div
                    key={doc.id}
                    onClick={() => {
                      setDoctorId(doc.id);
                      setDepartmentId(doc.departmentId);
                    }}
                    className={`cursor-pointer rounded-3xl p-5 border transition-all flex flex-col justify-between gap-4 ${
                      isSelected
                        ? 'bg-[#EAF5FC] border-2 border-[#123B67] shadow-md'
                        : 'bg-[#F5F9FC] border-slate-200 hover:border-[#1685B8]'
                    }`}
                  >
                    <div className="space-y-3.5">
                      <DoctorPortraitVisual
                        name={doc.name}
                        specialization={doc.specialization}
                        departmentName={doc.departmentName}
                        size="sm"
                      />
                      <div className="space-y-1">
                        <h3 className="text-lg font-display font-bold text-[#123B67]">
                          {doc.name}
                        </h3>
                        <p className="text-sm font-medium text-slate-600">{doc.specialization}</p>
                        <p className="text-xs text-slate-500">{doc.qualifications}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200/80 space-y-2.5 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">
                          Exp: <strong className="text-[#123B67]">{doc.experienceYears} Yrs</strong>
                        </span>
                        <span className="font-mono-tabular font-extrabold text-[#123B67] text-base">
                          Fee: ₹{doc.consultationFee}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 truncate">
                        Days: {doc.availableDays.join(', ')}
                      </p>
                      <div className="flex items-center justify-between gap-2.5 pt-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDoctorId(doc.id);
                            setDepartmentId(doc.departmentId);
                          }}
                          className={`flex-1 py-2.5 px-3.5 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#123B67] text-white'
                              : 'bg-white text-[#123B67] border border-[#123B67] hover:bg-[#123B67] hover:text-white'
                          }`}
                        >
                          {isSelected ? '✓ Doctor Selected' : 'Select Doctor'}
                        </button>
                        <Link
                          to={`/doctors/${doc.slug}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-3 py-2.5 rounded-xl text-sm font-bold text-[#1685B8] hover:underline"
                        >
                          <span>Profile</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 3 & 4: SELECT APPOINTMENT DATE & LIVE TIME SLOTS */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-5 shadow-xs">
            <h2 className="text-xl font-display font-bold text-[#123B67] flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-[#19B7A5]" />
              <span>Step 3 &amp; 4: Select Appointment Date &amp; Available Time Slot</span>
            </h2>

            <div className="max-w-xs">
              <label className="block text-sm font-bold text-[#123B67] mb-2">
                Preferred Consultation Date *
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().slice(0, 10)}
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full px-4 py-3 bg-[#F5F9FC] border border-slate-300 rounded-xl text-[15px] font-mono-tabular focus:outline-none focus:border-[#1685B8]"
              />
            </div>

            {!doctorId ? (
              <div className="p-4 rounded-2xl bg-[#F5F9FC] border border-slate-200 text-sm text-slate-600">
                Select a specialist doctor in Step 2 above to view live available time slots for{' '}
                {appointmentDate}.
              </div>
            ) : loadingSlots ? (
              <div className="p-6 rounded-2xl bg-[#F5F9FC] border border-slate-200 flex items-center gap-2.5 text-sm text-slate-600">
                <RefreshCw className="w-4 h-4 animate-spin text-[#1685B8]" />
                <span>Checking live doctor schedule and booked slots on server...</span>
              </div>
            ) : availability && !availability.isDoctorWorkingDay ? (
              <div className="p-5 rounded-2xl bg-[#EAF5FC] border border-[#1685B8]/30 text-sm text-[#123B67]">
                <strong>Schedule Notice:</strong> {availability.doctorName} does not hold outpatient
                clinic on <strong>{availability.dayOfWeek}s</strong>. Available days:{' '}
                <strong>{availability.availableDays.join(', ')}</strong>. Please select another
                date.
              </div>
            ) : availability ? (
              <div className="space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
                  <span>
                    Available Slots for <strong className="text-[#123B67]">{availability.doctorName}</strong> on{' '}
                    <strong className="text-[#123B67]">
                      {availability.dayOfWeek}, {availability.date}
                    </strong>
                    :
                  </span>
                  <span className="text-[#1685B8] font-bold">Click an open slot to select</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {availability.slots.map((s) => {
                    const isSelected = selectedTimeSlot === s.timeSlot;
                    return (
                      <button
                        key={s.timeSlot}
                        type="button"
                        disabled={!s.isAvailable}
                        onClick={() => setSelectedTimeSlot(s.timeSlot)}
                        className={`px-3.5 py-3 rounded-xl text-sm font-mono-tabular font-bold border transition-colors cursor-pointer ${
                          !s.isAvailable
                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                            : isSelected
                            ? 'bg-[#123B67] text-white border-[#123B67] shadow-sm'
                            : 'bg-[#F5F9FC] text-[#123B67] border-slate-300 hover:border-[#1685B8] hover:bg-[#EAF5FC]'
                        }`}
                      >
                        {s.timeSlot} {!s.isAvailable ? '(Booked)' : ''}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>

          {/* STEP 5: PATIENT DETAILS & PRIVACY CONSENT */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-5 shadow-xs">
            <h2 className="text-xl font-display font-bold text-[#123B67] flex items-center gap-2.5">
              <User className="w-5 h-5 text-[#1685B8]" />
              <span>Step 5: Patient Details &amp; Clinical Reason</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-[#123B67] mb-1.5">
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Enter full name of patient"
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
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  placeholder="patient@example.com"
                  className="w-full px-4 py-3 bg-[#F5F9FC] border border-slate-300 rounded-xl text-[15px]"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#123B67] mb-1.5">
                  Mobile Number (India) *
                </label>
                <input
                  type="tel"
                  required
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="+91-98765-43210"
                  className="w-full px-4 py-3 bg-[#F5F9FC] border border-slate-300 rounded-xl text-[15px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-[#123B67] mb-1.5">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={patientDob}
                    onChange={(e) => setPatientDob(e.target.value)}
                    className="w-full px-3.5 py-3 bg-[#F5F9FC] border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#123B67] mb-1.5">
                    Gender
                  </label>
                  <select
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value)}
                    className="w-full px-3.5 py-3 bg-[#F5F9FC] border border-slate-300 rounded-xl text-sm"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-bold text-[#123B67] mb-1.5">
                  Appointment Reason / Symptoms *
                </label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Routine cardiac checkup, joint pain evaluation, pediatric immunization..."
                  className="w-full px-4 py-3 bg-[#F5F9FC] border border-slate-300 rounded-xl text-[15px]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-bold text-[#123B67] mb-1.5">
                  Additional Clinical Notes / Ongoing Medications (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any known allergies, ongoing medications, or previous diagnostic reports..."
                  className="w-full px-4 py-3 bg-[#F5F9FC] border border-slate-300 rounded-xl text-[15px]"
                />
              </div>

              <div className="sm:col-span-2 pt-1">
                <label className="flex items-start gap-2.5 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={privacyConsent}
                    onChange={(e) => setPrivacyConsent(e.target.checked)}
                    className="mt-1 rounded border-slate-300 text-[#123B67]"
                  />
                  <span>
                    I consent to the{' '}
                    <Link
                      to="/privacy-policy"
                      className="text-[#1685B8] font-bold hover:underline"
                    >
                      Gokul Hospital Privacy Policy
                    </Link>{' '}
                    and authorize the hospital to share my booking details with the selected
                    consulting doctor. *
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: CONSULTATION VISUAL + STEP 6 & 7 BOOKING SUMMARY & CONFIRM */}
        <div className="lg:col-span-4 space-y-6">
          <ConsultationBookingVisual />

          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 space-y-5 sticky top-24 shadow-sm">
            <h2 className="text-xl font-display font-bold text-[#123B67] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#1685B8]" />
              <span>Step 6: Booking Summary</span>
            </h2>

            <div className="space-y-3 text-sm bg-[#F5F9FC] p-5 rounded-2xl border border-slate-200">
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Hospital Name:</span>
                <span className="font-bold text-[#123B67]">GOKUL HOSPITAL</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Department:</span>
                <span className="font-bold text-[#123B67] text-right">
                  {selectedDepartment?.name || 'Not selected'}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Doctor Name:</span>
                <span className="font-bold text-[#123B67] text-right">
                  {selectedDoctor?.name || 'Not selected'}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Appointment Date:</span>
                <span className="font-mono-tabular font-bold text-[#123B67]">
                  {appointmentDate || '—'}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Appointment Time:</span>
                <span className="font-mono-tabular font-bold text-[#1685B8]">
                  {selectedTimeSlot || 'Select a slot'}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Patient Name:</span>
                <span className="font-bold text-[#123B67] text-right">
                  {patientName.trim() || '—'}
                </span>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-slate-700 font-bold">Consultation Fee:</span>
                <span className="text-2xl font-display font-extrabold text-[#123B67] tabular-nums">
                  {selectedDoctor ? `₹${selectedDoctor.consultationFee}` : '₹—'}
                </span>
              </div>
            </div>

            {/* Payment Option Selector (Pay at Hospital vs Demo Payment Mode) */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-[#123B67]">
                Select Payment Option:
              </label>
              <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 bg-[#F5F9FC] cursor-pointer text-sm">
                <input
                  type="radio"
                  name="paymentChoice"
                  checked={paymentChoice === 'PayAtHospital'}
                  onChange={() => setPaymentChoice('PayAtHospital')}
                  className="mt-1"
                />
                <div>
                  <p className="font-bold text-[#123B67]">Pay at Hospital OPD Counter</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Pay consultation fee at reception upon arrival.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-[#1685B8]/30 bg-[#EAF5FC] cursor-pointer text-sm">
                <input
                  type="radio"
                  name="paymentChoice"
                  checked={paymentChoice === 'DemoPaymentSimulation'}
                  onChange={() => setPaymentChoice('DemoPaymentSimulation')}
                  className="mt-1"
                />
                <div>
                  <p className="font-bold text-[#123B67]">
                    Demo Payment Mode (Simulated Test)
                  </p>
                  <p className="text-xs text-[#243447] mt-0.5">
                    Test online booking checkout with ₹0 real charge. Clearly labeled as a
                    simulated payment.
                  </p>
                </div>
              </label>
            </div>

            <div className="text-xs text-slate-600 leading-relaxed space-y-1.5">
              <p className="flex items-center gap-1.5 text-[#123B67] font-bold">
                <ShieldCheck className="w-4 h-4 text-[#19B7A5] shrink-0" />
                <span>Concurrency-Locked Slot Protection Active</span>
              </p>
              <p>
                <strong>Cancellation Policy:</strong> Appointments can be rescheduled or cancelled
                up to {settings?.cancellationWindowHours || 4} hours before the slot via the Patient
                Dashboard.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting || !selectedTimeSlot || !doctorId}
              className="w-full py-4 px-5 rounded-xl bg-[#123B67] hover:bg-[#1685B8] disabled:bg-slate-300 text-white font-display font-bold text-base transition-colors shadow-md cursor-pointer"
            >
              {submitting ? 'Verifying Slot & Saving...' : 'Step 7: Confirm Appointment'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
