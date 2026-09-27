import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import { INITIAL_TEAMS, INITIAL_PLAYERS, INITIAL_ANNOUNCEMENTS, INITIAL_ACCOUNTS } from './src/data/initialData';
import { AuctionState, BidRecord, Player, Team, SaleRecord, Announcement, TeamReaction, WSMessage, UserAccount } from './src/types/auction';
import { canTeamBid, getStandardIncrement } from './src/utils/auctionUtils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());

// In-memory Server-Authoritative State
let auctionState: AuctionState = {
  currentStage: 'IDLE',
  currentPlayerId: null,
  currentBid: 0,
  currentBidTeamId: null,
  bidHistory: [],
  timer: 20,
  isTimerRunning: false,
  timerDuration: 20,
  teams: JSON.parse(JSON.stringify(INITIAL_TEAMS)),
  players: JSON.parse(JSON.stringify(INITIAL_PLAYERS)),
  recentSales: [],
  totalSoldAmount: 0,
  totalPlayersSold: 0,
  totalPlayersUnsold: 0,
  announcements: [...INITIAL_ANNOUNCEMENTS],
  reactions: [],
  lastActionTimestamp: Date.now(),
  accounts: JSON.parse(JSON.stringify(INITIAL_ACCOUNTS))
};

const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });
const sseClients = new Set<express.Response>();

// Handle Upgrade only for '/ws' route
server.on('upgrade', (request, socket, head) => {
  try {
    const host = request.headers.host || 'localhost:3000';
    const url = new URL(request.url || '', `http://${host}`);
    if (url.pathname === '/ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  } catch (err) {
    socket.destroy();
  }
});

function broadcast(msg: WSMessage) {
  const data = JSON.stringify(msg);

  // Send via WebSockets
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(data);
      } catch {
        // ignore client error
      }
    }
  });

  // Send via Server-Sent Events (SSE)
  sseClients.forEach(res => {
    try {
      res.write(`data: ${data}\n\n`);
    } catch {
      sseClients.delete(res);
    }
  });
}

function broadcastState(extraSound?: 'gavel' | 'bid' | 'sold' | 'unsold' | 'countdown') {
  broadcast({
    type: 'STATE_UPDATE',
    payload: auctionState
  });
  if (extraSound) {
    broadcast({
      type: 'SOUND',
      payload: { sound: extraSound }
    });
  }
}

function addAnnouncement(text: string, type: 'bid' | 'hammer' | 'system' | 'timer' | 'chat', teamColor?: string) {
  const announcement: Announcement = {
    id: 'ann_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    text,
    type,
    teamColor,
    timestamp: Date.now()
  };
  auctionState.announcements.unshift(announcement);
  if (auctionState.announcements.length > 50) {
    auctionState.announcements.pop();
  }
}

// Server Authoritative Countdown Timer (Runs every second)
setInterval(() => {
  if (!auctionState.isTimerRunning || !auctionState.currentPlayerId) return;

  if (auctionState.timer > 0) {
    auctionState.timer -= 1;

    // Automatic auctioneer phase progression if bids are stagnant
    if (auctionState.timer === 10 && auctionState.currentStage === 'BIDDING' && auctionState.currentBidTeamId) {
      auctionState.currentStage = 'GOING_ONCE';
      const player = auctionState.players.find(p => p.id === auctionState.currentPlayerId);
      const team = auctionState.teams.find(t => t.id === auctionState.currentBidTeamId);
      addAnnouncement(`Auctioneer: "Going once for ${player?.name} at ${auctionState.currentBid} TK to ${team?.shortCode}!"`, 'hammer', team?.primaryColor);
    } else if (auctionState.timer === 4 && auctionState.currentStage === 'GOING_ONCE' && auctionState.currentBidTeamId) {
      auctionState.currentStage = 'GOING_TWICE';
      const player = auctionState.players.find(p => p.id === auctionState.currentPlayerId);
      const team = auctionState.teams.find(t => t.id === auctionState.currentBidTeamId);
      addAnnouncement(`Auctioneer: "Going twice! Any further paddle for ${player?.name} at ${auctionState.currentBid} TK?"`, 'hammer', team?.primaryColor);
    }

    broadcastState();
  } else {
    auctionState.isTimerRunning = false;
    broadcastState();
  }
}, 1000);

// Core action handler function shared between WebSocket and REST POST /api/action
function handleAuctionAction(type: string, payload: any): { error?: string } {
  switch (type) {
    case 'START_PLAYER': {
      const { playerId, basePrice } = payload || {};
      const player = auctionState.players.find(p => p.id === playerId);
      if (!player) return { error: 'Player not found' };

      if (typeof basePrice === 'number' && basePrice >= 10) {
        player.basePrice = basePrice;
      }

      auctionState.currentPlayerId = player.id;
      auctionState.currentBid = player.basePrice;
      auctionState.currentBidTeamId = null;
      auctionState.bidHistory = [];
      auctionState.currentStage = 'BIDDING';
      auctionState.timer = auctionState.timerDuration;
      auctionState.isTimerRunning = true;
      player.status = 'live';

      addAnnouncement(
        `AUCTIONEER: Set ${player.set} - ${player.name} (${player.role}) is now ON THE HAMMER! Base Price: ${player.basePrice} TK.`,
        'system'
      );

      broadcastState('gavel');
      return {};
    }

    case 'UPDATE_PLAYER_BASE_PRICE': {
      const { playerId, basePrice } = payload || {};
      const player = auctionState.players.find(p => p.id === playerId);
      if (!player) return { error: 'Player not found' };
      const num = Number(basePrice);
      if (isNaN(num) || num < 10) return { error: 'Base price must be at least 10 TK' };
      player.basePrice = num;
      if (auctionState.currentPlayerId === player.id && !auctionState.currentBidTeamId) {
        auctionState.currentBid = num;
      }
      addAnnouncement(`Admin updated base price for ${player.name} to ${num} TK`, 'system');
      broadcastState();
      return {};
    }

    case 'PLACE_BID': {
      const { teamId, amount } = payload || {};
      if (!auctionState.currentPlayerId) return { error: 'No active player on the hammer' };

      const player = auctionState.players.find(p => p.id === auctionState.currentPlayerId);
      const team = auctionState.teams.find(t => t.id === teamId);

      if (!player || !team) return { error: 'Invalid player or team' };

      const minRequiredBid = auctionState.currentBidTeamId
        ? auctionState.currentBid + getStandardIncrement(auctionState.currentBid)
        : player.basePrice;

      const bidAmount = amount || minRequiredBid;

      if (auctionState.currentBidTeamId && bidAmount <= auctionState.currentBid) {
        return { error: `Bid of ${bidAmount} TK must be higher than current bid of ${auctionState.currentBid} TK` };
      }

      const eligibility = canTeamBid(team, bidAmount);
      if (!eligibility.canBid) {
        return { error: `${team.name}: ${eligibility.reason}` };
      }

      const increment = bidAmount - auctionState.currentBid;
      const bidRecord: BidRecord = {
        id: 'bid_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
        teamId: team.id,
        teamShort: team.shortCode,
        teamName: team.name,
        teamColor: team.primaryColor,
        amount: bidAmount,
        timestamp: Date.now(),
        increment: increment > 0 ? increment : 0
      };

      auctionState.currentBid = bidAmount;
      auctionState.currentBidTeamId = team.id;
      auctionState.bidHistory.unshift(bidRecord);
      auctionState.currentStage = 'BIDDING';
      auctionState.timer = 18;
      auctionState.isTimerRunning = true;
      auctionState.lastActionTimestamp = Date.now();

      addAnnouncement(
        `${team.shortCode} raises paddle to ${bidAmount} TK (+${increment} TK)!`,
        'bid',
        team.primaryColor
      );

      broadcast({
        type: 'BID_PLACED',
        payload: { bid: bidRecord, state: auctionState }
      });
      broadcast({
        type: 'SOUND',
        payload: { sound: 'bid' }
      });
      return {};
    }

    case 'HAMMER_CALL': {
      const { stage } = payload || {};
      if (!auctionState.currentPlayerId) return { error: 'No active player' };

      auctionState.currentStage = stage;
      const player = auctionState.players.find(p => p.id === auctionState.currentPlayerId);
      const team = auctionState.teams.find(t => t.id === auctionState.currentBidTeamId);

      if (stage === 'GOING_ONCE') {
        addAnnouncement(`Auctioneer: "Going ONCE at ${auctionState.currentBid} TK${team ? ` to ${team.shortCode}` : ''}!"`, 'hammer', team?.primaryColor);
      } else {
        addAnnouncement(`Auctioneer: "Going TWICE at ${auctionState.currentBid} TK! Final call for ${player?.name}!"`, 'hammer', team?.primaryColor);
      }

      broadcastState('gavel');
      return {};
    }

    case 'HAMMER_SELL': {
      if (!auctionState.currentPlayerId || !auctionState.currentBidTeamId) {
        return { error: 'Cannot sell without an active bid!' };
      }

      const player = auctionState.players.find(p => p.id === auctionState.currentPlayerId);
      const team = auctionState.teams.find(t => t.id === auctionState.currentBidTeamId);

      if (!player || !team) return { error: 'Player or team not found' };

      const soldPrice = auctionState.currentBid;
      const maxSquad = team.maxSquad || 12;
      const minSquad = team.minSquad || 8;

      if (team.squad.length >= maxSquad) {
        return { error: `${team.name}-এর সর্বোচ্চ ${maxSquad} জনের স্কোয়াড কোটা ইতিমধ্যে পূরণ হয়ে গেছে!` };
      }

      player.status = 'sold';
      player.soldPrice = soldPrice;
      player.soldToTeamId = team.id;

      team.purse -= soldPrice;
      team.squad.push({ ...player });

      const saleRecord: SaleRecord = {
        playerId: player.id,
        playerName: player.name,
        playerCategory: player.category || 'A',
        playerRole: player.role,
        teamId: team.id,
        teamShort: team.shortCode,
        teamName: team.name,
        teamColor: team.primaryColor,
        amount: soldPrice,
        timestamp: Date.now()
      };

      auctionState.recentSales.unshift(saleRecord);
      auctionState.totalSoldAmount += soldPrice;
      auctionState.totalPlayersSold += 1;
      auctionState.currentStage = 'SOLD';
      auctionState.isTimerRunning = false;

      addAnnouncement(
        `🔨 SOLD! ${player.name} is SOLD to ${team.name} (${team.shortCode}) for ${soldPrice} TK! (দল: ${team.squad.length}/${maxSquad})`,
        'hammer',
        team.primaryColor
      );

      if (team.squad.length === minSquad) {
        addAnnouncement(
          `🎉 কোটা মাইলফলক: ${team.name} (${team.shortCode}) সফলভাবে তাদের ন্যূনতম ${minSquad} জন খেলোয়াড়ের কোটা পূর্ণ করেছে!`,
          'system',
          team.primaryColor
        );
      } else if (team.squad.length === maxSquad) {
        addAnnouncement(
          `🏆 স্কোয়াড সমাপ্ত: ${team.name} (${team.shortCode})-এর সর্বোচ্চ ${maxSquad}/${maxSquad} জনের পূর্ণাঙ্গ দল গঠিত হয়েছে!`,
          'system',
          team.primaryColor
        );
      }

      broadcastState('sold');
      return {};
    }

    case 'HAMMER_UNSOLD': {
      if (!auctionState.currentPlayerId) return { error: 'No active player' };

      const player = auctionState.players.find(p => p.id === auctionState.currentPlayerId);
      if (!player) return { error: 'Player not found' };

      player.status = 'unsold';
      auctionState.currentStage = 'UNSOLD';
      auctionState.totalPlayersUnsold += 1;
      auctionState.isTimerRunning = false;

      addAnnouncement(
        `❌ UNSOLD! No bid for ${player.name}. Player moves to the Unsold Pool.`,
        'hammer'
      );

      broadcastState('unsold');
      return {};
    }

    case 'NEXT_PLAYER': {
      const nextPlayer = auctionState.players.find(p => p.status === 'upcoming');
      if (nextPlayer) {
        auctionState.currentPlayerId = nextPlayer.id;
        auctionState.currentBid = nextPlayer.basePrice;
        auctionState.currentBidTeamId = null;
        auctionState.bidHistory = [];
        auctionState.currentStage = 'BIDDING';
        auctionState.timer = auctionState.timerDuration;
        auctionState.isTimerRunning = true;
        nextPlayer.status = 'live';

        addAnnouncement(
          `NEXT UP: ${nextPlayer.name} (${nextPlayer.role}, ${nextPlayer.country}) - Base Price: ₹${(nextPlayer.basePrice / 100).toFixed(2)} Cr`,
          'system'
        );

        broadcastState('gavel');
      } else {
        auctionState.currentPlayerId = null;
        auctionState.currentStage = 'IDLE';
        auctionState.isTimerRunning = false;
        addAnnouncement(`All regular sets completed!`, 'system');
        broadcastState();
      }
      return {};
    }

    case 'TIMER_TOGGLE': {
      auctionState.isTimerRunning = !auctionState.isTimerRunning;
      broadcastState();
      return {};
    }

    case 'TIMER_RESET': {
      const duration = payload?.duration || 20;
      auctionState.timer = duration;
      auctionState.timerDuration = duration;
      broadcastState();
      return {};
    }

    case 'TIMER_ADD_10': {
      auctionState.timer += 10;
      broadcastState();
      return {};
    }

    case 'REINTRODUCE_UNSOLD': {
      const { playerId } = payload || {};
      const player = auctionState.players.find(p => p.id === playerId);
      if (player && player.status === 'unsold') {
        player.status = 'upcoming';
        auctionState.totalPlayersUnsold = Math.max(0, auctionState.totalPlayersUnsold - 1);
        addAnnouncement(`Accelerated Round: ${player.name} re-entered into auction pool!`, 'system');
        broadcastState();
      }
      return {};
    }

    case 'UPDATE_TEAM_PURSE': {
      const { teamId, purse } = payload || {};
      const team = auctionState.teams.find(t => t.id === teamId);
      if (team && typeof purse === 'number') {
        team.purse = purse;
        addAnnouncement(`Admin updated budget for ${team.name} to ${purse} TK`, 'system');
        broadcastState();
      }
      return {};
    }

    case 'ADD_CUSTOM_PLAYER': {
      const category = payload.category || 'A';
      const newPlayer: Player = {
        id: 'p_' + Date.now(),
        name: payload.name,
        category: category,
        role: payload.role || 'All-Rounder',
        basePrice: Math.max(10, Number(payload.basePrice) || 20),
        status: 'upcoming',
        image: payload.image || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=600&q=80',
        stats: {
          matches: Number(payload.matches) || 10,
          runs: Number(payload.runs) || 150,
          wickets: Number(payload.wickets) || 5
        },
        set: `Category ${category}`
      };
      auctionState.players.push(newPlayer);
      addAnnouncement(`নতুন Player যোগ করা হয়েছে: ${newPlayer.name} (Category: ${newPlayer.category}, Base Price: ৳${newPlayer.basePrice})`, 'system');
      broadcastState();
      return {};
    }

    case 'EDIT_PLAYER': {
      const { playerId, name, category, role, basePrice } = payload || {};
      const player = auctionState.players.find(p => p.id === playerId);
      if (!player) return { error: 'Player not found' };

      if (name) player.name = name;
      if (category) {
        player.category = category;
        player.set = `Category ${category}`;
      }
      if (role) player.role = role;
      if (basePrice !== undefined) {
        player.basePrice = Math.max(10, Number(basePrice));
        if (auctionState.currentPlayerId === player.id && !auctionState.currentBidTeamId) {
          auctionState.currentBid = player.basePrice;
        }
      }

      addAnnouncement(`Player তথ্য আপডেট করা হয়েছে: ${player.name}`, 'system');
      broadcastState();
      return {};
    }

    case 'DELETE_PLAYER': {
      const { playerId } = payload || {};
      const index = auctionState.players.findIndex(p => p.id === playerId);
      if (index === -1) return { error: 'Player not found' };

      const removed = auctionState.players.splice(index, 1)[0];
      if (auctionState.currentPlayerId === playerId) {
        auctionState.currentPlayerId = null;
        auctionState.currentStage = 'IDLE';
        auctionState.currentBid = 0;
        auctionState.currentBidTeamId = null;
      }

      addAnnouncement(`Player ডিলিট করা হয়েছে: ${removed.name}`, 'system');
      broadcastState();
      return {};
    }

    case 'EDIT_TEAM': {
      const { teamId, name, shortCode, purse, primaryColor, logo, minSquad, maxSquad } = payload || {};
      const team = auctionState.teams.find(t => t.id === teamId);
      if (!team) return { error: 'Team not found' };

      if (name) team.name = name;
      if (shortCode) team.shortCode = shortCode;
      if (typeof purse === 'number') team.purse = purse;
      if (primaryColor) team.primaryColor = primaryColor;
      if (logo) team.logo = logo;
      if (typeof minSquad === 'number') team.minSquad = minSquad;
      if (typeof maxSquad === 'number') team.maxSquad = maxSquad;

      addAnnouncement(`Team তথ্য আপডেট করা হয়েছে: ${team.name}`, 'system');
      broadcastState();
      return {};
    }

    case 'ADD_TEAM': {
      const newTeam: Team = {
        id: 'team_' + Date.now(),
        name: payload.name || `TEAM ${auctionState.teams.length + 1}`,
        shortCode: payload.shortCode || `T${auctionState.teams.length + 1}`,
        primaryColor: payload.primaryColor || '#10B981',
        secondaryColor: '#064E3B',
        accentColor: '#059669',
        logo: payload.logo || '🏏',
        purse: Number(payload.purse) || 2000,
        originalPurse: Number(payload.purse) || 2000,
        minSquad: Number(payload.minSquad) || 8,
        maxSquad: Number(payload.maxSquad) || 12,
        squad: []
      };
      auctionState.teams.push(newTeam);
      addAnnouncement(`নতুন Team যোগ করা হয়েছে: ${newTeam.name} (বাজেট: ৳${newTeam.purse}, স্কোয়াড: ৮-১২ জন)`, 'system');
      broadcastState();
      return {};
    }

    case 'CHAT_REACTION': {
      const { teamId, emoji, text } = payload || {};
      const team = auctionState.teams.find(t => t.id === teamId);
      if (team) {
        const reaction: TeamReaction = {
          id: 'react_' + Date.now(),
          teamId: team.id,
          teamShort: team.shortCode,
          teamColor: team.primaryColor,
          emoji: emoji || '💬',
          text: text || '',
          timestamp: Date.now()
        };
        auctionState.reactions.unshift(reaction);
        if (auctionState.reactions.length > 20) {
          auctionState.reactions.pop();
        }
        addAnnouncement(`${team.shortCode} War Room: ${reaction.emoji} "${reaction.text}"`, 'chat', team.primaryColor);
        broadcastState();
      }
      return {};
    }

    case 'RESET_AUCTION': {
      auctionState = {
        currentStage: 'IDLE',
        currentPlayerId: null,
        currentBid: 0,
        currentBidTeamId: null,
        bidHistory: [],
        timer: 20,
        isTimerRunning: false,
        timerDuration: 20,
        teams: JSON.parse(JSON.stringify(INITIAL_TEAMS)),
        players: JSON.parse(JSON.stringify(INITIAL_PLAYERS)),
        recentSales: [],
        totalSoldAmount: 0,
        totalPlayersSold: 0,
        totalPlayersUnsold: 0,
        announcements: [...INITIAL_ANNOUNCEMENTS],
        reactions: [],
        lastActionTimestamp: Date.now(),
        accounts: auctionState.accounts && auctionState.accounts.length > 0
          ? auctionState.accounts
          : JSON.parse(JSON.stringify(INITIAL_ACCOUNTS))
      };
      addAnnouncement('AUCTION RESET: All franchise purses and player rosters have been restored.', 'system');
      broadcastState('gavel');
      return {};
    }

    case 'CREATE_ACCOUNT': {
      const { username, password, role, name, teamId } = payload || {};
      const cleanUsername = String(username || '').trim();
      const cleanPassword = String(password || '').trim();

      if (!cleanUsername) return { error: 'User ID / Username ফাঁকা রাখা যাবে না!' };
      if (cleanUsername.length < 3) return { error: 'User ID কমপক্ষে ৩ অক্ষরের হতে হবে!' };
      if (!cleanPassword || cleanPassword.length < 3) return { error: 'Password কমপক্ষে ৩ অক্ষরের হতে হবে!' };
      if (role !== 'admin' && role !== 'team') return { error: 'সঠিক Role নির্বাচন করুন (admin অথবা team)' };

      // Check duplicate username
      const existing = auctionState.accounts.find(
        acc => acc.username.toLowerCase() === cleanUsername.toLowerCase()
      );
      if (existing) {
        return { error: `"${cleanUsername}" এই User ID ইতিমধ্যে ব্যবহৃত হয়েছে! অন্য একটি User ID দিন।` };
      }

      if (role === 'team') {
        if (!teamId) return { error: 'Team Role-এর জন্য Team নির্বাচন করা আবশ্যক!' };
        const team = auctionState.teams.find(t => t.id === teamId);
        if (!team) return { error: 'নির্বাচিত Team খুঁজে পাওয়া যায়নি!' };
      }

      const newAccount: UserAccount = {
        id: 'acc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        username: cleanUsername,
        password: cleanPassword,
        role,
        name: String(name || '').trim() || (role === 'admin' ? 'Admin User' : 'Team Representative'),
        teamId: role === 'team' ? teamId : undefined,
        createdAt: Date.now()
      };

      auctionState.accounts.push(newAccount);
      addAnnouncement(`🔐 Admin নতুন ${role === 'admin' ? 'Admin' : 'Team'} অ্যাকাউন্ট তৈরি করেছেন: ${newAccount.username}`, 'system');
      broadcastState();
      return {};
    }

    case 'EDIT_ACCOUNT': {
      const { id, password, name, teamId } = payload || {};
      const acc = auctionState.accounts.find(a => a.id === id);
      if (!acc) return { error: 'অ্যাকাউন্ট পাওয়া যায়নি!' };

      if (password && String(password).trim().length >= 3) {
        acc.password = String(password).trim();
      }
      if (name && String(name).trim()) {
        acc.name = String(name).trim();
      }
      if (acc.role === 'team' && teamId) {
        acc.teamId = teamId;
      }

      addAnnouncement(`Admin অ্যাকাউন্ট (${acc.username}) আপডেট করেছেন`, 'system');
      broadcastState();
      return {};
    }

    case 'DELETE_ACCOUNT': {
      const { id } = payload || {};
      const index = auctionState.accounts.findIndex(a => a.id === id);
      if (index === -1) return { error: 'অ্যাকাউন্ট পাওয়া যায়নি!' };

      const acc = auctionState.accounts[index];
      if (acc.id === 'acc_admin' || acc.username.toLowerCase() === 'admin') {
        return { error: 'প্রধান Admin অ্যাকাউন্ট ডিলিট করা যাবে না!' };
      }

      auctionState.accounts.splice(index, 1);
      addAnnouncement(`Admin অ্যাকাউন্ট ডিলিট করেছেন: ${acc.username}`, 'system');
      broadcastState();
      return {};
    }

    default:
      return { error: 'Unknown action' };
  }
}

// WebSocket Connection Handler
wss.on('connection', (ws: WebSocket) => {
  ws.send(JSON.stringify({
    type: 'INIT_STATE',
    payload: auctionState
  }));

  ws.on('message', (messageBuffer: Buffer) => {
    try {
      const data = JSON.parse(messageBuffer.toString());
      const res = handleAuctionAction(data.type, data.payload);
      if (res.error) {
        ws.send(JSON.stringify({
          type: 'ERROR',
          payload: { message: res.error }
        }));
      }
    } catch (err) {
      // quiet error handling
    }
  });
});

// REST Endpoints
app.get('/api/state', (_req, res) => {
  res.json(auctionState);
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Server-Sent Events Endpoint for real-time state synchronization
app.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  });

  // Send current state immediately
  res.write(`data: ${JSON.stringify({ type: 'INIT_STATE', payload: auctionState })}\n\n`);

  sseClients.add(res);

  // Send heartbeat keepalive every 15s to keep connection open through proxies
  const keepAliveInterval = setInterval(() => {
    try {
      res.write(': keepalive\n\n');
    } catch {
      clearInterval(keepAliveInterval);
      sseClients.delete(res);
    }
  }, 15000);

  req.on('close', () => {
    clearInterval(keepAliveInterval);
    sseClients.delete(res);
  });
});

// HTTP Action Dispatcher Endpoint (Dual-mode fallback)
app.post('/api/action', (req, res) => {
  const { type, payload } = req.body || {};
  const result = handleAuctionAction(type, payload);
  if (result.error) {
    res.status(400).json({ success: false, message: result.error });
  } else {
    res.json({ success: true, state: auctionState });
  }
});

app.post('/api/reset', (_req, res) => {
  handleAuctionAction('RESET_AUCTION', {});
  res.json({ success: true, state: auctionState });
});

// Authentication Endpoint
app.post('/api/login', (req, res) => {
  const { username, password, requiredRole } = req.body || {};
  const cleanUsername = String(username || '').trim();
  const cleanPassword = String(password || '').trim();

  if (!cleanUsername || !cleanPassword) {
    return res.status(400).json({ success: false, message: 'User ID এবং Password দুটিই প্রদান করুন!' });
  }

  const user = auctionState.accounts.find(
    acc => acc.username.toLowerCase() === cleanUsername.toLowerCase() && acc.password === cleanPassword
  );

  if (!user) {
    return res.status(401).json({ success: false, message: 'ভুল User ID অথবা Password! অনুগ্রহ করে সঠিক তথ্য দিন।' });
  }

  if (requiredRole && user.role !== requiredRole) {
    return res.status(403).json({
      success: false,
      message: requiredRole === 'admin'
        ? 'এই অ্যাকাউন্ট দিয়ে Admin Panel-এ প্রবেশাধিকার নেই! এটি শুধুমাত্র Admin-দের জন্য।'
        : 'এই অ্যাকাউন্ট দিয়ে Team War Room-এ প্রবেশাধিকার নেই!'
    });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
      teamId: user.teamId,
      createdAt: user.createdAt
    }
  });
});

app.get('/api/accounts', (_req, res) => {
  res.json({ success: true, accounts: auctionState.accounts });
});

// Vite Middleware for Dev or Static Serving for Prod
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  server.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[IPL Mega Auction Hub] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
