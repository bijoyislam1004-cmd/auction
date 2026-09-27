import React, { useState } from 'react';
import { AuctionState, Player, Team } from '../../types/auction';
import { formatIPLAmount, formatIPLAmountFull, getStandardIncrement } from '../../utils/auctionUtils';
import { Gavel, Play, Pause, ArrowRight, UserPlus, Search, CheckCircle2, XCircle, Shield, DollarSign, Edit3, Check, Trash2, Plus, Users, KeyRound, LogOut, Lock } from 'lucide-react';
import { AccountManager } from './AccountManager';

interface AdminPanelProps {
  state: AuctionState;
  onSendMessage: (type: string, payload?: Record<string, unknown>) => void;
  currentUser?: { username: string; role: string; name: string } | null;
  onLogout?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ state, onSendMessage, currentUser, onLogout }) => {
  const [adminTab, setAdminTab] = useState<'auction' | 'accounts'>('auction');
  const [selectedSet, setSelectedSet] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modals
  const [showAddPlayerModal, setShowAddPlayerModal] = useState<boolean>(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [showAddTeamModal, setShowAddTeamModal] = useState<boolean>(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  // New Player form state
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerCategory, setNewPlayerCategory] = useState<'A' | 'B' | 'C' | string>('A');
  const [newPlayerRole, setNewPlayerRole] = useState<'Batsman' | 'Bowler' | 'All-Rounder' | 'Wicketkeeper'>('All-Rounder');
  const [newPlayerBasePrice, setNewPlayerBasePrice] = useState(200);

  // Edit Player state
  const [editPlayerName, setEditPlayerName] = useState('');
  const [editPlayerCategory, setEditPlayerCategory] = useState<'A' | 'B' | 'C' | string>('A');
  const [editPlayerRole, setEditPlayerRole] = useState<'Batsman' | 'Bowler' | 'All-Rounder' | 'Wicketkeeper'>('All-Rounder');
  const [editPlayerBasePrice, setEditPlayerBasePrice] = useState(200);

  // Team Form State
  const [teamName, setTeamName] = useState('');
  const [teamShortCode, setTeamShortCode] = useState('');
  const [teamPurse, setTeamPurse] = useState(2000);
  const [teamLogo, setTeamLogo] = useState('🦁');
  const [teamColor, setTeamColor] = useState('#F59E0B');
  const [teamMinSquad, setTeamMinSquad] = useState<number>(8);
  const [teamMaxSquad, setTeamMaxSquad] = useState<number>(12);

  const activePlayer = state.players.find(p => p.id === state.currentPlayerId);
  const leadingTeam = state.teams.find(t => t.id === state.currentBidTeamId);

  // Filter players
  const filteredPlayers = state.players.filter(player => {
    const matchesSet = selectedSet === 'ALL'
      || (selectedSet === 'UNSOLD' ? player.status === 'unsold' : player.category === selectedSet);
    const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSet && matchesSearch;
  });

  const handleStartPlayer = (playerId: string) => {
    onSendMessage('START_PLAYER', { playerId });
  };

  const handleHammerCall = (stage: 'GOING_ONCE' | 'GOING_TWICE') => {
    onSendMessage('HAMMER_CALL', { stage });
  };

  const handleHammerSell = () => {
    if (!state.currentBidTeamId) return;
    onSendMessage('HAMMER_SELL');
  };

  const handleHammerUnsold = () => {
    onSendMessage('HAMMER_UNSOLD');
  };

  const handleNextPlayer = () => {
    onSendMessage('NEXT_PLAYER');
  };

  const handleTimerToggle = () => {
    onSendMessage('TIMER_TOGGLE');
  };

  const handleTimerReset = () => {
    onSendMessage('TIMER_RESET', { duration: 20 });
  };

  const handleCreatePlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;

    onSendMessage('ADD_CUSTOM_PLAYER', {
      name: newPlayerName.trim(),
      category: newPlayerCategory,
      role: newPlayerRole,
      basePrice: Number(newPlayerBasePrice) || 200
    });

    setNewPlayerName('');
    setShowAddPlayerModal(false);
  };

  const handleSaveEditPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlayer) return;

    onSendMessage('EDIT_PLAYER', {
      playerId: editingPlayer.id,
      name: editPlayerName,
      category: editPlayerCategory,
      role: editPlayerRole,
      basePrice: Number(editPlayerBasePrice)
    });

    setEditingPlayer(null);
  };

  const handleDeletePlayer = (playerId: string) => {
    if (confirm('আপনি কি এই Player ডিলিট করতে চান?')) {
      onSendMessage('DELETE_PLAYER', { playerId });
    }
  };

  const handleSaveTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTeam) {
      onSendMessage('EDIT_TEAM', {
        teamId: editingTeam.id,
        name: teamName,
        shortCode: teamShortCode,
        purse: Number(teamPurse),
        logo: teamLogo,
        primaryColor: teamColor,
        minSquad: Number(teamMinSquad) || 8,
        maxSquad: Number(teamMaxSquad) || 12
      });
      setEditingTeam(null);
    } else {
      onSendMessage('ADD_TEAM', {
        name: teamName,
        shortCode: teamShortCode,
        purse: Number(teamPurse) || 2000,
        logo: teamLogo,
        primaryColor: teamColor,
        minSquad: Number(teamMinSquad) || 8,
        maxSquad: Number(teamMaxSquad) || 12
      });
      setShowAddTeamModal(false);
    }
  };

  const openEditTeam = (team: Team) => {
    setEditingTeam(team);
    setTeamName(team.name);
    setTeamShortCode(team.shortCode);
    setTeamPurse(team.purse);
    setTeamLogo(team.logo);
    setTeamColor(team.primaryColor);
    setTeamMinSquad(team.minSquad || 8);
    setTeamMaxSquad(team.maxSquad || 12);
  };

  const openEditPlayer = (p: Player) => {
    setEditingPlayer(p);
    setEditPlayerName(p.name);
    setEditPlayerCategory(p.category || 'A');
    setEditPlayerRole(p.role);
    setEditPlayerBasePrice(p.basePrice);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-500/15 via-slate-900 to-amber-500/15 border border-amber-500/30 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Gavel className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              JPL Admin Panel &bull; Auctioneer Console
              <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-amber-400 text-slate-950">
                Full Control
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Team এডিট, Player যোগ/এডিট/ডিলিট, Category নির্বাচন, Base Price সেট ও Auction নিয়ন্ত্রণ করুন।
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddPlayerModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold hover:bg-emerald-600/30 transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Player যোগ করুন</span>
          </button>
          <button
            onClick={() => {
              setTeamName(`TEAM ${state.teams.length + 1}`);
              setTeamShortCode(`TEAM ${state.teams.length + 1}`);
              setTeamPurse(2000);
              setTeamLogo('🏏');
              setTeamColor('#10B981');
              setShowAddTeamModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-300 border border-blue-500/40 text-xs font-semibold hover:bg-blue-600/30 transition-all"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Team যোগ/এডিট</span>
          </button>
          <button
            onClick={handleNextPlayer}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 shadow-md shadow-amber-500/20 transition-all"
          >
            <span>Next Player</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sub Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAdminTab('auction')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              adminTab === 'auction'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 hover:text-white border border-white/5'
            }`}
          >
            <Gavel className="w-4 h-4" />
            <span>Auction & Teams Console</span>
          </button>

          <button
            onClick={() => setAdminTab('accounts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              adminTab === 'accounts'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 hover:text-white border border-white/5'
            }`}
          >
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span>User ID & Password Accounts</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
              adminTab === 'accounts' ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-300'
            }`}>
              {state.accounts?.length || 0}
            </span>
          </button>
        </div>

        {currentUser && (
          <div className="flex items-center gap-2 text-xs bg-slate-900 px-3 py-1.5 rounded-xl border border-white/10">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Admin: <strong className="text-white font-mono">{currentUser.username}</strong></span>
            {onLogout && (
              <button
                onClick={onLogout}
                className="ml-2 px-2 py-0.5 rounded bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 text-slate-400 text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer"
                title="লগআউট"
              >
                <LogOut className="w-3 h-3" />
                <span>লগআউট</span>
              </button>
            )}
          </div>
        )}
      </div>

      {adminTab === 'accounts' ? (
        <AccountManager state={state} onSendMessage={onSendMessage} />
      ) : (
        <>
          {/* Main Dual Grid: Active Auction Controller & 4 Teams Manager */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Player on Hammer (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 shadow-xl relative overflow-hidden">
            {/* Header: Stage Pill & Timer */}
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase text-slate-400">Auction অবস্থা:</span>
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
                      : 'bg-slate-800 text-slate-400 border-white/5'
                  }`}
                >
                  {state.currentStage}
                </span>
              </div>

              {/* Timer Controls */}
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-black text-amber-400 bg-slate-950 px-2.5 py-0.5 rounded-lg border border-white/10">
                  ⏱️ {state.timer}s
                </span>
                <button
                  onClick={handleTimerToggle}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                  title={state.isTimerRunning ? 'Pause' : 'Start'}
                >
                  {state.isTimerRunning ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
                </button>
                <button
                  onClick={handleTimerReset}
                  className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:text-white"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Active Player Display */}
            {activePlayer ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src={activePlayer.image || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=600&q=80'}
                    alt={activePlayer.name}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-400 shadow-lg"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-xs uppercase">
                        Category {activePlayer.category || 'A'}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-semibold">
                        {activePlayer.role}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-white">{activePlayer.name}</h3>
                    <div className="text-sm font-semibold text-emerald-400 font-mono mt-0.5">
                      Base Price: ৳{activePlayer.basePrice}
                    </div>
                  </div>
                </div>

                {/* Big Live Bid Box */}
                <div className="bg-slate-950 border border-amber-500/40 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase font-bold text-slate-400">Current Highest Bid</div>
                    <div className="text-3xl font-black text-amber-400 font-mono">
                      {formatIPLAmountFull(state.currentBid)}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs uppercase font-bold text-slate-400 mb-1">Highest Bidder</div>
                    {leadingTeam ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border font-bold text-sm text-white">
                        <span>{leadingTeam.logo}</span>
                        <span>{leadingTeam.name}</span>
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 italic">এখনও কোনো Bid আসেনি</span>
                    )}
                  </div>
                </div>

                {/* Hammer Action Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  <button
                    onClick={() => handleHammerCall('GOING_ONCE')}
                    disabled={!state.currentBidTeamId}
                    className="py-2 rounded-xl font-bold text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all disabled:opacity-40"
                  >
                    🔔 Going Once
                  </button>
                  <button
                    onClick={() => handleHammerCall('GOING_TWICE')}
                    disabled={!state.currentBidTeamId}
                    className="py-2 rounded-xl font-bold text-xs bg-orange-500/20 text-orange-300 border border-orange-500/40 hover:bg-orange-500/30 transition-all disabled:opacity-40"
                  >
                    🔔 Going Twice
                  </button>
                  <button
                    onClick={handleHammerSell}
                    disabled={!state.currentBidTeamId}
                    className="py-2 rounded-xl font-black text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all disabled:opacity-40"
                  >
                    🔨 SOLD!
                  </button>
                  <button
                    onClick={handleHammerUnsold}
                    disabled={state.currentBidTeamId !== null}
                    className="py-2 rounded-xl font-bold text-xs bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-500/40 transition-all disabled:opacity-40"
                  >
                    ❌ UNSOLD
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center text-slate-400">
                <Gavel className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                <h4 className="text-base font-bold text-white mb-1">কোনো Player বর্তমানে Hammer-এ নেই</h4>
                <p className="text-xs max-w-sm mx-auto mb-3">
                  নিচের Player তালিকা থেকে পছন্দ করুন বা Next Player বাটন চাপুন।
                </p>
                <button
                  onClick={handleNextPlayer}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400"
                >
                  প্রথম Player তুলুন
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: ৪টি Team-এর Budget ও এডিট অপশন (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  ৪টি Team-এর বাজেট ও পরিচালনা
                </h3>
                <p className="text-xs text-slate-400">শুরু বাজেট: ৳2,000 প্রতিটি</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {state.teams.map((team, idx) => (
                <div
                  key={team.id}
                  className="p-3 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{team.logo}</span>
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{team.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-bold text-slate-950" style={{ backgroundColor: team.primaryColor }}>
                          {team.shortCode}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <span>স্কোয়াড: <strong className="text-white">{team.squad.length}/{team.maxSquad || 12} জন</strong></span>
                        <span className={`px-1.5 py-0.2 rounded font-bold text-[9px] ${
                          team.squad.length >= (team.maxSquad || 12)
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : team.squad.length >= (team.minSquad || 8)
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {team.squad.length >= (team.maxSquad || 12)
                            ? '১২ জন পূর্ণ'
                            : team.squad.length >= (team.minSquad || 8)
                            ? '৮+ পূর্ণ'
                            : `বাকি ${8 - team.squad.length} জন`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-400 text-sm">
                      {formatIPLAmount(team.purse)}
                    </span>
                    <button
                      onClick={() => openEditTeam(team)}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                      title="Team এডিট করুন"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Player Pool Management (যোগ/এডিট/ডিলিট/ক্যাটেগরি/বেস প্রাইস) */}
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Player Pool পরিচালনা (যোগ / এডিট / ডিলিট)</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/10">
                মোট {filteredPlayers.length} জন
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              যেকোনো Player-কে Auction-এ তুলুন ("Start"), বা এডিট/ডিলিট করুন।
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="খুঁজুন..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
            <button
              onClick={() => setShowAddPlayerModal(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>নতুন Player</span>
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 text-xs overflow-x-auto pb-1">
          {['ALL', 'A', 'B', 'C', 'UNSOLD'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedSet(cat)}
              className={`px-3 py-1 rounded-lg font-bold shrink-0 transition-all ${
                selectedSet === cat
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat === 'ALL' ? 'সকল Category' : cat === 'UNSOLD' ? 'Unsold Players' : `Category ${cat}`}
            </button>
          ))}
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredPlayers.map(player => {
            const isCurrentlyActive = player.id === state.currentPlayerId;
            const soldTeam = state.teams.find(t => t.id === player.soldToTeamId);

            return (
              <div
                key={player.id}
                className={`p-3 rounded-xl border flex flex-col justify-between gap-2.5 transition-all ${
                  isCurrentlyActive
                    ? 'bg-amber-500/10 border-amber-400 ring-2 ring-amber-400/40'
                    : player.status === 'sold'
                    ? 'bg-slate-950/40 border-emerald-500/20'
                    : player.status === 'unsold'
                    ? 'bg-slate-950/40 border-rose-500/20'
                    : 'bg-slate-950/60 border-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={player.image || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=600&q=80'}
                    alt={player.name}
                    className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-white text-sm truncate flex items-center gap-1.5">
                      <span>{player.name}</span>
                      <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-amber-500 text-slate-950">
                        {player.category || 'A'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {player.role}
                    </div>
                    <div className="text-xs font-bold text-amber-400 font-mono">
                      Base Price: ৳{player.basePrice}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditPlayer(player)}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                      title="এডিট করুন"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeletePlayer(player.id)}
                      className="p-1 rounded bg-rose-950 hover:bg-rose-900 text-rose-300"
                      title="ডিলিট করুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    {player.status === 'sold' ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                        SOLD ৳{player.soldPrice} ({soldTeam?.shortCode})
                      </span>
                    ) : player.status === 'unsold' ? (
                      <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 font-bold text-[10px]">
                        UNSOLD
                      </span>
                    ) : isCurrentlyActive ? (
                      <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[10px] animate-pulse">
                        ON HAMMER
                      </span>
                    ) : (
                      <button
                        onClick={() => handleStartPlayer(player.id)}
                        className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1"
                      >
                        <Gavel className="w-3 h-3" />
                        <span>Start Auction</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      </>
      )}

      {/* Modal: Add New Player */}
      {showAddPlayerModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-3">নতুন Player যোগ করুন</h3>
            <form onSubmit={handleCreatePlayer} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Player-এর নাম</label>
                <input
                  type="text"
                  required
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  placeholder="e.g. Shakib, Tamim, etc."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Category নির্বাচন</label>
                  <select
                    value={newPlayerCategory}
                    onChange={(e) => setNewPlayerCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white"
                  >
                    <option value="A">Category A</option>
                    <option value="B">Category B</option>
                    <option value="C">Category C</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Base Price (৳)</label>
                  <input
                    type="number"
                    min={10}
                    step={10}
                    required
                    value={newPlayerBasePrice}
                    onChange={(e) => setNewPlayerBasePrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Role</label>
                <select
                  value={newPlayerRole}
                  onChange={(e) => setNewPlayerRole(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white"
                >
                  <option value="All-Rounder">All-Rounder</option>
                  <option value="Batsman">Batsman</option>
                  <option value="Bowler">Bowler</option>
                  <option value="Wicketkeeper">Wicketkeeper</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPlayerModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 font-bold text-slate-950"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Player */}
      {editingPlayer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-3">Player তথ্য এডিট করুন</h3>
            <form onSubmit={handleSaveEditPlayer} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Player-এর নাম</label>
                <input
                  type="text"
                  required
                  value={editPlayerName}
                  onChange={(e) => setEditPlayerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Category</label>
                  <select
                    value={editPlayerCategory}
                    onChange={(e) => setEditPlayerCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white"
                  >
                    <option value="A">Category A</option>
                    <option value="B">Category B</option>
                    <option value="C">Category C</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Base Price (৳)</label>
                  <input
                    type="number"
                    min={10}
                    step={10}
                    required
                    value={editPlayerBasePrice}
                    onChange={(e) => setEditPlayerBasePrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Role</label>
                <select
                  value={editPlayerRole}
                  onChange={(e) => setEditPlayerRole(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white"
                >
                  <option value="All-Rounder">All-Rounder</option>
                  <option value="Batsman">Batsman</option>
                  <option value="Bowler">Bowler</option>
                  <option value="Wicketkeeper">Wicketkeeper</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPlayer(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 font-bold text-white"
                >
                  আপডেট করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add / Edit Team */}
      {(showAddTeamModal || editingTeam) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-3">
              {editingTeam ? `${editingTeam.name} এডিট করুন` : 'নতুন Team তৈরি করুন'}
            </h3>
            <form onSubmit={handleSaveTeam} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Team-এর পুরো নাম</label>
                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. TEAM 1 (Kings)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Short Code</label>
                  <input
                    type="text"
                    required
                    value={teamShortCode}
                    onChange={(e) => setTeamShortCode(e.target.value)}
                    placeholder="e.g. TEAM 1"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">বাজেট (৳)</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={teamPurse}
                    onChange={(e) => setTeamPurse(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">ন্যূনতম প্লেয়ার কোটা (Min)</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    required
                    value={teamMinSquad}
                    onChange={(e) => setTeamMinSquad(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white font-mono"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">ডিফল্ট: ৮ জন</span>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">সর্বোচ্চ প্লেয়ার কোটা (Max)</label>
                  <input
                    type="number"
                    min={teamMinSquad || 1}
                    max={30}
                    required
                    value={teamMaxSquad}
                    onChange={(e) => setTeamMaxSquad(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white font-mono"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">ডিফল্ট: ১২ জন</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Team Logo / Emoji</label>
                  <input
                    type="text"
                    value={teamLogo}
                    onChange={(e) => setTeamLogo(e.target.value)}
                    placeholder="🦁"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-center text-lg"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Theme Color</label>
                  <input
                    type="color"
                    value={teamColor}
                    onChange={(e) => setTeamColor(e.target.value)}
                    className="w-full h-10 p-1 rounded-xl bg-slate-950 border border-white/10 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddTeamModal(false);
                    setEditingTeam(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 font-bold text-slate-950"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
