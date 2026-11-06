import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UserPlus,
  Search,
  CalendarPlus,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  MessageSquare,
  Bell,
  LogOut,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext.tsx';
import { apiRequest } from '../services/api.ts';
import type {
  Appointment,
  UserAccount,
  InquiryItem,
  PackageBookingRequest,
  NotificationItem,
} from '../types/hospital.ts';
import { usePageSeo } from '../layouts/PublicLayout.tsx';
import { GokulHospitalLogo } from '../components/BrandLogo.tsx';

type ReceptionTab =
  | 'dashboard'
  | 'register-patient'
  | 'patient-search'
  | 'book-appointment'
  | 'today'
  | 'upcoming'
  | 'confirm'
  | 'cancel'
  | 'reschedule'
  | 'inquiries'
  | 'notifications';

export function ReceptionistDashboard() {
  const { user, departments, doctors, logout, showToast } = useHospital();
  const navigate = useNavigate();

  usePageSeo('Receptionist Front-Desk Portal');

  const [activeTab, setActiveTab] = useState<ReceptionTab>('dashboard');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<UserAccount[]>([]);
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [packageBookings, setPackageBookings] = useState<PackageBookingRequest[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [patientQuery, setPatientQuery] = useState('');

  // Walk-in registration state
  const [patName, setPatName] = useState('');
  const [patEmail, setPatEmail] = useState('');
  const [patPhone, setPatPhone] = useState('');
  const [patDob, setPatDob] = useState('');
  const [patGender, setPatGender] = useState('Male');
  const [patBlood, setPatBlood] = useState('O+');

  // Front-desk booking state
  const [bkDeptId, setBkDeptId] = useState('');
  const [bkDocId, setBkDocId] = useState('');
  const [bkDate, setBkDate] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [bkSlot, setBkSlot] = useState('10:30 AM');
  const [bkPatName, setBkPatName] = useState('');
  const [bkPatEmail, setBkPatEmail] = useState('');
  const [bkPatPhone, setBkPatPhone] = useState('');
  const [bkReason, setBkReason] = useState('');

  // Reschedule state
  const [resApptId, setResApptId] = useState('');
  const [resDate, setResDate] = useState(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [resSlot, setResSlot] = useState('11:00 AM');

  const loadReceptionData = useCallback(async () => {
    try {
      const [apptRes, patRes, inqRes, notifRes] = await Promise.all([
        apiRequest<{ appointments: Appointment[] }>('/api/appointments'),
        apiRequest<{ patients: UserAccount[] }>('/api/clinical/patients'),
        apiRequest<{ inquiries: InquiryItem[]; packageBookings: PackageBookingRequest[] }>(
          '/api/admin/inquiries'
        ),
        apiRequest<{ notifications: NotificationItem[] }>('/api/clinical/notifications'),
      ]);
      setAppointments(apptRes.appointments);
      setPatients(patRes.patients);
      setInquiries(inqRes.inquiries);
      setPackageBookings(inqRes.packageBookings);
      setNotifications(notifRes.notifications);
    } catch (err) {
      console.error('Reception portal load error:', err);
    }
  }, []);

  useEffect(() => {
    loadReceptionData();
  }, [loadReceptionData]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todaysAppts = appointments.filter((a) => a.appointmentDate === todayStr);
  const upcomingAppts = appointments.filter(
    (a) => a.appointmentDate >= todayStr && (a.status === 'Pending' || a.status === 'Confirmed')
  );
  const pendingAppts = appointments.filter((a) => a.status === 'Pending');

  const handleRegisterWalkIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/api/clinical/patients', {
        method: 'POST',
        body: JSON.stringify({
          fullName: patName,
          email: patEmail,
          phone: patPhone,
          dateOfBirth: patDob,
          gender: patGender,
          bloodGroup: patBlood,
        }),
      });
      showToast(`Registered walk-in patient ${patName}.`, 'success');
      setPatName('');
      setPatEmail('');
      setPatPhone('');
      await loadReceptionData();
      setActiveTab('patient-search');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Registration failed.', 'error');
    }
  };

  const handleFrontDeskBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest<{ appointment: Appointment }>('/api/appointments', {
        method: 'POST',
        body: JSON.stringify({
          departmentId: bkDeptId,
          doctorId: bkDocId,
          appointmentDate: bkDate,
          timeSlot: bkSlot,
          patientName: bkPatName,
          patientEmail: bkPatEmail,
          patientPhone: bkPatPhone,
          reason: bkReason,
        }),
      });
      showToast(`Booked & Confirmed ${res.appointment.appointmentNumber}!`, 'success');
      setBkPatName('');
      setBkPatEmail('');
      setBkPatPhone('');
      setBkReason('');
      await loadReceptionData();
      setActiveTab('upcoming');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Booking failed.', 'error');
    }
  };

  const handleConfirmStatus = async (id: string) => {
    try {
      await apiRequest(`/api/appointments/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'Confirmed' }),
      });
      showToast('Appointment confirmed.', 'success');
      await loadReceptionData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error.', 'error');
    }
  };

  const handleCancelStatus = async (id: string) => {
    try {
      await apiRequest(`/api/appointments/${id}/cancel`, {
        method: 'PATCH',
        body: JSON.stringify({ reason: 'Cancelled by OPD Reception Desk' }),
      });
      showToast('Appointment cancelled.', 'info');
      await loadReceptionData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error.', 'error');
    }
  };

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resApptId) return;
    try {
      await apiRequest(`/api/appointments/${resApptId}/reschedule`, {
        method: 'PATCH',
        body: JSON.stringify({ appointmentDate: resDate, timeSlot: resSlot }),
      });
      showToast('Appointment rescheduled by reception.', 'success');
      await loadReceptionData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error.', 'error');
    }
  };

  const menu: { id: ReceptionTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: '1. Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    {
      id: 'register-patient',
      label: '2. Patient Registration',
      icon: <UserPlus className="w-4 h-4" />,
    },
    { id: 'patient-search', label: '3. Patient Search', icon: <Search className="w-4 h-4" /> },
    {
      id: 'book-appointment',
      label: '4. Book Appointments',
      icon: <CalendarPlus className="w-4 h-4" />,
    },
    { id: 'today', label: "5. Today's Appointments", icon: <Calendar className="w-4 h-4" /> },
    { id: 'upcoming', label: '6. Upcoming Appointments', icon: <Clock className="w-4 h-4" /> },
    {
      id: 'confirm',
      label: `7. Appt Confirmation (${pendingAppts.length})`,
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
    { id: 'cancel', label: '8. Appt Cancellation', icon: <XCircle className="w-4 h-4" /> },
    { id: 'reschedule', label: '9. Appt Rescheduling', icon: <RefreshCw className="w-4 h-4" /> },
    { id: 'inquiries', label: '10. Patient Inquiries', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'notifications', label: '11. Notifications', icon: <Bell className="w-4 h-4" /> },
  ];

  const filteredPatients = patients.filter(
    (p) =>
      !patientQuery.trim() ||
      p.fullName.toLowerCase().includes(patientQuery.toLowerCase()) ||
      p.phone.toLowerCase().includes(patientQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(patientQuery.toLowerCase())
  );

  return (
    <div className="dashboard-container py-8 sm:py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        <aside className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 p-5 space-y-4 shadow-xs">
          <Link to="/" className="block">
            <GokulHospitalLogo variant="compact" />
          </Link>
          <div className="p-4 rounded-2xl bg-[#123B67] text-white space-y-1">
            <p className="text-xs text-[#19B7A5] font-bold uppercase tracking-wider">
              OPD Receptionist Desk
            </p>
            <p className="text-base font-display font-bold truncate">{user?.fullName}</p>
            <p className="text-xs text-white/80">Operational Scheduling Access</p>
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
              <span>12. Logout</span>
            </button>
          </nav>
        </aside>

        <section className="lg:col-span-9 space-y-6">
          {/* 1. DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 flex items-center justify-between shadow-xs">
                <div>
                  <p className="text-sm text-[#1685B8] font-bold">
                    Gokul Hospital Front-Desk Operations
                  </p>
                  <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[#123B67]">
                    Receptionist Operational Console
                  </h1>
                </div>
                <button
                  onClick={() => setActiveTab('book-appointment')}
                  className="px-5 py-3 rounded-xl bg-[#123B67] hover:bg-[#1685B8] text-white text-sm font-bold cursor-pointer"
                >
                  + Book Walk-In Slot
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <p className="text-xs text-slate-500">Registered Patients</p>
                  <p className="text-2xl font-display font-extrabold text-[#123B67] tabular-nums mt-1">
                    {patients.length}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <p className="text-xs text-slate-500">Pending Confirmation</p>
                  <p className="text-2xl font-display font-extrabold text-amber-600 tabular-nums mt-1">
                    {pendingAppts.length}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <p className="text-xs text-slate-500">Upcoming OPD Slots</p>
                  <p className="text-2xl font-display font-extrabold text-[#1685B8] tabular-nums mt-1">
                    {upcomingAppts.length}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <p className="text-xs text-slate-500">Patient Inquiries</p>
                  <p className="text-2xl font-display font-extrabold text-[#19B7A5] tabular-nums mt-1">
                    {inquiries.length + packageBookings.length}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 2. WALK-IN PATIENT REGISTRATION */}
          {activeTab === 'register-patient' && (
            <form
              onSubmit={handleRegisterWalkIn}
              className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 text-xs"
            >
              <h2 className="text-xl font-display font-bold text-[#123B67]">
                Authorized Walk-In Patient Registration
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Patient Full Name *</label>
                  <input
                    type="text"
                    required
                    value={patName}
                    onChange={(e) => setPatName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={patEmail}
                    onChange={(e) => setPatEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={patPhone}
                    onChange={(e) => setPatPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={patDob}
                    onChange={(e) => setPatDob(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Gender</label>
                  <select
                    value={patGender}
                    onChange={(e) => setPatGender(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Blood Group</label>
                  <input
                    type="text"
                    value={patBlood}
                    onChange={(e) => setPatBlood(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#123B67] text-white font-semibold"
              >
                Register Patient Record
              </button>
            </form>
          )}

          {/* 3. PATIENT SEARCH */}
          {activeTab === 'patient-search' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-xl font-display font-bold text-[#123B67]">
                  Operational Patient Directory Search
                </h2>
                <input
                  type="search"
                  value={patientQuery}
                  onChange={(e) => setPatientQuery(e.target.value)}
                  placeholder="Search by name, phone, or email..."
                  className="px-3.5 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl w-full sm:w-72"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredPatients.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl bg-[#F5F9FC] border border-slate-200 flex items-center justify-between gap-2"
                  >
                    <div>
                      <p className="font-bold text-sm text-[#123B67]">{p.fullName}</p>
                      <p className="text-slate-600">
                        {p.phone} · {p.email}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setBkPatName(p.fullName);
                        setBkPatEmail(p.email);
                        setBkPatPhone(p.phone);
                        setActiveTab('book-appointment');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#123B67] text-white font-semibold shrink-0"
                    >
                      Book OPD
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. BOOK APPOINTMENTS */}
          {activeTab === 'book-appointment' && (
            <form
              onSubmit={handleFrontDeskBook}
              className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 text-xs"
            >
              <h2 className="text-xl font-display font-bold text-[#123B67]">
                Book &amp; Confirm OPD Appointment for Patient
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Patient Name *</label>
                  <input
                    type="text"
                    required
                    value={bkPatName}
                    onChange={(e) => setBkPatName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Patient Phone *</label>
                  <input
                    type="tel"
                    required
                    value={bkPatPhone}
                    onChange={(e) => setBkPatPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Patient Email *</label>
                  <input
                    type="email"
                    required
                    value={bkPatEmail}
                    onChange={(e) => setBkPatEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Department *</label>
                  <select
                    required
                    value={bkDeptId}
                    onChange={(e) => setBkDeptId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                  >
                    <option value="">Select Department...</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Doctor *</label>
                  <select
                    required
                    value={bkDocId}
                    onChange={(e) => {
                      setBkDocId(e.target.value);
                      const doc = doctors.find((d) => d.id === e.target.value);
                      if (doc) setBkDeptId(doc.departmentId);
                    }}
                    className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                  >
                    <option value="">Select Doctor...</option>
                    {doctors
                      .filter((d) => !bkDeptId || d.departmentId === bkDeptId)
                      .map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} (₹{d.consultationFee})
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Date &amp; Slot *</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      required
                      min={todayStr}
                      value={bkDate}
                      onChange={(e) => setBkDate(e.target.value)}
                      className="flex-1 px-2 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl font-mono-tabular"
                    />
                    <select
                      value={bkSlot}
                      onChange={(e) => setBkSlot(e.target.value)}
                      className="px-2 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl font-mono-tabular"
                    >
                      {[
                        '09:00 AM',
                        '09:30 AM',
                        '10:00 AM',
                        '10:30 AM',
                        '11:00 AM',
                        '02:00 PM',
                        '03:00 PM',
                        '04:00 PM',
                      ].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1">Reason for Consultation *</label>
                  <input
                    type="text"
                    required
                    value={bkReason}
                    onChange={(e) => setBkReason(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#123B67] text-white font-semibold"
              >
                Confirm &amp; Issue Token
              </button>
            </form>
          )}

          {/* 5, 6, 7, 8. APPOINTMENTS MANAGEMENT */}
          {(activeTab === 'today' ||
            activeTab === 'upcoming' ||
            activeTab === 'confirm' ||
            activeTab === 'cancel') && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 text-xs">
              <h2 className="text-xl font-display font-bold text-[#123B67]">
                OPD Appointment Queue
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-2 pr-3">ID</th>
                      <th className="py-2 pr-3">Patient</th>
                      <th className="py-2 pr-3">Doctor</th>
                      <th className="py-2 pr-3">Date &amp; Slot</th>
                      <th className="py-2 pr-3">Status</th>
                      <th className="py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(activeTab === 'today'
                      ? todaysAppts
                      : activeTab === 'confirm'
                      ? pendingAppts
                      : upcomingAppts
                    ).map((a) => (
                      <tr key={a.id}>
                        <td className="py-3 pr-3 font-mono-tabular font-bold text-[#123B67]">
                          {a.appointmentNumber}
                        </td>
                        <td className="py-3 pr-3">
                          <p className="font-semibold text-[#123B67]">{a.patientName}</p>
                          <p className="text-slate-500">{a.patientPhone}</p>
                        </td>
                        <td className="py-3 pr-3">{a.doctorName}</td>
                        <td className="py-3 pr-3 font-mono-tabular">
                          {a.appointmentDate} · {a.timeSlot}
                        </td>
                        <td className="py-3 pr-3 font-semibold text-[#1685B8]">{a.status}</td>
                        <td className="py-3 text-right space-x-2 whitespace-nowrap">
                          {a.status === 'Pending' && (
                            <button
                              onClick={() => handleConfirmStatus(a.id)}
                              className="px-2.5 py-1 rounded bg-[#19B7A5] text-white font-semibold"
                            >
                              Confirm
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setResApptId(a.id);
                              setActiveTab('reschedule');
                            }}
                            className="px-2.5 py-1 rounded bg-[#1685B8] text-white font-semibold"
                          >
                            Reschedule
                          </button>
                          <button
                            onClick={() => handleCancelStatus(a.id)}
                            className="px-2.5 py-1 rounded bg-red-700 text-white font-semibold"
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 9. RESCHEDULE */}
          {activeTab === 'reschedule' && (
            <form
              onSubmit={handleReschedule}
              className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 text-xs"
            >
              <h2 className="text-xl font-display font-bold text-[#123B67]">
                Reschedule Patient Appointment
              </h2>
              <div>
                <label className="block font-semibold mb-1">Select Appointment *</label>
                <select
                  required
                  value={resApptId}
                  onChange={(e) => setResApptId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                >
                  <option value="">Choose appointment...</option>
                  {upcomingAppts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.appointmentNumber} — {a.patientName} with {a.doctorName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  required
                  min={todayStr}
                  value={resDate}
                  onChange={(e) => setResDate(e.target.value)}
                  className="px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl font-mono-tabular"
                />
                <select
                  value={resSlot}
                  onChange={(e) => setResSlot(e.target.value)}
                  className="px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl font-mono-tabular"
                >
                  {['09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '02:30 PM', '04:00 PM'].map(
                    (s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    )
                  )}
                </select>
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#123B67] text-white font-semibold"
              >
                Save New Schedule
              </button>
            </form>
          )}

          {/* 10. INQUIRIES */}
          {activeTab === 'inquiries' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 text-xs">
              <h2 className="text-xl font-display font-bold text-[#123B67]">
                Patient Inquiries &amp; Health Package Requests
              </h2>
              {inquiries.length === 0 && packageBookings.length === 0 ? (
                <p className="text-slate-500">No open inquiries.</p>
              ) : (
                <div className="space-y-3">
                  {inquiries.map((inq) => (
                    <div
                      key={inq.id}
                      className="p-4 rounded-xl bg-[#F5F9FC] border border-slate-200 flex items-start justify-between gap-4"
                    >
                      <div>
                        <p className="font-bold text-[#123B67]">
                          {inq.subject} — {inq.fullName} ({inq.phone})
                        </p>
                        <p className="text-slate-600 mt-1">{inq.message}</p>
                      </div>
                      <button
                        onClick={async () => {
                          await apiRequest(`/api/admin/inquiries/${inq.id}`, {
                            method: 'PATCH',
                            body: JSON.stringify({ status: 'Resolved' }),
                          });
                          showToast('Inquiry marked Resolved.', 'success');
                          await loadReceptionData();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#19B7A5] text-white font-semibold shrink-0"
                      >
                        {inq.status === 'Resolved' ? 'Resolved' : 'Mark Resolved'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 11. NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-3 text-xs">
              <h2 className="text-xl font-display font-bold text-[#123B67]">
                Reception Desk Notifications
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
        </section>
      </div>
    </div>
  );
}
