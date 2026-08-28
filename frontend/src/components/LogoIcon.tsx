import React from 'react';

interface LogoIconProps {
  className?: string;
}

export default function LogoIcon({ className = 'w-10 h-10' }: LogoIconProps) {
  return (
    <svg 
      viewBox="0 0 200 200" 
      className={`${className} transition-transform duration-700 ease-out`}
      fill="currentColor"
    >
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => (
        <g key={idx} transform={`rotate(${angle}, 100, 100)`}>
          <ellipse 
            cx="100" 
            cy="54" 
            rx="15" 
            ry="33" 
            transform="rotate(28, 100, 54)" 
          />
        </g>
      ))}
    </svg>
  );
}
