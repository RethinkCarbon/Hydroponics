import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { UserRole } from '@/types/greenhouse';

export interface Profile {
  id: string;
  role: UserRole;
  display_name: string | null;
  avatar_url: string | null;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string, loginAs?: UserRole) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const ADMIN_EMAIL = 'admin@planetive.org';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loginAs, setLoginAs] = useState<UserRole>('operator');
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, role, display_name, avatar_url')
      .eq('id', userId)
      .single();
    if (error || !data) {
      setProfile(null);
      return;
    }
    setProfile({
      id: data.id,
      role: (data.role as UserRole) || 'operator',
      display_name: data.display_name ?? null,
      avatar_url: data.avatar_url ?? null,
    });
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) fetchProfile(s.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) fetchProfile(s.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signIn = useCallback(async (email: string, password: string, asRole?: UserRole) => {
    if (asRole) setLoginAs(asRole);
    if (email.trim().toLowerCase() === ADMIN_EMAIL && asRole === 'admin') setLoginAs('admin');

    const result = await supabase.auth.signInWithPassword({ email, password });
    if (result.error) {
      const msg = result.error.message;
      if (msg.toLowerCase().includes('invalid login credentials')) {
        return {
          error: new Error(
            'Invalid email or password. For the default admin account, run `npm run seed:admin` in the server folder (once), then sign in with admin@planetive.org.',
          ),
        };
      }
      return { error: result.error };
    }
    return { error: null };
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
    const apiBase = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || 'http://localhost:3001';

    // Prefer backend (service role) — bypasses Supabase public signup rate limits
    try {
      const res = await fetch(`${apiBase}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName, role: 'operator' }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.ok) return { error: null };
      return { error: new Error(body.error || `Sign up failed (${res.status})`) };
    } catch {
      // Backend not running — try public Supabase signup
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: displayName || email } },
    });
    if (error) {
      const status = (error as { status?: number }).status;
      if (status === 429 || /too many requests|rate limit/i.test(error.message)) {
        return {
          error: new Error(
            'Sign-up rate-limited by Supabase. Start the API (`cd server && npm run dev`), then try again.',
          ),
        };
      }
      return { error };
    }
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setLoginAs('operator');
  }, []);

  const effectiveRole: UserRole =
    user && profile
      ? loginAs === 'admin' && (profile.role === 'admin' || (ADMIN_EMAIL && user.email === ADMIN_EMAIL))
        ? 'admin'
        : (profile.role || 'operator')
      : 'operator';

  const profileWithRole: Profile | null = profile ? { ...profile, role: effectiveRole } : null;

  const value: AuthContextValue = {
    user,
    session,
    profile: profileWithRole,
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
