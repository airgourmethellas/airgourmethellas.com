import React from 'react';

const LogoText: React.FC = () => {
  return (
    <svg width="300" height="70" viewBox="0 0 300 70">
      {/* Background shape */}
      <rect x="5" y="5" width="290" height="60" rx="10" fill="#f8f8f8" opacity="0.7" />
      
      {/* Main title with gradient */}
      <defs>
        <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#003366" />
          <stop offset="100%" stopColor="#0066cc" />
        </linearGradient>
      </defs>
      
      <text 
        x="150" 
        y="38" 
        fontFamily="Arial, sans-serif" 
        fontSize="30" 
        fontWeight="bold" 
        fill="url(#blueGradient)"
        textAnchor="middle"
      >
        Air Gourmet
      </text>
      
      <text 
        x="150" 
        y="58" 
        fontFamily="Arial, sans-serif" 
        fontSize="20" 
        fontWeight="bold" 
        fill="#003366"
        textAnchor="middle"
      >
        Hellas
      </text>
      
      {/* Small plane icon */}
      <path 
        d="M40,30 l15,-10 l20,0 l-5,10 l5,10 l-20,0 l-15,-10 z" 
        fill="#0066cc" 
        opacity="0.8" 
      />
    </svg>
  );
};

export default LogoText;