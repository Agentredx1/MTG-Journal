import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { PlayerStats, CommanderData, ColorData } from '../types';
import CommanderTable from '../components/CommanderTable';
import ColorTable from '../components/ColorTable';
import CommanderModal from '../components/CommanderModal';
import Layout from '../components/Layout';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { useCommanderModal } from '../hooks/useCommanderModal';
import { SECTION_CLASSES, HEADER_CLASSES } from '../constants/styles';

// API response structure for player detail
interface PlayerDetailApiResponse {
  player_name: string;
  stats: PlayerStats;
  commanders: CommanderData[];
  color_stats: ColorData[];
}

export interface PlayerDetailProps {
  playerName: string;
  onBack?: () => void;
}

const PlayerDetail: React.FC<PlayerDetailProps> = ({ playerName, onBack }) => {
  const [playerData, setPlayerData] = useState<PlayerDetailApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Commander modal state using shared hook
  const {
    selectedCommander,
    isModalOpen,
    handleCommanderClick,
    handleModalClose
  } = useCommanderModal();

  useEffect(() => {
    if (playerName) {
      loadPlayerDetail();
    }
  }, [playerName]);

  const loadPlayerDetail = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await apiService.getPlayerDetail(playerName);
      
      if (response.success && response.data) {
        setPlayerData(response.data);
      } else {
        setError(`Failed to load player details for ${playerName}`);
      }
    } catch (err) {
      console.error('Player detail load failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to load player details');
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <Layout title={`${playerName}'s Stats`} className="player-detail-container">
        <LoadingState message="Loading player details..." />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title={`${playerName}'s Stats`} className="player-detail-container">
        <ErrorState 
          message={error}
          onRetry={loadPlayerDetail}
        >
          {onBack && (
            <button onClick={onBack} className="back-button">
              Back
            </button>
          )}
        </ErrorState>
      </Layout>
    );
  }

  if (!playerData) {
    return (
      <Layout title={`${playerName}'s Stats`} className="player-detail-container">
        <div className="no-data">No player data available for {playerName}</div>
        {onBack && (
          <button onClick={onBack} className="back-button">
            Back
          </button>
        )}
      </Layout>
    );
  }

  return (
    <Layout 
      title={`${playerName}'s Stats`} 
      className="player-detail-container"
      showBackButton={!!onBack}
      onBackClick={onBack}
    >
      {/* Overall Performance Spotlight */}
      <section className={SECTION_CLASSES.spotlight}>
        <h2 className={HEADER_CLASSES.tertiary}>Overall Performance</h2>
          <div className="performance-stats">
            <div className="stat-card">
              <div className="stat-value">{playerData.stats.games_played}</div>
              <div className="stat-label">Games Played</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{playerData.stats.wins}</div>
              <div className="stat-label">Wins</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{playerData.stats.win_rate?.toFixed(1) || '0.0'}%</div>
              <div className="stat-label">Win Rate</div>
            </div>
            {playerData.stats.avg_turn_order && (
              <div className="stat-card">
                <div className="stat-value">{playerData.stats.avg_turn_order.toFixed(1)}</div>
                <div className="stat-label">Avg Turn Order</div>
              </div>
            )}
          </div>
        </section>

      {/* Commanders Played Section */}
      <section className={SECTION_CLASSES.playerDetail}>
        <h2 className={HEADER_CLASSES.secondary}>Commanders Played</h2>
          {playerData.commanders && playerData.commanders.length > 0 ? (
            <CommanderTable 
              commanders={playerData.commanders}
              clickable={true}
              onCommanderClick={handleCommanderClick}
            />
          ) : (
            <div className="no-data">No commander data available</div>
          )}
        </section>

      {/* Color Analysis Section */}
      <section className={SECTION_CLASSES.playerDetail}>
        <h2 className={HEADER_CLASSES.secondary}>Most Played Colors for {playerName}</h2>
          {playerData.color_stats && playerData.color_stats.length > 0 ? (
            <ColorTable colorStats={playerData.color_stats} />
          ) : (
            <div className="no-data">No color data available</div>
          )}
      </section>

      {/* Commander Modal */}
      <CommanderModal 
        commanderName={selectedCommander}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </Layout>
  );
};

export default PlayerDetail;