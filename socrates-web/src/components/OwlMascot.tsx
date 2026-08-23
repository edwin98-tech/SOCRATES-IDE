interface OwlMascotProps {
  size?: number;
  className?: string;
}

export default function OwlMascot({ size = 48, className = "" }: OwlMascotProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={`select-none pointer-events-none ${className}`}
    >
      {/* Dark Outer Circle with Blue Ring */}
      <circle cx="50" cy="50" r="47" fill="#1e293b" stroke="#3b82f6" strokeWidth="4.5" />

      {/* Ears / Head tufts */}
      <path d="M30 35 L33 24 L44 32 Z" fill="#6c3c1e" />
      <path d="M70 35 L67 24 L56 32 Z" fill="#6c3c1e" />

      {/* Head shape */}
      <rect x="29" y="30" width="42" height="26" rx="13" fill="#783f23" />

      {/* Lower Body */}
      <ellipse cx="50" cy="62" rx="19" ry="20" fill="#6c3c1e" />

      {/* Wings */}
      <ellipse cx="32" cy="61" rx="4.5" ry="14" fill="#4d2812" transform="rotate(8 32 61)" />
      <ellipse cx="68" cy="61" rx="4.5" ry="14" fill="#4d2812" transform="rotate(-8 68 61)" />

      {/* Peach Belly */}
      <ellipse cx="50" cy="64" rx="13.5" ry="15" fill="#fed7aa" />

      {/* Large Yellow Eyes */}
      <circle cx="40" cy="42" r="9" fill="#facc15" stroke="#3a1d0b" strokeWidth="1.5" />
      <circle cx="40" cy="42" r="4" fill="#1e293b" />
      <circle cx="41.5" cy="40.5" r="1.5" fill="#ffffff" />

      <circle cx="60" cy="42" r="9" fill="#facc15" stroke="#3a1d0b" strokeWidth="1.5" />
      <circle cx="60" cy="42" r="4" fill="#1e293b" />
      <circle cx="61.5" cy="40.5" r="1.5" fill="#ffffff" />

      {/* Orange Beak */}
      <polygon points="50,49 45,43 55,43" fill="#ea580c" />

      {/* Orange Feet */}
      <ellipse cx="43" cy="81" rx="5" ry="2.5" fill="#ea580c" />
      <ellipse cx="57" cy="81" rx="5" ry="2.5" fill="#ea580c" />
    </svg>
  );
}
