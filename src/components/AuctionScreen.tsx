import React, { useState } from 'react';
import { AuctionState, Team } from '../types/auction';
import { formatIPLAmount, formatIPLAmountFull, getStandardIncrement } from '../utils/auctionUtils';
import { Gavel, CheckCircle2, XCircle, ArrowRight, ShieldCheck, Sparkles, Volume2 } from 'lucide-react';

interface AuctionScreenProps {
  state: AuctionState;
  onSendMessage: (type: string, payload?: Record<string, unknown>) => void;
}

export const AuctionScreen: React.FC<AuctionScreenProps> = ({ state, onSendMessage }) => {
  const [customBidStep, setCustomBidStep] = useState<number>(10);

  const activePlayer = state.players.find(p => p.id === state.currentPlayerId);
  const leadingTeam = state.teams.find(t => t.id === state.currentBidTeamId);

  // Teams to show on screen (First 4 or all)
  const displayTeams = state.teams.slice(0, 4);

  const handleTeamBid = (team: Team) => {
    if (!activePlayer) return;
    const nextAmount = state.currentBidTeamId
      ? state.currentBid + customBidStep
      : activePlayer.basePrice;

    if (team.purse < nextAmount) {
      alert(`${team.name}-এর কাছে পর্যাপ্ত বাজেট নেই (বাকি আছে ৳${team.purse})`);
      return;
    }

    onSendMessage('PLACE_BID', {
      teamId: team.id,
      amount: nextAmount
    });
  };

  const handleHammerSell = () => {
    if (!state.currentBidTeamId) {
      alert('এখনও কোনো Team Bid করেনি!');
      return;
    }
    onSendMessage('HAMMER_SELL');
  };

  const handleHammerUnsold = () => {
    onSendMessage('HAMMER_UNSOLD');
  };

  const handleHammerCall = (stage: 'GOING_ONCE' | 'GOING_TWICE') => {
    onSendMessage('HAMMER_CALL', { stage });
  };

  const handleNextPlayer = () => {
    onSendMessage('NEXT_PLAYER');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Exact Visual Header matching specification */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-amber-400 tracking-wider font-sans uppercase">
          JANKHALI PREMIER LEAGUE
        </h1>
        <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-widest uppercase">
          PLAYER AUCTION
        </h2>
        <div className="w-24 h-1 bg-amber-500 mx-auto rounded-full mt-1" />
      </div>

      {/* Main Auction Stage Container */}
      <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Active Player Card Block */}
        <div className="bg-slate-950/90 border border-white/10 rounded-2xl p-5 mb-6 text-center sm:text-left flex flex-col sm:flex-row items-center gap-5">
          {activePlayer ? (
            <>
              <img
                src={activePlayer.image || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=600&q=80'}
                alt={activePlayer.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-amber-400 shadow-lg"
              />
              <div className="flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 uppercase">
                    Category: {activePlayer.category || 'A'}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-white/10">
                    {activePlayer.role}
                  </span>
                  <span
                    className={`text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                      state.currentStage === 'BIDDING'
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/40 animate-pulse'
                        : state.currentStage === 'GOING_ONCE'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : state.currentStage === 'GOING_TWICE'
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-bounce'
                        : state.currentStage === 'SOLD'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400 border-white/10'
                    }`}
                  >
                    {state.currentStage.replace('_', ' ')}
                  </span>
                </div>

                <div className="text-2xl sm:text-3xl font-black text-white flex items-center justify-center sm:justify-start gap-2">
                  <span>🏏</span>
                  <span>PLAYER: {activePlayer.name}</span>
                </div>

                <div className="text-sm font-semibold text-slate-300 flex items-center justify-center sm:justify-start gap-4 pt-1">
                  <span>Base Price: <strong className="text-emerald-400 font-mono text-base font-bold">৳{activePlayer.basePrice}</strong></span>
                  {activePlayer.stats && (
                    <span className="text-xs text-slate-400">
                      Matches: {activePlayer.stats.matches} &bull; Runs: {activePlayer.stats.runs || 0} &bull; Wkts: {activePlayer.stats.wickets || 0}
                    </span>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="w-full text-center py-6 space-y-2">
              <div className="text-3xl">🏏</div>
              <h3 className="text-xl font-bold text-white">PLAYER: ADMIN WILL ADD / নির্বাচন করুন</h3>
              <p className="text-xs text-slate-400">
                নিচের বাটন চেপে যেকোনো Player তুলুন অথবা Admin Panel থেকে নির্বাচন করুন।
              </p>
              <button
                onClick={handleNextPlayer}
                className="mt-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
              >
                পরবর্তী Player তুলুন
              </button>
            </div>
          )}
        </div>

        {/* 4 TEAMS BUDGET BOXES - 4-Column Table Grid matching diagram */}
        <div className="mb-8">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
            ৪টি Team-এর বাজেট ও বর্তমান অবস্থা:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {displayTeams.map((team, idx) => {
              const isHighestBidder = state.currentBidTeamId === team.id;

              return (
                <div
                  key={team.id}
                  className={`p-3.5 sm:p-4 rounded-2xl border-2 text-center transition-all relative overflow-hidden ${
                    isHighestBidder
                      ? 'border-amber-400 bg-amber-500/15 ring-2 ring-amber-400/50 shadow-xl'
                      : 'border-white/10 bg-slate-950/70 hover:border-white/20'
                  }`}
                  style={{
                    borderColor: isHighestBidder ? team.primaryColor : undefined
                  }}
                >
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <span className="text-xl">{team.logo}</span>
                    <span className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                      {team.shortCode || `TEAM ${idx + 1}`}
                    </span>
                  </div>

                  <div className="text-lg sm:text-xl font-black text-amber-400 font-mono tracking-tight">
                    {formatIPLAmount(team.purse)}
                  </div>

                  <div className="flex items-center justify-center gap-1.5 mt-1 text-[10px]">
                    <span className="text-slate-400 font-semibold">
                      দল: <strong className="text-white">{team.squad.length}/12</strong>
                    </span>
                    <span className={`px-1 py-0.2 rounded text-[9px] font-bold ${
                      team.squad.length >= (team.maxSquad || 12)
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : team.squad.length >= (team.minSquad || 8)
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {team.squad.length >= (team.maxSquad || 12)
                        ? 'FULL'
                        : team.squad.length >= (team.minSquad || 8)
                        ? '৮+ পূর্ণ'
                        : `বাকি ${8 - team.squad.length}`}
                    </span>
                  </div>

                  {isHighestBidder && (
                    <div className="mt-1.5 inline-block px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[9px] font-black uppercase tracking-wider animate-pulse">
                      HIGHEST BIDDER
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CENTERPIECE: CURRENT BID DISPLAY */}
        <div className="my-6 text-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-500/60 rounded-3xl p-6 shadow-inner relative">
          <div className="text-xs sm:text-sm font-black text-amber-400 uppercase tracking-widest mb-1">
            CURRENT BID
          </div>
          <div className="text-4xl sm:text-6xl font-black text-white font-mono tracking-tight drop-shadow-md">
            {formatIPLAmountFull(state.currentBid || (activePlayer?.basePrice || 200))}
          </div>

          <div className="mt-2 text-xs font-semibold text-slate-300">
            {leadingTeam ? (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-white/10">
                <span>{leadingTeam.logo}</span>
                <span>{leadingTeam.name} ({leadingTeam.shortCode}) বর্তমানে এগিয়ে</span>
              </span>
            ) : (
              <span className="text-slate-500 italic">
                কোনো Bid আসেনি &bull; Base Price: {formatIPLAmount(activePlayer?.basePrice || 200)}
              </span>
            )}
          </div>

          {/* Quick Bid Increment Steps */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold">Bid বাড়ানোর ধাপ:</span>
            {[10, 20, 50, 100].map(step => (
              <button
                key={step}
                onClick={() => setCustomBidStep(step)}
                className={`px-2.5 py-1 rounded-lg font-bold border transition-all ${
                  customBidStep === step
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-slate-800 text-slate-300 border-white/10 hover:text-white'
                }`}
              >
                +{step} TK
              </button>
            ))}
          </div>
        </div>

        {/* 4 TEAM BID BUTTONS: [ TEAM 1 BID ] [ TEAM 2 BID ] [ TEAM 3 BID ] [ TEAM 4 BID ] */}
        <div className="space-y-2 mb-6">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
            Team Bid Controls (ক্লিক করে সরাসরি Bid দিন):
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {displayTeams.map((team, idx) => {
              const isLeading = state.currentBidTeamId === team.id;
              const nextBid = state.currentBidTeamId
                ? state.currentBid + customBidStep
                : activePlayer?.basePrice || 200;

              const hasEnoughPurse = team.purse >= nextBid;
              const canClick = activePlayer && !isLeading && hasEnoughPurse && state.currentStage !== 'SOLD' && state.currentStage !== 'UNSOLD';

              return (
                <button
                  key={team.id}
                  onClick={() => handleTeamBid(team)}
                  disabled={!canClick}
                  className={`py-3.5 px-3 rounded-2xl font-black text-sm uppercase tracking-wider border-2 transition-all flex flex-col items-center justify-center gap-0.5 shadow-lg ${
                    isLeading
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400 ring-2 ring-emerald-500/50 cursor-default'
                      : canClick
                      ? 'hover:brightness-125 hover:scale-[1.02] cursor-pointer text-white'
                      : 'bg-slate-900 border-white/10 text-slate-500 cursor-not-allowed opacity-50'
                  }`}
                  style={{
                    backgroundColor: isLeading ? undefined : canClick ? `${team.primaryColor}25` : undefined,
                    borderColor: isLeading ? undefined : canClick ? team.primaryColor : undefined
                  }}
                >
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black">
                    <span>{team.logo}</span>
                    <span>{team.shortCode || `TEAM ${idx + 1}`} BID</span>
                  </div>

                  <div className="text-[11px] font-mono font-bold text-amber-300">
                    {isLeading ? 'LEADS BID' : `BID ৳${nextBid}`}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 🔨 SOLD / ❌ UNSOLD ACTION BUTTONS */}
        <div className="pt-2 border-t border-white/10">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-center flex items-center justify-center gap-1.5">
            <Gavel className="w-3.5 h-3.5 text-amber-400" />
            <span>Auctioneer Hammer Decision (হ্যামার কন্ট্রোল):</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              onClick={() => handleHammerCall('GOING_ONCE')}
              disabled={!state.currentBidTeamId || state.currentStage === 'GOING_ONCE'}
              className="py-2.5 px-3 rounded-xl font-bold text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              🔔 Going ONCE...
            </button>

            <button
              onClick={() => handleHammerCall('GOING_TWICE')}
              disabled={!state.currentBidTeamId || state.currentStage === 'GOING_TWICE'}
              className="py-2.5 px-3 rounded-xl font-bold text-xs bg-orange-500/20 text-orange-300 border border-orange-500/40 hover:bg-orange-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              🔔 Going TWICE...
            </button>

            <button
              onClick={handleHammerSell}
              disabled={!state.currentBidTeamId || state.currentStage === 'SOLD'}
              className="py-2.5 px-3 rounded-xl font-black text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>🔨 SOLD!</span>
            </button>

            <button
              onClick={handleHammerUnsold}
              disabled={state.currentBidTeamId !== null || state.currentStage === 'UNSOLD'}
              className="py-2.5 px-3 rounded-xl font-bold text-xs bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1"
            >
              <XCircle className="w-4 h-4" />
              <span>❌ UNSOLD</span>
            </button>
          </div>
        </div>
      </div>

      {/* Roster of 4 Teams with purchased players */}
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <span>🏏 ৪টি Team-এর কেনা Player-এর তালিকা</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {displayTeams.map(team => (
            <div
              key={team.id}
              className="bg-slate-950/70 border rounded-xl p-3 space-y-2"
              style={{ borderColor: `${team.primaryColor}40` }}
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                <span className="font-extrabold text-white text-xs flex items-center gap-1.5">
                  <span>{team.logo}</span>
                  <span>{team.shortCode}</span>
                  <span className="text-[10px] text-slate-400 font-semibold font-mono">
                    ({team.squad.length}/12)
                  </span>
                </span>
                <span className="font-mono text-amber-400 font-bold text-xs">
                  {formatIPLAmount(team.purse)}
                </span>
              </div>

              <div className="space-y-1 max-h-40 overflow-y-auto pr-1 text-xs">
                {team.squad.length > 0 ? (
                  team.squad.map((p, idx) => (
                    <div
                      key={p.id}
                      className="p-1.5 rounded bg-slate-900 border border-white/5 flex items-center justify-between text-[11px]"
                    >
                      <span className="text-white font-medium truncate">
                        {idx + 1}. {p.name}
                      </span>
                      <span className="font-mono text-emerald-400 font-bold shrink-0">
                        {formatIPLAmount(p.soldPrice || p.basePrice)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-[11px] text-slate-500 italic py-2 text-center">
                    এখনও কোনো Player কেনেনি
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
