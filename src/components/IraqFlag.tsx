/** Flag of the Republic of Iraq: red, white and black bands with "Allahu Akbar" in green. */
export function IraqFlag({ width = 54, className }: { width?: number; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 90 60" width={width} height={(width * 2) / 3} role="img" aria-label="Flag of Iraq">
      <defs>
        <clipPath id="iq-flag-clip">
          <rect width="90" height="60" rx="5" />
        </clipPath>
        <linearGradient id="iq-flag-sheen" x1="0" y1="0" x2="1" y2="0.2">
          <stop offset="0" stopColor="#fff" stopOpacity="0.18" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.7" stopColor="#000" stopOpacity="0.08" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <g clipPath="url(#iq-flag-clip)">
        <rect width="90" height="20" fill="#CE1126" />
        <rect y="20" width="90" height="20" fill="#FFFFFF" />
        <rect y="40" width="90" height="20" fill="#000000" />
        <text
          x="45"
          y="35.2"
          textAnchor="middle"
          fontFamily="'Noto Sans Arabic', 'Segoe UI', Tahoma, sans-serif"
          fontWeight="700"
          fontSize="12.5"
          fill="#007A3D"
          direction="rtl"
        >
          الله أكبر
        </text>
        <rect width="90" height="60" fill="url(#iq-flag-sheen)" />
      </g>
    </svg>
  );
}
