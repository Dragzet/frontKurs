import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = false, icon, className = '', ...props }, ref) => {
    // Base input classes
    const inputClasses = `
      px-4 py-2 
      border border-gray-300 
      rounded-lg 
      text-gray-900 
      placeholder-gray-400
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
      disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
      transition-colors duration-200
      ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
      ${icon ? 'pl-10' : ''}
      ${className}
    `;

    // Width class
    const widthClass = fullWidth ? 'w-full' : '';

    return (
      <div className={`mb-4 ${widthClass}`}>
        {label && (
          <label className="block mb-1 text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`${inputClasses} ${widthClass}`}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;