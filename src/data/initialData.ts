import { Player, Team, UserAccount } from '../types/auction';

export const INITIAL_TEAMS: Team[] = [
  {
    id: 'team_1',
    name: 'TEAM 1 (Kings)',
    shortCode: 'TEAM 1',
    primaryColor: '#F59E0B', // Amber
    secondaryColor: '#0F172A',
    accentColor: '#D97706',
    logo: '🦁',
    purse: 2000, // ৳2000
    originalPurse: 2000,
    minSquad: 8,
    maxSquad: 12,
    squad: []
  },
  {
    id: 'team_2',
    name: 'TEAM 2 (Riders)',
    shortCode: 'TEAM 2',
    primaryColor: '#8B5CF6', // Purple
    secondaryColor: '#1E1B4B',
    accentColor: '#6D28D9',
    logo: '⚔️',
    purse: 2000, // ৳2000
    originalPurse: 2000,
    minSquad: 8,
    maxSquad: 12,
    squad: []
  },
  {
    id: 'team_3',
    name: 'TEAM 3 (Titans)',
    shortCode: 'TEAM 3',
    primaryColor: '#0EA5E9', // Sky Blue
    secondaryColor: '#082F49',
    accentColor: '#0284C7',
    logo: '⚡',
    purse: 2000, // ৳2000
    originalPurse: 2000,
    minSquad: 8,
    maxSquad: 12,
    squad: []
  },
  {
    id: 'team_4',
    name: 'TEAM 4 (Warriors)',
    shortCode: 'TEAM 4',
    primaryColor: '#EF4444', // Red
    secondaryColor: '#450A0A',
    accentColor: '#DC2626',
    logo: '🛡️',
    purse: 2000, // ৳2000
    originalPurse: 2000,
    minSquad: 8,
    maxSquad: 12,
    squad: []
  }
];

export const INITIAL_PLAYERS: Player[] = [
  {
    id: 'p1',
    name: 'Shakib Al Hasan',
    category: 'A',
    role: 'All-Rounder',
    basePrice: 200, // ৳200
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=600&q=80',
    stats: { matches: 84, runs: 2150, wickets: 104, strikeRate: 138.4 },
    set: 'Category A'
  },
  {
    id: 'p2',
    name: 'Tamim Iqbal',
    category: 'A',
    role: 'Batsman',
    basePrice: 200,
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    stats: { matches: 92, runs: 2840, strikeRate: 132.5 },
    set: 'Category A'
  },
  {
    id: 'p3',
    name: 'Mustafizur Rahman',
    category: 'A',
    role: 'Bowler',
    basePrice: 200,
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    stats: { matches: 78, wickets: 98, economy: 7.42 },
    set: 'Category A'
  },
  {
    id: 'p4',
    name: 'Mushfiqur Rahim',
    category: 'A',
    role: 'Wicketkeeper',
    basePrice: 200,
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80',
    stats: { matches: 102, runs: 2510, strikeRate: 129.8 },
    set: 'Category A'
  },
  {
    id: 'p5',
    name: 'Towhid Hridoy',
    category: 'B',
    role: 'Batsman',
    basePrice: 100, // ৳100
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
    stats: { matches: 38, runs: 1040, strikeRate: 142.3 },
    set: 'Category B'
  },
  {
    id: 'p6',
    name: 'Taskin Ahmed',
    category: 'B',
    role: 'Bowler',
    basePrice: 100,
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
    stats: { matches: 54, wickets: 72, economy: 7.91 },
    set: 'Category B'
  },
  {
    id: 'p7',
    name: 'Mehidy Hasan Miraz',
    category: 'B',
    role: 'All-Rounder',
    basePrice: 100,
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    stats: { matches: 58, runs: 850, wickets: 62 },
    set: 'Category B'
  },
  {
    id: 'p8',
    name: 'Litton Das',
    category: 'B',
    role: 'Wicketkeeper',
    basePrice: 100,
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80',
    stats: { matches: 71, runs: 1680, strikeRate: 133.5 },
    set: 'Category B'
  },
  {
    id: 'p9',
    name: 'Rishad Hossain',
    category: 'C',
    role: 'All-Rounder',
    basePrice: 50, // ৳50
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80',
    stats: { matches: 24, wickets: 32, runs: 210 },
    set: 'Category C'
  },
  {
    id: 'p10',
    name: 'Tanzid Hasan Tamim',
    category: 'C',
    role: 'Batsman',
    basePrice: 50,
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
    stats: { matches: 21, runs: 490, strikeRate: 136.8 },
    set: 'Category C'
  },
  {
    id: 'p11',
    name: 'Tanzim Hasan Sakib',
    category: 'C',
    role: 'Bowler',
    basePrice: 50,
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=600&q=80',
    stats: { matches: 15, wickets: 22, economy: 7.64 },
    set: 'Category C'
  },
  {
    id: 'p12',
    name: 'Local Star Player',
    category: 'C',
    role: 'All-Rounder',
    basePrice: 50,
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    stats: { matches: 10, runs: 210, wickets: 12 },
    set: 'Category C'
  }
];

export const INITIAL_ANNOUNCEMENTS = [
  {
    id: 'a1',
    text: 'JANKHALI PREMIER LEAGUE MEGA AUCTION — OFFICIAL LIVE',
    type: 'system' as const,
    timestamp: Date.now() - 60000
  },
  {
    id: 'a2',
    text: '৪টি Team প্রস্তুত (বাজেট: ৳2,000 প্রতিটি, স্কোয়াড সীমা: ন্যূনতম ৮ জন, সর্বোচ্চ ১২ জন)',
    type: 'system' as const,
    timestamp: Date.now() - 30000
  }
];

export const INITIAL_ACCOUNTS: UserAccount[] = [
  {
    id: 'acc_admin',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: 'JPL Super Admin',
    createdAt: Date.now()
  },
  {
    id: 'acc_team_1',
    username: 'team1',
    password: 'team1pass',
    role: 'team',
    teamId: 'team_1',
    name: 'TEAM 1 (Kings) Owner',
    createdAt: Date.now()
  },
  {
    id: 'acc_team_2',
    username: 'team2',
    password: 'team2pass',
    role: 'team',
    teamId: 'team_2',
    name: 'TEAM 2 (Riders) Owner',
    createdAt: Date.now()
  },
  {
    id: 'acc_team_3',
    username: 'team3',
    password: 'team3pass',
    role: 'team',
    teamId: 'team_3',
    name: 'TEAM 3 (Titans) Owner',
    createdAt: Date.now()
  },
  {
    id: 'acc_team_4',
    username: 'team4',
    password: 'team4pass',
    role: 'team',
    teamId: 'team_4',
    name: 'TEAM 4 (Warriors) Owner',
    createdAt: Date.now()
  }
];

