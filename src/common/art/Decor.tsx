// Décors réutilisables (trois lieux), déclinés selon le moment de la journée.
// Illustrations vectorielles stylisées : luxe tranquille, malaise sous-jacent.

import type { DecorId, TimeOfDay } from '../../../shared/types.ts';

interface Palette {
  skyTop: string;
  skyBottom: string;
  far: string;
  hedge: string;
  hedgeLight: string;
  lawn: string;
  road: string;
  wall: string;
  wallShade: string;
  roof: string;
  glass: string;
  lit: string;
  lamp: number;
  stars: boolean;
}

const PALETTES: Record<Exclude<TimeOfDay, 'interieur'>, Palette> = {
  jour: {
    skyTop: '#B9C6CF',
    skyBottom: '#F1E8D8',
    far: '#55705F',
    hedge: '#2C5545',
    hedgeLight: '#3D6B57',
    lawn: '#6E8A62',
    road: '#A39E97',
    wall: '#F1EBE0',
    wallShade: '#D9D0C2',
    roof: '#4E5866',
    glass: '#8FA2B4',
    lit: '#8FA2B4',
    lamp: 0,
    stars: false,
  },
  soir: {
    skyTop: '#33405A',
    skyBottom: '#E3A877',
    far: '#2F4239',
    hedge: '#1F3D33',
    hedgeLight: '#2C5545',
    lawn: '#4A5C45',
    road: '#7C7570',
    wall: '#E5CDB3',
    wallShade: '#B99C86',
    roof: '#39404D',
    glass: '#5D6B80',
    lit: '#F2C98A',
    lamp: 0.55,
    stars: false,
  },
  nuit: {
    skyTop: '#0B111B',
    skyBottom: '#25324A',
    far: '#111A1C',
    hedge: '#0F201B',
    hedgeLight: '#173027',
    lawn: '#16231D',
    road: '#2D3440',
    wall: '#5B6273',
    wallShade: '#434A59',
    roof: '#1A1F29',
    glass: '#1E2838',
    lit: '#F2C98A',
    lamp: 1,
    stars: true,
  },
};

function Sky({ p, id }: { p: Palette; id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.skyTop} />
          <stop offset="1" stopColor={p.skyBottom} />
        </linearGradient>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0" stopColor="#F7D9A0" stopOpacity="0.9" />
          <stop offset="0.35" stopColor="#F2C98A" stopOpacity="0.35" />
          <stop offset="1" stopColor="#F2C98A" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1600" height="900" fill={`url(#${id}-sky)`} />
      {p.stars &&
        STARS.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#F3EDE2" opacity={0.25 + (i % 4) * 0.15} />)}
      {p.stars && <circle cx="1320" cy="120" r="34" fill="#E9E2D0" opacity="0.85" />}
    </>
  );
}

const STARS: [number, number, number][] = Array.from({ length: 46 }, (_, i) => [
  (i * 337) % 1600,
  (i * 151) % 330,
  i % 5 === 0 ? 1.8 : 1.1,
]);

function Lamp({ x, y, p, id }: { x: number; y: number; p: Palette; id: string }) {
  return (
    <g>
      {p.lamp > 0 && <circle cx={x} cy={y} r={120} fill={`url(#${id}-glow)`} opacity={p.lamp} />}
      <rect x={x - 3} y={y} width="6" height={900 - y} fill="#1A1416" opacity="0.85" />
      <rect x={x - 12} y={y - 18} width="24" height="22" rx="4" fill={p.lamp > 0 ? '#F7D9A0' : '#3A3A3A'} />
      <path d={`M${x - 16} ${y - 18} L${x} ${y - 32} L${x + 16} ${y - 18} Z`} fill="#1A1416" />
    </g>
  );
}

function House({
  x,
  y,
  w,
  h,
  p,
  lit,
  door = '#5B1A24',
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  p: Palette;
  lit: boolean;
  door?: string;
}) {
  const win = lit ? p.lit : p.glass;
  const roofH = h * 0.55;
  return (
    <g>
      <path d={`M${x - w * 0.06} ${y} L${x + w / 2} ${y - roofH} L${x + w * 1.06} ${y} Z`} fill={p.roof} />
      <rect x={x} y={y} width={w} height={h} fill={p.wall} />
      <rect x={x + w * 0.62} y={y} width={w * 0.38} height={h} fill={p.wallShade} opacity="0.55" />
      <rect x={x + w * 0.12} y={y + h * 0.18} width={w * 0.2} height={h * 0.3} fill={win} />
      <rect x={x + w * 0.68} y={y + h * 0.18} width={w * 0.2} height={h * 0.3} fill={win} opacity={lit ? 0.85 : 1} />
      <rect x={x + w * 0.42} y={y + h * 0.45} width={w * 0.16} height={h * 0.55} fill={door} />
      <rect x={x + w * 0.12} y={y + h * 0.6} width={w * 0.2} height={h * 0.25} fill={win} opacity="0.9" />
      <line x1={x + w * 0.22} y1={y + h * 0.18} x2={x + w * 0.22} y2={y + h * 0.48} stroke={p.wall} strokeWidth="3" />
      <line x1={x + w * 0.78} y1={y + h * 0.18} x2={x + w * 0.78} y2={y + h * 0.48} stroke={p.wall} strokeWidth="3" />
    </g>
  );
}

function Hedge({ x, y, w, h, p }: { x: number; y: number; w: number; h: number; p: Palette }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={h * 0.35} fill={p.hedge} />
      <rect x={x + 6} y={y + 4} width={w - 12} height={h * 0.3} rx={h * 0.15} fill={p.hedgeLight} opacity="0.6" />
    </g>
  );
}

function Tree({ x, y, s, p }: { x: number; y: number; s: number; p: Palette }) {
  return (
    <g>
      <rect x={x - 5 * s} y={y} width={10 * s} height={110 * s} fill="#2A211E" />
      <ellipse cx={x} cy={y - 10 * s} rx={62 * s} ry={78 * s} fill={p.hedge} />
      <ellipse cx={x - 18 * s} cy={y - 30 * s} rx={34 * s} ry={40 * s} fill={p.hedgeLight} opacity="0.5" />
    </g>
  );
}

function Allee({ time }: { time: Exclude<TimeOfDay, 'interieur'> }) {
  const p = PALETTES[time];
  const lit = time !== 'jour';
  return (
    <>
      <Sky p={p} id="allee" />
      {/* lisière lointaine */}
      <path d="M0 470 C 120 420 220 440 320 430 C 460 410 560 440 700 425 C 860 405 980 440 1120 420 C 1280 400 1420 440 1600 420 L1600 560 L0 560 Z" fill={p.far} />
      <rect y="520" width="1600" height="380" fill={p.lawn} />
      {/* maisons */}
      <House x={760} y={455} w={120} h={70} p={p} lit={lit} />
      <House x={330} y={380} w={280} h={170} p={p} lit={lit} />
      <House x={1120} y={360} w={340} h={210} p={p} lit={false} door="#1F3D33" />
      {/* allée en perspective */}
      <path d="M760 520 L840 520 L1180 900 L420 900 Z" fill={p.road} />
      <path d="M800 525 L800 900" stroke="#F3EDE2" strokeWidth="4" strokeDasharray="30 34" opacity="0.35" />
      <Hedge x={180} y={520} w={480} h={60} p={p} />
      <Hedge x={980} y={540} w={620} h={70} p={p} />
      <Tree x={700} y={440} s={0.8} p={p} />
      <Tree x={920} y={430} s={0.9} p={p} />
      <Tree x={1020} y={470} s={1.3} p={p} />
      <Lamp x={690} y={470} p={p} id="allee" />
      {time === 'jour' && (
        <g>
          {/* le jardinier, au loin */}
          <rect x="986" y="560" width="26" height="46" rx="8" fill="#6B3A22" />
          <circle cx="999" cy="550" r="11" fill="#C99A7A" />
          <path d="M988 545 Q999 532 1010 545 Z" fill="#B8B8B4" />
          <line x1="1012" y1="575" x2="1040" y2="560" stroke="#3A3A3A" strokeWidth="4" />
        </g>
      )}
      <Lamp x={1080} y={520} p={p} id="allee" />
      {/* piliers du portail et plaque */}
      <rect x="60" y="300" width="170" height="600" fill="#E3DACB" />
      <rect x="60" y="300" width="60" height="600" fill="#C9BFAF" opacity="0.6" />
      <rect x="44" y="282" width="202" height="30" fill="#D4CABA" />
      <rect x="120" y="500" width="100" height="56" rx="3" fill="#B08A4A" />
      <rect x="126" y="506" width="88" height="44" rx="2" fill="none" stroke="#E8CF94" strokeWidth="1.5" />
      <text x="170" y="526" textAnchor="middle" fontSize="11" fontFamily="Cormorant Garamond, serif" fill="#3A2A12" letterSpacing="1">BELLÉCOURT</text>
      <text x="170" y="543" textAnchor="middle" fontSize="11" fontFamily="Cormorant Garamond, serif" fill="#3A2A12">1987</text>
      <Hedge x={0} y={720} w={330} h={180} p={p} />
      {time === 'nuit' && <rect width="1600" height="900" fill="#0B111B" opacity="0.25" />}
    </>
  );
}

function Salon({ time }: { time: TimeOfDay }) {
  const night = time === 'nuit';
  return (
    <>
      <defs>
        <linearGradient id="salon-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={night ? '#5A4B44' : '#EDE3D2'} />
          <stop offset="1" stopColor={night ? '#3E332F' : '#D8C9B2'} />
        </linearGradient>
        <radialGradient id="salon-lamp" cx="0.5" cy="0.2" r="0.7">
          <stop offset="0" stopColor="#F7D9A0" stopOpacity={night ? 0.55 : 0.4} />
          <stop offset="1" stopColor="#F7D9A0" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="salon-garden" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0B111B" />
          <stop offset="1" stopColor="#1E2A3A" />
        </linearGradient>
        <radialGradient id="salon-pool">
          <stop offset="0" stopColor="#7FE3E0" stopOpacity="0.9" />
          <stop offset="1" stopColor="#2BB3B1" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#salon-wall)" />
      {Array.from({ length: 32 }, (_, i) => (
        <rect key={i} x={i * 50} y="0" width="2" height="640" fill={night ? '#2E2522' : '#CDBEA6'} opacity="0.35" />
      ))}
      {/* parquet */}
      <rect y="640" width="1600" height="260" fill="#3E2F29" />
      {Array.from({ length: 14 }, (_, i) => (
        <line key={i} x1={800} y1={640} x2={-400 + i * 185} y2={900} stroke="#2A1F1B" strokeWidth="2" opacity="0.6" />
      ))}
      {/* baie vitrée sur le jardin, avec le pavillon au loin */}
      <rect x="980" y="130" width="520" height="500" fill="url(#salon-garden)" />
      <ellipse cx="1240" cy="480" rx="180" ry="60" fill="url(#salon-pool)" />
      <rect x="1180" y="440" width="120" height="50" fill="#2BB3B1" opacity="0.55" />
      <path d="M980 520 C 1080 480 1160 510 1250 500 C 1340 490 1420 520 1500 500 L1500 630 L980 630 Z" fill="#0F201B" />
      {[1110, 1240, 1370].map((x) => (
        <rect key={x} x={x - 4} y="130" width="8" height="500" fill="#1A1416" />
      ))}
      <rect x="980" y="130" width="520" height="500" fill="none" stroke="#1A1416" strokeWidth="14" />
      <rect x="960" y="110" width="40" height="540" fill="#5B1A24" />
      <rect x="1480" y="110" width="40" height="540" fill="#5B1A24" />
      {/* cheminée */}
      <rect x="120" y="360" width="320" height="280" fill="#EFE9DF" />
      <rect x="100" y="344" width="360" height="24" fill="#F7F2EA" />
      <rect x="180" y="440" width="200" height="200" fill="#1A1416" />
      <path d="M220 640 C 230 590 260 600 270 560 C 285 600 300 580 310 620 C 320 600 335 610 340 640 Z" fill="#E8B86B" opacity={night ? 0.95 : 0.75} />
      <rect x="244" y="374" width="56" height="44" fill="#C9A45C" />
      <rect x="250" y="380" width="44" height="32" fill="#F3EDE2" />
      <line x1="256" y1="390" x2="288" y2="390" stroke="#B08A4A" strokeWidth="2" />
      <line x1="260" y1="398" x2="284" y2="398" stroke="#B08A4A" strokeWidth="1.5" />
      <rect x="330" y="384" width="20" height="40" fill="#2C5545" />
      {/* étagère et photos */}
      <rect x="610" y="300" width="270" height="10" fill="#5B1A24" />
      <rect x="610" y="390" width="270" height="10" fill="#5B1A24" />
      {[
        [630, 252, 40, 48],
        [690, 260, 54, 40],
        [760, 248, 36, 52],
        [814, 262, 46, 38],
        [640, 342, 60, 48],
        [716, 336, 44, 54],
        [778, 346, 70, 44],
      ].map(([x, y, w, h], i) => (
        <g key={i}>
          <rect x={x} y={y} width={w} height={h} fill="#C9A45C" />
          <rect x={x + 4} y={y + 4} width={w - 8} height={h - 8} fill={i === 6 ? '#6B7A8F' : '#9AA8B8'} opacity="0.8" />
        </g>
      ))}
      {/* suspension */}
      <rect width="1600" height="900" fill="url(#salon-lamp)" />
      <line x1="800" y1="0" x2="800" y2="140" stroke="#1A1416" strokeWidth="3" />
      <path d="M740 180 L860 180 L830 140 L770 140 Z" fill="#1A1416" />
      <ellipse cx="800" cy="182" rx="60" ry="8" fill="#F7D9A0" />
      {/* table dressée */}
      <ellipse cx="800" cy="800" rx="460" ry="110" fill="#F3EDE2" />
      <ellipse cx="800" cy="790" rx="460" ry="100" fill="#FBF8F2" />
      {[560, 700, 900, 1040].map((x, i) => (
        <g key={x}>
          <ellipse cx={x} cy={800 + (i % 2) * 16} rx="46" ry="14" fill="#E9E1D4" stroke="#C9BFAF" />
          <path d={`M${x + 52} ${760 + (i % 2) * 16} q 10 0 10 14 q 0 14 -10 14 q -10 0 -10 -14 q 0 -14 10 -14 Z`} fill="#7A2433" opacity="0.7" />
          <line x1={x + 52} y1={788 + (i % 2) * 16} x2={x + 52} y2={806 + (i % 2) * 16} stroke="#C9BFAF" strokeWidth="2" />
        </g>
      ))}
      {[770, 830].map((x) => (
        <g key={x}>
          <rect x={x - 5} y="700" width="10" height="70" fill="#F3EDE2" />
          <ellipse cx={x} cy="694" rx="6" ry="12" fill="#F7D9A0" />
          <circle cx={x} cy="694" r="40" fill="#F7D9A0" opacity="0.15" />
        </g>
      ))}
    </>
  );
}

function PavillonExterieur() {
  const p = PALETTES.nuit;
  return (
    <>
      <defs>
        <linearGradient id="pool" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3FD0CB" />
          <stop offset="1" stopColor="#0C4E5E" />
        </linearGradient>
        <linearGradient id="pav-glass" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#58C9C4" stopOpacity="0.55" />
          <stop offset="1" stopColor="#1E2838" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <Sky p={p} id="pav" />
      <path d="M0 470 C 200 430 380 470 560 440 C 760 410 900 460 1100 430 C 1300 400 1450 450 1600 430 L1600 600 L0 600 Z" fill={p.far} />
      <Hedge x={0} y={480} w={420} h={110} p={p} />
      <Hedge x={1220} y={470} w={380} h={120} p={p} />
      {/* pavillon de verre */}
      <rect x="480" y="250" width="680" height="320" fill="url(#pav-glass)" />
      {[480, 600, 720, 840, 960, 1080, 1160].map((x) => (
        <rect key={x} x={x - 4} y="250" width="8" height="320" fill="#141820" />
      ))}
      <rect x="460" y="232" width="720" height="24" fill="#141820" />
      <rect x="780" y="380" width="80" height="190" fill="#141820" opacity="0.6" />
      {/* digicode */}
      <rect x="880" y="420" width="26" height="40" rx="3" fill="#2B2F38" stroke="#6B7A8F" />
      <circle cx="893" cy="430" r="3" fill="#E8B86B" className="blink" />
      {/* plage et piscine */}
      <rect y="570" width="1600" height="330" fill="#3B4250" />
      <path d="M260 620 L1340 620 L1520 880 L80 880 Z" fill="url(#pool)" />
      <g className="ripples" opacity="0.55">
        {Array.from({ length: 9 }, (_, i) => (
          <path
            key={i}
            d={`M${220 + i * 30} ${650 + i * 26} C ${520} ${640 + i * 26}, ${700} ${670 + i * 26}, ${1000 - i * 10} ${650 + i * 26} S ${1300} ${660 + i * 26}, ${1380 + i * 18} ${648 + i * 26}`}
            fill="none"
            stroke="#BFF5F1"
            strokeWidth="2"
          />
        ))}
      </g>
      <path d="M260 620 L1340 620" stroke="#D9D0C2" strokeWidth="10" />
      {/* transats */}
      <path d="M1360 600 L1480 600 L1540 560" stroke="#D9D0C2" strokeWidth="10" fill="none" />
      <path d="M120 600 L240 600 L300 560" stroke="#D9D0C2" strokeWidth="10" fill="none" />
    </>
  );
}

function PavillonInterieur() {
  return (
    <>
      <defs>
        <radialGradient id="torch" cx="0.5" cy="0.5" r="0.6">
          <stop offset="0" stopColor="#000" stopOpacity="0" />
          <stop offset="0.55" stopColor="#05080D" stopOpacity="0.45" />
          <stop offset="1" stopColor="#05080D" stopOpacity="0.85" />
        </radialGradient>
        <pattern id="tiles" width="60" height="60" patternUnits="userSpaceOnUse">
          <rect width="60" height="60" fill="#B9CBCB" />
          <path d="M0 0 H60 V60" fill="none" stroke="#8FA6A8" strokeWidth="2" />
        </pattern>
      </defs>
      <rect width="1600" height="900" fill="url(#tiles)" />
      {/* grande baie sur la piscine */}
      <rect x="560" y="160" width="420" height="380" fill="#0E3640" />
      <rect x="560" y="420" width="420" height="120" fill="#2BB3B1" opacity="0.7" />
      <line x1="770" y1="160" x2="770" y2="540" stroke="#141820" strokeWidth="8" />
      <rect x="560" y="160" width="420" height="380" fill="none" stroke="#141820" strokeWidth="12" />
      {/* sol */}
      <rect y="660" width="1600" height="240" fill="#7E9294" />
      {Array.from({ length: 12 }, (_, i) => (
        <line key={i} x1={800} y1={660} x2={-500 + i * 240} y2={900} stroke="#5E7072" strokeWidth="2" />
      ))}
      {/* registre accroché au mur */}
      <rect x="420" y="380" width="64" height="84" fill="#7A2433" />
      <rect x="428" y="388" width="48" height="68" fill="#F3EDE2" />
      {[400, 412, 424, 436].map((y) => (
        <line key={y} x1="434" y1={y} x2="470" y2={y} stroke="#6B7A8F" strokeWidth="2" />
      ))}
      <circle cx="452" cy="372" r="5" fill="#141820" />
      {/* local technique */}
      <rect x="1080" y="280" width="220" height="420" fill="#5B6273" />
      <rect x="1094" y="294" width="192" height="392" fill="#6E7688" />
      <rect x="1120" y="320" width="140" height="28" fill="#E8B86B" />
      <text x="1190" y="339" textAnchor="middle" fontSize="13" fontFamily="Inter, sans-serif" fontWeight="600" fill="#1A1416">LOCAL TECHNIQUE</text>
      <rect x="1262" y="480" width="10" height="40" rx="3" fill="#141820" />
      {/* transats empilés */}
      <path d="M180 660 L340 660 L410 600" stroke="#F3EDE2" strokeWidth="12" fill="none" />
      <path d="M190 690 L350 690 L420 630" stroke="#D9D0C2" strokeWidth="12" fill="none" />
      <rect width="1600" height="900" fill="url(#torch)" />
    </>
  );
}

export function Decor({ decor, time }: { decor: DecorId; time: TimeOfDay }) {
  const outdoor = time === 'interieur' ? 'nuit' : time;
  return (
    <svg className="decor" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {decor === 'allee' && <Allee time={outdoor} />}
      {decor === 'salon' && <Salon time={time} />}
      {decor === 'pavillon' && (time === 'interieur' ? <PavillonInterieur /> : <PavillonExterieur />)}
    </svg>
  );
}
