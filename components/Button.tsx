

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // FIX: Made children optional to support icon-only buttons.
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
  Icon?: React.ElementType;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', Icon, ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-200';

  const variantClasses = {
    primary: 'bg-primary-700 hover:bg-primary-800 text-white focus:ring-primary-500',
    secondary: 'bg-primary-100 hover:bg-primary-200 text-primary-700 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus:ring-primary-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
  };

  return (
    <button
      type="button"
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {/* FIX: Conditionally apply margin to the icon only when there are children. */}
      {Icon && <Icon className={`w-5 h-5 ${children ? 'mr-2 -ml-1' : ''}`} />}
      {children}
    </button>
  );
};

export default Button;