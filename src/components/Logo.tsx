import React from 'react';

export interface LogoProps {
  variant?: 'full' | 'icon';
  height?: number;
  className?: string;
  'aria-label'?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  height = 28,
  className = '',
  'aria-label': ariaLabel = 'Safar — home',
}) => {
  if (variant === 'icon') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        height={height}
        width={height}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={ariaLabel}
        className={`shrink-0 overflow-visible ${className}`}
        style={{ height: `${height}px`, width: 'auto' }}
      >
        {/* Origin Dot */}
        <circle cx="11" cy="14" r="4.5" fill="#ff6b35" />
        
        {/* S-curve Route: #1d1d1f in light, #f5f5f7 in dark */}
        <path
          d="M11 14 C28 3.5 50.5 12.5 43.5 25.5 C37 37.5 15.5 32 17.5 44 C19.5 55.5 36.5 57.5 44.5 50.5"
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          className="stroke-[#1d1d1f] dark:stroke-[#f5f5f7] transition-colors duration-300"
        />

        {/* Destination Pin */}
        <path
          d="M46 29.5 C52.8 29.5 57.8 34.5 57.8 40.5 C57.8 48.2 46 59.5 46 59.5 C46 59.5 34.2 48.2 34.2 40.5 C34.2 34.5 39.2 29.5 46 29.5 Z"
          fill="#ff6b35"
        />

        {/* Pin Inner Hole: #ffffff in light, #1d1d1f in dark */}
        <circle
          cx="46"
          cy="40.5"
          r="4.2"
          className="fill-white dark:fill-[#1d1d1f] transition-colors duration-300"
        />
      </svg>
    );
  }

  // Full Horizontal Lockup
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 236 64"
      height={height}
      width={(height * 236) / 64}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={ariaLabel}
      className={`shrink-0 overflow-visible ${className}`}
      style={{ height: `${height}px`, width: 'auto' }}
    >
      {/* Origin Dot */}
      <circle cx="11" cy="14" r="4.5" fill="#ff6b35" />

      {/* S-curve Route: #1d1d1f in light, #f5f5f7 in dark */}
      <path
        d="M11 14 C28 3.5 50.5 12.5 43.5 25.5 C37 37.5 15.5 32 17.5 44 C19.5 55.5 36.5 57.5 44.5 50.5"
        fill="none"
        strokeWidth="5"
        strokeLinecap="round"
        className="stroke-[#1d1d1f] dark:stroke-[#f5f5f7] transition-colors duration-300"
      />

      {/* Destination Pin */}
      <path
        d="M46 29.5 C52.8 29.5 57.8 34.5 57.8 40.5 C57.8 48.2 46 59.5 46 59.5 C46 59.5 34.2 48.2 34.2 40.5 C34.2 34.5 39.2 29.5 46 29.5 Z"
        fill="#ff6b35"
      />

      {/* Pin Inner Hole */}
      <circle
        cx="46"
        cy="40.5"
        r="4.2"
        className="fill-white dark:fill-[#1d1d1f] transition-colors duration-300"
      />

      {/* Wordmark text */}
      <text
        x="67"
        y="44.5"
        fontFamily="Inter, -apple-system, 'Segoe UI', Arial, sans-serif"
        fontWeight="600"
        fontSize="34"
        letterSpacing="-0.5"
        className="fill-[#1d1d1f] dark:fill-[#f5f5f7] transition-colors duration-300"
      >
        Safar
      </text>
    </svg>
  );
};
