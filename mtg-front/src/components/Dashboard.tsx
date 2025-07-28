import React, { useState, useEffect } from 'react';
import { apiService, DashboardData } from '../services/api';
import CommanderModal from './CommanderModal';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import { useCommanderModal } from '../hooks/useCommanderModal';

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
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
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await apiService.getDashboard();
      
      if (response.success && response.data) {
        setDashboardData(response.data);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (err) {
      console.error('Dashboard load failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Development mode - logout functionality commented out
  // const handleLogout = async () => {
  //   await logout();
  // };


  if (loading) {
    return (
      <div className="dashboard-container">
        <LoadingState message="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <ErrorState message={error} onRetry={loadDashboard} />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <main className="dashboard-main">
        {/* King Section */}
        <section className="king-section">
          <h2>👑 Current Champion</h2>
          {dashboardData?.king ? (
            <div className="king-card">
              <div className="king-info">
                <h3>{dashboardData.king.name}</h3>
                <div className="king-stats">
                  <span className="win-rate">{dashboardData.king.win_rate}% Win Rate</span>
                  <span className="game-count">
                    {dashboardData.king.wins}/{dashboardData.king.games_played} wins
                  </span>
                </div>
              </div>
              {dashboardData.king_commanders.length > 0 && (
                <div className="king-commanders">
                  <h4>Recent Commanders:</h4>
                  <div className="commander-list">
                    {dashboardData.king_commanders.map((commander, index) => (
                      <div key={index} className="commander-item">
                        <img 
                          src={commander.img} 
                          alt={commander.name}
                          className="commander-image"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <span 
                          className="commander-name commander-clickable"
                          onClick={() => handleCommanderClick(commander.name)}
                        >
                          {commander.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="no-data">No champion data available</div>
          )}
        </section>

        {/* Win Streaks Section */}
        <section className="villains-section">
          <h2>🔥 Current Win Streaks</h2>
          {dashboardData?.villains && dashboardData.villains.length > 0 ? (
            <div className="villains-grid">
              {dashboardData.villains.map((villain, index) => (
                <div key={index} className="villain-card">
                  <div className="villain-info">
                    <h3>{villain.player_name}</h3>
                    <div className="streak-count">
                      {villain.streak_count} game streak
                    </div>
                  </div>
                  {villain.commanders.length > 0 && (
                    <div className="villain-commanders">
                      <div className="commander-list">
                        {villain.commanders.map((commander, cmdIndex) => (
                          <div key={cmdIndex} className="commander-item">
                            <img 
                              src={commander.img} 
                              alt={commander.name}
                              className="commander-image"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                            <span 
                              className="commander-name commander-clickable"
                              onClick={() => handleCommanderClick(commander.name)}
                            >
                              {commander.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data">No active win streaks</div>
          )}
        </section>

        {/* Quick Actions */}
        <section className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button className="action-button">
              ➕ Add New Game
            </button>
            <button className="action-button">
              👥 Player Details
            </button>
          </div>
        </section>
      </main>

      {/* Commander Modal */}
      <CommanderModal 
        commanderName={selectedCommander}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </div>
  );
};

export default Dashboard;