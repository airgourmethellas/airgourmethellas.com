// This file exists to ensure the logo file is correctly prepared for the application
import React from 'react';

export function LogoPreloader() {
  return (
    <div style={{ display: 'none' }}>
      <img src="/logo-airgourmet.png" alt="Logo Preloader" />
    </div>
  );
}

// The logo URL that should be used throughout the application
export const logoUrl = '/logo-airgourmet.png';