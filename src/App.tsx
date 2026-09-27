/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuctionSocket } from './hooks/useAuctionSocket';
import { useAuth } from './hooks/useAuth';
import { Header } from './components/Header';
import { AuctionScreen } from './components/AuctionScreen';
import { AdminPanel } from './components/admin/AdminPanel';
import { OwnerPanel } from './components/owner/OwnerPanel';
import { BroadcastView } from './components/broadcast/BroadcastView';
import { SquadsView } from './components/analytics/SquadsView';
import { AdminLogin } from './components/auth/AdminLogin';
import { TeamLogin } from './components/auth/TeamLogin';
import { AlertCircle, X, Radio } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'live_auction' | 'admin' | 'owner' | 'broadcast' | 'analytics'>('live_auction');
  const { state, isConnected, errorMessage, clearError, sendMessage } = useAuctionSocket();
  const { user, isAdmin, login, logout } = useAuth(state?.accounts);

  const handleResetAuction = () => {
    sendMessage('RESET_AUCTION');
  };

  if (!state) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300 p-4">
        <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 mb-4 animate-pulse">
          <Radio className="w-8 h-8 animate-spin" />
        </div>
        <h2 className="text-xl font-bold text-white mb-1">Connecting to Jankhali Premier League Live Hub</h2>
        <p className="text-xs text-slate-400 max-w-sm text-center">
          Initializing server-authoritative auction socket and calibrating franchise war rooms...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Interactive Sticky Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isConnected={isConnected}
        onResetAuction={handleResetAuction}
        activePlayersCount={state.players.length}
        totalSoldAmount={state.totalSoldAmount}
        currentUser={user}
        onLogout={logout}
      />

      {/* Real-time Error Notification Toast */}
      {errorMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 w-full">
          <div className="p-3 rounded-xl bg-rose-950/90 border border-rose-500/50 text-rose-200 text-xs flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="font-semibold">{errorMessage}</span>
            </div>
            <button
              onClick={clearError}
              className="p-1 rounded hover:bg-rose-900/60 text-rose-300 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'live_auction' && (
          <AuctionScreen state={state} onSendMessage={sendMessage} />
        )}

        {activeTab === 'admin' && (
          isAdmin ? (
            <AdminPanel
              state={state}
              onSendMessage={sendMessage}
              currentUser={user}
              onLogout={logout}
            />
          ) : (
            <AdminLogin
              onLogin={(u, p) => login(u, p, 'admin')}
            />
          )
        )}

        {activeTab === 'owner' && (
          user ? (
            <OwnerPanel
              state={state}
              onSendMessage={sendMessage}
              currentUser={user}
              onLogout={logout}
            />
          ) : (
            <TeamLogin
              teams={state.teams}
              accounts={state.accounts}
              onLogin={(u, p) => login(u, p, 'team')}
            />
          )
        )}

        {activeTab === 'broadcast' && (
          <BroadcastView state={state} />
        )}

        {activeTab === 'analytics' && (
          <SquadsView state={state} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-4 text-center text-xs text-slate-500 bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; 2026 Jankhali Premier League Mega Auction &bull; 2,000 TK Budget Engine</span>
          <div className="flex items-center gap-3">
            <span className="text-slate-400">Admin Account Desk</span>
            <span>&bull;</span>
            <span className="text-slate-400">Team War Room Credentials</span>
            <span>&bull;</span>
            <span className="text-slate-400">JPL Live</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
