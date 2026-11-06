import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Phone,
  Mail,
  Clock,
  Menu,
  X,
  Search,
  UserCheck,
  MessageSquare,
  Send,
  AlertTriangle,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext.tsx';
import { BrandLogo } from '../components/BrandLogo.tsx';
import { apiRequest } from '../services/api.ts';

export function usePageSeo(title: string, description?: string) {
  useEffect(() => {
    document.title = `${title} | Gokul Hospital`;
    if (description) {
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', description);
    }
  }, [title, description]);
}

export function getDashboardPathForRole(role?: string) {
  switch (role) {
    case 'admin':
      return '/admin-dashboard';
    case 'doctor':
      return '/doctor-dashboard';
    case 'receptionist':
      return '/receptionist-dashboard';
    default:
      return '/patient-dashboard';
  }
}

export function PublicLayout({ children }: { children?: React.ReactNode }) {
  const { settings, user, logout, toasts, dismissToast } = useHospital();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantInput, setAssistantInput] = useState('');
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantMessages, setAssistantMessages] = useState<
    { sender: 'user' | 'assistant'; text: string }[]
  >([
    {
      sender: 'assistant',
      text: 'Hello! I am the Gokul Hospital Information Assistant. Ask me about our 15 medical departments, doctor timings, OPD hours, or how to book an appointment. Note: I do not provide medical diagnosis or emergency advice.',
    },
  ]);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchOpen(false);
  };

  const handleAskAssistant = async (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = assistantInput.trim();
    if (!prompt || assistantLoading) return;

    setAssistantMessages((prev) => [...prev, { sender: 'user', text: prompt }]);
    setAssistantInput('');
    setAssistantLoading(true);

    try {
      const res = await apiRequest<{ reply: string }>('/api/ai/assistant', {
        method: 'POST',
        body: JSON.stringify({ message: prompt }),
      });
      setAssistantMessages((prev) => [...prev, { sender: 'assistant', text: res.reply }]);
    } catch (err) {
      setAssistantMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text:
            err instanceof Error
              ? err.message
              : 'Unable to reach assistant. Please browse our Departments or Contact page directly.',
        },
      ]);
    } finally {
      setAssistantLoading(false);
    }
  };

  const hospitalName = settings?.hospitalName || 'GOKUL HOSPITAL';
  const contactPhone = settings?.contactPhone || '+91-00000-00000';
  const emergencyPhone = settings?.emergencyPhone || '108 / +91-00000-10800';
  const emailAddress = settings?.emailAddress || 'info@gokulhospital.example.in';
  const opdHours = settings?.opdHours || 'Mon – Sat: 08:30 AM – 08:00 PM';

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#F5F9FC] text-[#243447]">
      {/* Toast Notifications */}
      {toasts.length > 0 && (
        <div
          className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-md w-full px-4 pointer-events-none"
          role="region"
          aria-label="System Notifications"
        >
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl shadow-xl border text-sm sm:text-base font-medium transition-all ${
                t.type === 'error'
                  ? 'bg-red-950 text-white border-red-800'
                  : t.type === 'success'
                  ? 'bg-[#123B67] text-white border-[#19B7A5]'
                  : 'bg-slate-900 text-white border-slate-700'
              }`}
            >
              <span>{t.title}</span>
              <button
                onClick={() => dismissToast(t.id)}
                className="text-white/75 hover:text-white p-1"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Top Information Utility Strip (Desktop) */}
      <div className="hidden lg:block bg-[#123B67] text-white/95 text-[13px] border-b border-white/10">
        <div className="hospital-container py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-5 truncate">
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <Phone className="w-4 h-4 text-[#19B7A5]" />
              <span>Reception: {contactPhone}</span>
            </span>
            <span aria-hidden="true" className="text-white/40">·</span>
            <Link
              to="/emergency"
              className="inline-flex items-center gap-1.5 text-[#19B7A5] font-bold hover:underline whitespace-nowrap"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>24/7 Emergency: {emergencyPhone}</span>
            </Link>
            <span aria-hidden="true" className="text-white/40">·</span>
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <Mail className="w-4 h-4 text-[#19B7A5]" />
              <span>{emailAddress}</span>
            </span>
            <span aria-hidden="true" className="text-white/40">·</span>
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <Clock className="w-4 h-4 text-[#19B7A5]" />
              <span>{opdHours}</span>
            </span>
          </div>

          <div className="flex items-center gap-4 shrink-0 font-medium">
            <Link to="/about" className="hover:text-[#19B7A5] transition-colors whitespace-nowrap">
              About Us
            </Link>
            <Link to="/facilities" className="hover:text-[#19B7A5] transition-colors whitespace-nowrap">
              Facilities
            </Link>
            <Link to="/health-packages" className="hover:text-[#19B7A5] transition-colors whitespace-nowrap">
              Health Packages
            </Link>
            <Link to="/blogs" className="hover:text-[#19B7A5] transition-colors whitespace-nowrap">
              Health Blog
            </Link>
            <Link to="/contact" className="hover:text-[#19B7A5] transition-colors whitespace-nowrap">
              Contact Us
            </Link>
            <button
              onClick={() => setSearchOpen((prev) => !prev)}
              className="inline-flex items-center gap-1 text-white/95 hover:text-[#19B7A5] whitespace-nowrap cursor-pointer"
              aria-label="Search Gokul Hospital"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
            <span aria-hidden="true" className="text-white/30">|</span>
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={getDashboardPathForRole(user.role)}
                  className="inline-flex items-center gap-1.5 text-[#19B7A5] font-bold hover:underline whitespace-nowrap"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{user.role.toUpperCase()} Portal ({user.fullName.split(' ')[0]})</span>
                </Link>
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-1 text-white/80 hover:text-white whitespace-nowrap cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3.5">
                <Link
                  to="/login"
                  className="font-semibold text-white hover:text-[#19B7A5] transition-colors whitespace-nowrap"
                >
                  Patient Login
                </Link>
                <Link
                  to="/register"
                  className="font-bold text-[#19B7A5] hover:underline whitespace-nowrap"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Primary Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <div className="hospital-container h-20 flex items-center justify-between gap-6">
          {/* Zone 1: Official Gokul Hospital Brand Logo */}
          <Link to="/" className="whitespace-nowrap shrink-0 focus:outline-none">
            <BrandLogo hospitalName={hospitalName} size="md" />
          </Link>

          {/* Zone 2: Primary Navigation Links */}
          <nav
            className="hidden md:flex items-center gap-7 text-[15px] font-semibold text-[#243447]"
            aria-label="Main Navigation"
          >
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `py-1.5 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                  isActive
                    ? 'border-[#123B67] text-[#123B67] font-bold'
                    : 'border-transparent hover:text-[#1685B8]'
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/departments"
              className={({ isActive }) =>
                `py-1.5 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                  isActive
                    ? 'border-[#123B67] text-[#123B67] font-bold'
                    : 'border-transparent hover:text-[#1685B8]'
                }`
              }
            >
              Departments
            </NavLink>
            <NavLink
              to="/doctors"
              className={({ isActive }) =>
                `py-1.5 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                  isActive
                    ? 'border-[#123B67] text-[#123B67] font-bold'
                    : 'border-transparent hover:text-[#1685B8]'
                }`
              }
            >
              Our Doctors
            </NavLink>
            <NavLink
              to="/services"
              className={({ isActive }) =>
                `py-1.5 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                  isActive
                    ? 'border-[#123B67] text-[#123B67] font-bold'
                    : 'border-transparent hover:text-[#1685B8]'
                }`
              }
            >
              Medical Services
            </NavLink>
            <NavLink
              to="/appointment"
              className={({ isActive }) =>
                `py-1.5 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                  isActive
                    ? 'border-[#123B67] text-[#123B67] font-bold'
                    : 'border-transparent hover:text-[#1685B8]'
                }`
              }
            >
              Appointment
            </NavLink>
          </nav>

          {/* Zone 3: Primary Action CTA */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/appointment"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-[15px] font-bold text-white bg-[#123B67] hover:bg-[#1685B8] rounded-xl transition-all whitespace-nowrap shrink-0 shadow-sm hover:shadow-md"
            >
              <Calendar className="w-4 h-4 text-[#19B7A5]" />
              <span>Book Appointment</span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2.5 rounded-xl text-[#123B67] hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Expandable Global Search Bar */}
        {searchOpen && (
          <div className="border-t border-slate-200 bg-[#EAF5FC]/70 py-3.5">
            <div className="hospital-container">
              <form
                onSubmit={handleGlobalSearch}
                className="max-w-4xl mx-auto flex items-center gap-2.5"
              >
                <Search className="w-5 h-5 text-[#123B67] shrink-0" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search doctors, 15+ medical departments (Cardiology, Pediatrics...), services, or health packages..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-[15px] focus:outline-none focus:border-[#1685B8]"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#123B67] text-white text-[15px] font-bold rounded-xl hover:bg-[#1685B8] whitespace-nowrap shrink-0"
                >
                  Search Directory
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Mobile Drawer Navigation (All 10 Menu Links + Login/Register) */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-5 space-y-4 shadow-2xl">
            <form onSubmit={handleGlobalSearch} className="flex items-center gap-2">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search doctors, departments..."
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-[15px]"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-[#123B67] text-white text-[15px] font-bold rounded-xl"
              >
                Go
              </button>
            </form>
            <div className="grid grid-cols-2 gap-2.5 text-[15px] font-semibold">
              <Link to="/" className="px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-[#EAF5FC] text-[#123B67]">
                Home
              </Link>
              <Link to="/about" className="px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-[#EAF5FC] text-[#123B67]">
                About Us
              </Link>
              <Link to="/departments" className="px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-[#EAF5FC] text-[#123B67]">
                Departments
              </Link>
              <Link to="/doctors" className="px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-[#EAF5FC] text-[#123B67]">
                Our Doctors
              </Link>
              <Link to="/services" className="px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-[#EAF5FC] text-[#123B67]">
                Medical Services
              </Link>
              <Link to="/facilities" className="px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-[#EAF5FC] text-[#123B67]">
                Facilities
              </Link>
              <Link to="/health-packages" className="px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-[#EAF5FC] text-[#123B67]">
                Health Packages
              </Link>
              <Link to="/appointment" className="px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-[#EAF5FC] text-[#123B67]">
                Appointment
              </Link>
              <Link to="/blogs" className="px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-[#EAF5FC] text-[#123B67]">
                Health Blog
              </Link>
              <Link to="/contact" className="px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-[#EAF5FC] text-[#123B67]">
                Contact Us
              </Link>
            </div>
            <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
              {user ? (
                <>
                  <Link
                    to={getDashboardPathForRole(user.role)}
                    className="flex-1 text-center px-4 py-2.5 bg-[#19B7A5] text-[#123B67] rounded-xl text-[15px] font-bold"
                  >
                    Open {user.role.toUpperCase()} Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="px-4 py-2.5 border border-slate-300 rounded-xl text-[15px] font-semibold"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex-1 text-center px-4 py-2.5 border border-[#123B67] text-[#123B67] rounded-xl text-[15px] font-bold"
                  >
                    Patient Login
                  </Link>
                  <Link
                    to="/register"
                    className="flex-1 text-center px-4 py-2.5 bg-[#1685B8] text-white rounded-xl text-[15px] font-bold"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full">{children ?? <Outlet />}</main>

      {/* Hospital Information Assistant Floating Widget */}
      <div className="fixed bottom-5 right-5 z-40">
        {assistantOpen ? (
          <div className="w-88 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="bg-[#123B67] text-white px-4 py-3.5 flex items-center justify-between">
              <div>
                <h4 className="text-base font-display font-bold">Gokul Hospital Guide</h4>
                <p className="text-xs text-white/80">
                  Department &amp; Appointment Navigation
                </p>
              </div>
              <button
                onClick={() => setAssistantOpen(false)}
                className="text-white/80 hover:text-white p-1"
                aria-label="Close hospital guide"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-amber-50 border-b border-amber-200 px-3.5 py-2 text-xs text-amber-900">
              <strong>Medical Disclaimer:</strong> Does not diagnose conditions or prescribe medicine. For emergencies, call <strong>{emergencyPhone}</strong>.
            </div>

            <div className="p-4 h-68 overflow-y-auto space-y-3 bg-slate-50 text-sm">
              {assistantMessages.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl leading-relaxed whitespace-pre-line ${
                    m.sender === 'user'
                      ? 'bg-[#123B67] text-white ml-8'
                      : 'bg-white border border-slate-200 text-[#243447] mr-4'
                  }`}
                >
                  {m.text}
                </div>
              ))}
              {assistantLoading && (
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-slate-500 text-sm">
                  Checking Gokul Hospital directory...
                </div>
              )}
            </div>

            <form
              onSubmit={handleAskAssistant}
              className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
            >
              <input
                type="text"
                value={assistantInput}
                onChange={(e) => setAssistantInput(e.target.value)}
                placeholder="Ask about departments, timings, booking..."
                className="flex-1 text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#1685B8]"
              />
              <button
                type="submit"
                disabled={assistantLoading}
                className="p-2.5 bg-[#123B67] text-white rounded-xl hover:bg-[#1685B8] disabled:opacity-50"
                aria-label="Send question"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <button
            onClick={() => setAssistantOpen(true)}
            className="inline-flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-[#123B67] hover:bg-[#1685B8] text-white text-sm font-bold shadow-xl transition-all border border-white/15 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-[#19B7A5]" />
            <span>Hospital Help Guide</span>
          </button>
        )}
      </div>

      {/* Comprehensive Wide Footer */}
      <footer className="bg-[#123B67] text-white border-t border-white/10 mt-20">
        <div className="hospital-container py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            {/* Column 1: Brand & Contact */}
            <div className="lg:col-span-2 space-y-4">
              <BrandLogo hospitalName={hospitalName} light size="md" />
              <p className="text-[15px] text-white/85 max-w-md leading-relaxed">
                {settings?.aboutSummary ||
                  'Multi-Specialty Hospital and Healthcare Management System providing ethical, patient-focused outpatient, inpatient, surgical, diagnostic, and 24/7 emergency care in India.'}
              </p>
              <div className="text-sm text-white/85 space-y-2 pt-1">
                <p>
                  <strong className="text-white">Address:</strong> {settings?.addressLine1},{' '}
                  {settings?.cityStatePin}
                </p>
                <p>
                  <strong className="text-white">Reception:</strong> {contactPhone} ·{' '}
                  <strong className="text-[#19B7A5]">Emergency:</strong> {emergencyPhone}
                </p>
                <p>
                  <strong className="text-white">Email:</strong> {emailAddress}
                </p>
              </div>
            </div>

            {/* Column 2: Quick Navigation */}
            <div>
              <h3 className="text-base font-display font-bold text-white mb-4">
                Hospital Pages
              </h3>
              <ul className="space-y-2.5 text-sm text-white/80">
                <li><Link to="/about" className="hover:text-[#19B7A5] transition-colors">About Gokul Hospital</Link></li>
                <li><Link to="/overview" className="hover:text-[#19B7A5] transition-colors">Hospital Overview</Link></li>
                <li><Link to="/mission-vision" className="hover:text-[#19B7A5] transition-colors">Mission &amp; Vision</Link></li>
                <li><Link to="/doctors" className="hover:text-[#19B7A5] transition-colors">Our Doctors Directory</Link></li>
                <li><Link to="/find-doctor" className="hover:text-[#19B7A5] transition-colors">Find a Doctor</Link></li>
                <li><Link to="/departments" className="hover:text-[#19B7A5] transition-colors">Medical Departments</Link></li>
                <li><Link to="/services" className="hover:text-[#19B7A5] transition-colors">Medical Services</Link></li>
                <li><Link to="/facilities" className="hover:text-[#19B7A5] transition-colors">Hospital Facilities</Link></li>
                <li><Link to="/emergency" className="hover:text-[#19B7A5] transition-colors">24/7 Emergency Care</Link></li>
              </ul>
            </div>

            {/* Column 3: Patient Resources */}
            <div>
              <h3 className="text-base font-display font-bold text-white mb-4">
                Patient Services
              </h3>
              <ul className="space-y-2.5 text-sm text-white/80">
                <li><Link to="/appointment" className="hover:text-[#19B7A5] transition-colors">Book Appointment</Link></li>
                <li><Link to="/health-packages" className="hover:text-[#19B7A5] transition-colors">Health Checkup Packages</Link></li>
                <li><Link to="/testimonials" className="hover:text-[#19B7A5] transition-colors">Patient Testimonials</Link></li>
                <li><Link to="/gallery" className="hover:text-[#19B7A5] transition-colors">Hospital Gallery</Link></li>
                <li><Link to="/blogs" className="hover:text-[#19B7A5] transition-colors">Health Blog &amp; Articles</Link></li>
                <li><Link to="/faq" className="hover:text-[#19B7A5] transition-colors">Frequently Asked Questions</Link></li>
                <li><Link to="/contact" className="hover:text-[#19B7A5] transition-colors">Contact &amp; Directions</Link></li>
                <li><Link to="/search" className="hover:text-[#19B7A5] transition-colors">Search Hospital Directory</Link></li>
              </ul>
            </div>

            {/* Column 4: Portals & Legal Policies */}
            <div>
              <h3 className="text-base font-display font-bold text-white mb-4">
                Portals &amp; Governance
              </h3>
              <ul className="space-y-2.5 text-sm text-white/80">
                <li>
                  <Link to="/patient-dashboard" className="hover:text-[#19B7A5] inline-flex items-center gap-1 transition-colors">
                    <span>Patient Dashboard</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </li>
                <li>
                  <Link to="/doctor-dashboard" className="hover:text-[#19B7A5] inline-flex items-center gap-1 transition-colors">
                    <span>Doctor Dashboard</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </li>
                <li>
                  <Link to="/receptionist-dashboard" className="hover:text-[#19B7A5] inline-flex items-center gap-1 transition-colors">
                    <span>Receptionist Portal</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </li>
                <li>
                  <Link to="/admin-dashboard" className="hover:text-[#19B7A5] inline-flex items-center gap-1 transition-colors">
                    <span>Admin Console</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </li>
                <li className="pt-2 border-t border-white/10">
                  <Link to="/privacy-policy" className="hover:text-[#19B7A5] transition-colors">Privacy Policy</Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-[#19B7A5] transition-colors">Terms &amp; Conditions</Link>
                </li>
                <li>
                  <Link to="/cancellation-policy" className="hover:text-[#19B7A5] transition-colors">Cancellation &amp; Refund Policy</Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-white/75">
            <p>
              © {new Date().getFullYear()} <strong>GOKUL HOSPITAL</strong>. All rights reserved. Currency: INR (₹).
            </p>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#19B7A5] shrink-0" />
              <span>
                Editable demonstration contact details &amp; profiles — configurable via Admin Dashboard.
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
