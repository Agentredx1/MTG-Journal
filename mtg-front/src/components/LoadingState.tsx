import React from 'react';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'Loading...', 
  className = '' 
}) => {
  return (
    <div className={`loading ${className}`}>
      {message}
    </div>
  );
};

export default LoadingState;