import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Edit3,
  Calendar,
  Clock,
  CheckSquare,
  Users,
  FileText,
  Pill,
  Bell,
  Lock,
  LogOut,
  Plus,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext.tsx';
import { apiRequest } from '../services/api.ts';
import type {
  Appointment,
  AppointmentStatus,
  UserAccount,
  MedicalRecord,
  Prescription,
  NotificationItem,
} from '../types/hospital.ts';
import { usePageSeo } from '../layouts/PublicLayout.tsx';
import { GokulHospitalLogo } from '../components/BrandLogo.tsx';

type DoctorTab =
  | 'dashboard'
  | 'profile'
  | 'edit-profile'
  | 'schedule'
  | 'availability'
  | 'today'
  | 'upcoming'
  | 'history'
  | 'patients'
  | 'status'
  | 'records'
  | 'prescriptions'
  | 'notifications'
  | 'password';

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function DoctorDashboard() {
  const { user, doctors, logout, refreshBootstrap, showToast } = useHospital();
  const navigate = useNavigate();

  usePageSeo('Doctor Clinical Portal');

  const myDoctorProfile =
    doctors.find((d) => d.id === user?.doctorId || d.userId === user?.id) || doctors[0];

  const [activeTab, setActiveTab] = useState<DoctorTab>('dashboard');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<UserAccount[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Availability & Profile Edit state
  const [availableDays, setAvailableDays] = useState<string[]>(
    myDoctorProfile?.availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  );
  const [isAvailable, setIsAvailable] = useState<boolean>(myDoctorProfile?.isAvailable ?? true);
  const [consultationFee, setConsultationFee] = useState<number>(
    myDoctorProfile?.consultationFee || 800
  );
  const [biography, setBiography] = useState<string>(myDoctorProfile?.biography || '');
  const [qualifications, setQualifications] = useState<string>(
    myDoctorProfile?.qualifications || ''
  );

  // New Medical Record Form
  const [mrPatientId, setMrPatientId] = useState('');
  const [mrDiagnosis, setMrDiagnosis] = useState('');
  const [mrNotes, setMrNotes] = useState('');
  const [mrBp, setMrBp] = useState('120/80 mmHg');
  const [mrPulse, setMrPulse] = useState('72 bpm');
  const [mrSpo2, setMrSpo2] = useState('99%');

  // New Prescription Form
  const [rxPatientId, setRxPatientId] = useState('');
  const [rxDiagnosis, setRxDiagnosis] = useState('');
  const [rxMedicine, setRxMedicine] = useState('');
  const [rxDosage, setRxDosage] = useState('1 Tablet');
  const [rxFrequency, setRxFrequency] = useState('Twice Daily (Morning & Night)');
  const [rxDuration, setRxDuration] = useState('5 Days');
  const [rxAdvice, setRxAdvice] = useState('Take after meals with water.');

  // Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const loadDoctorData = useCallback(async () => {
    try {
      const [apptRes, patRes, recRes, rxRes, notifRes] = await Promise.all([
        apiRequest<{ appointments: Appointment[] }>('/api/appointments'),
        apiRequest<{ patients: UserAccount[] }>('/api/clinical/patients'),
        apiRequest<{ medicalRecords: MedicalRecord[] }>('/api/clinical/medical-records'),
        apiRequest<{ prescriptions: Prescription[] }>('/api/clinical/prescriptions'),
        apiRequest<{ notifications: NotificationItem[] }>('/api/clinical/notifications'),
      ]);
      setAppointments(apptRes.appointments);
      setPatients(patRes.patients);
      setRecords(recRes.medicalRecords);
      setPrescriptions(rxRes.prescriptions);
      setNotifications(notifRes.notifications);
      if (patRes.patients.length > 0) {
        setMrPatientId((prev) => prev || patRes.patients[0].id);
        setRxPatientId((prev) => prev || patRes.patients[0].id);
      }
    } catch (err) {
      console.error('Doctor portal load error:', err);
    }
  }, []);

  useEffect(() => {
    loadDoctorData();
  }, [loadDoctorData]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todaysAppts = appointments.filter((a) => a.appointmentDate === todayStr);
  const upcomingAppts = appointments.filter(
    (a) => a.appointmentDate >= todayStr && (a.status === 'Pending' || a.status === 'Confirmed')
  );

  const handleUpdateStatus = async (apptId: string, status: AppointmentStatus) => {
    try {
      await apiRequest(`/api/appointments/${apptId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      showToast(`Appointment status updated to ${status}.`, 'success');
      await loadDoctorData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Status update failed.', 'error');
    }
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/api/clinical/doctor-schedule', {
        method: 'PUT',
        body: JSON.stringify({
          doctorId: myDoctorProfile?.id,
          availableDays,
          isAvailable,
          consultationFee: Number(consultationFee),
          biography,
          qualifications,
        }),
      });
      await refreshBootstrap();
      showToast('Doctor availability & profile updated.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Unable to save schedule.', 'error');
    }
  };

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/api/clinical/medical-records', {
        method: 'POST',
        body: JSON.stringify({
          patientId: mrPatientId,
          diagnosis: mrDiagnosis,
          clinicalNotes: mrNotes,
          bloodPressure: mrBp,
          heartRate: mrPulse,
          spo2: mrSpo2,
        }),
      });
      showToast('Clinical medical record saved.', 'success');
      setMrDiagnosis('');
      setMrNotes('');
      await loadDoctorData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save record.', 'error');
    }
  };

  const handleIssuePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/api/clinical/prescriptions', {
        method: 'POST',
        body: JSON.stringify({
          patientId: rxPatientId,
          diagnosis: rxDiagnosis,
          generalAdvice: rxAdvice,
          medications: [
            {
              medicineName: rxMedicine,
              dosage: rxDosage,
              frequency: rxFrequency,
              duration: rxDuration,
              instructions: rxAdvice,
            },
          ],
        }),
      });
      showToast('Digital prescription issued to patient.', 'success');
      setRxDiagnosis('');
      setRxMedicine('');
      await loadDoctorData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to issue prescription.', 'error');
    }
  };

  const toggleDay = (day: string) => {
    setAvailableDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const menu: { id: DoctorTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: '1. Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'profile', label: '2. My Profile', icon: <User className="w-4 h-4" /> },
    { id: 'edit-profile', label: '3. Edit Profile', icon: <Edit3 className="w-4 h-4" /> },
    { id: 'schedule', label: '4. My Schedule', icon: <Calendar className="w-4 h-4" /> },
    { id: 'availability', label: '5. Manage Availability', icon: <Clock className="w-4 h-4" /> },
    { id: 'today', label: "6. Today's Appointments", icon: <Calendar className="w-4 h-4" /> },
    { id: 'upcoming', label: '7. Upcoming Appointments', icon: <Clock className="w-4 h-4" /> },
    { id: 'history', label: '8. Appointment History', icon: <Calendar className="w-4 h-4" /> },
    { id: 'patients', label: '9. Patient Details', icon: <Users className="w-4 h-4" /> },
    { id: 'status', label: '10. Manage Appt Status', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'records', label: '11. Medical Records', icon: <FileText className="w-4 h-4" /> },
    { id: 'prescriptions', label: '12. Prescriptions', icon: <Pill className="w-4 h-4" /> },
    { id: 'notifications', label: '13. Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'password', label: '14. Change Password', icon: <Lock className="w-4 h-4" /> },
  ];

  return (
    <div className="dashboard-container py-8 sm:py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        <aside className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 p-5 space-y-4 shadow-xs">
          <Link to="/" className="block">
            <GokulHospitalLogo variant="compact" />
          </Link>
          <div className="p-4 rounded-2xl bg-[#123B67] text-white space-y-1">
            <p className="text-xs text-[#19B7A5] font-bold uppercase tracking-wider">
              Doctor Clinical Portal
            </p>
            <p className="text-base font-display font-bold truncate">{myDoctorProfile?.name}</p>
            <p className="text-xs text-white/80 truncate">{myDoctorProfile?.departmentName}</p>
          </div>

          <nav className="space-y-1">
            {menu.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-left transition-colors cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-[#123B67] text-white font-bold shadow-xs'
                    : 'text-[#243447] hover:bg-[#EAF5FC]/70'
                }`}
              >
                {item.icon}
                <span className="truncate">{item.label}</span>
              </button>
            ))}
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-red-700 hover:bg-red-50 text-left cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>15. Logout</span>
            </button>
          </nav>
        </aside>

        <section className="lg:col-span-9 space-y-6">
          {/* 1. DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 flex items-center justify-between shadow-xs">
                <div>
                  <p className="text-sm text-[#1685B8] font-bold">
                    Department of {myDoctorProfile?.departmentName}
                  </p>
                  <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[#123B67]">
                    Welcome, {myDoctorProfile?.name}
                  </h1>
                </div>
                <button
                  onClick={() => setActiveTab('prescriptions')}
                  className="px-5 py-3 rounded-xl bg-[#123B67] hover:bg-[#1685B8] text-white text-sm font-bold cursor-pointer"
                >
                  + Issue Prescription
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <p className="text-xs text-slate-500">Assigned Appointments</p>
                  <p className="text-2xl font-display font-extrabold text-[#123B67] tabular-nums mt-1">
                    {appointments.length}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <p className="text-xs text-slate-500">Today&apos;s Clinic</p>
                  <p className="text-2xl font-display font-extrabold text-[#1685B8] tabular-nums mt-1">
                    {todaysAppts.length}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <p className="text-xs text-slate-500">Upcoming Consults</p>
                  <p className="text-2xl font-display font-extrabold text-[#19B7A5] tabular-nums mt-1">
                    {upcomingAppts.length}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <p className="text-xs text-slate-500">Authorized Patients</p>
                  <p className="text-2xl font-display font-extrabold text-[#123B67] tabular-nums mt-1">
                    {patients.length}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 2 & 3. MY PROFILE & EDIT PROFILE */}
          {(activeTab === 'profile' || activeTab === 'edit-profile') && (
            <form
              onSubmit={handleSaveSchedule}
              className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 text-xs"
            >
              <h2 className="text-xl font-display font-bold text-[#123B67]">
                Doctor Professional Profile ({myDoctorProfile?.name})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Qualifications</label>
                  <input
                    type="text"
                    value={qualifications}
                    onChange={(e) => setQualifications(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Consultation Fee (INR ₹)</label>
                  <input
                    type="number"
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl font-mono-tabular"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1">Professional Biography</label>
                  <textarea
                    rows={3}
                    value={biography}
                    onChange={(e) => setBiography(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#123B67] text-white font-semibold"
              >
                Save Professional Profile
              </button>
            </form>
          )}

          {/* 4 & 5. SCHEDULE & MANAGE AVAILABILITY */}
          {(activeTab === 'schedule' || activeTab === 'availability') && (
            <form
              onSubmit={handleSaveSchedule}
              className="bg-white rounded-2xl p-6 border border-slate-200 space-y-5 text-xs"
            >
              <h2 className="text-xl font-display font-bold text-[#123B67]">
                Manage Weekly OPD Schedule &amp; Availability
              </h2>

              <label className="flex items-center gap-2.5 font-semibold text-sm text-[#123B67] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="rounded border-slate-300"
                />
                <span>Available for Online Patient Appointment Bookings</span>
              </label>

              <div className="space-y-2">
                <p className="font-semibold text-slate-700">Active OPD Consultation Days:</p>
                <div className="flex flex-wrap gap-2">
                  {ALL_DAYS.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-3.5 py-2 rounded-xl font-semibold border transition-colors ${
                        availableDays.includes(day)
                          ? 'bg-[#123B67] text-white border-[#123B67]'
                          : 'bg-[#F5F9FC] text-slate-600 border-slate-300'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#123B67] text-white font-semibold"
              >
                Update Availability Schedule
              </button>
            </form>
          )}

          {/* 6, 7, 8, 10. APPOINTMENTS & STATUS MANAGEMENT */}
          {(activeTab === 'today' ||
            activeTab === 'upcoming' ||
            activeTab === 'history' ||
            activeTab === 'status') && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
              <h2 className="text-xl font-display font-bold text-[#123B67]">
                Assigned Patient Appointments
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-2 pr-3">ID</th>
                      <th className="py-2 pr-3">Patient</th>
                      <th className="py-2 pr-3">Date &amp; Slot</th>
                      <th className="py-2 pr-3">Reason</th>
                      <th className="py-2 pr-3">Status</th>
                      <th className="py-2 text-right">Update Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(activeTab === 'today'
                      ? todaysAppts
                      : activeTab === 'upcoming'
                      ? upcomingAppts
                      : appointments
                    ).map((a) => (
                      <tr key={a.id}>
                        <td className="py-3 pr-3 font-mono-tabular font-bold text-[#123B67]">
                          {a.appointmentNumber}
                        </td>
                        <td className="py-3 pr-3">
                          <p className="font-semibold text-[#123B67]">{a.patientName}</p>
                          <p className="text-slate-500">{a.patientPhone}</p>
                        </td>
                        <td className="py-3 pr-3 font-mono-tabular">
                          {a.appointmentDate} · {a.timeSlot}
                        </td>
                        <td className="py-3 pr-3 max-w-xs truncate">{a.reason}</td>
                        <td className="py-3 pr-3 font-semibold text-[#1685B8]">{a.status}</td>
                        <td className="py-3 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => handleUpdateStatus(a.id, 'Confirmed')}
                            className="px-2.5 py-1 rounded bg-[#1685B8] text-white font-semibold"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(a.id, 'Completed')}
                            className="px-2.5 py-1 rounded bg-[#19B7A5] text-white font-semibold"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(a.id, 'No-show')}
                            className="px-2.5 py-1 rounded border border-slate-300 text-slate-600"
                          >
                            No-Show
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 9. AUTHORIZED PATIENT DETAILS */}
          {activeTab === 'patients' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
              <h2 className="text-xl font-display font-bold text-[#123B67]">
                Authorized Assigned Patients ({patients.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {patients.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl bg-[#F5F9FC] border border-slate-200 space-y-1.5"
                  >
                    <p className="font-display font-bold text-sm text-[#123B67]">{p.fullName}</p>
                    <p className="text-slate-600">
                      Phone: {p.phone} · Blood Group: {p.bloodGroup || 'N/A'}
                    </p>
                    <p className="text-slate-600">
                      Allergies: <strong>{p.allergies || 'None'}</strong>
                    </p>
                    <p className="text-slate-600">
                      Conditions: <strong>{p.chronicConditions || 'None'}</strong>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 11. MEDICAL RECORDS */}
          {activeTab === 'records' && (
            <div className="space-y-6">
              <form
                onSubmit={handleCreateRecord}
                className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 text-xs"
              >
                <h2 className="text-lg font-display font-bold text-[#123B67] flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#19B7A5]" />
                  <span>Add Clinical Visit Record for Assigned Patient</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-1">Patient *</label>
                    <select
                      required
                      value={mrPatientId}
                      onChange={(e) => setMrPatientId(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                    >
                      {patients.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.fullName} ({p.phone})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Clinical Diagnosis *</label>
                    <input
                      type="text"
                      required
                      value={mrDiagnosis}
                      onChange={(e) => setMrDiagnosis(e.target.value)}
                      placeholder="e.g. Essential Hypertension, Viral Pharyngitis..."
                      className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Blood Pressure</label>
                    <input
                      type="text"
                      value={mrBp}
                      onChange={(e) => setMrBp(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl font-mono-tabular"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Heart Rate &amp; SpO2</label>
                    <input
                      type="text"
                      value={mrPulse}
                      onChange={(e) => setMrPulse(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl font-mono-tabular"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-semibold mb-1">Clinical Examination Notes *</label>
                    <textarea
                      rows={3}
                      required
                      value={mrNotes}
                      onChange={(e) => setMrNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#123B67] text-white font-semibold"
                >
                  Save Medical Record
                </button>
              </form>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-3 text-xs">
                <h3 className="text-base font-display font-bold text-[#123B67]">
                  Recorded Clinical Notes ({records.length})
                </h3>
                {records.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 rounded-xl bg-[#F5F9FC] border border-slate-200 space-y-1"
                  >
                    <p className="font-bold text-[#123B67]">
                      {r.patientName} — {r.diagnosis} ({r.visitDate})
                    </p>
                    <p className="text-slate-600">{r.clinicalNotes}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 12. PRESCRIPTIONS */}
          {activeTab === 'prescriptions' && (
            <div className="space-y-6">
              <form
                onSubmit={handleIssuePrescription}
                className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 text-xs"
              >
                <h2 className="text-lg font-display font-bold text-[#123B67]">
                  Issue Digital Prescription
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-1">Select Patient *</label>
                    <select
                      required
                      value={rxPatientId}
                      onChange={(e) => setRxPatientId(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                    >
                      {patients.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.fullName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Diagnosis *</label>
                    <input
                      type="text"
                      required
                      value={rxDiagnosis}
                      onChange={(e) => setRxDiagnosis(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Medicine Name *</label>
                    <input
                      type="text"
                      required
                      value={rxMedicine}
                      onChange={(e) => setRxMedicine(e.target.value)}
                      placeholder="e.g. Tab. Paracetamol 650mg"
                      className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Dosage &amp; Frequency *</label>
                    <input
                      type="text"
                      required
                      value={rxFrequency}
                      onChange={(e) => setRxFrequency(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Duration *</label>
                    <input
                      type="text"
                      required
                      value={rxDuration}
                      onChange={(e) => setRxDuration(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Dietary / General Advice</label>
                    <input
                      type="text"
                      value={rxAdvice}
                      onChange={(e) => setRxAdvice(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#123B67] text-white font-semibold"
                >
                  Issue Prescription to Patient Portal
                </button>
              </form>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-3 text-xs">
                <h3 className="text-base font-display font-bold text-[#123B67]">
                  Issued Prescriptions ({prescriptions.length})
                </h3>
                {prescriptions.map((rx) => (
                  <div
                    key={rx.id}
                    className="p-4 rounded-xl bg-[#F5F9FC] border border-slate-200 space-y-1"
                  >
                    <p className="font-bold text-[#123B67]">
                      {rx.patientName} — {rx.diagnosis} ({rx.issuedDate})
                    </p>
                    <p className="text-slate-600">
                      Medications: {rx.medications.map((m) => m.medicineName).join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 13. NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-3 text-xs">
              <h2 className="text-xl font-display font-bold text-[#123B67]">
                Doctor Notifications
              </h2>
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="p-4 rounded-xl bg-[#F5F9FC] border border-slate-200 space-y-1"
                >
                  <p className="font-bold text-[#123B67]">{n.title}</p>
                  <p className="text-slate-600">{n.message}</p>
                </div>
              ))}
            </div>
          )}

          {/* 14. PASSWORD */}
          {activeTab === 'password' && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await apiRequest('/api/auth/change-password', {
                    method: 'POST',
                    body: JSON.stringify({ currentPassword, newPassword }),
                  });
                  showToast('Password updated.', 'success');
                  setCurrentPassword('');
                  setNewPassword('');
                } catch (err) {
                  showToast(err instanceof Error ? err.message : 'Error.', 'error');
                }
              }}
              className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 max-w-md text-xs"
            >
              <h2 className="text-xl font-display font-bold text-[#123B67]">Change Password</h2>
              <div>
                <label className="block font-semibold mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">New Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#123B67] text-white font-semibold"
              >
                Update Password
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
