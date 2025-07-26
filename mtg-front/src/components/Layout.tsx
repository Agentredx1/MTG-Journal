import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  className?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  backButtonText?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title, 
  className = '', 
  showBackButton = false,
  onBackClick,
  backButtonText = '← Back'
}) => {
  const containerClass = `min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center w-full box-border ${className}`;

  return (
    <div className={containerClass}>
      <header className="w-full max-w-6xl mx-auto mb-8 relative text-center px-4 py-8">
        {showBackButton && onBackClick && (
          <button 
            onClick={onBackClick} 
            className="back-button back-button--header"
          >
            {backButtonText}
          </button>
        )}
        <h1 className="heading heading--primary">{title}</h1>
      </header>

      <main className="w-full max-w-6xl mx-auto flex flex-col gap-12 box-border px-4 pb-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;