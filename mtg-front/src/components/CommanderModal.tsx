import React, { useState, useEffect } from 'react';
import { CommanderModalProps } from '../types';

const CommanderModal: React.FC<CommanderModalProps> = ({ 
  commanderName, 
  isOpen, 
  onClose 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Helper function to convert commander name to kebab-case for image URLs
  const toKebabCase = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')   // remove commas, apostrophes, etc.
      .trim()
      .replace(/\s+/g, '-');         // replace spaces with hyphens
  };

  // Generate URLs based on commander name
  const kebabName = commanderName ? toKebabCase(commanderName) : '';
  const imageUrl = `http://localhost:5001/static/assets/commanders/${kebabName}.jpg`;
  const scryfallUrl = commanderName 
    ? `https://scryfall.com/search?q=${encodeURIComponent(commanderName)}`
    : '#';
  const edhrecUrl = `https://edhrec.com/commanders/${kebabName}`;

  // Reset image state when commander changes
  useEffect(() => {
    if (commanderName) {
      setImageLoaded(false);
      setImageError(false);
    }
  }, [commanderName]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Handle background click to close modal
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // Handle image load success
  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  // Handle image load error
  const handleImageError = () => {
    setImageLoaded(false);
    setImageError(true);
  };

  if (!isOpen || !commanderName) {
    return null;
  }

  return (
    <div className="commander-modal" onClick={handleBackdropClick}>
      <div className="commander-modal__overlay">
        <div className="commander-modal__container">
          <button 
            className="commander-modal__close" 
            onClick={onClose}
            aria-label="Close modal"
          >
            <span>&times;</span>
          </button>
          
          <div className="commander-modal__image-container">
            {!imageLoaded && !imageError && (
              <div className="commander-modal__loading">
                Loading commander image...
              </div>
            )}
            
            {imageError && (
              <div className="commander-modal__error">
                <div className="commander-modal__error-text">
                  Image not available for {commanderName}
                </div>
                <div className="commander-modal__placeholder">
                  🎴
                </div>
              </div>
            )}
            
            <img 
              className="commander-modal__content" 
              src={imageUrl}
              alt={`${commanderName} commander card`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{ 
                display: imageLoaded ? 'block' : 'none' 
              }}
            />
          </div>
          
          <div className="commander-modal__actions">
            <a 
              href={scryfallUrl} 
              className="commander-modal__btn commander-modal__btn--primary" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <span className="commander-modal__btn-text">
                View {commanderName} on Scryfall
              </span>
            </a>
            <a 
              href={edhrecUrl} 
              className="commander-modal__btn commander-modal__btn--secondary" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <span className="commander-modal__btn-text">
                View {commanderName} on EDHREC
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommanderModal;