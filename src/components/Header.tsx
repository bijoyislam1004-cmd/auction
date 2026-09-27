import React, { useState } from 'react';
import { Gavel, Users, Tv, BarChart3, Volume2, VolumeX, RotateCcw, AlertTriangle, Radio, Shield, LogOut, Lock } from 'lucide-react';
import { sounds, formatIPLAmount } from '../utils/auctionUtils';
import { AuthenticatedUser } from '../hooks/useAuth';

interface HeaderProps {
  activeTab: 'live_auction' | 'admin' | 'owner' | 'broadcast' | 'analytics';
  setActiveTab: (tab: 'live_auction' | 'admin' | 'owner' | 'broadcast' | 'analytics') => void;
  isConnected: boolean;
  onResetAuction: () => void;
  activePlayersCount: number;
  totalSoldAmount: number;
  currentUser?: AuthenticatedUser | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isConnected,
  onResetAuction,
  activePlayersCount,
  totalSoldAmount,
  currentUser,
  onLogout
}) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const toggleSound = () => {
    const next = !soundEnabled;
    sounds.enabled = next;
    setSoundEnabled(next);
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-amber-500/20 shadow-2xl">
      {/* Top micro bar with status and stats */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border-b border-white/5 px-4 py-1 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            {isConnected ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <Radio className="w-3 h-3 animate-spin" /> LIVE REAL-TIME SYNC
              </span>
            ) : (
              <span className="text-rose-400">CONNECTING...</span>
            )}
          </span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline text-amber-300 font-semibold">
            JANKHALI PREMIER LEAGUE MEGA AUCTION (JPL)
          </span>
          <span className="hidden md:inline text-slate-400">
            &bull; Team Budget: <strong className="text-white">2,000 TK</strong> &bull; Squad: <strong className="text-amber-400">Min 8 - Max 12 Players</strong> &bull; Min Bid: <strong className="text-emerald-400">10 TK</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-amber-300/90 font-medium">
            Total Spent: <span className="font-bold text-amber-400 font-mono">{formatIPLAmount(totalSoldAmount)}</span>
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300">
            Players in Pool: <span className="font-semibold text-white">{activePlayersCount}</span>
          </span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 shadow-lg shadow-amber-500/20 border border-amber-300/40">
            <Gavel className="w-6 h-6 text-slate-950" />
            <div className="absolute -bottom-1 -right-1 px-1 py-0.2 bg-slate-900 rounded border border-amber-400/50 text-[9px] font-black text-amber-400">
              JPL
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-white font-sans flex items-center gap-1.5">
                JANKHALI PREMIER LEAGUE <span className="text-amber-400 font-extrabold">MEGA AUCTION</span>
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
                MIN 8 &bull; MAX 12 PLAYERS
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Admin Auctioneer Desk &bull; Team War Rooms &bull; Min Bid: 10 TK
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <nav className="flex items-center p-1 bg-slate-900/90 rounded-xl border border-white/10 shadow-inner">
          <button
            onClick={() => setActiveTab('live_auction')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'live_auction'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>🏏</span>
            <span>Auction Screen</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold ${activeTab === 'live_auction' ? 'bg-amber-600/30 text-black' : 'bg-slate-800 text-amber-400'}`}>
              LIVE
            </span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'admin'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Gavel className="w-4 h-4" />
            <span>Admin Panel</span>
          </button>

          <button
            onClick={() => setActiveTab('owner')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'owner'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Team Panel</span>
          </button>

          <button
            onClick={() => setActiveTab('broadcast')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'broadcast'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>Broadcast</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'analytics'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Squads</span>
          </button>
        </nav>

        {/* Global Controls: Audio, Reset & Auth */}
        <div className="flex items-center gap-2">
          {/* User Session Pill */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 bg-slate-900 border border-white/10 px-2.5 py-1.5 rounded-xl text-xs">
              {currentUser.role === 'admin' ? (
                <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              ) : (
                <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              )}
              <span className="font-mono font-bold text-white max-w-[80px] sm:max-w-none truncate">
                {currentUser.username}
              </span>
              <span className={`text-[9px] px-1 py-0.2 rounded font-extrabold uppercase ${
                currentUser.role === 'admin' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
              }`}>
                {currentUser.role}
              </span>
              {onLogout && (
                <button
                  onClick={onLogout}
                  title="লগআউট"
                  className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-all ml-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900/80 border border-white/5 text-[11px] text-slate-400">
              <Lock className="w-3 h-3 text-slate-500" />
              <span>গেস্ট ভিউ</span>
            </div>
          )}

          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Mute Auction Sound FX' : 'Enable Auction Sound FX'}
            className={`p-2 rounded-lg border transition-all ${
              soundEnabled
                ? 'bg-slate-900 border-white/10 text-amber-400 hover:border-amber-400/40'
                : 'bg-slate-900/60 border-white/5 text-slate-500'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setShowResetConfirm(true)}
            title="Reset Auction to 2,000 TK per Team"
            className="p-2 rounded-lg bg-slate-900 border border-white/10 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-white">Reset Full Jankhali Auction?</h3>
            </div>
            <p className="text-sm text-slate-300 mb-5">
              This will restore all franchise budgets back to 2,000 TK, reset squad quotas (Min 8, Max 12 Players), clear all rosters, and re-populate the player pool.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-lg text-sm bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onResetAuction();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-rose-600 text-white hover:bg-rose-500 shadow-lg shadow-rose-600/30"
              >
                Yes, Reset to 2,000 TK
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
