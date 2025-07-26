import React from 'react';

type PageType = 'dashboard' | 'stats' | 'player-detail';

interface NavigationProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  showNavigation?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ 
  currentPage, 
  onPageChange, 
  showNavigation = true 
}) => {
  if (!showNavigation) return null;

  const buttonStyle = (page: PageType) => ({
    padding: '8px 16px',
    background: currentPage === page ? '#646cff' : 'rgba(255,255,255,0.1)',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '6px',
    cursor: 'pointer'
  });

  return (
    <div style={{ 
      position: 'fixed', 
      top: '20px', 
      right: '20px', 
      zIndex: 1002,
      display: 'flex',
      gap: '10px'
    }}>
      <button 
        onClick={() => onPageChange('dashboard')}
        style={buttonStyle('dashboard')}
      >
        Dashboard
      </button>
      <button 
        onClick={() => onPageChange('stats')}
        style={buttonStyle('stats')}
      >
        Stats
      </button>
    </div>
  );
};

export default Navigation;