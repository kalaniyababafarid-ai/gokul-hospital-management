import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Edit3,
  CalendarPlus,
  Calendar,
  Clock,
  History,
  XCircle,
  RefreshCw,
  FileText,
  FlaskConical,
  Pill,
  Bell,
  Shield,
  Lock,
  LogOut,
  Download,
  Printer,
  CheckCircle2,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext.tsx';
import { apiRequest } from '../services/api.ts';
import type {
  Appointment,
  MedicalRecord,
  Prescription,
  LabReport,
  NotificationItem,
} from '../types/hospital.ts';
import { usePageSeo } from '../layouts/PublicLayout.tsx';
import { GokulHospitalLogo } from '../components/BrandLogo.tsx';

type PatientTab =
  | 'overview'
  | 'profile'
  | 'edit-profile'
  | 'book-new'
  | 'my-appointments'
  | 'upcoming'
  | 'previous'
  | 'cancel'
  | 'reschedule'
  | 'appointment-details'
  | 'history'
  | 'medical-records'
  | 'lab-reports'
  | 'prescriptions'
  | 'notifications'
  | 'privacy'
  | 'password';

export function PatientDashboard() {
  const { user, logout, refreshUser, refreshBootstrap, departments, doctors, showToast } =
    useHospital();
  const navigate = useNavigate();

  usePageSeo('Patient Dashboard & Health Portal');

  const [activeTab, setActiveTab] = useState<PatientTab>('overview');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labReports, setLabReports] = useState<LabReport[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  // Reschedule form state
  const [rescheduleApptId, setRescheduleApptId] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [rescheduleSlot, setRescheduleSlot] = useState('10:30 AM');

  // Cancel form state
  const [cancelApptId, setCancelApptId] = useState('');
  const [cancelReason, setCancelReason] = useState('');

  // Quick Book state inside dashboard
  const [qbDeptId, setQbDeptId] = useState('');
  const [qbDocId, setQbDocId] = useState('');
  const [qbDate, setQbDate] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [qbSlot, setQbSlot] = useState('10:00 AM');
  const [qbReason, setQbReason] = useState('');

  // Profile Edit state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth || '');
  const [gender, setGender] = useState(user?.gender || '');
  const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || '');
  const [address, setAddress] = useState(user?.address || '');
  const [emergencyContact, setEmergencyContact] = useState(user?.emergencyContact || '');
  const [allergies, setAllergies] = useState(user?.allergies || '');
  const [chronicConditions, setChronicConditions] = useState(user?.chronicConditions || '');
  const [allowSharing, setAllowSharing] = useState(user?.allowDataSharingWithDoctors !== false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const loadPatientData = useCallback(async () => {
    setLoading(true);
    try {
      const [apptRes, mrRes, rxRes, labRes, notifRes] = await Promise.all([
        apiRequest<{ appointments: Appointment[] }>('/api/appointments'),
        apiRequest<{ medicalRecords: MedicalRecord[] }>('/api/clinical/medical-records'),
        apiRequest<{ prescriptions: Prescription[] }>('/api/clinical/prescriptions'),
        apiRequest<{ labReports: LabReport[] }>('/api/clinical/lab-reports'),
        apiRequest<{ notifications: NotificationItem[] }>('/api/clinical/notifications'),
      ]);
      setAppointments(apptRes.appointments);
      setMedicalRecords(mrRes.medicalRecords);
      setPrescriptions(rxRes.prescriptions);
      setLabReports(labRes.labReports);
      setNotifications(notifRes.notifications);
      if (apptRes.appointments.length > 0 && !selectedAppt) {
        setSelectedAppt(apptRes.appointments[0]);
      }
    } catch (err) {
      console.error('Load patient portal data error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedAppt]);

  useEffect(() => {
    loadPatientData();
  }, [loadPatientData]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const upcomingAppointments = appointments.filter(
    (a) => a.appointmentDate >= todayStr && (a.status === 'Pending' || a.status === 'Confirmed')
  );
  const previousAppointments = appointments.filter(
    (a) => a.appointmentDate < todayStr || a.status === 'Completed' || a.status === 'Cancelled'
  );
  const pendingCount = appointments.filter((a) => a.status === 'Pending').length;
  const completedCount = appointments.filter((a) => a.status === 'Completed').length;
  const unreadNotifs = notifications.filter((n) => !n.isRead).length;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          fullName,
          phone,
          dateOfBirth,
          gender,
          bloodGroup,
          address,
          emergencyContact,
          allergies,
          chronicConditions,
          allowDataSharingWithDoctors: allowSharing,
        }),
      });
      await refreshUser();
      showToast('Patient profile & health details saved.', 'success');
      setActiveTab('profile');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Update failed.', 'error');
    }
  };

  const handleCancelAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelApptId) return;
    try {
      await apiRequest(`/api/appointments/${cancelApptId}/cancel`, {
        method: 'PATCH',
        body: JSON.stringify({ reason: cancelReason || 'Cancelled by patient via portal' }),
      });
      showToast('Appointment cancelled and slot released.', 'info');
      setCancelReason('');
      await loadPatientData();
      await refreshBootstrap();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Unable to cancel.', 'error');
    }
  };

  const handleRescheduleAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleApptId) return;
    try {
      await apiRequest(`/api/appointments/${rescheduleApptId}/reschedule`, {
        method: 'PATCH',
        body: JSON.stringify({
          appointmentDate: rescheduleDate,
          timeSlot: rescheduleSlot,
        }),
      });
      showToast('Appointment rescheduled!', 'success');
      await loadPatientData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Unable to reschedule.', 'error');
    }
  };

  const handleQuickBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qbDeptId || !qbDocId || !qbDate || !qbSlot || !qbReason) return;
    try {
      const res = await apiRequest<{ appointment: Appointment }>('/api/appointments', {
        method: 'POST',
        body: JSON.stringify({
          departmentId: qbDeptId,
          doctorId: qbDocId,
          appointmentDate: qbDate,
          timeSlot: qbSlot,
          patientName: user?.fullName || '',
          patientEmail: user?.email || '',
          patientPhone: user?.phone || '',
          patientDob: user?.dateOfBirth,
          reason: qbReason,
        }),
      });
      showToast(`Appointment booked! ID: ${res.appointment.appointmentNumber}`, 'success');
      setQbReason('');
      await loadPatientData();
      setActiveTab('my-appointments');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Booking failed.', 'error');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
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
      showToast(err instanceof Error ? err.message : 'Password change failed.', 'error');
    }
  };

  const handleDownloadLabReport = (report: LabReport) => {
    if (report.fileDataUrl) {
      const a = document.createElement('a');
      a.href = report.fileDataUrl;
      a.download = report.fileName || `${report.reportNumber}.pdf`;
      a.click();
      return;
    }
    const textContent = [
      `GOKUL HOSPITAL — DIAGNOSTIC LABORATORY REPORT`,
      `Report Number: ${report.reportNumber}`,
      `Patient Name: ${report.patientName}`,
      `Ordered By: ${report.orderedByDoctorName}`,
      `Test Name: ${report.testName} (${report.category})`,
      `Report Date: ${report.reportDate} | Status: ${report.status}`,
      `------------------------------------------------------------`,
      `Summary: ${report.summaryResult}`,
      `------------------------------------------------------------`,
      ...report.parameters.map(
        (p) => `${p.parameter}: ${p.observedValue} ${p.unit} (Ref: ${p.referenceRange})`
      ),
    ].join('\n');

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.reportNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const menuItems: { id: PatientTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: '1. Dashboard Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'profile', label: '2. My Profile', icon: <User className="w-4 h-4" /> },
    { id: 'edit-profile', label: '3. Edit Profile', icon: <Edit3 className="w-4 h-4" /> },
    { id: 'book-new', label: '4. Book New Appointment', icon: <CalendarPlus className="w-4 h-4" /> },
    { id: 'my-appointments', label: '5. My Appointments', icon: <Calendar className="w-4 h-4" /> },
    { id: 'upcoming', label: '6. Upcoming Appointments', icon: <Clock className="w-4 h-4" /> },
    { id: 'previous', label: '7. Previous Appointments', icon: <History className="w-4 h-4" /> },
    { id: 'cancel', label: '8. Cancel Appointment', icon: <XCircle className="w-4 h-4" /> },
    { id: 'reschedule', label: '9. Reschedule Appointment', icon: <RefreshCw className="w-4 h-4" /> },
    { id: 'appointment-details', label: '10. Appointment Details', icon: <FileText className="w-4 h-4" /> },
    { id: 'history', label: '11. Appointment History', icon: <History className="w-4 h-4" /> },
    { id: 'medical-records', label: '12. Medical Records', icon: <FileText className="w-4 h-4" /> },
    { id: 'lab-reports', label: '13. Lab Reports', icon: <FlaskConical className="w-4 h-4" /> },
    { id: 'prescriptions', label: '14. Prescriptions', icon: <Pill className="w-4 h-4" /> },
    {
      id: 'notifications',
      label: `15. Notifications (${unreadNotifs})`,
      icon: <Bell className="w-4 h-4" />,
    },
    { id: 'privacy', label: '16. Privacy Settings', icon: <Shield className="w-4 h-4" /> },
    { id: 'password', label: '17. Change Password', icon: <Lock className="w-4 h-4" /> },
  ];

  return (
    <div className="dashboard-container py-8 sm:py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* Sidebar Navigation (All 18 Patient Dashboard Menu Items) */}
        <aside className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 p-5 space-y-4 shadow-xs">
          <Link to="/" className="block">
            <GokulHospitalLogo variant="compact" />
          </Link>
          <div className="p-4 rounded-2xl bg-[#123B67] text-white space-y-1">
            <p className="text-xs text-[#19B7A5] font-bold uppercase tracking-wider">
              Gokul Hospital Patient Portal
            </p>
            <p className="text-base font-display font-bold truncate">{user?.fullName}</p>
            <p className="text-xs text-white/80 truncate">{user?.email}</p>
          </div>

          <nav className="space-y-1" aria-label="Patient Portal Navigation">
            {menuItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors text-left cursor-pointer ${
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
              type="button"
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-red-700 hover:bg-red-50 text-left cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>18. Logout</span>
            </button>
          </nav>
        </aside>

        {/* Main Content Viewport */}
        <section className="lg:col-span-9 space-y-6">
          {loading ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-base text-slate-500">
              Loading your patient health records...
            </div>
          ) : (
            <>
              {/* 1. OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                    <div>
                      <p className="text-sm text-[#1685B8] font-bold">
                        Welcome back, {user?.fullName}
                      </p>
                      <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[#123B67]">
                        Patient Health Dashboard Overview
                      </h1>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('book-new')}
                      className="px-5 py-3 rounded-xl bg-[#123B67] hover:bg-[#1685B8] text-white text-sm font-bold whitespace-nowrap cursor-pointer"
                    >
                      + Quick Book Appointment
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
                      <p className="text-sm text-slate-500 font-medium">Total Appointments</p>
                      <p className="text-3xl font-display font-extrabold text-[#123B67] tabular-nums mt-1">
                        {appointments.length}
                      </p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
                      <p className="text-sm text-slate-500 font-medium">Upcoming</p>
                      <p className="text-3xl font-display font-extrabold text-[#1685B8] tabular-nums mt-1">
                        {upcomingAppointments.length}
                      </p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
                      <p className="text-sm text-slate-500 font-medium">Pending Confirmation</p>
                      <p className="text-3xl font-display font-extrabold text-amber-600 tabular-nums mt-1">
                        {pendingCount}
                      </p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
                      <p className="text-sm text-slate-500 font-medium">Completed Visits</p>
                      <p className="text-3xl font-display font-extrabold text-[#19B7A5] tabular-nums mt-1">
                        {completedCount}
                      </p>
                    </div>
                  </div>

                  {/* Upcoming Appointments Preview */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-display font-bold text-[#123B67]">
                        Upcoming Appointments
                      </h2>
                      <button
                        onClick={() => setActiveTab('my-appointments')}
                        className="text-xs font-semibold text-[#1685B8] hover:underline"
                      >
                        View All →
                      </button>
                    </div>
                    {upcomingAppointments.length === 0 ? (
                      <p className="text-xs text-slate-500">
                        You have no upcoming appointments scheduled.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {upcomingAppointments.map((a) => (
                          <div
                            key={a.id}
                            className="p-4 rounded-xl bg-[#F5F9FC] border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                          >
                            <div>
                              <p className="font-mono-tabular font-bold text-[#123B67]">
                                {a.appointmentNumber} · {a.appointmentDate} at {a.timeSlot}
                              </p>
                              <p className="text-slate-700 font-medium mt-0.5">
                                {a.doctorName} ({a.departmentName}) — {a.reason}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-semibold text-[#1685B8]">
                                Status: {a.status}
                              </span>
                              <button
                                onClick={() => {
                                  setSelectedAppt(a);
                                  setActiveTab('appointment-details');
                                }}
                                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-[#123B67] font-semibold"
                              >
                                Details
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Notifications */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-3">
                    <h2 className="text-base font-display font-bold text-[#123B67]">
                      Recent Activity &amp; Notifications
                    </h2>
                    {notifications.slice(0, 4).map((n) => (
                      <div
                        key={n.id}
                        className="p-3.5 rounded-xl bg-[#F5F9FC] border border-slate-200 text-xs flex items-start justify-between gap-4"
                      >
                        <div>
                          <p className="font-bold text-[#123B67]">{n.title}</p>
                          <p className="text-slate-600 mt-0.5">{n.message}</p>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono-tabular shrink-0">
                          {n.createdAt.slice(0, 10)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. MY PROFILE */}
              {activeTab === 'profile' && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-display font-bold text-[#123B67]">
                      My Patient Profile
                    </h2>
                    <button
                      onClick={() => setActiveTab('edit-profile')}
                      className="px-4 py-2 rounded-xl bg-[#123B67] text-white text-xs font-semibold"
                    >
                      Edit Profile
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm bg-[#F5F9FC] p-5 rounded-xl border border-slate-200">
                    <div>
                      <p className="text-slate-500">Full Name</p>
                      <p className="font-semibold text-[#123B67]">{user?.fullName}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Email Address</p>
                      <p className="font-semibold text-[#123B67]">{user?.email}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Mobile Number</p>
                      <p className="font-semibold text-[#123B67]">{user?.phone}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Date of Birth &amp; Gender</p>
                      <p className="font-semibold text-[#123B67]">
                        {user?.dateOfBirth || 'Not set'} · {user?.gender || 'Not set'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Blood Group</p>
                      <p className="font-semibold text-[#123B67]">{user?.bloodGroup || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Emergency Contact</p>
                      <p className="font-semibold text-[#123B67]">
                        {user?.emergencyContact || 'Not set'}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-slate-500">Known Allergies &amp; Chronic Conditions</p>
                      <p className="font-semibold text-[#123B67]">
                        Allergies: {user?.allergies || 'None reported'} | Conditions:{' '}
                        {user?.chronicConditions || 'None reported'}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-slate-500">Residential Address</p>
                      <p className="font-semibold text-[#123B67]">{user?.address || 'Not set'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. EDIT PROFILE */}
              {activeTab === 'edit-profile' && (
                <form
                  onSubmit={handleSaveProfile}
                  className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4"
                >
                  <h2 className="text-xl font-display font-bold text-[#123B67]">
                    Edit Personal &amp; Clinical Profile
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-semibold mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Blood Group</label>
                      <input
                        type="text"
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value)}
                        placeholder="e.g. O+, A+, B+"
                        className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Gender</label>
                      <input
                        type="text"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Emergency Contact</label>
                      <input
                        type="text"
                        value={emergencyContact}
                        onChange={(e) => setEmergencyContact(e.target.value)}
                        className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-semibold mb-1">Known Allergies</label>
                      <input
                        type="text"
                        value={allergies}
                        onChange={(e) => setAllergies(e.target.value)}
                        className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-semibold mb-1">Chronic Conditions</label>
                      <input
                        type="text"
                        value={chronicConditions}
                        onChange={(e) => setChronicConditions(e.target.value)}
                        className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-semibold mb-1">Residential Address</label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#123B67] text-white text-xs font-semibold"
                  >
                    Save Profile Changes
                  </button>
                </form>
              )}

              {/* 4. BOOK NEW APPOINTMENT */}
              {activeTab === 'book-new' && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-display font-bold text-[#123B67]">
                      Book New Outpatient Appointment
                    </h2>
                    <Link
                      to="/appointment"
                      className="text-xs font-semibold text-[#1685B8] hover:underline"
                    >
                      Open Full 12-Step Booking Wizard →
                    </Link>
                  </div>
                  <form onSubmit={handleQuickBook} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-semibold mb-1">Department *</label>
                      <select
                        required
                        value={qbDeptId}
                        onChange={(e) => setQbDeptId(e.target.value)}
                        className="w-full px-3 py-2.5 bg-[#F5F9FC] border border-slate-300 rounded-xl"
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
                      <label className="block font-semibold mb-1">Consulting Doctor *</label>
                      <select
                        required
                        value={qbDocId}
                        onChange={(e) => {
                          setQbDocId(e.target.value);
                          const d = doctors.find((doc) => doc.id === e.target.value);
                          if (d) setQbDeptId(d.departmentId);
                        }}
                        className="w-full px-3 py-2.5 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                      >
                        <option value="">Select Doctor...</option>
                        {doctors
                          .filter((d) => !qbDeptId || d.departmentId === qbDeptId)
                          .map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name} ({d.departmentName} — ₹{d.consultationFee})
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Preferred Date *</label>
                      <input
                        type="date"
                        required
                        min={todayStr}
                        value={qbDate}
                        onChange={(e) => setQbDate(e.target.value)}
                        className="w-full px-3 py-2.5 bg-[#F5F9FC] border border-slate-300 rounded-xl font-mono-tabular"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Time Slot *</label>
                      <select
                        value={qbSlot}
                        onChange={(e) => setQbSlot(e.target.value)}
                        className="w-full px-3 py-2.5 bg-[#F5F9FC] border border-slate-300 rounded-xl font-mono-tabular"
                      >
                        {[
                          '09:00 AM',
                          '09:30 AM',
                          '10:00 AM',
                          '10:30 AM',
                          '11:00 AM',
                          '11:30 AM',
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
                    <div className="sm:col-span-2">
                      <label className="block font-semibold mb-1">Reason for Visit *</label>
                      <input
                        type="text"
                        required
                        value={qbReason}
                        onChange={(e) => setQbReason(e.target.value)}
                        placeholder="Describe symptoms or follow-up reason..."
                        className="w-full px-3 py-2.5 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-[#123B67] text-white font-semibold"
                      >
                        Confirm Appointment
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* 5, 6, 7, 11. APPOINTMENTS LISTS */}
              {(activeTab === 'my-appointments' ||
                activeTab === 'upcoming' ||
                activeTab === 'previous' ||
                activeTab === 'history') && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
                  <h2 className="text-xl font-display font-bold text-[#123B67]">
                    {activeTab === 'upcoming'
                      ? 'Upcoming Appointments'
                      : activeTab === 'previous'
                      ? 'Previous Appointments'
                      : 'All My Appointments & History'}
                  </h2>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500">
                          <th className="py-2.5 pr-4">Appt ID</th>
                          <th className="py-2.5 pr-4">Doctor &amp; Dept</th>
                          <th className="py-2.5 pr-4">Date &amp; Slot</th>
                          <th className="py-2.5 pr-4">Fee</th>
                          <th className="py-2.5 pr-4">Status</th>
                          <th className="py-2.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(activeTab === 'upcoming'
                          ? upcomingAppointments
                          : activeTab === 'previous'
                          ? previousAppointments
                          : appointments
                        ).map((a) => (
                          <tr key={a.id} className="hover:bg-slate-50">
                            <td className="py-3 pr-4 font-mono-tabular font-bold text-[#123B67]">
                              {a.appointmentNumber}
                            </td>
                            <td className="py-3 pr-4">
                              <p className="font-semibold text-[#123B67]">{a.doctorName}</p>
                              <p className="text-slate-500">{a.departmentName}</p>
                            </td>
                            <td className="py-3 pr-4 font-mono-tabular">
                              {a.appointmentDate} · {a.timeSlot}
                            </td>
                            <td className="py-3 pr-4 font-mono-tabular font-semibold">
                              ₹{a.consultationFee}
                            </td>
                            <td className="py-3 pr-4 font-semibold text-[#1685B8]">
                              {a.status}
                            </td>
                            <td className="py-3 text-right space-x-2 whitespace-nowrap">
                              <button
                                onClick={() => {
                                  setSelectedAppt(a);
                                  setActiveTab('appointment-details');
                                }}
                                className="text-[#123B67] font-semibold hover:underline"
                              >
                                Details
                              </button>
                              {(a.status === 'Pending' || a.status === 'Confirmed') && (
                                <>
                                  <button
                                    onClick={() => {
                                      setRescheduleApptId(a.id);
                                      setActiveTab('reschedule');
                                    }}
                                    className="text-[#1685B8] font-semibold hover:underline"
                                  >
                                    Reschedule
                                  </button>
                                  <button
                                    onClick={() => {
                                      setCancelApptId(a.id);
                                      setActiveTab('cancel');
                                    }}
                                    className="text-red-700 font-semibold hover:underline"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 8. CANCEL APPOINTMENT */}
              {activeTab === 'cancel' && (
                <form
                  onSubmit={handleCancelAppointment}
                  className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 text-xs"
                >
                  <h2 className="text-xl font-display font-bold text-[#123B67]">
                    Cancel an Upcoming Appointment
                  </h2>
                  <div>
                    <label className="block font-semibold mb-1">
                      Select Appointment to Cancel *
                    </label>
                    <select
                      required
                      value={cancelApptId}
                      onChange={(e) => setCancelApptId(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                    >
                      <option value="">Choose an active appointment...</option>
                      {appointments
                        .filter((a) => a.status === 'Pending' || a.status === 'Confirmed')
                        .map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.appointmentNumber} — {a.doctorName} ({a.appointmentDate} at{' '}
                            {a.timeSlot})
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Reason for Cancellation *</label>
                    <input
                      type="text"
                      required
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="e.g. Schedule change, feeling better..."
                      className="w-full px-3 py-2.5 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-red-700 text-white font-semibold"
                  >
                    Confirm Cancellation
                  </button>
                </form>
              )}

              {/* 9. RESCHEDULE APPOINTMENT */}
              {activeTab === 'reschedule' && (
                <form
                  onSubmit={handleRescheduleAppointment}
                  className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 text-xs"
                >
                  <h2 className="text-xl font-display font-bold text-[#123B67]">
                    Reschedule Appointment
                  </h2>
                  <div>
                    <label className="block font-semibold mb-1">
                      Select Appointment to Reschedule *
                    </label>
                    <select
                      required
                      value={rescheduleApptId}
                      onChange={(e) => setRescheduleApptId(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                    >
                      <option value="">Choose an active appointment...</option>
                      {appointments
                        .filter((a) => a.status === 'Pending' || a.status === 'Confirmed')
                        .map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.appointmentNumber} — {a.doctorName} ({a.appointmentDate} at{' '}
                            {a.timeSlot})
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold mb-1">New Consultation Date *</label>
                      <input
                        type="date"
                        required
                        min={todayStr}
                        value={rescheduleDate}
                        onChange={(e) => setRescheduleDate(e.target.value)}
                        className="w-full px-3 py-2.5 bg-[#F5F9FC] border border-slate-300 rounded-xl font-mono-tabular"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">New Time Slot *</label>
                      <select
                        value={rescheduleSlot}
                        onChange={(e) => setRescheduleSlot(e.target.value)}
                        className="w-full px-3 py-2.5 bg-[#F5F9FC] border border-slate-300 rounded-xl font-mono-tabular"
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
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#123B67] text-white font-semibold"
                  >
                    Confirm New Date &amp; Time Slot
                  </button>
                </form>
              )}

              {/* 10. APPOINTMENT DETAILS */}
              {activeTab === 'appointment-details' && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="space-y-1">
                      <GokulHospitalLogo variant="full" size="sm" />
                      <h2 className="text-xl font-display font-bold text-[#123B67]">
                        Appointment Slip Details
                      </h2>
                    </div>
                    <button
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Official Slip</span>
                    </button>
                  </div>
                  {selectedAppt ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-xl bg-[#F5F9FC] border border-slate-200 text-xs sm:text-sm">
                        <div>
                          <p className="text-slate-500">Appointment ID</p>
                          <p className="font-mono-tabular font-bold text-[#123B67]">
                            {selectedAppt.appointmentNumber}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Current Status</p>
                          <p className="font-bold text-[#1685B8]">{selectedAppt.status}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Doctor &amp; Department</p>
                          <p className="font-semibold text-[#123B67]">
                            {selectedAppt.doctorName} ({selectedAppt.departmentName})
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Date &amp; Slot</p>
                          <p className="font-mono-tabular font-semibold text-[#123B67]">
                            {selectedAppt.appointmentDate} · {selectedAppt.timeSlot}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Consultation Fee &amp; Payment Mode</p>
                          <p className="font-mono-tabular font-semibold text-[#123B67]">
                            ₹{selectedAppt.consultationFee} ·{' '}
                            {selectedAppt.paymentStatus === 'PaidSandbox'
                              ? 'DEMO PAYMENT MODE (Simulated — Not a Real Payment)'
                              : 'Pay at Hospital OPD Counter'}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Reason</p>
                          <p className="font-semibold text-[#123B67]">{selectedAppt.reason}</p>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 space-y-2 text-xs">
                        <p className="font-bold text-amber-900">
                          Demo Payment Mode &amp; Demo Email Mode Active
                        </p>
                        <p className="text-amber-900/90">
                          {selectedAppt.paymentStatus === 'PaidSandbox'
                            ? `Simulated Reference: ${selectedAppt.paymentReference || 'DEMO-SIM-RZP'} (Demo Test Only — ₹0 Real Money Charged).`
                            : 'You can test the online payment checkout flow in Demo Payment Mode without entering any Razorpay keys or real payment details.'}
                        </p>
                        {selectedAppt.paymentStatus !== 'PaidSandbox' &&
                          selectedAppt.status !== 'Cancelled' && (
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  const res = await apiRequest<{ message: string }>(
                                    '/api/payments/sandbox-order',
                                    {
                                      method: 'POST',
                                      body: JSON.stringify({
                                        appointmentId: selectedAppt.id,
                                        paymentMethod: 'Patient Portal Demo UPI/Card',
                                      }),
                                    }
                                  );
                                  showToast(res.message, 'info');
                                  await loadPatientData();
                                } catch (err) {
                                  showToast(
                                    err instanceof Error ? err.message : 'Demo payment failed.',
                                    'error'
                                  );
                                }
                              }}
                              className="px-4 py-2 rounded-lg bg-[#1685B8] hover:bg-[#123B67] text-white font-semibold text-xs"
                            >
                              Simulate Demo Payment (Test Only — ₹0 Charge)
                            </button>
                          )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">Select an appointment to view details.</p>
                  )}
                </div>
              )}

              {/* 12. MEDICAL RECORDS */}
              {activeTab === 'medical-records' && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
                  <h2 className="text-xl font-display font-bold text-[#123B67]">
                    Authorized Clinical Medical Records
                  </h2>
                  {medicalRecords.length === 0 ? (
                    <p className="text-xs text-slate-500">No medical visit records found.</p>
                  ) : (
                    <div className="space-y-4">
                      {medicalRecords.map((mr) => (
                        <div
                          key={mr.id}
                          className="p-5 rounded-xl bg-[#F5F9FC] border border-slate-200 space-y-3 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-[#123B67]">
                              Diagnosis: {mr.diagnosis}
                            </span>
                            <span className="font-mono-tabular text-slate-500">
                              Visit Date: {mr.visitDate}
                            </span>
                          </div>
                          <p className="text-slate-600">
                            <strong>Consulting Doctor:</strong> {mr.doctorName}
                          </p>
                          <p className="text-slate-700 leading-relaxed">{mr.clinicalNotes}</p>
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-200 font-mono-tabular">
                            <div>BP: {mr.vitalSigns.bloodPressure || '—'}</div>
                            <div>Pulse: {mr.vitalSigns.heartRate || '—'}</div>
                            <div>Temp: {mr.vitalSigns.temperature || '—'}</div>
                            <div>Weight: {mr.vitalSigns.weightKg || '—'}</div>
                            <div>SpO2: {mr.vitalSigns.spo2 || '—'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 13. LAB REPORTS */}
              {activeTab === 'lab-reports' && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
                  <h2 className="text-xl font-display font-bold text-[#123B67]">
                    Diagnostic Laboratory Reports
                  </h2>
                  {labReports.length === 0 ? (
                    <p className="text-xs text-slate-500">No diagnostic lab reports found.</p>
                  ) : (
                    <div className="space-y-4">
                      {labReports.map((rep) => (
                        <div
                          key={rep.id}
                          className="p-5 rounded-xl bg-[#F5F9FC] border border-slate-200 space-y-3 text-xs"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <p className="font-mono-tabular font-bold text-[#1685B8]">
                                {rep.reportNumber} · {rep.category}
                              </p>
                              <h3 className="text-base font-display font-bold text-[#123B67]">
                                {rep.testName}
                              </h3>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDownloadLabReport(rep)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#123B67] text-white font-semibold shrink-0"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download Verified Report</span>
                            </button>
                          </div>
                          <p className="text-slate-700">
                            <strong>Summary:</strong> {rep.summaryResult}
                          </p>
                          {rep.parameters.length > 0 && (
                            <div className="overflow-x-auto pt-2">
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="border-b border-slate-200 text-slate-500">
                                    <th className="py-1.5">Parameter</th>
                                    <th className="py-1.5">Observed Value</th>
                                    <th className="py-1.5">Reference Interval</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200/60 font-mono-tabular">
                                  {rep.parameters.map((p, i) => (
                                    <tr key={i}>
                                      <td className="py-1.5 font-sans font-medium text-[#123B67]">
                                        {p.parameter}
                                      </td>
                                      <td className="py-1.5 font-bold">
                                        {p.observedValue} {p.unit}
                                      </td>
                                      <td className="py-1.5 text-slate-500">{p.referenceRange}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 14. PRESCRIPTIONS */}
              {activeTab === 'prescriptions' && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
                  <h2 className="text-xl font-display font-bold text-[#123B67]">
                    Doctor-Authorized Prescriptions
                  </h2>
                  {prescriptions.length === 0 ? (
                    <p className="text-xs text-slate-500">No prescriptions issued yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {prescriptions.map((rx) => (
                        <div
                          key={rx.id}
                          className="p-5 rounded-xl bg-[#F5F9FC] border border-slate-200 space-y-3 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-bold text-sm text-[#123B67]">
                                {rx.doctorName} ({rx.departmentName})
                              </p>
                              <p className="text-slate-600">Diagnosis: {rx.diagnosis}</p>
                            </div>
                            <button
                              onClick={() => window.print()}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Print Rx</span>
                            </button>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-slate-200">
                            {rx.medications.map((m, idx) => (
                              <div
                                key={idx}
                                className="p-3 rounded-lg bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                              >
                                <div>
                                  <p className="font-bold text-[#123B67]">
                                    {idx + 1}. {m.medicineName} ({m.dosage})
                                  </p>
                                  <p className="text-slate-500">{m.instructions}</p>
                                </div>
                                <div className="font-mono-tabular text-[#1685B8] font-semibold">
                                  {m.frequency} · {m.duration}
                                </div>
                              </div>
                            ))}
                          </div>
                          <p className="text-slate-600 pt-1">
                            <strong>General Advice:</strong> {rx.generalAdvice}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 15. NOTIFICATIONS */}
              {activeTab === 'notifications' && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-display font-bold text-[#123B67]">
                      Notifications Center
                    </h2>
                    <button
                      onClick={async () => {
                        await apiRequest('/api/clinical/notifications/read-all', {
                          method: 'POST',
                        });
                        await loadPatientData();
                        showToast('All notifications marked as read.', 'info');
                      }}
                      className="text-xs font-semibold text-[#1685B8] hover:underline"
                    >
                      Mark All as Read
                    </button>
                  </div>
                  <div className="space-y-3">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-4 rounded-xl border text-xs flex items-start justify-between gap-4 ${
                          n.isRead
                            ? 'bg-white border-slate-200 text-slate-600'
                            : 'bg-[#F5F9FC] border-[#1685B8] text-[#123B67]'
                        }`}
                      >
                        <div className="space-y-1">
                          <p className="font-bold">{n.title}</p>
                          <p>{n.message}</p>
                        </div>
                        {!n.isRead && (
                          <button
                            onClick={async () => {
                              await apiRequest(`/api/clinical/notifications/${n.id}/read`, {
                                method: 'PATCH',
                              });
                              await loadPatientData();
                            }}
                            className="text-[#1685B8] font-semibold shrink-0"
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 16. PRIVACY SETTINGS */}
              {activeTab === 'privacy' && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 text-xs sm:text-sm">
                  <h2 className="text-xl font-display font-bold text-[#123B67]">
                    Patient Privacy &amp; Consent Settings
                  </h2>
                  <p className="text-slate-600">
                    Manage how your clinical records are shared with consulting doctors during appointments at Gokul Hospital.
                  </p>
                  <label className="flex items-start gap-3 p-4 rounded-xl bg-[#F5F9FC] border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowSharing}
                      onChange={(e) => setAllowSharing(e.target.checked)}
                      className="mt-1 rounded border-slate-300"
                    />
                    <div>
                      <strong className="text-[#123B67] block">
                        Authorize Consulting Doctors to View My Past Clinical Records
                      </strong>
                      <span className="text-xs text-slate-500">
                        When enabled, doctors with whom you have booked an appointment can view your past diagnoses, lab reports, and allergies for safe treatment.
                      </span>
                    </div>
                  </label>
                  <button
                    onClick={handleSaveProfile}
                    className="px-5 py-2.5 rounded-xl bg-[#123B67] text-white text-xs font-semibold"
                  >
                    Save Privacy Preferences
                  </button>
                </div>
              )}

              {/* 17. CHANGE PASSWORD */}
              {activeTab === 'password' && (
                <form
                  onSubmit={handleChangePassword}
                  className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 max-w-md text-xs"
                >
                  <h2 className="text-xl font-display font-bold text-[#123B67]">
                    Change Account Password
                  </h2>
                  <div>
                    <label className="block font-semibold mb-1">Current Password *</label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">New Password (Min 8 chars) *</label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#F5F9FC] border border-slate-300 rounded-xl"
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
            </>
          )}
        </section>
      </div>
    </div>
  );
}
