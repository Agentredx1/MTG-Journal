import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Navigation.css';

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { groupInfo } = useAuth();

  if (!showNavigation) return null;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handlePageChange = (page: PageType) => {
    onPageChange(page);
    setIsMenuOpen(false);
  };

  return (
    <header className="navigation">
      {/* Dashboard Header Content */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>MTG Journal</h1>
          <div className="header-info">
            <span className="group-name">
              {groupInfo?.group_name || 'Default Group'}
            </span>
            {/* Development mode - logout button commented out */}
            {/* <button onClick={handleLogout} className="logout-button">
              Logout
            </button> */}
          </div>
        </div>
      </div>

      {/* Navigation Content */}
      <nav className="navigation__nav">
        <div className="navigation__container">
          <div className="navigation__header">
            <button 
              className="navigation__toggle"
              onClick={toggleMenu}
              aria-label="Toggle navigation"
            >
              <span className={`navigation__hamburger ${isMenuOpen ? 'navigation__hamburger--active-top' : ''}`}></span>
              <span className={`navigation__hamburger ${isMenuOpen ? 'navigation__hamburger--active-middle' : ''}`}></span>
              <span className={`navigation__hamburger ${isMenuOpen ? 'navigation__hamburger--active-bottom' : ''}`}></span>
            </button>
            
            <div className="navigation__content">
              <button 
                className={`navigation__button ${currentPage === 'dashboard' ? 'navigation__button--active' : ''}`}
                onClick={() => handlePageChange('dashboard')}
              >
                Dashboard
              </button>
              <button 
                className={`navigation__button ${currentPage === 'stats' ? 'navigation__button--active' : ''}`}
                onClick={() => handlePageChange('stats')}
              >
                Stats
              </button>
            </div>
          </div>

          <div className={`navigation__mobile-content ${isMenuOpen ? 'navigation__mobile-content--active' : ''}`}>
            <button 
              className={`navigation__mobile-button ${currentPage === 'dashboard' ? 'navigation__mobile-button--active' : ''}`}
              onClick={() => handlePageChange('dashboard')}
            >
              Dashboard
            </button>
            <button 
              className={`navigation__mobile-button ${currentPage === 'stats' ? 'navigation__mobile-button--active' : ''}`}
              onClick={() => handlePageChange('stats')}
            >
              Stats
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navigation;