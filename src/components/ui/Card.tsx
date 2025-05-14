import React from 'react';

type CardProps = {
  children: React.ReactNode;
  title?: string;
  className?: string;
  'data-testid'?: string;
};

const Card = ({ children, title, className = '', 'data-testid': testId }: CardProps) => {
  return (
    <div 
      data-testid={testId} 
      className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-md ${className}`}
    >
      {title && (
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};

export default Card;