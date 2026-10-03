/** Flag of the Kurdistan Region: red, white and green bands with a golden 21-ray sun. */
const RAYS = 21;
const CX = 45;
const CY = 30;
const R_OUT = 9.6;
const R_IN = 5.4;

function sunPath(): string {
  const pts: string[] = [];
  for (let i = 0; i < RAYS * 2; i++) {
    const r = i % 2 === 0 ? R_OUT : R_IN;
    const a = (Math.PI * i) / RAYS - Math.PI / 2;
    pts.push(`${(CX + r * Math.cos(a)).toFixed(2)},${(CY + r * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join('L')}Z`;
}
const SUN = sunPath();

export function KurdistanFlag({ width = 54, className }: { width?: number; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 90 60" width={width} height={(width * 2) / 3} role="img" aria-label="Kurdistan Region flag">
      <defs>
        <clipPath id="krg-flag-clip">
          <rect width="90" height="60" rx="5" />
        </clipPath>
        <linearGradient id="krg-flag-sheen" x1="0" y1="0" x2="1" y2="0.2">
          <stop offset="0" stopColor="#fff" stopOpacity="0.18" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.7" stopColor="#000" stopOpacity="0.08" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <g clipPath="url(#krg-flag-clip)">
        <rect width="90" height="20" fill="#ED2024" />
        <rect y="20" width="90" height="20" fill="#FFFFFF" />
        <rect y="40" width="90" height="20" fill="#278E43" />
        <path d={SUN} fill="#FEBD11" />
        <circle cx={CX} cy={CY} r={R_IN - 0.4} fill="#FEBD11" />
        <rect width="90" height="60" fill="url(#krg-flag-sheen)" />
      </g>
      <rect x="0.5" y="0.5" width="89" height="59" rx="4.5" fill="none" stroke="#000" strokeOpacity="0.12" />
    </svg>
  );
}
