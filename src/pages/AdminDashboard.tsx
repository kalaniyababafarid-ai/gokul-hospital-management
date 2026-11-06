import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Building2,
  Calendar,
  Clock,
  UserCheck,
  HeartPulse,
  ShieldCheck,
  MessageSquare,
  FileText,
  Image,
  Bell,
  BarChart3,
  Settings,
  Lock,
  LogOut,
  Download,
  Plus,
  FlaskConical,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext.tsx';
import { apiRequest } from '../services/api.ts';
import type {
  UserAccount,
  Appointment,
  AppointmentStatus,
  InquiryItem,
  AuditLogItem,
  WebsiteSettings,
} from '../types/hospital.ts';
import { usePageSeo } from '../layouts/PublicLayout.tsx';
import { GokulHospitalLogo, CUSTOM_LOGO_STORAGE_KEY } from '../components/BrandLogo.tsx';

type AdminTab =
  | 'overview'
  | 'patients'
  | 'doctors'
  | 'departments'
  | 'appointments'
  | 'schedules'
  | 'receptionists'
  | 'services'
  | 'facilities'
  | 'packages'
  | 'records-permissions'
  | 'inquiries'
  | 'testimonials'
  | 'blogs'
  | 'gallery'
  | 'notifications'
  | 'reports'
  | 'analytics'
  | 'settings'
  | 'staff'
  | 'roles'
  | 'audit-logs';

interface OverviewResponse {
  stats: {
    totalPatients: number;
    totalDoctors: number;
    totalReceptionists: number;
    totalAppointments: number;
    todaysAppointments: number;
    pendingAppointments: number;
    confirmedAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    openInquiries: number;
    packageRequests: number;
  };
  departmentBreakdown: {
    departmentId: string;
    departmentName: string;
    doctorsCount: number;
    appointmentsCount: number;
  }[];
  recentAuditLogs: AuditLogItem[];
}

export function AdminDashboard() {
  const {
    user,
    settings,
    departments,
    doctors,
    services,
    facilities,
    healthPackages,
    testimonials,
    blogs,
    gallery,
    logout,
    refreshBootstrap,
    showToast,
  } = useHospital();
  const navigate = useNavigate();

  usePageSeo('Hospital Administration Console');

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [allUsers, setAllUsers] = useState<UserAccount[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);

  // Filters
  const [apptSearch, setApptSearch] = useState('');
  const [apptStatusFilter, setApptStatusFilter] = useState('ALL');
  const [patientSearch, setPatientSearch] = useState('');

  // Add Doctor Form
  const [docName, setDocName] = useState('');
  const [docDeptId, setDocDeptId] = useState(departments[0]?.id || '');
  const [docSpec, setDocSpec] = useState('');
  const [docQual, setDocQual] = useState('');
  const [docExp, setDocExp] = useState(10);
  const [docFee, setDocFee] = useState(700);

  // Add Department Form
  const [deptName, setDeptName] = useState('');
  const [deptDesc, setDeptDesc] = useState('');
  const [deptHead, setDeptHead] = useState('');
  const [deptFloor, setDeptFloor] = useState('Wing A, 2nd Floor');

  // Add Staff Form
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffRole, setStaffRole] = useState<'doctor' | 'receptionist' | 'admin'>('receptionist');
  const [staffPass, setStaffPass] = useState('GokulStaff@123');

  // Add Lab Report Form
  const [labPatientId, setLabPatientId] = useState('');
  const [labTestName, setLabTestName] = useState('');
  const [labSummary, setLabSummary] = useState('');

  // Website Settings Form
  const [formSettings, setFormSettings] = useState<Partial<WebsiteSettings>>(settings || {});

  // Broadcast Form
  const [bcTitle, setBcTitle] = useState('');
  const [bcMessage, setBcMessage] = useState('');

  const loadAdminData = useCallback(async () => {
    try {
      const [ovRes, usrRes, apptRes, inqRes, logRes] = await Promise.all([
        apiRequest<OverviewResponse>('/api/admin/overview'),
        apiRequest<{ users: UserAccount[] }>('/api/admin/users'),
        apiRequest<{ appointments: Appointment[] }>('/api/appointments'),
        apiRequest<{ inquiries: InquiryItem[] }>('/api/admin/inquiries'),
        apiRequest<{ auditLogs: AuditLogItem[] }>('/api/admin/audit-logs'),
      ]);
      setOverview(ovRes);
      setAllUsers(usrRes.users);
      setAppointments(apptRes.appointments);
      setInquiries(inqRes.inquiries);
      setAuditLogs(logRes.auditLogs);
      const firstPat = usrRes.users.find((u) => u.role === 'patient');
      if (firstPat) setLabPatientId((prev) => prev || firstPat.id);
    } catch (err) {
      console.error('Admin load error:', err);
    }
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  useEffect(() => {
    if (settings) setFormSettings(settings);
  }, [settings]);

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/api/admin/doctors', {
        method: 'POST',
        body: JSON.stringify({
          name: docName,
          departmentId: docDeptId || departments[0]?.id,
          specialization: docSpec,
          qualifications: docQual,
          experienceYears: docExp,
          consultationFee: docFee,
        }),
      });
      showToast(`Added ${docName} to Gokul Hospital directory!`, 'success');
      setDocName('');
      setDocSpec('');
      setDocQual('');
      await refreshBootstrap();
      await loadAdminData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error adding doctor.', 'error');
    }
  };

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/api/admin/departments', {
        method: 'POST',
        body: JSON.stringify({
          name: deptName,
          shortDescription: deptDesc,
          headOfDepartment: deptHead,
          floorLocation: deptFloor,
        }),
      });
      showToast(`Created department: ${deptName}`, 'success');
      setDeptName('');
      setDeptDesc('');
      await refreshBootstrap();
      await loadAdminData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error creating department.', 'error');
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify({
          fullName: staffName,
          email: staffEmail,
          phone: staffPhone,
          role: staffRole,
          password: staffPass,
        }),
      });
      showToast(`Created ${staffRole} account for ${staffName}.`, 'success');
      setStaffName('');
      setStaffEmail('');
      setStaffPhone('');
      await loadAdminData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error creating staff.', 'error');
    }
  };

  const handleSaveWebsiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(formSettings),
      });
      await refreshBootstrap();
      showToast('Gokul Hospital website settings updated live!', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save settings.', 'error');
    }
  };

  const handleUploadLabReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/api/clinical/lab-reports', {
        method: 'POST',
        body: JSON.stringify({
          patientId: labPatientId,
          testName: labTestName,
          category: 'Biochemistry',
          summaryResult: labSummary,
          parameters: [
            {
              parameter: labTestName,
              observedValue: 'Normal / Verified',
              unit: '',
              referenceRange: 'Standard Reference',
            },
          ],
        }),
      });
      showToast('Verified Lab Report uploaded to Patient Portal.', 'success');
      setLabTestName('');
      setLabSummary('');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Upload failed.', 'error');
    }
  };

  const exportCsvReport = (type: 'appointments' | 'patients' | 'doctors') => {
    let csv = '';
    if (type === 'appointments') {
      csv = [
        'AppointmentID,PatientName,Phone,Department,Doctor,Date,TimeSlot,FeeINR,Status',
        ...appointments.map(
          (a) =>
            `${a.appointmentNumber},"${a.patientName}",${a.patientPhone},"${a.departmentName}","${a.doctorName}",${a.appointmentDate},${a.timeSlot},${a.consultationFee},${a.status}`
        ),
      ].join('\n');
    } else if (type === 'patients') {
      csv = [
        'UserID,FullName,Email,Phone,Active,CreatedAt',
        ...allUsers
          .filter((u) => u.role === 'patient')
          .map((u) => `${u.id},"${u.fullName}",${u.email},${u.phone},${u.isActive},${u.createdAt}`),
      ].join('\n');
    } else {
      csv = [
        'DoctorID,Name,Department,Specialization,FeeINR,Available',
        ...doctors.map(
          (d) =>
            `${d.id},"${d.name}","${d.departmentName}","${d.specialization}",${d.consultationFee},${d.isAvailable}`
        ),
      ].join('\n');
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gokul-hospital-${type}-report.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${type} CSV report.`, 'success');
  };

  const sidebarItems: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: '1. Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'patients', label: '2. Patients', icon: <Users className="w-4 h-4" /> },
    { id: 'doctors', label: '3. Doctors', icon: <Stethoscope className="w-4 h-4" /> },
    { id: 'departments', label: '4. Departments', icon: <Building2 className="w-4 h-4" /> },
    { id: 'appointments', label: '5. Appointments', icon: <Calendar className="w-4 h-4" /> },
    { id: 'schedules', label: '6. Manage Schedules', icon: <Clock className="w-4 h-4" /> },
    { id: 'receptionists', label: '7. Receptionists', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'services', label: '8. Hospital Services', icon: <HeartPulse className="w-4 h-4" /> },
    { id: 'facilities', label: '9. Facilities', icon: <Building2 className="w-4 h-4" /> },
    { id: 'packages', label: '10. Health Packages', icon: <FlaskConical className="w-4 h-4" /> },
    {
      id: 'records-permissions',
      label: '11. Records & Lab Uploads',
      icon: <ShieldCheck className="w-4 h-4" />,
    },
    { id: 'inquiries', label: '12. Patient Inquiries', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'testimonials', label: '13. Testimonials', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'blogs', label: '14. Blogs', icon: <FileText className="w-4 h-4" /> },
    { id: 'gallery', label: '15. Gallery', icon: <Image className="w-4 h-4" /> },
    { id: 'notifications', label: '16. Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'reports', label: '17. Reports (CSV)', icon: <Download className="w-4 h-4" /> },
    { id: 'analytics', label: '18. Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'settings', label: '19. Website Settings', icon: <Settings className="w-4 h-4" /> },
    { id: 'staff', label: '20. Staff Management', icon: <Users className="w-4 h-4" /> },
    { id: 'roles', label: '21. Roles & Permissions', icon: <Lock className="w-4 h-4" /> },
    { id: 'audit-logs', label: '22. Audit Logs', icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  const stats = overview?.stats;

  return (
    <div className="dashboard-container py-8 sm:py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* Admin Sidebar (All 23 Items) */}
        <aside className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 p-5 space-y-4 shadow-xs">
          <Link to="/" className="block">
            <GokulHospitalLogo variant="compact" />
          </Link>
          <div className="p-4 rounded-2xl bg-[#123B67] text-white space-y-1">
            <p className="text-xs text-[#19B7A5] font-bold uppercase tracking-wider">
              Gokul Hospital Admin
            </p>
            <p className="text-base font-display font-bold truncate">{user?.fullName}</p>
            <p className="text-xs text-white/80 truncate">{user?.email}</p>
          </div>

          <nav className="space-y-1 max-h-[680px] overflow-y-auto pr-1">
            {sidebarItems.map((item) => (
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
              <span>23. Logout</span>
            </button>
          </nav>
        </aside>

        {/* Main Viewport */}
        <section className="lg:col-span-9 space-y-6">
          {/* 1. OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                <div>
                  <p className="text-sm text-[#1685B8] font-bold">
                    GOKUL HOSPITAL · EXECUTIVE COMMAND CENTER
                  </p>
                  <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[#123B67]">
                    Hospital Administration Overview
                  </h1>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-[#123B67] hover:bg-slate-50 cursor-pointer"
                  >
                    Website Settings
                  </button>
                  <button
                    onClick={() => setActiveTab('doctors')}
                    className="px-5 py-2.5 rounded-xl bg-[#123B67] hover:bg-[#1685B8] text-white text-sm font-bold cursor-pointer"
                  >
                    + Add Doctor
                  </button>
                </div>
              </div>

              {/* All 9 Required Database-Driven Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
                  <p className="text-sm text-slate-500 font-medium">1. Total Patients</p>
                  <p className="text-3xl font-display font-extrabold text-[#123B67] tabular-nums mt-1">
                    {stats?.totalPatients ?? 0}
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
                  <p className="text-sm text-slate-500 font-medium">2. Total Doctors</p>
                  <p className="text-3xl font-display font-extrabold text-[#1685B8] tabular-nums mt-1">
                    {stats?.totalDoctors ?? doctors.length}
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
                  <p className="text-sm text-slate-500 font-medium">3. Total Receptionists</p>
                  <p className="text-3xl font-display font-extrabold text-[#123B67] tabular-nums mt-1">
                    {stats?.totalReceptionists ?? 0}
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
                  <p className="text-sm text-slate-500 font-medium">4. Total Appointments</p>
                  <p className="text-3xl font-display font-extrabold text-[#123B67] tabular-nums mt-1">
                    {stats?.totalAppointments ?? appointments.length}
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
                  <p className="text-sm text-slate-500 font-medium">5. Today&apos;s Appointments</p>
                  <p className="text-3xl font-display font-extrabold text-[#1685B8] tabular-nums mt-1">
                    {stats?.todaysAppointments ?? 0}
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
                  <p className="text-sm text-slate-500 font-medium">6. Pending Appointments</p>
                  <p className="text-3xl font-display font-extrabold text-amber-600 tabular-nums mt-1">
                    {stats?.pendingAppointments ?? 0}
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
                  <p className="text-sm text-slate-500 font-medium">7. Confirmed Appointments</p>
                  <p className="text-3xl font-display font-extrabold text-[#1685B8] tabular-nums mt-1">
                    {stats?.confirmedAppointments ?? 0}
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
                  <p className="text-sm text-slate-500 font-medium">8. Completed Appointments</p>
                  <p className="text-3xl font-display font-extrabold text-[#19B7A5] tabular-nums mt-1">
                    {stats?.completedAppointments ?? 0}
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
                  <p className="text-sm text-slate-500 font-medium">9. Cancelled Appointments</p>
                  <p className="text-3xl font-display font-extrabold text-red-700 tabular-nums mt-1">
                    {stats?.cancelledAppointments ?? 0}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 2. PATIENTS MANAGEMENT */}
          {activeTab === 'patients' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-xl font-display font-bold text-[#123B67]">
                  Patient Account Management
                </h2>
                <input
                  type="search"
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  placeholder="Search patient name, email, phone..."
                  className="px-3.5 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl w-full sm:w-72"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-2 pr-3">Name</th>
                      <th className="py-2 pr-3">Email &amp; Phone</th>
                      <th className="py-2 pr-3">Status</th>
                      <th className="py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allUsers
                      .filter(
                        (u) =>
                          u.role === 'patient' &&
                          (!patientSearch ||
                            u.fullName.toLowerCase().includes(patientSearch.toLowerCase()) ||
                            u.email.toLowerCase().includes(patientSearch.toLowerCase()))
                      )
                      .map((p) => (
                        <tr key={p.id}>
                          <td className="py-3 pr-3 font-semibold text-[#123B67]">{p.fullName}</td>
                          <td className="py-3 pr-3">
                            {p.email} · {p.phone}
                          </td>
                          <td className="py-3 pr-3 font-semibold">
                            {p.isActive ? 'Active' : 'Deactivated'}
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={async () => {
                                await apiRequest(`/api/admin/users/${p.id}`, {
                                  method: 'PATCH',
                                  body: JSON.stringify({ isActive: !p.isActive }),
                                });
                                showToast('Updated patient account status.', 'info');
                                await loadAdminData();
                              }}
                              className="px-3 py-1 rounded border border-slate-300 font-semibold"
                            >
                              {p.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3 & 6. DOCTORS & SCHEDULES MANAGEMENT */}
          {(activeTab === 'doctors' || activeTab === 'schedules') && (
            <div className="space-y-6">
              <form
                onSubmit={handleAddDoctor}
                className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 text-xs"
              >
                <h2 className="text-lg font-display font-bold text-[#123B67] flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#19B7A5]" />
                  <span>Add Specialist Doctor to Gokul Hospital</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold mb-1">Doctor Name *</label>
                    <input
                      type="text"
                      required
                      value={docName}
                      onChange={(e) => setDocName(e.target.value)}
                      placeholder="Dr. Full Name"
                      className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Department *</label>
                    <select
                      value={docDeptId}
                      onChange={(e) => setDocDeptId(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Specialization *</label>
                    <input
                      type="text"
                      required
                      value={docSpec}
                      onChange={(e) => setDocSpec(e.target.value)}
                      placeholder="Consultant Physician"
                      className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Qualifications *</label>
                    <input
                      type="text"
                      required
                      value={docQual}
                      onChange={(e) => setDocQual(e.target.value)}
                      placeholder="MBBS, MD"
                      className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Experience (Years) *</label>
                    <input
                      type="number"
                      value={docExp}
                      onChange={(e) => setDocExp(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl font-mono-tabular"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Consultation Fee (INR ₹) *</label>
                    <input
                      type="number"
                      value={docFee}
                      onChange={(e) => setDocFee(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl font-mono-tabular"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#123B67] text-white font-semibold"
                >
                  Add Doctor to Directory
                </button>
              </form>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 text-xs">
                <h3 className="text-base font-display font-bold text-[#123B67]">
                  Manage Existing Doctors &amp; Availability ({doctors.length})
                </h3>
                <div className="space-y-3">
                  {doctors.map((d) => (
                    <div
                      key={d.id}
                      className="p-4 rounded-xl bg-[#F5F9FC] border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <p className="font-bold text-sm text-[#123B67]">
                          {d.name} — {d.departmentName} (₹{d.consultationFee})
                        </p>
                        <p className="text-slate-600">
                          {d.qualifications} · Days: {d.availableDays.join(', ')}
                        </p>
                      </div>
                      <button
                        onClick={async () => {
                          await apiRequest(`/api/admin/doctors/${d.id}`, {
                            method: 'PUT',
                            body: JSON.stringify({ isAvailable: !d.isAvailable }),
                          });
                          await refreshBootstrap();
                          showToast(`Updated availability for ${d.name}.`, 'info');
                        }}
                        className={`px-3 py-1.5 rounded-lg font-semibold ${
                          d.isAvailable
                            ? 'bg-[#19B7A5] text-white'
                            : 'bg-slate-300 text-slate-800'
                        }`}
                      >
                        {d.isAvailable ? 'Available (Click to Pause)' : 'Paused (Click to Enable)'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4. DEPARTMENTS MANAGEMENT */}
          {activeTab === 'departments' && (
            <div className="space-y-6">
              <form
                onSubmit={handleAddDepartment}
                className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 text-xs"
              >
                <h2 className="text-lg font-display font-bold text-[#123B67]">
                  Create Medical Department
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold mb-1">Department Name *</label>
                    <input
                      type="text"
                      required
                      value={deptName}
                      onChange={(e) => setDeptName(e.target.value)}
                      placeholder="e.g. Pulmonology"
                      className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Head of Department</label>
                    <input
                      type="text"
                      value={deptHead}
                      onChange={(e) => setDeptHead(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Floor Location</label>
                    <input
                      type="text"
                      value={deptFloor}
                      onChange={(e) => setDeptFloor(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block font-semibold mb-1">Description *</label>
                    <input
                      type="text"
                      required
                      value={deptDesc}
                      onChange={(e) => setDeptDesc(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#123B67] text-white font-semibold"
                >
                  Save Department
                </button>
              </form>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-3 text-xs">
                <h3 className="text-base font-display font-bold text-[#123B67]">
                  Configured Medical Departments ({departments.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {departments.map((d) => (
                    <div
                      key={d.id}
                      className="p-4 rounded-xl bg-[#F5F9FC] border border-slate-200 flex items-center justify-between gap-2"
                    >
                      <div>
                        <p className="font-bold text-[#123B67]">{d.name}</p>
                        <p className="text-slate-500">{d.floorLocation}</p>
                      </div>
                      <span className="text-[#19B7A5] font-semibold">Active</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 5. APPOINTMENTS MANAGEMENT */}
          {activeTab === 'appointments' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-xl font-display font-bold text-[#123B67]">
                  Hospital-Wide Appointment Management
                </h2>
                <div className="flex gap-2">
                  <input
                    type="search"
                    value={apptSearch}
                    onChange={(e) => setApptSearch(e.target.value)}
                    placeholder="Search ID, patient, doctor..."
                    className="px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                  />
                  <select
                    value={apptStatusFilter}
                    onChange={(e) => setApptStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-2 pr-3">ID</th>
                      <th className="py-2 pr-3">Patient</th>
                      <th className="py-2 pr-3">Doctor &amp; Dept</th>
                      <th className="py-2 pr-3">Date &amp; Slot</th>
                      <th className="py-2 pr-3">Status</th>
                      <th className="py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {appointments
                      .filter(
                        (a) =>
                          (apptStatusFilter === 'ALL' || a.status === apptStatusFilter) &&
                          (!apptSearch ||
                            a.appointmentNumber.toLowerCase().includes(apptSearch.toLowerCase()) ||
                            a.patientName.toLowerCase().includes(apptSearch.toLowerCase()) ||
                            a.doctorName.toLowerCase().includes(apptSearch.toLowerCase()))
                      )
                      .map((a) => (
                        <tr key={a.id}>
                          <td className="py-3 pr-3 font-mono-tabular font-bold text-[#123B67]">
                            {a.appointmentNumber}
                          </td>
                          <td className="py-3 pr-3">
                            <p className="font-semibold text-[#123B67]">{a.patientName}</p>
                            <p className="text-slate-500">{a.patientPhone}</p>
                          </td>
                          <td className="py-3 pr-3">
                            {a.doctorName} ({a.departmentName})
                          </td>
                          <td className="py-3 pr-3 font-mono-tabular">
                            {a.appointmentDate} · {a.timeSlot}
                          </td>
                          <td className="py-3 pr-3 font-semibold text-[#1685B8]">{a.status}</td>
                          <td className="py-3 text-right space-x-1.5 whitespace-nowrap">
                            {(['Confirmed', 'Completed', 'Cancelled'] as AppointmentStatus[]).map(
                              (st) => (
                                <button
                                  key={st}
                                  onClick={async () => {
                                    await apiRequest(`/api/appointments/${a.id}/status`, {
                                      method: 'PATCH',
                                      body: JSON.stringify({ status: st }),
                                    });
                                    showToast(`Updated ${a.appointmentNumber} to ${st}`, 'success');
                                    await loadAdminData();
                                  }}
                                  className="px-2 py-1 rounded border border-slate-300 hover:bg-slate-100 font-semibold"
                                >
                                  {st}
                                </button>
                              )
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 7, 20, 21. RECEPTIONISTS, STAFF MANAGEMENT & ROLES */}
          {(activeTab === 'receptionists' || activeTab === 'staff' || activeTab === 'roles') && (
            <div className="space-y-6">
              <form
                onSubmit={handleCreateStaff}
                className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 text-xs"
              >
                <h2 className="text-lg font-display font-bold text-[#123B67]">
                  Create Hospital Staff Account (RBAC Role Assignment)
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Official Email *</label>
                    <input
                      type="email"
                      required
                      value={staffEmail}
                      onChange={(e) => setStaffEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Phone *</label>
                    <input
                      type="tel"
                      required
                      value={staffPhone}
                      onChange={(e) => setStaffPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Assigned Role *</label>
                    <select
                      value={staffRole}
                      onChange={(e) =>
                        setStaffRole(e.target.value as 'doctor' | 'receptionist' | 'admin')
                      }
                      className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                    >
                      <option value="receptionist">Receptionist</option>
                      <option value="doctor">Doctor</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Initial Password *</label>
                    <input
                      type="text"
                      required
                      value={staffPass}
                      onChange={(e) => setStaffPass(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl font-mono-tabular"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#123B67] text-white font-semibold"
                >
                  Create Authorized Staff Account
                </button>
              </form>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-3 text-xs">
                <h3 className="text-base font-display font-bold text-[#123B67]">
                  All Users &amp; Role Assignments ({allUsers.length})
                </h3>
                <div className="space-y-2">
                  {allUsers.map((u) => (
                    <div
                      key={u.id}
                      className="p-3.5 rounded-xl bg-[#F5F9FC] border border-slate-200 flex items-center justify-between gap-2"
                    >
                      <div>
                        <p className="font-bold text-[#123B67]">
                          {u.fullName} ({u.role.toUpperCase()})
                        </p>
                        <p className="text-slate-500">
                          {u.email} · {u.phone}
                        </p>
                      </div>
                      <span className="font-semibold text-[#1685B8]">
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 8, 9, 10, 13, 14, 15. SERVICES, FACILITIES, PACKAGES, TESTIMONIALS, BLOGS, GALLERY */}
          {(activeTab === 'services' ||
            activeTab === 'facilities' ||
            activeTab === 'packages' ||
            activeTab === 'testimonials' ||
            activeTab === 'blogs' ||
            activeTab === 'gallery') && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 text-xs">
              <h2 className="text-xl font-display font-bold text-[#123B67] capitalize">
                Manage Hospital {activeTab}
              </h2>
              <p className="text-slate-600">
                Active records in database: Services ({services.length}), Facilities ({facilities.length}), Health Packages ({healthPackages.length}), Testimonials ({testimonials.length}), Blogs ({blogs.length}), Gallery ({gallery.length}).
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeTab === 'services' &&
                  services.map((s) => (
                    <div key={s.id} className="p-4 rounded-xl bg-[#F5F9FC] border border-slate-200">
                      <p className="font-bold text-[#123B67]">{s.title}</p>
                      <p className="text-slate-600 mt-1">{s.shortDescription}</p>
                    </div>
                  ))}
                {activeTab === 'facilities' &&
                  facilities.map((f) => (
                    <div key={f.id} className="p-4 rounded-xl bg-[#F5F9FC] border border-slate-200">
                      <p className="font-bold text-[#123B67]">{f.title}</p>
                      <p className="text-slate-600 mt-1">{f.description}</p>
                    </div>
                  ))}
                {activeTab === 'packages' &&
                  healthPackages.map((p) => (
                    <div key={p.id} className="p-4 rounded-xl bg-[#F5F9FC] border border-slate-200">
                      <p className="font-bold text-[#123B67]">
                        {p.name} — ₹{p.discountedPriceInr || p.priceInr}
                      </p>
                      <p className="text-slate-600 mt-1">{p.includedTests.length} tests included</p>
                    </div>
                  ))}
                {activeTab === 'testimonials' &&
                  testimonials.map((t) => (
                    <div key={t.id} className="p-4 rounded-xl bg-[#F5F9FC] border border-slate-200">
                      <p className="font-bold text-[#123B67]">{t.patientName}</p>
                      <p className="text-slate-600 mt-1">{t.outcomeQuote}</p>
                    </div>
                  ))}
                {activeTab === 'blogs' &&
                  blogs.map((b) => (
                    <div key={b.id} className="p-4 rounded-xl bg-[#F5F9FC] border border-slate-200">
                      <p className="font-bold text-[#123B67]">{b.title}</p>
                      <p className="text-slate-600 mt-1">{b.excerpt}</p>
                    </div>
                  ))}
                {activeTab === 'gallery' &&
                  gallery.map((g) => (
                    <div key={g.id} className="p-4 rounded-xl bg-[#F5F9FC] border border-slate-200">
                      <p className="font-bold text-[#123B67]">{g.title}</p>
                      <p className="text-slate-600 mt-1">{g.description}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* 11. MEDICAL RECORDS PERMISSIONS & LAB REPORT UPLOAD */}
          {activeTab === 'records-permissions' && (
            <form
              onSubmit={handleUploadLabReport}
              className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 text-xs"
            >
              <h2 className="text-xl font-display font-bold text-[#123B67]">
                Upload Verified Diagnostic Lab Report to Patient Portal
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Select Patient *</label>
                  <select
                    required
                    value={labPatientId}
                    onChange={(e) => setLabPatientId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                  >
                    {allUsers
                      .filter((u) => u.role === 'patient')
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.fullName} ({p.email})
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Diagnostic Test Name *</label>
                  <input
                    type="text"
                    required
                    value={labTestName}
                    onChange={(e) => setLabTestName(e.target.value)}
                    placeholder="e.g. Complete Blood Count & HbA1c"
                    className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1">Verified Clinical Summary *</label>
                  <textarea
                    rows={3}
                    required
                    value={labSummary}
                    onChange={(e) => setLabSummary(e.target.value)}
                    placeholder="Enter verified pathology or radiology findings..."
                    className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#123B67] text-white font-semibold"
              >
                Publish Verified Lab Report
              </button>
            </form>
          )}

          {/* 12. PATIENT INQUIRIES */}
          {activeTab === 'inquiries' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 text-xs">
              <h2 className="text-xl font-display font-bold text-[#123B67]">
                Patient Inquiries ({inquiries.length})
              </h2>
              {inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="p-4 rounded-xl bg-[#F5F9FC] border border-slate-200 space-y-1"
                >
                  <p className="font-bold text-[#123B67]">
                    {inq.subject} — {inq.fullName} ({inq.phone}) [{inq.status}]
                  </p>
                  <p className="text-slate-600">{inq.message}</p>
                </div>
              ))}
            </div>
          )}

          {/* 16. NOTIFICATIONS & ANNOUNCEMENTS */}
          {activeTab === 'notifications' && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await apiRequest('/api/admin/announcements', {
                  method: 'POST',
                  body: JSON.stringify({ title: bcTitle, message: bcMessage, targetRole: 'ALL' }),
                });
                showToast('Hospital announcement broadcasted!', 'success');
                setBcTitle('');
                setBcMessage('');
              }}
              className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 text-xs"
            >
              <h2 className="text-xl font-display font-bold text-[#123B67]">
                Broadcast Hospital Announcement
              </h2>
              <div>
                <label className="block font-semibold mb-1">Announcement Title *</label>
                <input
                  type="text"
                  required
                  value={bcTitle}
                  onChange={(e) => setBcTitle(e.target.value)}
                  placeholder="e.g. Sunday Cardiology Camp Schedule"
                  className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Message *</label>
                <textarea
                  rows={3}
                  required
                  value={bcMessage}
                  onChange={(e) => setBcMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#123B67] text-white font-semibold"
              >
                Send Broadcast Notification
              </button>
            </form>
          )}

          {/* 17 & 18. REPORTS & ANALYTICS */}
          {(activeTab === 'reports' || activeTab === 'analytics') && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-6 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-display font-bold text-[#123B67]">
                  Hospital Reports &amp; Department Analytics
                </h2>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => exportCsvReport('appointments')}
                    className="px-3.5 py-2 rounded-xl bg-[#123B67] text-white font-semibold"
                  >
                    Download Appointments CSV
                  </button>
                  <button
                    onClick={() => exportCsvReport('patients')}
                    className="px-3.5 py-2 rounded-xl bg-[#1685B8] text-white font-semibold"
                  >
                    Download Patients CSV
                  </button>
                  <button
                    onClick={() => exportCsvReport('doctors')}
                    className="px-3.5 py-2 rounded-xl bg-[#19B7A5] text-white font-semibold"
                  >
                    Download Doctors CSV
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-sm text-[#123B67]">
                  Department Activity Breakdown
                </h3>
                {overview?.departmentBreakdown.map((item) => (
                  <div
                    key={item.departmentId}
                    className="p-3.5 rounded-xl bg-[#F5F9FC] border border-slate-200 flex items-center justify-between"
                  >
                    <span className="font-semibold text-[#123B67]">{item.departmentName}</span>
                    <span className="font-mono-tabular text-slate-600">
                      {item.doctorsCount} Doctors · {item.appointmentsCount} Appointments
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 19. WEBSITE SETTINGS (Editable Hospital Name, Phones, Hours, Address) */}
          {activeTab === 'settings' && (
            <form
              onSubmit={handleSaveWebsiteSettings}
              className="bg-white rounded-2xl p-6 border border-slate-200 space-y-5 text-xs"
            >
              <h2 className="text-xl font-display font-bold text-[#123B67]">
                Editable Hospital Branding &amp; Contact Settings
              </h2>

              {/* Official Logo Preview & Custom Image Upload */}
              <div className="p-4 rounded-xl bg-[#F5F9FC] border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <p className="font-bold text-[#123B67]">
                    Official Gokul Hospital Logo Asset (/assets/branding/gokul-hospital-logo.png)
                  </p>
                  <p className="text-slate-600">
                    Displayed across the main header, footer, login pages, dashboards, and printable receipts. You can also upload your exact logo PNG/JPG file here to update all pages immediately.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <label className="px-3.5 py-2 rounded-lg bg-[#123B67] hover:bg-[#1685B8] text-white font-semibold cursor-pointer">
                      <span>Upload Official Logo Image</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/svg+xml,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => {
                            if (typeof reader.result === 'string') {
                              window.localStorage.setItem(CUSTOM_LOGO_STORAGE_KEY, reader.result);
                              window.dispatchEvent(new Event('gokul-logo-updated'));
                              showToast('Official Gokul Hospital logo updated across all pages!', 'success');
                            }
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        window.localStorage.removeItem(CUSTOM_LOGO_STORAGE_KEY);
                        window.dispatchEvent(new Event('gokul-logo-updated'));
                        showToast('Reset to default /assets/branding/gokul-hospital-logo asset.', 'info');
                      }}
                      className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-white font-semibold"
                    >
                      Reset Default Asset
                    </button>
                  </div>
                </div>
                <div className="shrink-0">
                  <GokulHospitalLogo variant="full" size="md" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Official Hospital Name</label>
                  <input
                    type="text"
                    value={formSettings.hospitalName || ''}
                    onChange={(e) =>
                      setFormSettings({ ...formSettings, hospitalName: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Hero Headline</label>
                  <input
                    type="text"
                    value={formSettings.heroHeadline || ''}
                    onChange={(e) =>
                      setFormSettings({ ...formSettings, heroHeadline: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={formSettings.contactPhone || ''}
                    onChange={(e) =>
                      setFormSettings({ ...formSettings, contactPhone: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">24/7 Emergency Phone</label>
                  <input
                    type="text"
                    value={formSettings.emergencyPhone || ''}
                    onChange={(e) =>
                      setFormSettings({ ...formSettings, emergencyPhone: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Official Email Address</label>
                  <input
                    type="email"
                    value={formSettings.emailAddress || ''}
                    onChange={(e) =>
                      setFormSettings({ ...formSettings, emailAddress: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">OPD Opening Hours</label>
                  <input
                    type="text"
                    value={formSettings.opdHours || ''}
                    onChange={(e) =>
                      setFormSettings({ ...formSettings, opdHours: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1">Hospital Address Line</label>
                  <input
                    type="text"
                    value={formSettings.addressLine1 || ''}
                    onChange={(e) =>
                      setFormSettings({ ...formSettings, addressLine1: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#F5F9FC] border border-slate-300 rounded-xl"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#123B67] text-white font-semibold"
              >
                Save &amp; Publish Website Settings
              </button>
            </form>
          )}

          {/* 22. AUDIT LOGS */}
          {activeTab === 'audit-logs' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 text-xs">
              <h2 className="text-xl font-display font-bold text-[#123B67]">
                Security &amp; Database Audit Logs ({auditLogs.length})
              </h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-[#F5F9FC] border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <span className="font-mono-tabular font-bold text-[#123B67]">
                        [{log.action}]
                      </span>{' '}
                      <span className="font-semibold">{log.actorName}</span> ({log.actorRole}) —{' '}
                      <span className="text-slate-600">{log.details}</span>
                    </div>
                    <span className="font-mono-tabular text-slate-400 shrink-0">
                      {log.createdAt.slice(0, 19).replace('T', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
