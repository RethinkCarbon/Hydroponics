import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { UserRole } from '@/types/greenhouse';

export interface Profile {
  id: string;
  role: UserRole;
  display_name: string | null;
  avatar_url: string | null;
}

export interface LocalSession {
  email: string;
  role: UserRole;
}

interface AuthContextValue {
  session: LocalSession | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string, loginAs?: UserRole) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const AUTH_STORAGE_KEY = 'hydroponics_auth';

const ADMIN_EMAIL = 'admin@planetive.org';
const ADMIN_PASSWORD = 'Admin@123';

function loadStoredAuth(): LocalSession | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LocalSession;
    if (parsed.email === ADMIN_EMAIL && (parsed.role === 'admin' || parsed.role === 'operator')) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function saveAuth(session: LocalSession | null) {
  if (session) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

function profileFromSession(session: LocalSession): Profile {
  return {
    id: 'local-admin',
    role: session.role,
    display_name: 'Administrator',
    avatar_url: null,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<LocalSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSession(loadStoredAuth());
    setLoading(false);
  }, []);

  const signIn = useCallback(async (email: string, password: string, asRole?: UserRole) => {
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedEmail !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return { error: new Error('Invalid email or password.') };
    }

    const role: UserRole = asRole === 'operator' ? 'operator' : 'admin';
    const next: LocalSession = { email: ADMIN_EMAIL, role };
    setSession(next);
    saveAuth(next);
    return { error: null };
  }, []);

  const signUp = useCallback(async () => {
    return { error: new Error('Sign up is currently disabled.') };
  }, []);

  const signOut = useCallback(async () => {
    setSession(null);
    saveAuth(null);
  }, []);

  const profile = session ? profileFromSession(session) : null;

  const value: AuthContextValue = {
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
