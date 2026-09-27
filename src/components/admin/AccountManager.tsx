import React, { useState } from 'react';
import { AuctionState, Team, UserAccount, UserRole } from '../../types/auction';
import { Shield, KeyRound, UserPlus, Users, Eye, EyeOff, Copy, Check, Trash2, Edit2, ShieldAlert, Lock, AlertCircle } from 'lucide-react';

interface AccountManagerProps {
  state: AuctionState;
  onSendMessage: (type: string, payload?: Record<string, unknown>) => void;
}

export const AccountManager: React.FC<AccountManagerProps> = ({ state, onSendMessage }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState('');
  
  // Visibility toggles for passwords
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states for creating account
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('team');
  const [formTeamId, setFormTeamId] = useState<string>(state.teams[0]?.id || 'team_1');
  const [formName, setFormName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyPassword = (id: string, pass: string) => {
    navigator.clipboard.writeText(pass);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanUsername = formUsername.trim();
    const cleanPassword = formPassword.trim();

    if (!cleanUsername || cleanUsername.length < 3) {
      setFormError('User ID কমপক্ষে ৩ অক্ষরের হতে হবে!');
      return;
    }

    if (!cleanPassword || cleanPassword.length < 3) {
      setFormError('Password কমপক্ষে ৩ অক্ষরের হতে হবে!');
      return;
    }

    // Check duplicate locally
    const exists = state.accounts?.some(
      a => a.username.toLowerCase() === cleanUsername.toLowerCase()
    );
    if (exists) {
      setFormError(`"${cleanUsername}" এই User ID ইতিমধ্যে বিদ্যমান! অনুগ্রহ করে অন্য User ID দিন।`);
      return;
    }

    if (formRole === 'team' && !formTeamId) {
      setFormError('Team নির্বাচন করা বাধ্যতামূলক!');
      return;
    }

    const assignedTeam = state.teams.find(t => t.id === formTeamId);
    const defaultName = formRole === 'admin' 
      ? 'Admin Official' 
      : `${assignedTeam?.name || 'Team'} Owner`;

    onSendMessage('CREATE_ACCOUNT', {
      username: cleanUsername,
      password: cleanPassword,
      role: formRole,
      teamId: formRole === 'team' ? formTeamId : undefined,
      name: formName.trim() || defaultName
    });

    // Reset and close
    setFormUsername('');
    setFormPassword('');
    setFormName('');
    setFormRole('team');
    setShowCreateModal(false);
  };

  const handleSaveEditedPassword = (id: string) => {
    if (!newPasswordValue.trim() || newPasswordValue.trim().length < 3) {
      alert('Password কমপক্ষে ৩ অক্ষরের হতে হবে!');
      return;
    }

    onSendMessage('EDIT_ACCOUNT', {
      id,
      password: newPasswordValue.trim()
    });

    setEditingAccountId(null);
    setNewPasswordValue('');
  };

  const handleDeleteAccount = (acc: UserAccount) => {
    if (acc.id === 'acc_admin' || acc.username.toLowerCase() === 'admin') {
      alert('প্রধান Admin অ্যাকাউন্ট ডিলিট করা সম্ভব নয়!');
      return;
    }

    if (confirm(`আপনি কি নিশ্চিত যে User ID "${acc.username}" অ্যাকাউন্টটি ডিলিট করতে চান?`)) {
      onSendMessage('DELETE_ACCOUNT', { id: acc.id });
    }
  };

  const accounts = state.accounts || [];
  const adminAccountsCount = accounts.filter(a => a.role === 'admin').length;
  const teamAccountsCount = accounts.filter(a => a.role === 'team').length;

  return (
    <div className="space-y-6">
      {/* Header Banner & Stats */}
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">
                  User ID & Password Management
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-400 text-slate-950">
                  Admin Exclusive
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                JPL টুর্নামেন্টের টিম ও অ্যাডমিনদের ইউজার আইডি এবং পাসওয়ার্ড শুধুমাত্র এই প্যানেল থেকেই তৈরি ও নিয়ন্ত্রণ করা যাবে।
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>নতুন অ্যাকাউন্ট তৈরি করুন</span>
          </button>
        </div>

        {/* Quick metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/10 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 flex items-center gap-3">
            <Shield className="w-5 h-5 text-amber-400" />
            <div>
              <div className="text-slate-400 font-semibold">Admin অ্যাকাউন্ট:</div>
              <div className="text-base font-black text-white font-mono">{adminAccountsCount} টি</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 flex items-center gap-3">
            <Users className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-slate-400 font-semibold">Team অ্যাকাউন্ট:</div>
              <div className="text-base font-black text-white font-mono">{teamAccountsCount} টি</div>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-slate-950/70 border border-white/5 flex items-center gap-3">
            <Lock className="w-5 h-5 text-blue-400" />
            <div>
              <div className="text-slate-400 font-semibold">মোট অ্যাকাউন্ট:</div>
              <div className="text-base font-black text-white font-mono">{accounts.length} টি</div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <div className="flex items-center gap-2 text-amber-400">
                <UserPlus className="w-5 h-5" />
                <h3 className="text-base font-black text-white">নতুন অ্যাকাউন্ট তৈরি করুন</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/90 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="font-semibold">{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateAccount} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                  অ্যাকাউন্ট টাইপ / Role:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormRole('team')}
                    className={`py-2 px-3 rounded-xl font-bold border flex items-center justify-center gap-2 transition-all ${
                      formRole === 'team'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow'
                        : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Team Panel</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormRole('admin')}
                    className={`py-2 px-3 rounded-xl font-bold border flex items-center justify-center gap-2 transition-all ${
                      formRole === 'admin'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow'
                        : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin Panel</span>
                  </button>
                </div>
              </div>

              {formRole === 'team' && (
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                    নির্ধারিত Team (Select Team):
                  </label>
                  <select
                    value={formTeamId}
                    onChange={(e) => setFormTeamId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white font-semibold focus:border-amber-400 focus:outline-none"
                  >
                    {state.teams.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.logo} {t.name} ({t.shortCode})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                    User ID (Username):
                  </label>
                  <input
                    type="text"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    placeholder="e.g. team_riders, jsk_mgr"
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white font-mono focus:border-amber-400 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500">লগইনের জন্য ব্যবহৃত হবে</span>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Password:
                  </label>
                  <input
                    type="text"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="e.g. pass123"
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white font-mono focus:border-amber-400 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500">কমপক্ষে ৩ অক্ষর</span>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                  মালিক বা ব্যক্তির নাম (Display / Owner Name):
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Mohammad Ali (Team Manager)"
                  className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20"
                >
                  অ্যাকাউন্ট তৈরি করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Accounts List Table / Cards */}
      <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-5 py-3.5 bg-slate-950/60 border-b border-white/5 flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span>সকল ইউজার ও টিম অ্যাকাউন্টের তালিকা:</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 text-[10px] font-black">
              {accounts.length} ACCOUNTS
            </span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            শুধুমাত্র Admin পাসওয়ার্ড দেখতে ও পরিবর্তন করতে পারেন
          </span>
        </div>

        <div className="divide-y divide-white/5">
          {accounts.map(acc => {
            const team = state.teams.find(t => t.id === acc.teamId);
            const isPasswordVisible = visiblePasswords[acc.id] || false;
            const isEditingThis = editingAccountId === acc.id;
            const isPrimaryAdmin = acc.id === 'acc_admin' || acc.username.toLowerCase() === 'admin';

            return (
              <div
                key={acc.id}
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/20 transition-all"
              >
                {/* User & Role Info */}
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold border shrink-0 ${
                    acc.role === 'admin'
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                      : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  }`}>
                    {acc.role === 'admin' ? <Shield className="w-5 h-5" /> : (team?.logo || '🏏')}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-black text-sm text-white font-mono">
                        {acc.username}
                      </span>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                        acc.role === 'admin'
                          ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                          : 'bg-emerald-400/20 text-emerald-300 border-emerald-400/40'
                      }`}>
                        {acc.role === 'admin' ? 'ADMIN PANEL' : 'TEAM PANEL'}
                      </span>
                      {isPrimaryAdmin && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-white/10">
                          Primary
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{acc.name}</span>
                      {acc.role === 'team' && team && (
                        <>
                          <span>&bull;</span>
                          <span className="text-white font-semibold flex items-center gap-1">
                            <span>{team.logo}</span>
                            <span>{team.name} ({team.shortCode})</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Password & Management Controls */}
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 ml-14 md:ml-0">
                  {/* Password Display / Edit Box */}
                  {isEditingThis ? (
                    <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-amber-400/50">
                      <input
                        type="text"
                        value={newPasswordValue}
                        onChange={(e) => setNewPasswordValue(e.target.value)}
                        placeholder="নতুন Password"
                        className="px-2 py-1 bg-transparent text-xs text-white font-mono focus:outline-none w-28 sm:w-36"
                      />
                      <button
                        onClick={() => handleSaveEditedPassword(acc.id)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingAccountId(null)}
                        className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-white/10">
                      <span className="text-[11px] text-slate-500 uppercase font-semibold">Pass:</span>
                      <span className="font-mono text-xs text-amber-300 font-bold select-all">
                        {isPasswordVisible ? acc.password : '••••••••'}
                      </span>
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(acc.id)}
                        title={isPasswordVisible ? 'Hide Password' : 'Show Password'}
                        className="p-1 rounded text-slate-400 hover:text-white"
                      >
                        {isPasswordVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyPassword(acc.id, acc.password)}
                        title="Copy Password"
                        className="p-1 rounded text-slate-400 hover:text-white"
                      >
                        {copiedId === acc.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}

                  {/* Action buttons */}
                  {!isEditingThis && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAccountId(acc.id);
                          setNewPasswordValue(acc.password);
                        }}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1 font-semibold transition-all"
                        title="পাসওয়ার্ড পরিবর্তন করুন"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                        <span className="hidden sm:inline">পাসওয়ার্ড পরিবর্তন</span>
                      </button>

                      {!isPrimaryAdmin && (
                        <button
                          type="button"
                          onClick={() => handleDeleteAccount(acc)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 text-slate-400 border border-white/5 hover:border-rose-500/30 transition-all"
                          title="অ্যাকাউন্ট ডিলিট করুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
