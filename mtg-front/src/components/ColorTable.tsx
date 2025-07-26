import React from 'react';
import { ColorData, ColorTableProps } from '../types';

const ColorTable: React.FC<ColorTableProps> = ({ colorStats }) => {
  if (!colorStats || colorStats.length === 0) {
    return (
      <div className="color-analysis">
        <div className="no-color-data">No color data available</div>
      </div>
    );
  }

  return (
    <div className="color-analysis">
      {colorStats.map((colorData, index) => (
        <div key={index} className="color-bar">
          <div 
            className={`color-bar__fill color-bar__fill--${colorData.color_name.toLowerCase()}`}
            style={{ width: `${colorData.percentage}%` }}
          >
          </div>
          <div className="color-bar__text">
            {colorData.color_name}: {colorData.count} ({colorData.percentage}%)
          </div>
          {colorData.pip_url && (
            <img 
              src={colorData.pip_url} 
              alt={`${colorData.color_name} mana`} 
              className="color-bar__pip"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default ColorTable;