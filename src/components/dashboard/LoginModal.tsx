import { useState } from 'react';
import { Shield, User, Lock, Eye, EyeOff } from 'lucide-react';
import type { UserRole } from '@/types/greenhouse';

interface LoginModalProps {
  onLogin: (role: UserRole) => void;
}

export function LoginModal({ onLogin }: LoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('operator');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate authentication delay
    setTimeout(() => {
      setIsLoading(false);
      onLogin(selectedRole);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md p-8 rounded-3xl bg-white border border-slate-200 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-200">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Greenhouse Control</h1>
          <p className="text-slate-500">Please sign in to continue</p>
        </div>

        {/* Role Selection */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setSelectedRole('operator')}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedRole === 'operator'
                ? 'border-teal-500 bg-teal-50'
                : 'border-slate-200 bg-white hover:border-teal-300'
            }`}
          >
            <User className={`w-6 h-6 mx-auto mb-2 ${selectedRole === 'operator' ? 'text-teal-600' : 'text-slate-400'}`} />
            <p className={`font-medium ${selectedRole === 'operator' ? 'text-slate-800' : 'text-slate-500'}`}>Operator</p>
            <p className="text-xs text-slate-400">View & Override</p>
          </button>
          
          <button
            type="button"
            onClick={() => setSelectedRole('admin')}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedRole === 'admin'
                ? 'border-teal-500 bg-teal-50'
                : 'border-slate-200 bg-white hover:border-teal-300'
            }`}
          >
            <Shield className={`w-6 h-6 mx-auto mb-2 ${selectedRole === 'admin' ? 'text-teal-600' : 'text-slate-400'}`} />
            <p className={`font-medium ${selectedRole === 'admin' ? 'text-slate-800' : 'text-slate-500'}`}>Administrator</p>
            <p className="text-xs text-slate-400">Full Access</p>
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-slate-600 mb-1 block">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={selectedRole === 'admin' ? 'admin' : 'operator'}
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
            disabled={isLoading || !username || !password}
            className="w-full btn-touch btn-primary disabled:opacity-50 mt-6"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Shield className="w-5 h-5" />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Demo Note */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Demo: Use any username/password to login
        </p>
      </div>
    </div>
  );
}
