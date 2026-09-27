import React, { useState, useEffect } from 'react';
import { AuctionState, PlayerRole, Team } from '../../types/auction';
import {
  formatIPLAmount,
  formatIPLAmountFull,
  getStandardIncrement,
  canTeamBid,
  getMaxPermissibleBid,
  MIN_SQUAD_SIZE,
  MAX_SQUAD_SIZE
} from '../../utils/auctionUtils';
import { Shield, Users, Zap, AlertTriangle, CheckCircle2, MessageSquare, LogOut, Lock, KeyRound, Award, Info } from 'lucide-react';
import { AuthenticatedUser } from '../../hooks/useAuth';

interface OwnerPanelProps {
  state: AuctionState;
  onSendMessage: (type: string, payload?: Record<string, unknown>) => void;
  currentUser?: AuthenticatedUser | null;
  onLogout?: () => void;
}

export const OwnerPanel: React.FC<OwnerPanelProps> = ({ state, onSendMessage, currentUser, onLogout }) => {
  // If user is a team user, lock to their assigned team; otherwise default to first team
  const defaultTeamId = currentUser?.role === 'team' && currentUser?.teamId
    ? currentUser.teamId
    : (state.teams[0]?.id || 'team_1');

  const [selectedTeamId, setSelectedTeamId] = useState<string>(defaultTeamId);
  const [customIncrement, setCustomIncrement] = useState<number | null>(null);

  useEffect(() => {
    if (currentUser?.role === 'team' && currentUser?.teamId) {
      setSelectedTeamId(currentUser.teamId);
    }
  }, [currentUser]);

  const selectedTeam = state.teams.find(t => t.id === selectedTeamId) || state.teams[0];
  const activePlayer = state.players.find(p => p.id === state.currentPlayerId);
  const isMyTeamLeading = state.currentBidTeamId === selectedTeam?.id;

  const isTeamLocked = currentUser?.role === 'team';

  const standardInc = getStandardIncrement(state.currentBid);
  const activeIncrement = customIncrement !== null ? customIncrement : standardInc;
  
  const nextBidAmount = state.currentBidTeamId
    ? state.currentBid + activeIncrement
    : (activePlayer ? activePlayer.basePrice : 200);

  const squadCount = selectedTeam?.squad?.length || 0;
  const minSquad = selectedTeam?.minSquad || MIN_SQUAD_SIZE;
  const maxSquad = selectedTeam?.maxSquad || MAX_SQUAD_SIZE;
  const isSquadFull = squadCount >= maxSquad;
  const isMinSquadMet = squadCount >= minSquad;
  const remainingToMin = Math.max(0, minSquad - squadCount);
  const remainingToMax = Math.max(0, maxSquad - squadCount);

  const maxPermissibleBid = selectedTeam ? getMaxPermissibleBid(selectedTeam.purse, squadCount, minSquad) : 0;
  const bidEligibility = selectedTeam ? canTeamBid(selectedTeam, nextBidAmount) : { canBid: false, reason: 'Team not selected' };
  const isBiddingActive = state.currentStage === 'BIDDING' || state.currentStage === 'GOING_ONCE' || state.currentStage === 'GOING_TWICE';
  const canPlaceBid = Boolean(activePlayer && isBiddingActive && !isMyTeamLeading && bidEligibility.canBid);

  const handlePlaceBid = () => {
    if (!activePlayer || !isBiddingActive || isMyTeamLeading || !bidEligibility.canBid) return;
    onSendMessage('PLACE_BID', {
      teamId: selectedTeam.id,
      amount: nextBidAmount
    });
  };

  const handleSendReaction = (emoji: string, text: string) => {
    onSendMessage('CHAT_REACTION', {
      teamId: selectedTeam.id,
      emoji,
      text
    });
  };

  if (!selectedTeam) return null;

  return (
    <div className="space-y-6">
      {/* Team Authentication Status Banner */}
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-lg shrink-0">
            {selectedTeam.logo}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white">
                {selectedTeam.name} ({selectedTeam.shortCode}) War Room
              </span>
              {isTeamLocked ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>টিম লকড</span>
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Admin Preview
                </span>
              )}
            </div>
            <div className="text-xs text-slate-400 mt-0.5 flex flex-wrap items-center gap-2">
              {currentUser && (
                <span>লগইন আছেন: <strong className="text-white font-mono">{currentUser.username}</strong> ({currentUser.name})</span>
              )}
              <span className="text-slate-600 hidden sm:inline">&bull;</span>
              <span className="text-slate-400">বাজেট: <strong className="text-amber-400 font-mono">{formatIPLAmount(selectedTeam.purse)}</strong></span>
              <span className="text-slate-600 hidden sm:inline">&bull;</span>
              <span className="text-slate-400">
                স্কোয়াড: <strong className={isSquadFull ? 'text-purple-400' : isMinSquadMet ? 'text-emerald-400' : 'text-amber-400'}>
                  {squadCount}/{maxSquad} জন
                </strong> (ন্যূনতম {minSquad} &bull; সর্বোচ্চ {maxSquad})
              </span>
            </div>
          </div>
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 text-slate-300 border border-white/5 hover:border-rose-500/30 text-xs font-semibold transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>লগআউট</span>
          </button>
        )}
      </div>

      {/* Admin Team Switcher (Only if Admin is viewing) */}
      {!isTeamLocked && (
        <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-3.5 shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Admin Franchise Switcher (টেস্ট করার জন্য টিম পরিবর্তন করুন):
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {state.teams.map(team => {
              const isSelected = team.id === selectedTeam.id;
              const isLeadingNow = state.currentBidTeamId === team.id;

              return (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeamId(team.id)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all text-left ${
                    isSelected
                      ? 'ring-2 shadow-lg bg-amber-500/15'
                      : 'border-white/10 bg-slate-950/60 hover:border-white/20'
                  }`}
                  style={{
                    borderColor: isSelected ? team.primaryColor : undefined,
                    boxShadow: isSelected ? `0 0 12px ${team.primaryColor}40` : undefined
                  }}
                >
                  <span className="text-2xl">{team.logo}</span>
                  <div className="min-w-0 flex-1">
                    <div className="font-extrabold text-xs text-white truncate flex items-center gap-1">
                      <span>{team.shortCode}</span>
                      {isLeadingNow && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />}
                    </div>
                    <div className="text-xs font-mono font-bold text-amber-300">
                      {formatIPLAmount(team.purse)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Dual View: Live Bidding Hammer & Team War Room HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Team Bidding Paddle (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div
            className="rounded-3xl border-2 p-6 shadow-2xl relative overflow-hidden transition-all duration-300"
            style={{
              borderColor: `${selectedTeam.primaryColor}60`,
              background: `radial-gradient(circle at top right, ${selectedTeam.primaryColor}15, #020617 80%)`
            }}
          >
            {/* Stage Indicator Bar */}
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold text-slate-400">
                  Auction Block:
                </span>
                <span
                  className={`text-xs font-black uppercase px-3 py-0.5 rounded-full border ${
                    state.currentStage === 'BIDDING'
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/40 animate-pulse'
                      : state.currentStage === 'GOING_ONCE'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : state.currentStage === 'GOING_TWICE'
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                      : state.currentStage === 'SOLD'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border-white/10'
                  }`}
                >
                  {state.currentStage}
                </span>
              </div>

              {/* Countdown timer */}
              <div className="font-mono text-base font-black px-3 py-1 rounded-xl border bg-slate-900 border-white/10 text-white">
                ⏱️ {state.timer}s
              </div>
            </div>

            {/* Active Player Card */}
            {activePlayer ? (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  <img
                    src={activePlayer.image || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=600&q=80'}
                    alt={activePlayer.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-amber-400 shadow-xl"
                  />

                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black">
                        Category {activePlayer.category || 'A'}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-white/10">
                        {activePlayer.role}
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black text-white">{activePlayer.name}</h2>
                    <p className="text-sm font-semibold text-emerald-400 font-mono mt-1">
                      Base Price: ৳{activePlayer.basePrice}
                    </p>
                  </div>
                </div>

                {/* CURRENT HIGHEST BID */}
                <div className="bg-slate-950 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase font-bold text-slate-400 mb-0.5">
                      Current Bid
                    </div>
                    <div className="text-3xl font-black text-amber-400 font-mono">
                      {formatIPLAmountFull(state.currentBid)}
                    </div>
                  </div>

                  <div className="text-center sm:text-right">
                    <div className="text-xs uppercase font-bold text-slate-400 mb-1">
                      Highest Bid Holder
                    </div>
                    {state.currentBidTeamId ? (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white font-bold text-sm">
                        <span>{state.teams.find(t => t.id === state.currentBidTeamId)?.logo}</span>
                        <span>{state.teams.find(t => t.id === state.currentBidTeamId)?.name}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500 italic">এখনও কোনো Bid আসেনি</span>
                    )}
                  </div>
                </div>

                {/* Quick Increment buttons */}
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Bid বাড়ানোর ধাপ:
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[10, 20, 50, 100].map(inc => {
                      const isSelected = customIncrement === inc || (customIncrement === null && inc === 10);
                      const prospectiveBid = state.currentBidTeamId ? state.currentBid + inc : activePlayer.basePrice;

                      return (
                        <button
                          key={inc}
                          type="button"
                          onClick={() => setCustomIncrement(inc)}
                          className={`p-2 rounded-xl text-center border text-xs font-bold transition-all ${
                            isSelected
                              ? 'border-amber-400 bg-amber-500/20 text-amber-300 ring-1 ring-amber-400'
                              : 'border-white/10 bg-slate-950/60 text-slate-300 hover:border-white/30'
                          }`}
                        >
                          <div>+{inc} TK</div>
                          <div className="text-[10px] font-normal text-slate-400 font-mono">
                            (৳{prospectiveBid})
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* TEAM PADDLE BID BUTTON */}
                <div className="pt-2">
                  {isSquadFull ? (
                    <div className="w-full p-4 rounded-2xl bg-purple-950/80 border-2 border-purple-500/60 text-center shadow-xl space-y-1">
                      <div className="flex items-center justify-center gap-2 text-purple-300 font-black text-base sm:text-lg">
                        <Award className="w-5 h-5 text-purple-400" />
                        <span>স্কোয়াড কোটা সম্পন্ন ({squadCount}/{maxSquad} জন পূর্ণ)</span>
                      </div>
                      <p className="text-xs text-purple-200/80">
                        আপনার ফ্র্যাঞ্চাইজির সর্বোচ্চ ১২ জন খেলোয়াড়ের কোটা পূরণ হয়েছে। আর কোনো প্লেয়ার কেনা যাবে না।
                      </p>
                    </div>
                  ) : isMyTeamLeading ? (
                    <div className="w-full py-4 rounded-2xl bg-emerald-950/80 border-2 border-emerald-500/60 text-center shadow-xl flex items-center justify-center gap-2 text-emerald-400 font-black text-lg">
                      <CheckCircle2 className="w-6 h-6 animate-bounce" />
                      <span>{selectedTeam.shortCode} বর্তমানে সবচেয়ে এগিয়ে আছে (৳{state.currentBid})</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={handlePlaceBid}
                        disabled={!canPlaceBid}
                        className={`w-full py-4 px-6 rounded-2xl font-black text-lg sm:text-xl uppercase tracking-wider flex items-center justify-between border-2 transition-all duration-200 transform active:scale-[0.98] ${
                          canPlaceBid
                            ? 'shadow-2xl hover:brightness-110 cursor-pointer text-slate-950'
                            : 'bg-slate-900 border-white/10 text-slate-500 cursor-not-allowed'
                        }`}
                        style={{
                          backgroundColor: canPlaceBid ? selectedTeam.primaryColor : undefined,
                          borderColor: canPlaceBid ? selectedTeam.accentColor || '#FFFFFF' : undefined
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🏓</span>
                          <div className="text-left leading-tight">
                            <div className="text-xs font-bold text-slate-900/80 uppercase">
                              {selectedTeam.shortCode} BID
                            </div>
                            <div className="text-xl sm:text-2xl font-extrabold text-slate-950 font-mono">
                              BID ৳{nextBidAmount}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-black/20 text-slate-950 font-mono">
                            +{nextBidAmount - state.currentBid} TK
                          </span>
                        </div>
                      </button>

                      {/* Bidding eligibility warning message */}
                      {!bidEligibility.canBid && (
                        <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5">
                          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                          <div>
                            <div className="font-bold">বিড করতে পারছেন না:</div>
                            <div className="mt-0.5 text-rose-200">{bidEligibility.reason}</div>
                          </div>
                        </div>
                      )}

                      {/* Quota & Max Permissible Bid Status Bar */}
                      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 px-1 pt-1 bg-slate-950/50 p-2 rounded-xl border border-white/5">
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-amber-400" />
                          <span>স্কোয়াড: <strong className="text-white">{squadCount}/{maxSquad}</strong> (ন্যূনতম {minSquad} জন)</span>
                        </span>
                        <span>
                          সর্বোচ্চ অনুমোদিত বিড: <strong className="text-amber-400 font-mono">৳{maxPermissibleBid}</strong>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <Shield className="w-12 h-12 mx-auto text-slate-600 mb-2" />
                <h4 className="text-base font-bold text-white mb-1">পরবর্তী Player-এর জন্য অপেক্ষা করুন</h4>
                <p className="text-xs max-w-sm mx-auto">
                  Admin পরবর্তী Player-কে Auction-এ তুললে এখানে তার নাম ও তথ্য আসবে।
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: কেনা Player-এর তালিকা ও বাজেট (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Budget status */}
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{selectedTeam.logo}</span>
                <div>
                  <h3 className="text-base font-black text-white">{selectedTeam.name}</h3>
                  <div className="text-xs text-slate-400">বাজেট ও কেনা খেলোয়াড়</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">অবশিষ্ট বাজেট</div>
                <div className="text-2xl font-black text-amber-400 font-mono">
                  {formatIPLAmount(selectedTeam.purse)}
                </div>
              </div>
            </div>

            <div className="mt-3 flex justify-between text-xs text-slate-300">
              <span>শুরু বাজেট: <strong>৳{selectedTeam.originalPurse}</strong></span>
              <span>মোট খরচ: <strong className="text-amber-400 font-mono">৳{selectedTeam.originalPurse - selectedTeam.purse}</strong></span>
            </div>
          </div>

          {/* Squad Quota Card (Min 8, Max 12) */}
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-400" />
                <span>স্কোয়াড কোটা (Min 8 &bull; Max 12)</span>
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-black ${
                isSquadFull
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : isMinSquadMet
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                {squadCount}/{maxSquad} জন
              </span>
            </div>

            {/* Visual Progress Bar with Min 8 & Max 12 Milestones */}
            <div className="space-y-1.5">
              <div className="relative w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-white/10">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    isSquadFull
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-500'
                      : isMinSquadMet
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : 'bg-gradient-to-r from-amber-500 to-amber-400'
                  }`}
                  style={{ width: `${Math.min(100, (squadCount / maxSquad) * 100)}%` }}
                />
                {/* 8-player marker line */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-amber-400 shadow-[0_0_6px_#f59e0b]"
                  style={{ left: `${(minSquad / maxSquad) * 100}%` }}
                  title="ন্যূনতম ৮ জন"
                />
              </div>

              {/* Threshold Labels */}
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>০ জন</span>
                <span className="text-amber-400 font-bold">ন্যূনতম ৮ জন (ম্যান্ডেটরি)</span>
                <span className="text-purple-400 font-bold">সর্বোচ্চ ১২ জন</span>
              </div>
            </div>

            {/* Quota Status Explanation */}
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 text-xs text-slate-300 space-y-1">
              {isSquadFull ? (
                <div className="text-purple-300 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  <span>১২ জনের পূর্ণাঙ্গ স্কোয়াড গঠিত হয়েছে!</span>
                </div>
              ) : isMinSquadMet ? (
                <div className="text-emerald-300 font-semibold flex items-center justify-between">
                  <span>✅ ন্যূনতম ৮ জনের কোটা পূর্ণ হয়েছে</span>
                  <span className="text-slate-400 font-mono">আরও {remainingToMax} জন নেওয়া যাবে</span>
                </div>
              ) : (
                <div className="text-amber-300 font-semibold flex items-center justify-between">
                  <span>⚠️ ন্যূনতম কোটা পূরণ বাকি:</span>
                  <span className="font-bold text-white font-mono">{remainingToMin} জন প্রয়োজন</span>
                </div>
              )}

              <div className="text-[11px] text-slate-400 border-t border-white/5 pt-1 mt-1 flex justify-between">
                <span>বাকিদের রিজার্ভ সহ সর্বোচ্চ বিড:</span>
                <strong className="text-amber-400 font-mono">৳{maxPermissibleBid}</strong>
              </div>
            </div>
          </div>

          {/* Acquired Players List */}
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center justify-between border-b border-white/5 pb-2">
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span>কেনা Player-এর তালিকা</span>
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-bold">
                {selectedTeam.squad.length} জন
              </span>
            </h3>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {selectedTeam.squad.length > 0 ? (
                selectedTeam.squad.map((player, idx) => (
                  <div
                    key={player.id}
                    className="p-2.5 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-slate-500 text-[10px]">{idx + 1}.</span>
                      <div className="min-w-0">
                        <div className="font-bold text-white truncate flex items-center gap-1">
                          <span>{player.name}</span>
                          <span className="text-[9px] px-1 rounded bg-amber-500 text-slate-950 font-black">
                            {player.category || 'A'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">{player.role}</div>
                      </div>
                    </div>

                    <div className="font-mono font-bold text-emerald-400 text-sm shrink-0">
                      {formatIPLAmount(player.soldPrice || player.basePrice)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-500 italic">
                  এখনও কোনো Player কেনা হয়নি। Bidding শুরু হলে Paddle চাপুন!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
