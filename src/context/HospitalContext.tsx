import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  UserAccount,
  WebsiteSettings,
  Department,
  Doctor,
  HospitalService,
  HospitalFacility,
  HealthPackage,
  TestimonialItem,
  BlogItem,
  GalleryItem,
} from '../types/hospital.ts';
import { apiRequest, getStoredToken, setStoredToken } from '../services/api.ts';

export interface ToastMessage {
  id: string;
  title: string;
  type: 'success' | 'error' | 'info';
}

interface BootstrapResponse {
  settings: WebsiteSettings;
  departments: Department[];
  doctors: Doctor[];
  services: HospitalService[];
  facilities: HospitalFacility[];
  healthPackages: HealthPackage[];
  testimonials: TestimonialItem[];
  blogs: BlogItem[];
  gallery: GalleryItem[];
  stats: {
    departmentsCount: number;
    doctorsCount: number;
    servicesCount: number;
    packagesCount: number;
  };
}

interface HospitalContextValue {
  user: UserAccount | null;
  isLoadingAuth: boolean;
  settings: WebsiteSettings | null;
  departments: Department[];
  doctors: Doctor[];
  services: HospitalService[];
  facilities: HospitalFacility[];
  healthPackages: HealthPackage[];
  testimonials: TestimonialItem[];
  blogs: BlogItem[];
  gallery: GalleryItem[];
  isLoadingBootstrap: boolean;
  toasts: ToastMessage[];
  showToast: (title: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;
  loginWithToken: (token: string, user: UserAccount, remember?: boolean) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  refreshBootstrap: () => Promise<void>;
}

const HospitalContext = createContext<HospitalContextValue | undefined>(undefined);

export function HospitalProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [services, setServices] = useState<HospitalService[]>([]);
  const [facilities, setFacilities] = useState<HospitalFacility[]>([]);
  const [healthPackages, setHealthPackages] = useState<HealthPackage[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [isLoadingBootstrap, setIsLoadingBootstrap] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((title: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, title, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refreshBootstrap = useCallback(async () => {
    try {
      const data = await apiRequest<BootstrapResponse>('/api/public/bootstrap');
      setSettings(data.settings);
      setDepartments(data.departments);
      setDoctors(data.doctors);
      setServices(data.services);
      setFacilities(data.facilities);
      setHealthPackages(data.healthPackages);
      setTestimonials(data.testimonials);
      setBlogs(data.blogs);
      setGallery(data.gallery);
    } catch (err) {
      console.error('Failed to load hospital bootstrap data:', err);
    } finally {
      setIsLoadingBootstrap(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setIsLoadingAuth(false);
      return;
    }
    try {
      const res = await apiRequest<{ user: UserAccount }>('/api/auth/me');
      setUser(res.user);
    } catch {
      setStoredToken(null);
      setUser(null);
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  useEffect(() => {
    refreshBootstrap();
    refreshUser();
  }, [refreshBootstrap, refreshUser]);

  const loginWithToken = useCallback(
    (token: string, loggedInUser: UserAccount, remember = true) => {
      setStoredToken(token, remember);
      setUser(loggedInUser);
    },
    []
  );

  const logout = useCallback(() => {
    setStoredToken(null);
    setUser(null);
    showToast('You have been logged out securely.', 'info');
  }, [showToast]);

  return (
    <HospitalContext.Provider
      value={{
        user,
        isLoadingAuth,
        settings,
        departments,
        doctors,
        services,
        facilities,
        healthPackages,
        testimonials,
        blogs,
        gallery,
        isLoadingBootstrap,
        toasts,
        showToast,
        dismissToast,
        loginWithToken,
        logout,
        refreshUser,
        refreshBootstrap,
      }}
    >
      {children}
    </HospitalContext.Provider>
  );
}

export function useHospital() {
  const ctx = useContext(HospitalContext);
  if (!ctx) throw new Error('useHospital must be used within a HospitalProvider');
  return ctx;
}
