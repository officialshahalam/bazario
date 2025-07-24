import React from 'react';

interface BazarioLogoProps {
  height?: number;
  width?: string;
  containerHeight?: number;
  className?: string;
}

const BazarioLogo: React.FC<BazarioLogoProps> = ({ 
  height = 60, 
  width = "100%", 
  containerHeight = 80,
  className = "" 
}) => {
  return (
    <div 
      className={className}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        width: width, 
        height: containerHeight 
      }}
    >
      <svg 
        viewBox="0 0 200 60" 
        xmlns="http://www.w3.org/2000/svg" 
        style={{ height: height, width: 'auto' }}
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#4CAF50', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#2E7D32', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#66BB6A', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#388E3C', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        
        {/* Icon/Symbol */}
        <g transform="translate(5, 6)">
          {/* Shopping bag base/bottom */}
          <path 
            d="M6 38 L30 38 L30 44 A2 2 0 0 1 28 46 L8 46 A2 2 0 0 1 6 44 Z" 
            fill="#2E7D32" 
            opacity="0.9"
          />
          
          {/* Shopping bag outline */}
          <path 
            d="M8 15 L28 15 L30 38 L6 38 Z" 
            fill="url(#iconGradient)" 
            stroke="#2E7D32" 
            strokeWidth="1.5"
          />
          
          {/* Shopping bag handles */}
          <path 
            d="M12 15 L12 12 A6 6 0 0 1 24 12 L24 15" 
            fill="none" 
            stroke="#2E7D32" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          
          {/* Decorative elements (representing products) */}
          <circle cx="14" cy="25" r="2" fill="#81C784" opacity="0.8"/>
          <circle cx="22" cy="28" r="1.5" fill="#A5D6A7" opacity="0.8"/>
          <rect x="16" y="32" width="4" height="3" rx="1" fill="#C8E6C9" opacity="0.8"/>
        </g>
        
        {/* Text */}
        <text 
          x="45" 
          y="25" 
          fontFamily="Arial, Helvetica, sans-serif" 
          fontSize="24" 
          fontWeight="bold" 
          fill="url(#logoGradient)"
        >
          Bazario
        </text>
        
        {/* Tagline */}
        <text 
          x="45" 
          y="40" 
          fontFamily="Arial, Helvetica, sans-serif" 
          fontSize="9" 
          fill="#666" 
          opacity="0.8"
        >
          Your Marketplace
        </text>
        
        {/* Decorative dot */}
        <circle cx="155" cy="25" r="3" fill="#4CAF50" opacity="0.6"/>
      </svg>
    </div>
  );
};

export default BazarioLogo;