import React from 'react';

type BadgeProps = {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
  className?: string;
};

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}: BadgeProps) => {
  const baseClasses = 'inline-flex items-center rounded-full font-medium';

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
  };

  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
  };

  const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  return <span className={classes}>{children}</span>;
};

export default Badge;