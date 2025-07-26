import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Dashboard from './components/Dashboard';
import Stats from './pages/Stats';
import PlayerDetail from './pages/PlayerDetail';
import Navigation from './components/Navigation';
import './App.css';

type PageType = 'dashboard' | 'stats' | 'player-detail';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  const handlePlayerClick = (playerName: string) => {
    setSelectedPlayer(playerName);
    setCurrentPage('player-detail');
  };

  const handleBackToStats = () => {
    setCurrentPage('stats');
    setSelectedPlayer(null);
  };

  const handlePageChange = (page: PageType) => {
    setCurrentPage(page);
    if (page !== 'player-detail') {
      setSelectedPlayer(null);
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'stats':
        return <Stats onPlayerClick={handlePlayerClick} />;
      case 'player-detail':
        return selectedPlayer ? (
          <PlayerDetail 
            playerName={selectedPlayer} 
            onBack={handleBackToStats}
          />
        ) : (
          <div>Error: No player selected</div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <AuthProvider>
      <div style={{ position: 'relative' }}>
        <Navigation 
          currentPage={currentPage} 
          onPageChange={handlePageChange}
          showNavigation={currentPage !== 'player-detail'}
        />
        
        {renderCurrentPage()}
      </div>
    </AuthProvider>
  );
}

export default App;

// ORIGINAL APP WITH AUTHENTICATION - COMMENTED OUT FOR DEVELOPMENT
/*
const AppContent: React.FC = () => {
  const { authStatus, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (!authStatus?.authenticated) {
    return <Login />;
  }

  return <Dashboard />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
*/
