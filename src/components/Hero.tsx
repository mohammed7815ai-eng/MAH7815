import { IS_IRAQ } from '../edition';

/** Illustration: a bright, healthy community future. Sunrise over the Kurdistan mountains, a family of all ages on green hills.
 * The Iraq edition shows the whole country instead: northern mountains, the Malwiya minaret and a ziggurat, date palms
 * along the two rivers and the reeds of the southern marshes. */
export function Person({ x, y, s = 1, body, skin = '#f1c7a5', hair = '#3b2a20', scarf }: { x: number; y: number; s?: number; body: string; skin?: string; hair?: string; scarf?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-15 0 C-15 -26 -11 -40 0 -40 C11 -40 15 -26 15 0 Z" fill={body} />
      <circle cx="0" cy="-52" r="11" fill={skin} />
      {scarf ? (
        <path d="M-12.5 -50 C-13 -66 13 -66 12.5 -50 C11 -40 6 -38 0 -38 C-6 -38 -11 -40 -12.5 -50 Z M-8 -50 C-8 -44 8 -44 8 -50 C8 -58 -8 -58 -8 -50 Z" fill={scarf} fillRule="evenodd" />
      ) : (
        <path d="M-11 -54 C-11 -66 11 -66 11 -54 C8 -60 -8 -60 -11 -54 Z" fill={hair} />
      )}
    </g>
  );
}

export function Hero({ caption }: { caption: string }) {
  return (
    <figure className="hero">
      <svg viewBox="0 0 800 300" role="img" aria-label={caption} preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="hero-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#bfe3ff" />
            <stop offset="0.55" stopColor="#fff3d6" />
            <stop offset="1" stopColor="#ffe1ec" />
          </linearGradient>
          <radialGradient id="hero-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#ffe38a" stopOpacity="0.9" />
            <stop offset="1" stopColor="#ffe38a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="hero-hill1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7cc68b" />
            <stop offset="1" stopColor="#3f9d5a" />
          </linearGradient>
          <linearGradient id="hero-hill2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5db574" />
            <stop offset="1" stopColor="#278e43" />
          </linearGradient>
        </defs>
        <rect width="800" height="300" fill="url(#hero-sky)" />
        {IS_IRAQ ? (
          <>
        {/* sun */}
        <g transform="translate(400 165)">
          <circle r="150" fill="url(#hero-glow)" />
          <circle r="54" fill="#febd11" />
        </g>
        {/* birds */}
        <g fill="none" stroke="#5a6573" strokeWidth="2" strokeLinecap="round">
          <path d="M150 70 q8 -8 16 0 q8 -8 16 0" />
          <path d="M200 52 q6 -6 12 0 q6 -6 12 0" />
          <path d="M600 60 q7 -7 14 0 q7 -7 14 0" />
        </g>
        {/* northern mountains, far away on the left */}
        <path d="M0 200 L60 150 L105 178 L160 132 L225 190 L270 205 L0 215 Z" fill="#c3cde2" />
        <path d="M160 132 L178 148 L168 147 L160 156 L152 146 L144 146 Z" fill="#fff" opacity="0.9" />
        {/* desert plain on the horizon */}
        <path d="M0 212 C200 196 420 204 800 194 L800 300 L0 300 Z" fill="#ecd3a2" />
        {/* Malwiya minaret (Samarra) */}
        <g fill="#c9a26b">
          <path d="M262 206 L268 150 L278 150 L284 206 Z" />
          <path d="M266 168 L280 164 M265 180 L281 175 M264 192 L282 187" stroke="#a9834f" strokeWidth="2" />
          <rect x="270" y="142" width="6" height="9" />
        </g>
        {/* ziggurat (Ur) */}
        <g fill="#c9a26b">
          <path d="M560 204 L574 186 L626 186 L640 204 Z" />
          <path d="M580 186 L588 174 L612 174 L620 186 Z" />
          <rect x="594" y="166" width="12" height="8" />
          <path d="M597 204 L597 186 L603 186 L603 204 Z" fill="#a9834f" />
        </g>
        {/* green land along the rivers */}
        <path d="M0 235 C150 205 300 220 420 228 C560 238 680 205 800 215 L800 300 L0 300 Z" fill="url(#hero-hill1)" />
        {/* the Tigris and Euphrates */}
        <path d="M0 246 C140 232 230 250 360 244 C500 238 600 258 800 240 L800 252 C610 268 500 250 360 256 C230 262 140 246 0 258 Z" fill="#7cc4ea" />
        <path d="M60 248 C120 242 160 248 210 247 M470 248 C520 246 560 252 620 252" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
        <path d="M0 272 C180 250 330 262 470 270 C620 280 720 258 800 262 L800 300 L0 300 Z" fill="url(#hero-hill2)" />
        {/* date palms */}
        {[[70, 232, 1], [118, 238, 0.8], [228, 236, 0.75], [548, 234, 0.8], [690, 226, 1.1], [742, 234, 0.85]].map(([x, y, k], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${k})`}>
            <path d="M-2 0 C-1 -20 1 -34 3 -46 L6 -46 C4 -34 3 -20 3 0 Z" fill="#8a6038" />
            <g fill="#2f8a4a">
              <path d="M4 -46 C-8 -54 -22 -50 -28 -40 C-16 -46 -6 -46 4 -46 Z" />
              <path d="M4 -46 C16 -54 30 -50 36 -40 C24 -46 14 -46 4 -46 Z" />
              <path d="M4 -46 C-4 -60 -16 -64 -24 -60 C-12 -58 -4 -52 4 -46 Z" fill="#3f9d5a" />
              <path d="M4 -46 C12 -60 24 -64 32 -60 C20 -58 12 -52 4 -46 Z" fill="#3f9d5a" />
              <path d="M4 -46 C2 -58 4 -66 8 -70 C8 -62 7 -54 4 -46 Z" />
            </g>
            <circle cx="0" cy="-42" r="2.5" fill="#d9822b" />
            <circle cx="7" cy="-41" r="2.5" fill="#d9822b" />
          </g>
        ))}
        {/* reeds of the southern marshes */}
        <g stroke="#5f9b4a" strokeWidth="2" strokeLinecap="round" fill="none">
          {[628, 636, 644, 652, 760, 768, 776].map((x, i) => (
            <path key={i} d={`M${x} 262 C${x - 2} 250 ${x + 2} 242 ${x + 1} ${232 + (i % 3) * 4}`} />
          ))}
        </g>
        {/* flowers */}
        <g>
          {[[140, 280, '#ff7aa8'], [190, 290, '#ffd23f'], [560, 284, '#ff7aa8'], [620, 292, '#ffffff'], [250, 292, '#ffffff']].map(([x, y, c], i) => (
            <circle key={i} cx={x as number} cy={y as number} r="4" fill={c as string} />
          ))}
        </g>
          </>
        ) : (
          <>
        {/* rising sun with 21 rays, echoing the flag */}
        <g transform="translate(400 170)">
          <circle r="150" fill="url(#hero-glow)" />
          {Array.from({ length: 21 }, (_, i) => (
            <path key={i} d="M-7 -62 L0 -98 L7 -62 Z" fill="#fec53a" opacity="0.85" transform={`rotate(${(360 / 21) * i})`} />
          ))}
          <circle r="56" fill="#febd11" />
        </g>
        {/* birds */}
        <g fill="none" stroke="#5a6573" strokeWidth="2" strokeLinecap="round">
          <path d="M150 70 q8 -8 16 0 q8 -8 16 0" />
          <path d="M200 52 q6 -6 12 0 q6 -6 12 0" />
          <path d="M600 60 q7 -7 14 0 q7 -7 14 0" />
        </g>
        {/* mountains */}
        <path d="M0 210 L110 120 L170 165 L260 95 L360 185 L430 150 L520 200 L610 110 L700 170 L800 125 L800 300 L0 300 Z" fill="#b3c2dd" />
        <path d="M260 95 L285 118 L272 116 L262 128 L250 114 L240 113 Z M610 110 L632 131 L620 128 L610 139 L600 127 L592 127 Z" fill="#fff" opacity="0.9" />
        {/* hills */}
        <path d="M0 235 C150 190 300 215 420 225 C560 237 680 195 800 210 L800 300 L0 300 Z" fill="url(#hero-hill1)" />
        <path d="M0 265 C180 238 330 250 470 262 C620 274 720 248 800 252 L800 300 L0 300 Z" fill="url(#hero-hill2)" />
        {/* trees */}
        <g>
          <rect x="88" y="200" width="6" height="22" fill="#6b4a2f" />
          <circle cx="91" cy="196" r="17" fill="#2f8a4a" />
          <rect x="702" y="192" width="6" height="22" fill="#6b4a2f" />
          <circle cx="705" cy="186" r="19" fill="#2f8a4a" />
          <circle cx="735" cy="200" r="12" fill="#3f9d5a" />
        </g>
        {/* flowers */}
        <g>
          {[[140, 270, '#ff7aa8'], [190, 282, '#ffd23f'], [560, 278, '#ff7aa8'], [620, 286, '#ffffff'], [660, 272, '#ffd23f'], [250, 288, '#ffffff']].map(([x, y, c], i) => (
            <circle key={i} cx={x as number} cy={y as number} r="4" fill={c as string} />
          ))}
        </g>
          </>
        )}
        {/* family of all ages, holding hands */}
        <g strokeLinecap="round">
          <path d="M318 248 L346 244 M374 244 L400 248 M424 246 L452 244 M478 244 L500 250" stroke="#f1c7a5" strokeWidth="5" />
          <Person x={300} y={268} s={0.95} body="#7a8aa6" hair="#d9d9d9" />
          <Person x={360} y={262} s={1.15} body="#d94f8a" scarf="#f6a5c4" />
          <Person x={412} y={270} s={0.7} body="#ffb020" />
          <Person x={464} y={262} s={1.2} body="#2e6fbf" />
          <Person x={512} y={272} s={0.62} body="#3fb37f" hair="#5a3a22" />
        </g>
        {/* heart */}
        <path d="M412 172 c-6 -10 -20 -6 -20 4 c0 9 12 16 20 22 c8 -6 20 -13 20 -22 c0 -10 -14 -14 -20 -4 z" fill="#ed2024" stroke="#fff" strokeWidth="3" />
      </svg>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
