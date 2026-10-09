import React from 'react';

export function ToriiIcon({ className = 'w-6 h-6', color = 'currentColor' }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Top curved lintel (Kasagi) */}
      <path
        d="M3 13C12 9 36 9 45 13C43 15 41 15.5 39 15.5H9C7 15.5 5 15 3 13Z"
        fill={color}
      />
      {/* Upper straight beam (Shimaki) */}
      <path d="M6 16.5H42V19.5H6V16.5Z" fill={color} />
      {/* Middle tie-beam (Nuki) */}
      <path d="M5 24H43V26.5H5V24Z" fill={color} />
      {/* Central strut (Gakuzuka) */}
      <rect x="22.5" y="19.5" width="3" height="4.5" fill={color} />
      {/* Left pillar (Hashira) */}
      <path d="M12 19.5L10 43H14L15.5 19.5H12Z" fill={color} />
      {/* Right pillar (Hashira) */}
      <path d="M36 19.5L38 43H34L32.5 19.5H36Z" fill={color} />
      {/* Left base plate */}
      <rect x="8.5" y="42" width="7" height="3" rx="1" fill={color} />
      {/* Right base plate */}
      <rect x="32.5" y="42" width="7" height="3" rx="1" fill={color} />
    </svg>
  );
}

export function SakuraIcon({ className = 'w-5 h-5', color = 'currentColor' }) {
  return (
    <svg viewBox="0 0 24 24" fill={color} className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C11 5.5 8 8 5 8C6 11 8.5 13 12 13C15.5 13 18 11 19 8C16 8 13 5.5 12 2Z" opacity="0.9" />
      <path d="M12 13C8.5 13 6 15 5 18C8 18 11 20.5 12 24C13 20.5 16 18 19 18C18 15 15.5 13 12 13Z" opacity="0.9" />
      <circle cx="12" cy="12" r="2.5" fill="#FFF176" />
    </svg>
  );
}

export function FujiIcon({ className = 'w-8 h-8' }) {
  return (
    <svg viewBox="0 0 64 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Rising Sun */}
      <circle cx="48" cy="16" r="10" fill="#C53D33" opacity="0.85" />
      {/* Mountain base */}
      <path
        d="M2 44C14 44 24 30 29 18H35C40 30 50 44 62 44H2Z"
        fill="#203247"
      />
      {/* Snow cap */}
      <path
        d="M29 18C30.5 22 31.5 24 32 23C32.5 24 33.5 22 35 18H29Z"
        fill="#FFFFFF"
      />
      <path
        d="M27 23L29 18H35L37 23L34.5 25L32 23.5L29.5 25L27 23Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export function DarumaIcon({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" fill="#C53D33" />
      <ellipse cx="16" cy="14" rx="9" ry="8" fill="#FDFBF7" />
      {/* Eyebrows */}
      <path d="M10 10C11.5 9 13.5 9.5 14 11" stroke="#242220" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M22 10C20.5 9 18.5 9.5 18 11" stroke="#242220" strokeWidth="1.5" strokeLinecap="round" />
      {/* Eyes */}
      <circle cx="12" cy="14" r="2.2" fill="#242220" />
      <circle cx="20" cy="14" r="2.2" fill="#242220" />
      {/* Beard & mouth */}
      <path d="M13 18C14.5 19 17.5 19 19 18" stroke="#242220" strokeWidth="1.5" strokeLinecap="round" />
      {/* Gold pattern */}
      <circle cx="16" cy="24" r="2" fill="#B38217" />
    </svg>
  );
}

export function HankoBadge({ text, className = '' }) {
  return (
    <span
      className={`inline-flex items-center justify-center font-serif text-accent border border-accent/80 rounded px-1.5 py-0.5 text-xs font-bold tracking-wider bg-accent-soft/30 shadow-[inset_0_0_0_1px_rgba(197,61,51,0.15)] ${className}`}
      style={{ fontFamily: "'Noto Serif JP', serif" }}
    >
      {text}
    </span>
  );
}
