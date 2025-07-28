import React from 'react';
import type { ColorTableProps } from '../types';

const ColorTable: React.FC<ColorTableProps> = ({ colorStats }) => {
  if (!colorStats || colorStats.length === 0) {
    return (
      <div className="color-analysis">
        <div className="no-color-data">No color data available</div>
      </div>
    );
  }

  const getPipUrl = (colorName: string): string => {
    const colorMap: { [key: string]: string } = {
      'white': '/static/assets/mana-pips/pip-w.webp',
      'blue': '/static/assets/mana-pips/pip-u.webp', 
      'black': '/static/assets/mana-pips/pip-b.webp',
      'red': '/static/assets/mana-pips/pip-r.webp',
      'green': '/static/assets/mana-pips/pip-g.webp',
      'w': '/static/assets/mana-pips/pip-w.webp',
      'u': '/static/assets/mana-pips/pip-u.webp',
      'b': '/static/assets/mana-pips/pip-b.webp', 
      'r': '/static/assets/mana-pips/pip-r.webp',
      'g': '/static/assets/mana-pips/pip-g.webp'
    };
    
    return colorMap[colorName.toLowerCase()] || '';
  };

  const getColorClass = (colorName: string): string => {
    const colorMap: { [key: string]: string } = {
      'white': 'white',
      'blue': 'blue', 
      'black': 'black',
      'red': 'red',
      'green': 'green',
      'w': 'white',
      'u': 'blue',
      'b': 'black',
      'r': 'red',
      'g': 'green',
      'colorless': 'colorless'
    };
    
    return colorMap[colorName.toLowerCase()] || 'colorless';
  };

  return (
    <div className="color-analysis">
      {colorStats.map((colorData, index) => {
        const pipUrl = colorData.pip_url || getPipUrl(colorData.color_name);
        const colorClass = getColorClass(colorData.color_name);
        
        return (
          <div key={index} className="color-bar">
            <div 
              className={`color-bar__fill color-bar__fill--${colorClass}`}
              style={{ width: `${colorData.percentage}%` }}
            >
            </div>
            <div className="color-bar__text">
              {colorData.color_name}: {colorData.count} ({colorData.percentage.toFixed(1)}%)
            </div>
            {pipUrl && (
              <img 
                src={pipUrl} 
                alt={`${colorData.color_name} mana`} 
                className="color-bar__pip"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ColorTable;