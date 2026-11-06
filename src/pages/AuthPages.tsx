import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  UserPlus,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  FileText,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext.tsx';
import { apiRequest } from '../services/api.ts';
import type { UserAccount, UserRole } from '../types/hospital.ts';
import { getDashboardPathForRole, usePageSeo } from '../layouts/PublicLayout.tsx';
import { GokulHospitalLogo } from '../components/BrandLogo.tsx';

export function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}) {
  const { user, isLoadingAuth } = useHospital();

  if (isLoadingAuth) {
    return (
      <div className="hospital-container py-20 flex flex-col items-center justify-center gap-4 text-center text-base text-slate-600">
        <GokulHospitalLogo variant="full" size="md" />
        <span>Verifying Gokul Hospital session &amp; permissions...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

export function LoginPage() {
  const { loginWithToken, showToast, user } = useHospital();
  const navigate = useNavigate();

  usePageSeo('Patient & Staff Portal Login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (user) {
    return <Navigate to={getDashboardPathForRole(user.role)} replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiRequest<{ token: string; user: UserAccount }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      loginWithToken(res.token, res.user, remember);
      showToast(`Welcome back, ${res.user.fullName}!`, 'success');
      navigate(getDashboardPathForRole(res.user.role));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="hospital-container py-12 sm:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 space-y-6 shadow-xs">
          <div className="space-y-3 border-b border-slate-100 pb-5">
            <GokulHospitalLogo variant="full" size="md" />
            <div className="space-y-1.5">
              <p className="text-xs sm:text-sm font-bold text-[#1685B8] uppercase tracking-wider">
                Gokul Hospital · Secure Portal Access
              </p>
              <h1 className="text-3xl font-display font-extrabold text-[#123B67]">
                Sign In to Your Account
              </h1>
              <p className="text-[15px] text-slate-600">
                Access your Patient Portal, Doctor Dashboard, Receptionist Desk, or Hospital Admin Console.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-900 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-[#123B67] mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  className="w-full pl-11 pr-4 py-3 bg-[#F5F9FC] border border-slate-300 rounded-xl text-[15px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#123B67] mb-1.5">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-11 py-3 bg-[#F5F9FC] border border-slate-300 rounded-xl text-[15px]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm pt-1">
              <label className="inline-flex items-center gap-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded border-slate-300 text-[#123B67]"
                />
                <span>Remember session securely</span>
              </label>
              <Link to="/forgot-password" className="font-bold text-[#1685B8] hover:underline">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#123B67] hover:bg-[#1685B8] text-white font-display font-bold text-base transition-colors cursor-pointer"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-200 text-sm text-slate-600 flex items-center justify-between">
            <span>New patient at Gokul Hospital?</span>
            <Link to="/register" className="font-bold text-[#123B67] hover:underline">
              Create Patient Account →
            </Link>
          </div>
        </div>

        {/* Role Portal Verification Credentials Helper */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-4 shadow-xs">
          <div className="flex items-center gap-2.5 text-[#123B67]">
            <ShieldCheck className="w-6 h-6 text-[#19B7A5]" />
            <h2 className="text-xl font-display font-bold">
              Pre-Configured Portal Accounts
            </h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Click any role below to auto-fill verified credentials and test the corresponding role-protected portal:
          </p>

          <div className="space-y-3 text-sm">
            <button
              type="button"
              onClick={() => fillDemoCredentials('patient@gokulhospital.in', 'Patient@123')}
              className="w-full text-left p-4 rounded-2xl bg-[#F5F9FC] hover:bg-[#EAF5FC] border border-slate-200 flex items-center justify-between transition-colors cursor-pointer"
            >
              <div>
                <p className="font-bold text-[#123B67]">1. Patient Portal (Aarav Patel)</p>
                <p className="text-xs text-slate-500 font-mono-tabular mt-0.5">
                  patient@gokulhospital.in · Patient@123
                </p>
              </div>
              <span className="text-[#1685B8] font-bold">Fill</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemoCredentials('dr.sharma@gokulhospital.in', 'Doctor@123')}
              className="w-full text-left p-4 rounded-2xl bg-[#F5F9FC] hover:bg-[#EAF5FC] border border-slate-200 flex items-center justify-between transition-colors cursor-pointer"
            >
              <div>
                <p className="font-bold text-[#123B67]">2. Doctor Portal (Dr. Rajeshwar Sharma)</p>
                <p className="text-xs text-slate-500 font-mono-tabular mt-0.5">
                  dr.sharma@gokulhospital.in · Doctor@123
                </p>
              </div>
              <span className="text-[#1685B8] font-bold">Fill</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemoCredentials('reception@gokulhospital.in', 'Reception@123')}
              className="w-full text-left p-4 rounded-2xl bg-[#F5F9FC] hover:bg-[#EAF5FC] border border-slate-200 flex items-center justify-between transition-colors cursor-pointer"
            >
              <div>
                <p className="font-bold text-[#123B67]">3. Receptionist Desk (Anjali Verma)</p>
                <p className="text-xs text-slate-500 font-mono-tabular mt-0.5">
                  reception@gokulhospital.in · Reception@123
                </p>
              </div>
              <span className="text-[#1685B8] font-bold">Fill</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemoCredentials('admin@gokulhospital.in', 'Admin@123')}
              className="w-full text-left p-4 rounded-2xl bg-[#F5F9FC] hover:bg-[#EAF5FC] border border-slate-200 flex items-center justify-between transition-colors cursor-pointer"
            >
              <div>
                <p className="font-bold text-[#123B67]">4. Hospital Admin Console</p>
                <p className="text-xs text-slate-500 font-mono-tabular mt-0.5">
                  admin@gokulhospital.in · Admin@123
                </p>
              </div>
              <span className="text-[#1685B8] font-bold">Fill</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const { loginWithToken, showToast, user } = useHospital();
  const navigate = useNavigate();

  usePageSeo('Patient Registration');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (user) {
    return <Navigate to={getDashboardPathForRole(user.role)} replace />;
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Password and Confirm Password do not match.');
      return;
    }
    setLoading(true);
    try {
      const res = await apiRequest<{ token: string; user: UserAccount }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName,
          email,
          phone,
          password,
          confirmPassword,
          dateOfBirth,
          gender,
          address,
          privacyConsent,
          termsAccepted,
        }),
      });
      loginWithToken(res.token, res.user, true);
      showToast('Patient account registered! Welcome to Gokul Hospital.', 'success');
      navigate('/patient-dashboard');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hospital-container py-12 sm:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 space-y-6 shadow-xs">
          <div className="space-y-3 border-b border-slate-100 pb-5">
            <GokulHospitalLogo variant="full" size="md" />
            <div className="space-y-1.5">
              <p className="text-xs sm:text-sm font-bold text-[#1685B8] uppercase tracking-wider">
                Gokul Hospital · Patient Portal Onboarding
              </p>
              <h1 className="text-3xl font-display font-extrabold text-[#123B67] flex items-center gap-2.5">
                <UserPlus className="w-7 h-7 text-[#19B7A5]" />
                <span>Create Your Patient Account</span>
              </h1>
              <p className="text-[15px] text-slate-600">
                Register once to book appointments faster and view your prescriptions, lab reports, and medical history securely.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-900 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-[#123B67] mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter full name"
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
                  placeholder="you@example.com"
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
                  placeholder="+91-98765-43210"
                  className="w-full px-4 py-3 bg-[#F5F9FC] border border-slate-300 rounded-xl text-[15px]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#123B67] mb-1.5">
                  Date of Birth (Optional)
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F5F9FC] border border-slate-300 rounded-xl text-[15px]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#123B67] mb-1.5">
                  Password (Min 8 characters) *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F5F9FC] border border-slate-300 rounded-xl text-[15px]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#123B67] mb-1.5">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F5F9FC] border border-slate-300 rounded-xl text-[15px]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#123B67] mb-1.5">
                  Gender (Optional)
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F5F9FC] border border-slate-300 rounded-xl text-[15px]"
                >
                  <option value="">Prefer not to say</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#123B67] mb-1.5">
                  Residential Address (Optional)
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="City / Locality"
                  className="w-full px-4 py-3 bg-[#F5F9FC] border border-slate-300 rounded-xl text-[15px]"
                />
              </div>
            </div>

            <div className="space-y-2.5 pt-2 text-sm text-slate-700">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={privacyConsent}
                  onChange={(e) => setPrivacyConsent(e.target.checked)}
                  className="mt-1 rounded border-slate-300"
                />
                <span>
                  I have read and accept the{' '}
                  <Link to="/privacy-policy" className="text-[#1685B8] font-bold underline">
                    Privacy Policy
                  </Link>{' '}
                  and consent to Gokul Hospital storing my clinical records securely. *
                </span>
              </label>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 rounded border-slate-300"
                />
                <span>
                  I accept the{' '}
                  <Link to="/terms" className="text-[#1685B8] font-bold underline">
                    Terms and Conditions
                  </Link>{' '}
                  of Gokul Hospital. *
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#123B67] hover:bg-[#1685B8] text-white font-display font-bold text-base transition-colors cursor-pointer"
            >
              {loading ? 'Creating Patient Account...' : 'Complete Patient Registration'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-5 shadow-xs">
          <h2 className="text-xl font-display font-bold text-[#123B67]">
            Patient Portal Benefits
          </h2>
          <ul className="space-y-3.5 text-sm text-slate-600">
            <li className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-[#1685B8] shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#123B67] block">1-Click OPD Scheduling</strong>
                Pre-filled patient details and real-time slot rescheduling.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-[#19B7A5] shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#123B67] block">Digital Prescriptions &amp; Reports</strong>
                Access verified clinical notes and downloadable diagnostic reports 24/7.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#123B67] shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#123B67] block">Strict Role-Based Privacy</strong>
                Your medical records are encrypted and visible only to you and your assigned doctor.
              </span>
            </li>
          </ul>
          <div className="pt-3 border-t border-slate-100 text-sm">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-[#1685B8] hover:underline">
              Sign in here →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ForgotPasswordPage() {
  const { showToast } = useHospital();
  usePageSeo('Forgot Password');
  const [email, setEmail] = useState('');
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiRequest<{ message: string; resetToken?: string }>(
        '/api/auth/forgot-password',
        {
          method: 'POST',
          body: JSON.stringify({ email }),
        }
      );
      setMessage(res.message);
      setGeneratedToken(res.resetToken || null);
      showToast('Password reset verification code generated.', 'info');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error requesting reset.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hospital-container py-12 sm:py-16">
      <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 space-y-6 shadow-xs">
        <div className="space-y-3 border-b border-slate-100 pb-4">
          <GokulHospitalLogo variant="full" size="sm" />
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[#123B67] flex items-center gap-2">
              <KeyRound className="w-6 h-6 text-[#1685B8]" />
              <span>Forgot Password</span>
            </h1>
            <p className="text-sm text-slate-600">
              Enter your registered email address to generate a password reset token.
            </p>
          </div>
        </div>

        <form onSubmit={handleRequestReset} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#123B67] mb-1.5">
              Registered Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#F5F9FC] border border-slate-300 rounded-xl text-[15px]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#123B67] text-white text-base font-bold cursor-pointer"
          >
            {loading ? 'Generating Reset Token...' : 'Request Password Reset'}
          </button>
        </form>

        {message && (
          <div className="p-5 rounded-2xl bg-[#F5F9FC] border border-slate-200 space-y-2.5 text-sm">
            <p className="text-slate-700">{message}</p>
            {generatedToken && (
              <div className="p-3.5 bg-white rounded-xl border border-slate-300 font-mono-tabular">
                Reset Token: <strong className="text-[#123B67]">{generatedToken}</strong>
              </div>
            )}
            <Link
              to={`/reset-password${generatedToken ? `?token=${generatedToken}` : ''}`}
              className="inline-block font-bold text-[#1685B8] hover:underline pt-1"
            >
              Proceed to Reset Password Page →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export function ResetPasswordPage() {
  const { showToast } = useHospital();
  const navigate = useNavigate();
  usePageSeo('Reset Password');

  const params = new URLSearchParams(window.location.search);
  const [token, setToken] = useState(params.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiRequest('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      });
      showToast('Password reset complete! Please sign in.', 'success');
      navigate('/login');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Reset failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hospital-container py-12 sm:py-16">
      <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 space-y-6 shadow-xs">
        <div className="space-y-3 border-b border-slate-100 pb-4">
          <GokulHospitalLogo variant="full" size="sm" />
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[#123B67]">
            Reset Your Password
          </h1>
        </div>
        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#123B67] mb-1.5">
              Password Reset Token *
            </label>
            <input
              type="text"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="GKH-RST-..."
              className="w-full px-4 py-3 bg-[#F5F9FC] border border-slate-300 rounded-xl text-[15px] font-mono-tabular"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#123B67] mb-1.5">
              New Password (Min 8 chars) *
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#F5F9FC] border border-slate-300 rounded-xl text-[15px]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#123B67] text-white text-base font-bold cursor-pointer"
          >
            {loading ? 'Updating Password...' : 'Save New Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
