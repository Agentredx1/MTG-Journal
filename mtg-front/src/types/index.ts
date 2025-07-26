// Shared TypeScript interfaces for MTG Journal components

// Commander-related interfaces
export interface CommanderData {
  name: string;
  games_played: number;
  wins: number;
  win_rate: number;
  img?: string; // Optional image URL for display
}

export interface CommanderReference {
  name: string;
  img: string;
}

// Color analysis interfaces
export interface ColorData {
  color_name: string;
  count: number;
  percentage: number;
  pip_url?: string; // URL to mana pip image
}

// Player statistics interfaces
export interface PlayerStats {
  name?: string; // From get_win_rate_stats function
  player_name?: string; // For consistency with other interfaces
  games_played: number;
  wins: number;
  win_rate: number;
  avg_turn_order?: number;
}

export interface PlayerDetail extends PlayerStats {
  commanders: CommanderData[];
  color_stats: ColorData[];
}

// Dashboard data interfaces
export interface WinStreakPlayer {
  player_name: string;
  streak_count: number;
  commanders: CommanderReference[];
}

export interface DashboardData {
  king: PlayerStats | null;
  king_commanders: CommanderReference[];
  villains: WinStreakPlayer[];
}

// Statistics page interfaces
export interface StatsData {
  player_stats: PlayerStats[];
  commander_stats: CommanderData[];
  color_stats: ColorData[];
}

// Game creation interfaces
export interface GamePlayer {
  name: string;
  commander?: string;
  turn_order?: number;
}

export interface GameRequest {
  date: string;
  players: GamePlayer[];
  winner_name?: string;
  turns?: string;
  win_con?: string;
}

// API response interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface ApiError {
  error: string;
  code: string;
}

// Component prop interfaces
export interface CommanderTableProps {
  commanders: CommanderData[];
  clickable?: boolean;
  onCommanderClick?: (commanderName: string) => void;
}

export interface ColorTableProps {
  colorStats: ColorData[];
}

export interface CommanderModalProps {
  commanderName: string | null;
  isOpen: boolean;
  onClose: () => void;
}

// Group/authentication interfaces (for development mode)
export interface GroupInfo {
  group_id: number;
  group_name: string;
}

// Form interfaces
export interface PlayerFormData {
  name: string;
  commander: string;
  turn_order: number;
}

export interface GameFormData {
  date: string;
  players: PlayerFormData[];
  winner_name: string;
  turns: string;
  win_con: string;
}

// Utility types
export type WinCondition = 'Combat' | 'Combo' | 'Commander Damage' | 'Ping/Burn' | 'Scoops';
export type MTGColor = 'White' | 'Blue' | 'Black' | 'Red' | 'Green' | 'Colorless';