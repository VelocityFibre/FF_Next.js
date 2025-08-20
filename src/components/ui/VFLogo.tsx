import React, { useState, useEffect } from 'react';

interface VFLogoProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const VFLogo: React.FC<VFLogoProps> = ({ className = '', size = 'large' }) => {
  const [logoSrc, setLogoSrc] = useState<string | null>(null);

  useEffect(() => {
    // Check for custom uploaded logo in localStorage
    const customLogo = localStorage.getItem('vf-custom-logo');
    if (customLogo) {
      setLogoSrc(customLogo);
    }
  }, []);

  // Size classes for the logo
  const sizeClasses = {
    small: 'w-10 h-10',
    medium: 'w-16 h-16',
    large: 'w-44 h-44'
  };

  const logoSize = sizeClasses[size];

  // Padding classes for each size
  const paddingClasses = {
    small: 'p-2',
    medium: 'p-3',
    large: 'p-4'
  };

  const containerPadding = paddingClasses[size];

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`bg-white rounded-xl shadow-sm ${containerPadding}`}>
        {logoSrc ? (
          <img 
            src={logoSrc} 
            alt="Logo" 
            className={`${logoSize} object-contain flex-shrink-0`}
          />
        ) : (
          <img 
            src="/assets/vf/vf-logo.svg" 
            alt="Logo" 
            className={`${logoSize} object-contain flex-shrink-0`}
            onError={(e) => {
              // Fallback to gradient div if SVG fails to load
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.parentElement?.querySelector('.fallback-logo');
              if (fallback) fallback.classList.remove('hidden');
            }}
          />
        )}
        
        {/* Fallback gradient logo */}
        <div className={`hidden fallback-logo ${logoSize} rounded-lg bg-gradient-to-br from-blue-500 via-pink-500 to-pink-600 flex items-center justify-center flex-shrink-0`}>
          <span className="text-white font-bold text-2xl">VF</span>
        </div>
      </div>
    </div>
  );
};

export default VFLogo;