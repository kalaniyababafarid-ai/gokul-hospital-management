/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { HospitalProvider } from './context/HospitalContext';
import { PublicLayout } from './layouts/PublicLayout';
import { HomePage } from './pages/HomePage';
import {
  DepartmentsPage,
  DepartmentDetailPage,
  DoctorsPage,
  DoctorProfilePage,
} from './pages/DirectoryPages';
import { AppointmentPage } from './pages/AppointmentPage';
import {
  AboutPage,
  OverviewPage,
  MissionVisionPage,
  ServicesPage,
  FacilitiesPage,
  EmergencyPage,
  HealthPackagesPage,
  TestimonialsPage,
  GalleryPage,
  BlogsPage,
  BlogDetailPage,
  FaqPage,
  ContactPage,
  SearchResultsPage,
  PrivacyPolicyPage,
  TermsPage,
  CancellationPolicyPage,
  UnauthorizedPage,
  NotFoundPage,
} from './pages/PublicPages';
import {
  ProtectedRoute,
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
} from './pages/AuthPages';
import { PatientDashboard } from './pages/PatientDashboard';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { ReceptionistDashboard } from './pages/ReceptionistDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <HospitalProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Public Website Routes & Route Aliases */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/overview" element={<OverviewPage />} />
            <Route path="/mission-vision" element={<MissionVisionPage />} />
            <Route path="/departments" element={<DepartmentsPage />} />
            <Route path="/departments/:slug" element={<DepartmentDetailPage />} />
            <Route path="/doctors" element={<DoctorsPage />} />
            <Route path="/find-doctor" element={<DoctorsPage />} />
            <Route path="/doctors/:slug" element={<DoctorProfilePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/facilities" element={<FacilitiesPage />} />
            <Route path="/emergency" element={<EmergencyPage />} />
            <Route path="/appointment" element={<AppointmentPage />} />
            <Route path="/book-appointment" element={<AppointmentPage />} />
            <Route path="/appointments" element={<AppointmentPage />} />
            <Route path="/packages" element={<HealthPackagesPage />} />
            <Route path="/health-packages" element={<HealthPackagesPage />} />
            <Route path="/testimonials" element={<TestimonialsPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/blogs" element={<BlogsPage />} />
            <Route path="/blog" element={<BlogsPage />} />
            <Route path="/blogs/:slug" element={<BlogDetailPage />} />
            <Route path="/blog/:slug" element={<BlogDetailPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/faqs" element={<FaqPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms-and-conditions" element={<TermsPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/cancellation-policy" element={<CancellationPolicyPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Role-Protected Hospital Management Portals (Both /role and /role-dashboard paths) */}
            <Route
              path="/patient"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <PatientDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient-dashboard"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <PatientDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor"
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor-dashboard"
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/receptionist"
              element={
                <ProtectedRoute allowedRoles={['receptionist']}>
                  <ReceptionistDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/receptionist-dashboard"
              element={
                <ProtectedRoute allowedRoles={['receptionist']}>
                  <ReceptionistDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </HospitalProvider>
  );
}
