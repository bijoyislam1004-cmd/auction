export type PlayerRole = 'Batsman' | 'Bowler' | 'All-Rounder' | 'Wicketkeeper';

export type PlayerStatus = 'upcoming' | 'live' | 'sold' | 'unsold';

export type AuctionStage = 'IDLE' | 'BIDDING' | 'GOING_ONCE' | 'GOING_TWICE' | 'SOLD' | 'UNSOLD';

export interface PlayerStats {
  matches: number;
  runs?: number;
  wickets?: number;
  strikeRate?: number;
  economy?: number;
  highestScore?: string;
  bestBowling?: string;
}

export interface Player {
  id: string;
  name: string;
  category: 'A' | 'B' | 'C' | string;
  role: PlayerRole;
  basePrice: number; // in Taka (e.g. 200, 100, 50, 20)
  country?: string;
  isOverseas?: boolean;
  batStyle?: string;
  bowlStyle?: string;
  currentBid?: number;
  soldPrice?: number;
  soldToTeamId?: string;
  status: PlayerStatus;
  image?: string;
  stats?: PlayerStats;
  set?: string;
}

export interface Team {
  id: string;
  name: string;
  shortCode: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logo: string;
  purse: number; // in Taka, starts at 2000
  originalPurse: number;
  squad: Player[];
  minSquad?: number; // Minimum 8 players
  maxSquad?: number; // Maximum 12 players
  maxOverseas?: number;
}

export interface BidRecord {
  id: string;
  teamId: string;
  teamShort: string;
  teamName: string;
  teamColor: string;
  amount: number; // in Taka
  timestamp: number;
  increment: number;
}

export interface Announcement {
  id: string;
  text: string;
  type: 'bid' | 'hammer' | 'system' | 'timer' | 'chat';
  teamColor?: string;
  timestamp: number;
}

export interface TeamReaction {
  id: string;
  teamId: string;
  teamShort: string;
  teamColor: string;
  text: string;
  emoji: string;
  timestamp: number;
}

export interface SaleRecord {
  playerId: string;
  playerName: string;
  playerCategory: string;
  playerRole: PlayerRole;
  teamId: string;
  teamShort: string;
  teamName: string;
  teamColor: string;
  amount: number;
  timestamp: number;
}

export type UserRole = 'admin' | 'team';

export interface UserAccount {
  id: string;
  username: string; // User ID
  password: string; // Password
  role: UserRole;
  name: string; // Display name e.g. "Admin" or "TEAM 1 Owner"
  teamId?: string; // If role === 'team'
  createdAt: number;
}

export interface AuctionState {
  currentStage: AuctionStage;
  currentPlayerId: string | null;
  currentBid: number;
  currentBidTeamId: string | null;
  bidHistory: BidRecord[];
  timer: number;
  isTimerRunning: boolean;
  timerDuration: number;
  teams: Team[];
  players: Player[];
  recentSales: SaleRecord[];
  totalSoldAmount: number;
  totalPlayersSold: number;
  totalPlayersUnsold: number;
  announcements: Announcement[];
  reactions: TeamReaction[];
  lastActionTimestamp: number;
  accounts: UserAccount[];
}

export type WSMessage =
  | { type: 'INIT_STATE'; payload: AuctionState }
  | { type: 'STATE_UPDATE'; payload: AuctionState }
  | { type: 'BID_PLACED'; payload: { bid: BidRecord; state: AuctionState } }
  | { type: 'HAMMER_EVENT'; payload: { stage: AuctionStage; state: AuctionState } }
  | { type: 'ERROR'; payload: { message: string } }
  | { type: 'SOUND'; payload: { sound: 'gavel' | 'bid' | 'sold' | 'unsold' | 'countdown' } };
