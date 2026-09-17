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

const LOCAL_AUTH_KEY = 'hydroponics_auth'; // clear old hardcoded sessions
const LOGIN_AS_KEY = 'hydroponics_login_as';

function apiBase(): string {
  return (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || 'http://localhost:3001';
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

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, role, display_name, avatar_url')
      .eq('id', userId)
      .single();

    if (error || !data) {
      // Profile may lag a moment after signup trigger — use safe defaults
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

  useEffect(() => {
    // Remove legacy local-only auth so it doesn't confuse users
    try {
      localStorage.removeItem(LOCAL_AUTH_KEY);
    } catch {
      /* ignore */
    }

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) fetchProfile(s.user.id);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) fetchProfile(s.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signIn = useCallback(async (email: string, password: string, asRole?: UserRole) => {
    const preferred: UserRole = asRole === 'admin' ? 'admin' : 'operator';
    setLoginAs(preferred);
    try {
      localStorage.setItem(LOGIN_AS_KEY, preferred);
    } catch {
      /* ignore */
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('invalid login credentials')) {
        return { error: new Error('Invalid email or password.') };
      }
      if (msg.includes('email not confirmed')) {
        return {
          error: new Error(
            'Email not confirmed. Confirm your email in Supabase, or ask an admin to create your account via the API.',
          ),
        };
      }
      return { error };
    }
    return { error: null };
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
    // Public signup is always operator — admin accounts are created via seed:admin only
    const role: UserRole = 'operator';

    // Prefer backend (service role) so account is confirmed and usable immediately
    try {
      const res = await fetch(`${apiBase()}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          displayName: displayName?.trim() || undefined,
          role,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.ok) {
        // Auto sign-in after successful API signup
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) {
          return {
            error: null,
            needsEmailConfirm: false,
          };
        }
        setLoginAs(role);
        try {
          localStorage.setItem(LOGIN_AS_KEY, role);
        } catch {
          /* ignore */
        }
        return { error: null };
      }
      // Known client errors from API — don't fall through
      if (res.status >= 400 && res.status < 500) {
        return { error: new Error(body.error || `Sign up failed (${res.status})`) };
      }
    } catch {
      // Backend unreachable — fall back to public Supabase signup
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: displayName?.trim() || email.trim(),
          role,
        },
      },
    });

    if (error) {
      const status = (error as { status?: number }).status;
      if (status === 429 || /too many requests|rate limit/i.test(error.message)) {
        return {
          error: new Error(
            'Sign-up rate-limited by Supabase. Start the API (`cd server && npm run dev`) and try again.',
          ),
        };
      }
      return { error };
    }

    // If session exists, email confirmation is off and user is logged in
    if (data.session) {
      setLoginAs(role);
      try {
        localStorage.setItem(LOGIN_AS_KEY, role);
      } catch {
        /* ignore */
      }
      return { error: null };
    }

    return { error: null, needsEmailConfirm: true };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setLoginAs('operator');
    try {
      localStorage.removeItem(LOGIN_AS_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  // Admin UI only if profiles.role is admin; "Log in as" can drop an admin to operator view
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
