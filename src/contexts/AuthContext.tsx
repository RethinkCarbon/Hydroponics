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
const ADMIN_PASSWORD = 'Admin123';

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
    const isHardcodedAdmin = email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
    if (asRole) setLoginAs(asRole);
    if (isHardcodedAdmin) setLoginAs('admin');

    let result = await supabase.auth.signInWithPassword({ email, password });
    if (result.error && isHardcodedAdmin) {
      await supabase.auth.signUp({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        options: { data: { full_name: 'Administrator' } },
      });
      result = await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    }
    return { error: result.error ?? null };
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: displayName || email } },
    });
    return { error: error ?? null };
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
