import React from 'react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  retryText?: string;
  showRetry?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const ErrorState: React.FC<ErrorStateProps> = ({ 
  message, 
  onRetry, 
  retryText = 'Retry',
  showRetry = true,
  className = '',
  children
}) => {
  return (
    <div className={className}>
      <div className="error-message">{message}</div>
      {(showRetry && onRetry) && (
        <button onClick={onRetry} className="retry-button">
          {retryText}
        </button>
      )}
      {children}
    </div>
  );
};

export default ErrorState;