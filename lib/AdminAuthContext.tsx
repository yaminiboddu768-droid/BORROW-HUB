'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface AdminUserSession {
  name: string;
  email: string;
  role: string;
  avatar: string;
  token: string;
  loggedInAt: string;
}

interface AdminAuthContextType {
  isAuthenticated: boolean;
  adminUser: AdminUserSession | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'borrowhub_admin_session';

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [adminUser, setAdminUser] = useState<AdminUserSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check localStorage on mount
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setAdminUser(parsed);
      }
    } catch (e) {
      console.error('Failed to load admin session', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    // Demo validation rules: accepts admin@borrowhub.com / admin123 or any valid credentials in demo
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (!cleanEmail || !cleanPass) {
      return { success: false, error: 'Please fill in both email and password.' };
    }

    if (cleanPass.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters long.' };
    }

    const sessionData: AdminUserSession = {
      name: 'Super Admin',
      email: cleanEmail || 'admin@borrowhub.com',
      role: 'Head of Operations & Governance',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200',
      token: 'adm_token_' + Date.now(),
      loggedInAt: new Date().toISOString(),
    };

    setAdminUser(sessionData);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sessionData));
    } catch (e) {
      console.error('Failed to persist admin session', e);
    }

    return { success: true };
  };

  const logout = () => {
    setAdminUser(null);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to remove admin session', e);
    }
    router.push('/admin');
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAuthenticated: !!adminUser,
        adminUser,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
