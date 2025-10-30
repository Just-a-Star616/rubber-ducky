import React from 'react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className }) => (
  <svg
    className={className}
    viewBox="150 80 350 220"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Company logo"
    role="img"
  >
    <path d="M481.44,148.22C384.08,82.4,192.28,131,164.24,293.26c83.56-116.32,234.3-131,234.3-131S476.48,153.18,481.44,148.22Z"/>
  </svg>
);