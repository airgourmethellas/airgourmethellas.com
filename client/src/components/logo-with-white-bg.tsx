import React from 'react';
import { Link } from 'wouter';

interface LogoProps {
  width?: number;
  linkToHome?: boolean;
}

/**
 * Logo component with enhanced white background to prevent any border issues
 */
const LogoWithWhiteBg: React.FC<LogoProps> = ({ 
  width = 320, 
  linkToHome = true 
}) => {
  // Completely clean style to eliminate any border rendering issues
  const containerStyle = {
    backgroundColor: '#ffffff',
    display: 'inline-block',
    boxShadow: 'none',
    border: 'none',
    outline: 'none',
    padding: '0',
    overflow: 'hidden'
  };
  
  const imgStyle = {
    width: `${width}px`,
    maxWidth: '100%',
    height: 'auto',
    display: 'block',
    border: '0',
    outline: 'none',
    boxShadow: 'none'
  };
  
  const imgElement = (
    <div style={containerStyle}>
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

export default LogoWithWhiteBg;