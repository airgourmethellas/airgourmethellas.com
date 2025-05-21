import React from 'react';
import { Link } from 'wouter';

interface LogoProps {
  width?: number;
  linkToHome?: boolean;
}

const AirGourmetLogo: React.FC<LogoProps> = ({ 
  width = 320, 
  linkToHome = true 
}) => {
  // Create a styled wrapper with pure white background to ensure no borders
  const logoStyle = {
    position: 'relative' as const,
    width: `${width}px`,
    height: 'auto',
    backgroundColor: 'white',
    padding: '12px',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: 'none',
    display: 'inline-block'
  };
  
  const imgStyle = {
    width: '100%',
    height: 'auto',
    display: 'block',
    border: '0',
    outline: 'none',
    maxWidth: '100%'
  };
  
  const imgElement = (
    <div style={logoStyle}>
      <img 
        src="/logo.png" 
        alt="Air Gourmet Hellas Logo" 
        style={imgStyle}
      />
    </div>
  );

  if (linkToHome) {
    return (
      <Link href="/">
        {imgElement}
      </Link>
    );
  }

  return imgElement;
};

export default AirGourmetLogo;