import React from 'react';
import { AuctionState } from '../../types/auction';
import { formatIPLAmount, formatIPLAmountFull } from '../../utils/auctionUtils';
import { Trophy, Tv, Sparkles, TrendingUp, ShieldAlert, Award, Clock } from 'lucide-react';

interface BroadcastViewProps {
  state: AuctionState;
}

export const BroadcastView: React.FC<BroadcastViewProps> = ({ state }) => {
  const activePlayer = state.players.find(p => p.id === state.currentPlayerId);
  const leadingTeam = state.teams.find(t => t.id === state.currentBidTeamId);

  // Identify duelists: last 2 distinct bidding teams
  const recentTeamsInBids: string[] = [];
  for (const bid of state.bidHistory) {
    if (!recentTeamsInBids.includes(bid.teamId)) {
      recentTeamsInBids.push(bid.teamId);
    }
    if (recentTeamsInBids.length === 2) break;
  }
  const duelTeamA = state.teams.find(t => t.id === recentTeamsInBids[0]);
  const duelTeamB = state.teams.find(t => t.id === recentTeamsInBids[1]);

  // Top purchases of the day
  const topBuys = [...state.recentSales].sort((a, b) => b.amount - a.amount).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Studio Header Marquee */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-slate-950 px-6 py-2.5 rounded-2xl flex items-center justify-between shadow-xl font-bold text-xs uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
          <span>JPL Live Broadcast Studio</span>
          <span className="hidden sm:inline">&bull; Real-Time Arena Telecast</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden md:inline">JANKHALI PREMIER LEAGUE MEGA AUCTION</span>
          <span className="bg-slate-950 text-amber-400 px-2 py-0.5 rounded text-[10px]">
            BUDGET: 2,000 TK &bull; SQUAD: MIN 8 - MAX 12
          </span>
        </div>
      </div>

      {/* Main Big Screen Presentation */}
      <div className="relative rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-amber-500/40 p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Stage Lighting FX */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/15 rounded-full blur-[100px] pointer-events-none" />

        {activePlayer ? (
          <div className="space-y-8 relative z-10">
            {/* Top Stage Badges & Timer */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-xs sm:text-sm font-black tracking-widest px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                  {activePlayer.set}
                </span>
                <span
                  className={`text-xs sm:text-sm font-black uppercase px-4 py-1 rounded-full border ${
                    state.currentStage === 'BIDDING'
                      ? 'bg-blue-600/30 text-blue-300 border-blue-400 animate-pulse'
                      : state.currentStage === 'GOING_ONCE'
                      ? 'bg-amber-500 text-slate-950 font-black border-amber-300 animate-bounce'
                      : state.currentStage === 'GOING_TWICE'
                      ? 'bg-rose-600 text-white font-black border-rose-300 animate-bounce'
                      : state.currentStage === 'SOLD'
                      ? 'bg-emerald-500 text-slate-950 font-black border-emerald-300'
                      : 'bg-slate-800 text-slate-300 border-white/10'
                  }`}
                >
                  {state.currentStage === 'GOING_ONCE'
                    ? 'GOING ONCE...'
                    : state.currentStage === 'GOING_TWICE'
                    ? 'GOING TWICE... FINAL CALL!'
                    : state.currentStage.replace('_', ' ')}
                </span>
              </div>

              {/* Countdown Ticker */}
              <div className="flex items-center gap-2 bg-slate-950/80 px-4 py-1.5 rounded-2xl border border-white/10">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-xs uppercase font-bold text-slate-400">Countdown:</span>
                <span
                  className={`font-mono text-xl sm:text-2xl font-black ${
                    state.timer <= 5 ? 'text-rose-400 animate-pulse' : 'text-amber-400'
                  }`}
                >
                  {state.timer}s
                </span>
              </div>
            </div>

            {/* Giant Center Stage: Player Spotlight */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              {/* Player Image with TV Frame (4 cols) */}
              <div className="md:col-span-4 flex flex-col items-center">
                <div className="relative group">
                  <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-500 to-amber-700 opacity-70 blur-md group-hover:opacity-100 transition-all" />
                  <img
                    src={activePlayer.image}
                    alt={activePlayer.name}
                    className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-2xl object-cover border-4 border-amber-400/80 shadow-2xl"
                  />
                  {activePlayer.isOverseas && (
                    <div className="absolute bottom-3 left-3 right-3 text-center py-1 rounded-lg bg-sky-900/90 border border-sky-400 text-sky-200 text-xs font-black uppercase tracking-wider backdrop-blur-sm">
                      ✈️ Overseas Player ({activePlayer.country})
                    </div>
                  )}
                </div>
              </div>

              {/* Player Details & Real-Time Bid Counter (8 cols) */}
              <div className="md:col-span-8 space-y-5 text-center md:text-left">
                <div>
                  <div className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">
                    {activePlayer.role} &bull; {activePlayer.country}
                  </div>
                  <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                    {activePlayer.name}
                  </h1>
                  <p className="text-sm text-slate-300 mt-1">
                    {activePlayer.batStyle} &bull; {activePlayer.bowlStyle}
                  </p>
                </div>

                {/* IPL Career Snapshot */}
                <div className="grid grid-cols-4 gap-2.5 max-w-lg">
                  <div className="bg-slate-900/80 border border-white/10 p-2.5 rounded-xl text-center">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Category</div>
                    <div className="text-lg font-black text-amber-400">{activePlayer.category || 'A'}</div>
                  </div>
                  <div className="bg-slate-900/80 border border-white/10 p-2.5 rounded-xl text-center">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">
                      {activePlayer.role === 'Bowler' ? 'Wickets' : 'Runs'}
                    </div>
                    <div className="text-lg font-black text-amber-400">
                      {activePlayer.role === 'Bowler' ? activePlayer.stats?.wickets || 0 : activePlayer.stats?.runs || 0}
                    </div>
                  </div>
                  <div className="bg-slate-900/80 border border-white/10 p-2.5 rounded-xl text-center">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">
                      Matches
                    </div>
                    <div className="text-lg font-black text-white">
                      {activePlayer.stats?.matches || 0}
                    </div>
                  </div>
                  <div className="bg-slate-900/80 border border-white/10 p-2.5 rounded-xl text-center">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Base Price</div>
                    <div className="text-lg font-black text-emerald-400">৳{activePlayer.basePrice}</div>
                  </div>
                </div>

                {/* THE GOLDEN GLOW BID BOX */}
                <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 border-2 border-amber-500/60 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-widest text-amber-400 font-extrabold mb-1">
                        Current Highest Offer
                      </div>
                      <div className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200 font-mono tracking-tight">
                        {formatIPLAmountFull(state.currentBid)}
                      </div>
                    </div>

                    <div className="text-center sm:text-right">
                      <div className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1.5">
                        Leading Franchise
                      </div>
                      {leadingTeam ? (
                        <div
                          className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl border-2 font-black text-lg shadow-xl"
                          style={{
                            backgroundColor: `${leadingTeam.primaryColor}30`,
                            borderColor: leadingTeam.primaryColor,
                            color: leadingTeam.primaryColor
                          }}
                        >
                          <span className="text-2xl">{leadingTeam.logo}</span>
                          <span>{leadingTeam.name}</span>
                        </div>
                      ) : (
                        <div className="text-sm text-slate-500 font-semibold italic">
                          Awaiting opening paddle...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* BIDDING WAR DUEL (When two franchises are locked in a bidding battle) */}
            {duelTeamA && duelTeamB && (
              <div className="bg-slate-950/90 border border-white/10 rounded-2xl p-4">
                <div className="text-center text-xs font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>War Room Bidding Duel</span>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>

                <div className="flex items-center justify-around gap-4">
                  {/* Duelist A */}
                  <div
                    className="flex-1 p-3 rounded-xl border flex items-center justify-center gap-3"
                    style={{
                      borderColor: duelTeamA.primaryColor,
                      backgroundColor: `${duelTeamA.primaryColor}15`
                    }}
                  >
                    <span className="text-3xl">{duelTeamA.logo}</span>
                    <div className="text-left">
                      <div className="font-black text-white text-base">{duelTeamA.name}</div>
                      <div className="text-xs text-amber-300 font-mono">
                        Purse: {formatIPLAmount(duelTeamA.purse)} &bull; Squad: {duelTeamA.squad.length}/12
                      </div>
                    </div>
                  </div>

                  <div className="text-xl font-black text-amber-400 px-3">VS</div>

                  {/* Duelist B */}
                  <div
                    className="flex-1 p-3 rounded-xl border flex items-center justify-center gap-3"
                    style={{
                      borderColor: duelTeamB.primaryColor,
                      backgroundColor: `${duelTeamB.primaryColor}15`
                    }}
                  >
                    <span className="text-3xl">{duelTeamB.logo}</span>
                    <div className="text-left">
                      <div className="font-black text-white text-base">{duelTeamB.name}</div>
                      <div className="text-xs text-amber-300 font-mono">
                        Purse: {formatIPLAmount(duelTeamB.purse)} &bull; Squad: {duelTeamB.squad.length}/12
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-20 text-center text-slate-400">
            <Tv className="w-16 h-16 mx-auto text-slate-600 mb-4 animate-pulse" />
            <h3 className="text-2xl font-black text-white mb-2">JANKHALI PREMIER LEAGUE MEGA AUCTION</h3>
            <p className="text-sm max-w-md mx-auto text-slate-400">
              The stage is set in the Jankhali Arena. Squad rules: Minimum 8 Players, Maximum 12 Players per franchise.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Grid: Live Ticker & Top Buys Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Announcements & Auctioneer Call Feed (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-white/10 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Live Auctioneer Broadcast Feed
            </h3>
            <span className="text-[11px] text-slate-400">Real-Time Commentary</span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {state.announcements.slice(0, 15).map(item => (
              <div
                key={item.id}
                className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 text-xs text-slate-200 flex items-start gap-2.5"
              >
                <span className="text-base shrink-0 mt-0.5">
                  {item.type === 'hammer' ? '🔨' : item.type === 'bid' ? '🏓' : item.type === 'chat' ? '💬' : '📢'}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-slate-200">{item.text}</p>
                  <span className="text-[10px] text-slate-500">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Buys of the Auction (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-white/10 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Costliest Buys of the Auction</span>
            </h3>
            <span className="text-[11px] text-amber-400 font-bold">Top 5</span>
          </div>

          <div className="space-y-2">
            {topBuys.length > 0 ? (
              topBuys.map((sale, idx) => (
                <div
                  key={sale.playerId}
                  className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[10px] shrink-0">
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <div className="font-bold text-white truncate flex items-center gap-1.5">
                        <span>{sale.playerName}</span>
                        <span className="text-[10px] px-1 rounded bg-amber-500 text-slate-950 font-bold">{sale.playerCategory || 'A'}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Sold to <strong style={{ color: sale.teamColor }}>{sale.teamShort}</strong> ({sale.playerRole})
                      </div>
                    </div>
                  </div>

                  <div className="font-mono font-black text-amber-400 text-sm shrink-0">
                    {formatIPLAmountFull(sale.amount)}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-500 italic">
                No players sold yet in this session.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
