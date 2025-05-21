import React from 'react';
import { Link } from 'wouter';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ className = "", size = 'md' }: LogoProps) {
  const sizes = {
    sm: { width: 120 },
    md: { width: 180 },
    lg: { width: 240 }
  };

  // Enhanced styling to prevent any border display
  const logoStyle = {
    width: sizes[size].width,
    height: 'auto',
    maxWidth: '100%',
    display: 'block',
    border: 'none',
    outline: 'none'
  };

  return (
    <div className={`${className} flex items-center justify-center`} style={{ backgroundColor: 'transparent' }}>
      <Link href="/">
        <img 
          src="/logo.png" 
          alt="Air Gourmet Hellas" 
          style={logoStyle} 
        />
      </Link>
    </div>
  );
}