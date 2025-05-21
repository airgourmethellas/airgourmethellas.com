import React from 'react';

const LogoText: React.FC = () => {
  return (
    <div className="flex items-center justify-center">
      <img src="/logo.png" alt="Air Gourmet Hellas Logo" style={{ maxWidth: '300px', height: 'auto' }} />
    </div>
  );
};

export default LogoText;