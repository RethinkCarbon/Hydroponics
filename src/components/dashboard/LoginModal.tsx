import { useState } from 'react';
import { Shield, User, Lock, Eye, EyeOff, UserCog } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types/greenhouse';

const LOGIN_AS_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'operator', label: 'Operator' },
  { value: 'admin', label: 'Administrator' },
];

export function LoginModal() {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loginAs, setLoginAs] = useState<UserRole>('operator');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    if (isSignUp) {
      const { error: err } = await signUp(email, password, displayName || undefined);
      setIsLoading(false);
      if (err) {
        setError(err.message);
        return;
      }
      setMessage('Check your email to confirm your account, then sign in.');
      return;
    }

    const { error: err } = await signIn(email, password, loginAs);
    setIsLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md p-8 rounded-3xl bg-white border border-slate-200 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-200">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Greenhouse Control</h1>
          <p className="text-slate-500">
            {isSignUp ? 'Create an account' : 'Sign in to continue'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 p-3 rounded-lg bg-teal-50 border border-teal-200 text-sm text-teal-700">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="text-sm text-slate-600 mb-1 block">Display name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all"
                />
              </div>
            </div>
          )}

          {!isSignUp && (
            <div>
              <label className="text-sm text-slate-600 mb-1 block">Log in as</label>
              <div className="relative">
                <UserCog className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <select
                  value={loginAs}
                  onChange={(e) => setLoginAs(e.target.value as UserRole)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all appearance-none cursor-pointer"
                >
                  {LOGIN_AS_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="text-sm text-slate-600 mb-1 block">Email</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-600 mb-1 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full pl-12 pr-12 py-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full btn-touch btn-primary disabled:opacity-50 mt-6"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Shield className="w-5 h-5" />
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-4">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setError(null); setMessage(null); }}
            className="text-teal-600 hover:text-teal-700 font-medium"
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  );
}
