import React, { useState } from 'react';
import { Users, Lock, User, AlertCircle, ArrowRight, ShieldAlert, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Team, UserAccount } from '../../types/auction';

interface TeamLoginProps {
  teams: Team[];
  accounts?: UserAccount[];
  onLogin: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
}

export const TeamLogin: React.FC<TeamLoginProps> = ({ teams, accounts = [], onLogin }) => {
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

  // Find team accounts for quick-fill assistance
  const teamAccounts = accounts.filter(a => a.role === 'team');

  return (
    <div className="max-w-md mx-auto my-8 p-6 sm:p-8 bg-slate-900/95 border-2 border-emerald-500/40 rounded-3xl shadow-2xl backdrop-blur-md">
      {/* Header Icon & Title */}
      <div className="text-center space-y-2 mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-slate-950 shadow-lg shadow-emerald-500/20 mb-1">
          <Users className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-wide">
          Team War Room Login
        </h2>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          আপনার ফ্র্যাঞ্চাইজি প্যাডেল ও ওয়ার রুমে প্রবেশ করতে Admin কর্তৃক প্রদত্ত User ID ও Password দিন (স্কোয়াড নিয়ম: ন্যূনতম ৮ জন, সর্বোচ্চ ১২ জন)।
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
            Team User ID:
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. team1, team2..."
              autoFocus
              required
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/90 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all font-mono"
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
              className="w-full pl-10 pr-10 py-2.5 bg-slate-950/90 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all font-mono"
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
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <span>লগইন হচ্ছে...</span>
          ) : (
            <>
              <span>War Room-এ প্রবেশ করুন</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Admin exclusivity disclaimer */}
      <div className="mt-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>অ্যাকাউন্ট তৈরি নীতি:</strong> টিম প্যানেলের জন্য বাইরে থেকে কোনো সাইনআপ বা অ্যাকাউন্ট তৈরি করা যাবে না। <em>অ্যাকাউন্ট শুধুমাত্র Admin Panel থেকেই তৈরি করা যায়।</em>
        </p>
      </div>

      {/* Quick Team demo credentials */}
      <div className="mt-6 pt-5 border-t border-white/10">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>টিম অ্যাকাউন্ট দ্রুত লগইন (Demo Credentials):</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {teamAccounts.length > 0 ? (
            teamAccounts.slice(0, 4).map(acc => {
              const team = teams.find(t => t.id === acc.teamId);
              return (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => handleQuickFill(acc.username, acc.password)}
                  className="p-2 rounded-xl bg-slate-950/80 border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all text-left flex items-center gap-2 group"
                >
                  <span className="text-xl">{team?.logo || '🏏'}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white truncate group-hover:text-emerald-300">
                      {team?.shortCode || acc.username}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {acc.username}
                    </div>
                  </div>
                </button>
              );
            })
          ) : (
            // Default fallbacks if accounts array not loaded yet
            [
              { u: 'team1', p: 'team1pass', label: 'TEAM 1', logo: '🦁' },
              { u: 'team2', p: 'team2pass', label: 'TEAM 2', logo: '⚔️' },
              { u: 'team3', p: 'team3pass', label: 'TEAM 3', logo: '⚡' },
              { u: 'team4', p: 'team4pass', label: 'TEAM 4', logo: '🛡️' }
            ].map(item => (
              <button
                key={item.u}
                type="button"
                onClick={() => handleQuickFill(item.u, item.p)}
                className="p-2 rounded-xl bg-slate-950/80 border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all text-left flex items-center gap-2 group"
              >
                <span className="text-xl">{item.logo}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate group-hover:text-emerald-300">
                    {item.label}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {item.u}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
