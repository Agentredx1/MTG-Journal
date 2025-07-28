import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title, 
  className = ''
}) => {
  const containerClass = `min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col w-full box-border ${className}`;

  return (
    <div className={containerClass}>
      <header className="w-full max-w-6xl mx-auto mb-8 text-center px-4 py-6">
        <h1 className="heading heading--primary">{title}</h1>
      </header>

      <main className="w-full max-w-6xl mx-auto flex flex-col gap-8 box-border px-4 pb-8 flex-grow">
        {children}
      </main>
    </div>
  );
};

export default Layout;