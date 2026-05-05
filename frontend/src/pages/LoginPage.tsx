import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center px-4">
      <div
        className="bg-white rounded-xl shadow-lg border border-[#E2E8F0] w-full max-w-[420px] p-10"
        style={{ animation: 'fade-in-up 300ms ease-out' }}
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-8 h-8 bg-[#185FA5] rounded-md mb-3" />
          <h1 className="text-xl font-semibold text-[#0F172A]">MigrateOS</h1>
          <p className="text-sm text-[#64748B] mt-1">Enterprise Data Migration Platform</p>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 p-3 rounded-md border-l-4 border-[#993C1D] bg-[rgba(153,60,29,0.05)]">
            <AlertCircle size={16} className="text-[#993C1D] mt-0.5 shrink-0" />
            <span className="text-sm text-[#993C1D]">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Work Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full h-10 pl-10 pr-3 rounded-md border border-[#E2E8F0] bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#185FA5] focus:ring-3 focus:ring-[rgba(24,95,165,0.15)] transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full h-10 pl-10 pr-10 rounded-md border border-[#E2E8F0] bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#185FA5] focus:ring-3 focus:ring-[rgba(24,95,165,0.15)] transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-[#185FA5] hover:bg-[#124A82] text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-[#94A3B8]">
            Try: <span className="font-mono">admin@company.com</span> / <span className="font-mono">password</span>
          </p>
        </div>
      </div>
    </div>
  );
}
