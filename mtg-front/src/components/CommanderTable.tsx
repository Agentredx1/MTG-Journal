import React from 'react';
import type { CommanderTableProps } from '../types';

const CommanderTable: React.FC<CommanderTableProps> = ({ 
  commanders, 
  clickable = false, 
  onCommanderClick 
}) => {
  if (!commanders || commanders.length === 0) {
    return (
      <div className="table-container">
        <div className="no-data">No commander data available</div>
      </div>
    );
  }

  const handleCommanderClick = (commanderName: string) => {
    if (clickable && onCommanderClick) {
      onCommanderClick(commanderName);
    }
  };

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th className="table__header">Commander</th>
            <th className="table__header">Games Played</th>
            <th className="table__header">Wins</th>
            <th className="table__header">WR</th>
          </tr>
        </thead>
        <tbody>
          {commanders.map((commander, index) => (
            <tr key={index} className="table__row">
              <td className="table__cell" data-label="Commander">
                {clickable ? (
                  <span 
                    className="commander-link"
                    onClick={() => handleCommanderClick(commander.name)}
                  >
                    {commander.name}
                  </span>
                ) : (
                  commander.name
                )}
              </td>
              <td className="table__cell" data-label="Games Played">{commander.games_played}</td>
              <td className="table__cell" data-label="Wins">{commander.wins}</td>
              <td className="table__cell" data-label="Win Rate (%)">{commander.win_rate.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CommanderTable;