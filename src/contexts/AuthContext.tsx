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
  signUp: (
    email: string,
    password: string,
    displayName?: string,
  ) => Promise<{ error: Error | null; needsEmailConfirm?: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const LOCAL_AUTH_KEY = 'hydroponics_auth';
const LOGIN_AS_KEY = 'hydroponics_login_as';

const EMAIL_CONFIRM_REQUIRED =
  'Please confirm your email before signing in. Check your inbox for the confirmation link.';

function apiBase(): string {
  return (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || 'http://localhost:3001';
}

function isEmailConfirmed(user: User | null | undefined): boolean {
  return Boolean(user?.email_confirmed_at);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loginAs, setLoginAs] = useState<UserRole>(() => {
    try {
      const stored = localStorage.getItem(LOGIN_AS_KEY);
      return stored === 'admin' || stored === 'operator' ? stored : 'operator';
    } catch {
      return 'operator';
    }
  });
  const [loading, setLoading] = useState(true);

  const clearLocalSession = useCallback(() => {
    setSession(null);
    setUser(null);
    setProfile(null);
  }, []);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, role, display_name, avatar_url')
      .eq('id', userId)
      .single();

    if (error || !data) {
      setProfile({
        id: userId,
        role: 'operator',
        display_name: null,
        avatar_url: null,
      });
      return;
    }

    setProfile({
      id: data.id,
      role: (data.role as UserRole) || 'operator',
      display_name: data.display_name ?? null,
      avatar_url: data.avatar_url ?? null,
    });
  }, []);

  const applySession = useCallback(
    async (s: Session | null) => {
      if (s?.user && !isEmailConfirmed(s.user)) {
        await supabase.auth.signOut();
        clearLocalSession();
        return;
      }
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) fetchProfile(s.user.id);
      else setProfile(null);
    },
    [clearLocalSession, fetchProfile],
  );

  useEffect(() => {
    try {
      localStorage.removeItem(LOCAL_AUTH_KEY);
    } catch {
      /* ignore */
    }

    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      await applySession(s);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      void applySession(s);
    });

    return () => subscription.unsubscribe();
  }, [applySession]);

  const signIn = useCallback(async (email: string, password: string, asRole?: UserRole) => {
    const preferred: UserRole = asRole === 'admin' ? 'admin' : 'operator';
    setLoginAs(preferred);
    try {
      localStorage.setItem(LOGIN_AS_KEY, preferred);
    } catch {
      /* ignore */
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('invalid login credentials')) {
        return { error: new Error('Invalid email or password.') };
      }
      if (msg.includes('email not confirmed')) {
        return { error: new Error(EMAIL_CONFIRM_REQUIRED) };
      }
      return { error };
    }

    if (!isEmailConfirmed(data.user)) {
      await supabase.auth.signOut();
      return { error: new Error(EMAIL_CONFIRM_REQUIRED) };
    }

    return { error: null };
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
    const role: UserRole = 'operator';
    const trimmedEmail = email.trim();

    // Prefer public signup so Supabase sends the confirmation email
    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: {
          full_name: displayName?.trim() || trimmedEmail,
          role,
        },
      },
    });

    if (!error) {
      // Never keep an unconfirmed session after signup
      if (data.session) {
        await supabase.auth.signOut();
      }
      return { error: null, needsEmailConfirm: true };
    }

    const status = (error as { status?: number }).status;
    const rateLimited = status === 429 || /too many requests|rate limit/i.test(error.message);

    // Fallback: API creates unconfirmed user (no auto-login)
    if (rateLimited) {
      try {
        const res = await fetch(`${apiBase()}/api/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: trimmedEmail,
            password,
            displayName: displayName?.trim() || undefined,
            role,
          }),
        });
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        if (res.ok) {
          await supabase.auth.signOut();
          // Ask Supabase to send / resend the confirmation email
          await supabase.auth.resend({ type: 'signup', email: trimmedEmail });
          return { error: null, needsEmailConfirm: true };
        }
        return { error: new Error(body.error || `Sign up failed (${res.status})`) };
      } catch {
        return {
          error: new Error(
            'Sign-up rate-limited by Supabase. Wait a few minutes, or start the API (`cd server && npm run dev`) and try again.',
          ),
        };
      }
    }

    return { error };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    clearLocalSession();
    setLoginAs('operator');
    try {
      localStorage.removeItem(LOGIN_AS_KEY);
    } catch {
      /* ignore */
    }
  }, [clearLocalSession]);

  const effectiveRole: UserRole =
    profile?.role === 'admin' ? (loginAs === 'operator' ? 'operator' : 'admin') : 'operator';

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
