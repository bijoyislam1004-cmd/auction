import React, { useState } from 'react';
import { AuctionState, Team } from '../../types/auction';
import { formatIPLAmount, formatIPLAmountFull } from '../../utils/auctionUtils';
import { Shield, Users, DollarSign, Download, Trophy, Check, Copy } from 'lucide-react';

interface SquadsViewProps {
  state: AuctionState;
}

export const SquadsView: React.FC<SquadsViewProps> = ({ state }) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string>('ALL');
  const [copiedTeamId, setCopiedTeamId] = useState<string | null>(null);

  const teamsToDisplay = selectedTeamId === 'ALL'
    ? state.teams
    : state.teams.filter(t => t.id === selectedTeamId);

  const handleCopySquad = (team: Team) => {
    const maxSquad = team.maxSquad || 12;
    const minSquad = team.minSquad || 8;
    const text = `🏏 ${team.name} (${team.shortCode}) - JPL Squad:\n` +
      `Budget Remaining: ${formatIPLAmountFull(team.purse)}\n` +
      `Squad Total: ${team.squad.length}/${maxSquad} (Rule: Min ${minSquad} - Max ${maxSquad} Players)\n\n` +
      team.squad.map((p, idx) => `${idx + 1}. ${p.name} (${p.role}) - ${formatIPLAmount(p.soldPrice || p.basePrice)}`).join('\n');

    navigator.clipboard.writeText(text);
    setCopiedTeamId(team.id);
    setTimeout(() => setCopiedTeamId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header and Summary Bar */}
      <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>Jankhali Premier League Squads & Budgets (2,000 TK Cap)</span>
            </h2>
            <p className="text-xs text-slate-400">
              Complete breakdown of JPL franchises, 2,000 TK budget allocation, and player rosters (Squad Limits: Min 8, Max 12 Players).
            </p>
          </div>

          {/* Quick Team Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
            <button
              onClick={() => setSelectedTeamId('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedTeamId === 'ALL'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              All Franchises
            </button>
            {state.teams.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTeamId(t.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedTeamId === t.id
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {t.shortCode}
              </button>
            ))}
          </div>
        </div>

        {/* League Aggregate Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-center">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5">
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Players Sold</div>
            <div className="text-xl font-black text-white">{state.totalPlayersSold}</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5">
            <div className="text-[10px] uppercase font-bold text-slate-400">Total League Spend</div>
            <div className="text-xl font-black text-amber-400 font-mono">
              {formatIPLAmount(state.totalSoldAmount)}
            </div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5">
            <div className="text-[10px] uppercase font-bold text-slate-400">Unsold in Session</div>
            <div className="text-xl font-black text-rose-400">{state.totalPlayersUnsold}</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5">
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Registered Stars</div>
            <div className="text-xl font-black text-emerald-400">{state.players.length}</div>
          </div>
        </div>
      </div>

      {/* Franchises Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teamsToDisplay.map(team => {
          const overseasCount = team.squad.filter(p => p.isOverseas).length;
          const totalSpent = team.originalPurse - team.purse;
          const batsmen = team.squad.filter(p => p.role === 'Batsman').length;
          const bowlers = team.squad.filter(p => p.role === 'Bowler').length;
          const allRounders = team.squad.filter(p => p.role === 'All-Rounder').length;
          const keepers = team.squad.filter(p => p.role === 'Wicketkeeper').length;

          return (
            <div
              key={team.id}
              className="bg-slate-900/90 border rounded-2xl p-5 shadow-xl space-y-4 transition-all"
              style={{ borderColor: `${team.primaryColor}40` }}
            >
              {/* Team Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{team.logo}</span>
                  <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <span>{team.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded font-black text-slate-950" style={{ backgroundColor: team.primaryColor }}>
                        {team.shortCode}
                      </span>
                    </h3>
                    <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2 mt-0.5">
                      <span>
                        Squad: <strong className={team.squad.length >= (team.maxSquad || 12) ? 'text-purple-400' : team.squad.length >= (team.minSquad || 8) ? 'text-emerald-400' : 'text-amber-400'}>
                          {team.squad.length}/{team.maxSquad || 12}
                        </strong>
                      </span>
                      <span>&bull;</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                        team.squad.length >= (team.maxSquad || 12)
                          ? 'bg-purple-500/20 text-purple-300'
                          : team.squad.length >= (team.minSquad || 8)
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {team.squad.length >= (team.maxSquad || 12)
                          ? '12/12 Full'
                          : team.squad.length >= (team.minSquad || 8)
                          ? `Min Met (${12 - team.squad.length} left)`
                          : `Need ${8 - team.squad.length} for Min 8`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Remaining Purse</div>
                    <div className="text-lg font-mono font-black text-amber-400">
                      {formatIPLAmount(team.purse)}
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopySquad(team)}
                    title="Copy squad roster to clipboard"
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10"
                  >
                    {copiedTeamId === team.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Squad Quota Visual Meter (Min 8 / Max 12) */}
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/5 space-y-1.5">
                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span className="font-semibold text-slate-300">Squad Quota Progress</span>
                  <span>
                    <strong className="text-white">{team.squad.length}</strong> / {team.maxSquad || 12} Players (Min: {team.minSquad || 8})
                  </span>
                </div>
                <div className="relative w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-white/10">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      team.squad.length >= (team.maxSquad || 12)
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-500'
                        : team.squad.length >= (team.minSquad || 8)
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : 'bg-gradient-to-r from-amber-500 to-amber-400'
                    }`}
                    style={{ width: `${Math.min(100, (team.squad.length / (team.maxSquad || 12)) * 100)}%` }}
                  />
                  {/* Min 8 tick marker */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-amber-400"
                    style={{ left: `${((team.minSquad || 8) / (team.maxSquad || 12)) * 100}%` }}
                    title="Min 8 Quota"
                  />
                </div>
                <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                  <span>0</span>
                  <span className="text-amber-400/80 font-bold">Min 8 Required</span>
                  <span className="text-purple-400/80 font-bold">Max 12</span>
                </div>
              </div>

              {/* Role Distribution Pill Tracker */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-1.5 rounded-lg bg-slate-950/60 border border-white/5">
                  <span className="text-[10px] text-slate-400 block font-semibold">BAT</span>
                  <strong className="text-white text-sm">{batsmen}</strong>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-950/60 border border-white/5">
                  <span className="text-[10px] text-slate-400 block font-semibold">BOWL</span>
                  <strong className="text-white text-sm">{bowlers}</strong>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-950/60 border border-white/5">
                  <span className="text-[10px] text-slate-400 block font-semibold">AR</span>
                  <strong className="text-white text-sm">{allRounders}</strong>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-950/60 border border-white/5">
                  <span className="text-[10px] text-slate-400 block font-semibold">WK</span>
                  <strong className="text-white text-sm">{keepers}</strong>
                </div>
              </div>

              {/* Acquired Players List */}
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {team.squad.length > 0 ? (
                  team.squad.map((player, idx) => (
                    <div
                      key={player.id}
                      className="p-2 rounded-xl bg-slate-950/50 border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-slate-500 font-mono text-[10px] w-4 text-right">
                          {idx + 1}.
                        </span>
                        <img
                          src={player.image}
                          alt={player.name}
                          className="w-7 h-7 rounded-lg object-cover border border-white/10 shrink-0"
                        />
                        <div className="truncate">
                          <span className="font-bold text-white truncate flex items-center gap-1">
                            {player.name}
                            {player.isOverseas && <span className="text-[10px]">✈️</span>}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {player.role} &bull; {player.country}
                          </span>
                        </div>
                      </div>

                      <div className="font-mono font-bold text-emerald-400 shrink-0">
                        {formatIPLAmount(player.soldPrice || player.basePrice)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-slate-500 italic">
                    No players signed yet. Full purse available!
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
