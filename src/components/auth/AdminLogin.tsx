import React, { useState } from 'react';
import { Shield, Lock, User, AlertCircle, ArrowRight, KeyRound, Eye, EyeOff } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await onLogin(username, password);
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'লগইন ব্যর্থ হয়েছে');
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError(null);
  };

  return (
    <div className="max-w-md mx-auto my-8 p-6 sm:p-8 bg-slate-900/95 border-2 border-amber-500/40 rounded-3xl shadow-2xl backdrop-blur-md">
      {/* Header Icon & Title */}
      <div className="text-center space-y-2 mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20 mb-1">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-wide">
          Admin Panel Authentication
        </h2>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          JPL Mega Auction অ্যাডমিন প্যানেল এবং অ্যাকাউন্ট ম্যানেজার প্রবেশ করতে আপনার User ID ও Password দিন।
        </p>
      </div>

      {/* Error alert */}
      {error && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Admin User ID:
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
              autoFocus
              required
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/90 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Password:
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full pl-10 pr-10 py-2.5 bg-slate-950/90 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <span>লগইন হচ্ছে...</span>
          ) : (
            <>
              <span>Admin লগইন করুন</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Quick Demo Helper */}
      <div className="mt-6 pt-5 border-t border-white/10">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
          <KeyRound className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold">ডিফল্ট অ্যাডমিন ক্রেডেনশিয়াল (Default Credentials):</span>
        </div>
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-amber-500/20 text-xs">
          <div className="space-x-2 font-mono">
            <span className="text-slate-400">ID:</span>
            <strong className="text-amber-400">admin</strong>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">Pass:</span>
            <strong className="text-amber-400">admin123</strong>
          </div>
          <button
            type="button"
            onClick={() => handleQuickFill('admin', 'admin123')}
            className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-[11px] font-bold transition-all"
          >
            Auto Fill
          </button>
        </div>
      </div>

      {/* Admin exclusive policy badge */}
      <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200/90 leading-relaxed text-center">
        💡 <strong>অ্যাকাউন্ট তৈরির নিয়ম:</strong> নতুন Team ও Admin অ্যাকাউন্ট তৈরির সুবিধা শুধুমাত্র Admin Panel-এর ভেতরেই বিদ্যমান।
      </div>
    </div>
  );
};
