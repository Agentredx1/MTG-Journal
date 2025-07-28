import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { StatsData } from '../types';
import CommanderTable from '../components/CommanderTable';
import ColorTable from '../components/ColorTable';
import CommanderModal from '../components/CommanderModal';
import Layout from '../components/Layout';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { useCommanderModal } from '../hooks/useCommanderModal';
import { SECTION_CLASSES, HEADER_CLASSES } from '../constants/styles';
import '../App.css';

export interface StatsProps {
  onPlayerClick?: (playerName: string) => void;
}

const Stats: React.FC<StatsProps> = ({ onPlayerClick }) => {
  const [statsData, setStatsData] = useState<StatsData | null>(null);
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
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await apiService.getStats();
      
      if (response.success && response.data) {
        setStatsData(response.data as StatsData);
      } else {
        setError('Failed to load statistics data');
      }
    } catch (err) {
      console.error('Stats load failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };


  // Player detail navigation
  const handlePlayerClick = (playerName: string) => {
    if (onPlayerClick) {
      onPlayerClick(playerName);
    } else {
      console.log('Navigate to player detail:', playerName);
    }
  };

  if (loading) {
    return (
      <Layout title="MTG Stats" className="stats-container">
        <LoadingState message="Loading statistics..." />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="MTG Stats" className="stats-container">
        <ErrorState message={error} onRetry={loadStats} />
      </Layout>
    );
  }

  if (!statsData) {
    return (
      <Layout title="MTG Stats" className="stats-container">
        <div className="no-data">No statistics data available</div>
      </Layout>
    );
  }

  return (
    <Layout title="MTG Stats" className="stats-container">
      {/* Player Stats Section */}
      <section className={SECTION_CLASSES.stats}>
        <h2 className={HEADER_CLASSES.secondary}>Player Win Rates</h2>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th className="table__header">Player Name</th>
                  <th className="table__header">Games</th>
                  <th className="table__header">Wins</th>
                  <th className="table__header">Win Rate</th>
                </tr>
              </thead>
              <tbody>
                {statsData.player_stats.map((player, index) => (
                  <tr key={index} className="table__row">
                    <td className="table__cell" data-label="Player Name">
                      <span 
                        className="player-link"
                        onClick={() => handlePlayerClick(player.player_name || '')}
                      >
                        {player.player_name}
                      </span>
                    </td>
                    <td className="table__cell" data-label="Games Played">
                      {player.games_played}
                    </td>
                    <td className="table__cell" data-label="Wins">
                      {player.wins}
                    </td>
                    <td className="table__cell" data-label="Win Rate">
                      {player.win_rate.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      {/* Commander Stats Section */}
      <section className={SECTION_CLASSES.stats}>
        <h2 className={HEADER_CLASSES.secondary}>Commander Usage</h2>
          <CommanderTable 
            commanders={statsData.commander_stats}
            clickable={true}
            onCommanderClick={handleCommanderClick}
          />
        </section>

      {/* Color Distribution Section */}
      <section className={SECTION_CLASSES.stats}>
        <h2 className={HEADER_CLASSES.secondary}>Overall Color Distribution</h2>
          <ColorTable colorStats={statsData.color_stats} />
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

export default Stats;