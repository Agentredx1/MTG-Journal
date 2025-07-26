const API_BASE_URL = 'http://localhost:5001/api/v1';

// Development mode: using default group ID 1
const DEFAULT_GROUP_ID = 1;
const DEFAULT_GROUP_NAME = 'Default Group';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface ApiError {
  error: string;
  code: string;
}

// Commented out for development - using default group
// export interface AuthStatus {
//   authenticated: boolean;
//   group_id?: number;
//   group_name?: string;
// }

export interface Player {
  name: string;
  commander?: string;
  turn_order?: number;
}

export interface GameRequest {
  date: string;
  players: Player[];
  winner_name?: string;
  turns?: string;
  win_con?: string;
}

export interface PlayerStats {
  player_name: string;
  games_played: number;
  wins: number;
  win_rate: number;
}

export interface CommanderStats {
  name: string;
  games_played: number;
  wins: number;
  win_rate: number;
  img: string;
}

export interface ColorStats {
  color: string;
  count: number;
  percentage: number;
}

export interface DashboardData {
  king: PlayerStats | null;
  king_commanders: Array<{ name: string; img: string }>;
  villains: Array<{
    player_name: string;
    streak_count: number;
    commanders: Array<{ name: string; img: string }>;
  }>;
}

export interface StatsData {
  player_stats: PlayerStats[];
  commander_stats: CommanderStats[];
  color_stats: ColorStats[];
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      // Commented out for development - not using sessions
      // credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  // Authentication - commented out for development
  // async login(passkey: string): Promise<ApiResponse<AuthStatus>> {
  //   return this.request('/auth/login', {
  //     method: 'POST',
  //     body: JSON.stringify({ passkey }),
  //   });
  // }

  // async logout(): Promise<ApiResponse> {
  //   return this.request('/auth/logout', {
  //     method: 'POST',
  //   });
  // }

  // async getAuthStatus(): Promise<ApiResponse<AuthStatus>> {
  //   return this.request('/auth/status');
  // }

  // Development helper to get default group info
  getDefaultGroupInfo() {
    return {
      group_id: DEFAULT_GROUP_ID,
      group_name: DEFAULT_GROUP_NAME,
    };
  }

  // Dashboard
  async getDashboard(): Promise<ApiResponse<DashboardData>> {
    return this.request('/dashboard');
  }

  // Statistics
  async getStats(): Promise<ApiResponse<StatsData>> {
    return this.request('/stats');
  }

  async getPlayerDetail(playerName: string): Promise<ApiResponse> {
    return this.request(`/players/${encodeURIComponent(playerName)}`);
  }

  // Games
  async createGame(game: GameRequest): Promise<ApiResponse<{ game_id: number }>> {
    return this.request('/games', {
      method: 'POST',
      body: JSON.stringify(game),
    });
  }

  // Commander suggestions
  async getCommanderSuggestions(query: string): Promise<ApiResponse<string[]>> {
    return this.request(`/commanders/suggestions?q=${encodeURIComponent(query)}`);
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    return this.request('/health');
  }
}

export const apiService = new ApiService();