// Portraits stylisés des quatre personnages, avec quatre expressions.

import type { CharId, Mood } from '../../../shared/types.ts';

interface Look {
  skin: string;
  skinShade: string;
  hair: string;
  hairShade: string;
  lips: string;
  male: boolean;
  hairBack?: string;
  hairFront: string;
  clothes: (look: Look) => React.ReactNode;
  extra?: (look: Look) => React.ReactNode;
  brow: number;
}

const HEAD_F = 'M120 240 C120 168 160 140 200 140 C 242 140 280 168 280 240 C 280 302 248 350 200 352 C 152 350 120 302 120 240 Z';
const HEAD_M = 'M116 236 C116 166 158 136 200 136 C 244 136 284 166 284 236 C 284 296 264 338 232 354 C 214 362 186 362 168 354 C 136 338 116 296 116 236 Z';

const LOOKS: Record<CharId, Look> = {
  beatrice: {
    skin: '#EDCDB4',
    skinShade: '#D9AE93',
    hair: '#D8BC88',
    hairShade: '#B8975E',
    lips: '#B5646C',
    male: false,
    brow: 4,
    hairBack: 'M98 242 C 92 150 148 108 204 110 C 266 112 310 158 304 242 C 302 292 312 334 302 360 C 290 376 268 368 250 356 L 150 356 C 132 368 110 376 98 360 C 88 334 100 292 98 242 Z',
    hairFront: 'M116 236 C 116 160 168 124 214 128 C 264 134 292 176 286 238 C 270 196 236 170 196 176 C 160 182 136 204 116 236 Z',
    clothes: () => (
      <>
        <path d="M30 560 C 40 446 112 404 200 400 C 288 404 360 446 370 560 Z" fill="#6E2230" />
        <path d="M150 404 L200 470 L250 404 C 236 400 216 398 200 398 C 184 398 164 400 150 404 Z" fill="#F3EDE2" />
        <path d="M150 404 L200 470 L178 560 L120 560 Z" fill="#5B1A24" opacity="0.5" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <circle key={i} cx={164 + i * 12} cy={418 + Math.sin((i / 6) * Math.PI) * 22} r="5" fill="#F7F2EA" stroke="#D9D0C2" />
        ))}
      </>
    ),
    extra: () => (
      <>
        <circle cx="118" cy="274" r="7" fill="#F7F2EA" stroke="#D9D0C2" />
        <circle cx="282" cy="274" r="7" fill="#F7F2EA" stroke="#D9D0C2" />
      </>
    ),
  },
  paul: {
    skin: '#DDB394',
    skinShade: '#C49677',
    hair: '#8C8A86',
    hairShade: '#5E5C59',
    lips: '#A0705E',
    male: true,
    brow: 6,
    hairFront: 'M112 226 C 104 158 150 116 206 118 C 262 120 296 160 288 226 C 280 192 262 170 232 164 C 196 158 166 166 146 178 C 128 190 118 206 112 226 Z',
    clothes: () => (
      <>
        <path d="M24 560 C 36 448 110 402 200 398 C 290 402 364 448 376 560 Z" fill="#6B7A8F" />
        <path d="M140 404 L200 520 L260 404 C 240 398 220 396 200 396 C 180 396 160 398 140 404 Z" fill="#22304A" />
        <path d="M172 400 L200 452 L228 400 Z" fill="#DDB394" />
        <path d="M140 404 L200 520 L170 560 L96 560 C 110 480 120 440 140 404 Z" fill="#56647A" />
        <path d="M260 404 L200 520 L230 560 L304 560 C 290 480 280 440 260 404 Z" fill="#56647A" />
      </>
    ),
    extra: (l) => (
      <path d="M140 300 C 150 336 176 356 200 356 C 224 356 250 336 260 300 C 250 320 228 332 200 332 C 172 332 150 320 140 300 Z" fill={l.hairShade} opacity="0.28" />
    ),
  },
  monica: {
    skin: '#F1D5C3',
    skinShade: '#DDB5A0',
    hair: '#1E1A1D',
    hairShade: '#0E0B0D',
    lips: '#8E1F2E',
    male: false,
    brow: 5,
    hairBack: 'M100 250 C 94 150 150 106 200 106 C 250 106 306 150 300 250 L 316 476 C 284 494 250 478 240 440 L 160 440 C 150 478 116 494 84 476 Z',
    hairFront: 'M200 118 C 156 120 120 158 116 240 C 114 290 120 340 132 384 C 140 300 154 210 200 132 C 246 210 260 300 268 384 C 280 340 286 290 284 240 C 280 158 244 120 200 118 Z',
    clothes: () => (
      <>
        <path d="M34 560 C 46 450 116 406 200 402 C 284 406 354 450 366 560 Z" fill="#1A1416" />
        <path d="M150 406 C 170 450 230 450 250 406" fill="none" stroke="#C9A45C" strokeWidth="2.5" />
        <circle cx="200" cy="440" r="5" fill="#C9A45C" />
      </>
    ),
  },
  alban: {
    skin: '#C99A7A',
    skinShade: '#AD7F61',
    hair: '#BDBDB8',
    hairShade: '#8F8F8A',
    lips: '#94604D',
    male: true,
    brow: 5,
    hairFront: 'M120 214 C 118 160 158 128 200 128 C 244 128 284 160 282 214 C 272 186 250 168 200 166 C 152 168 130 186 120 214 Z',
    clothes: () => (
      <>
        <path d="M22 560 C 34 446 108 400 200 396 C 292 400 366 446 378 560 Z" fill="#6B3A22" />
        <path d="M130 410 L200 470 L270 410 L246 396 L200 440 L154 396 Z" fill="#8A4B2C" />
        <rect x="250" y="476" width="54" height="40" rx="4" fill="#542C19" />
        <path d="M170 398 L200 440 L230 398 Z" fill="#B8A88A" />
      </>
    ),
    extra: (l) => (
      <>
        <path d="M128 282 C 136 334 166 364 200 364 C 236 364 266 334 274 282 C 262 316 240 330 200 332 C 162 330 140 316 128 282 Z" fill={l.hair} opacity="0.85" />
        <path d="M160 190 Q200 182 240 190" stroke={l.skinShade} strokeWidth="2" fill="none" />
        <path d="M166 202 Q200 196 234 202" stroke={l.skinShade} strokeWidth="1.5" fill="none" />
        <path d="M140 262 l-10 6 M140 270 l-10 2" stroke={l.skinShade} strokeWidth="1.5" />
        <path d="M260 262 l10 6 M260 270 l10 2" stroke={l.skinShade} strokeWidth="1.5" />
      </>
    ),
  },
};

function Eye({ cx, l, mood }: { cx: number; l: Look; mood: Mood }) {
  const cy = 252;
  const squint = mood === 'sourire' ? 3 : 0;
  const white = `M${cx - 22} ${cy} Q${cx} ${cy - 14 + squint} ${cx + 22} ${cy} Q${cx} ${cy + 10 - squint} ${cx - 22} ${cy} Z`;
  return (
    <g>
      <path d={white} fill="#F7F2EA" />
      <circle cx={cx} cy={cy - 1} r="7.5" fill="#2A211E" />
      <circle cx={cx + 2.5} cy={cy - 3.5} r="2" fill="#F7F2EA" />
      {mood === 'froid' && <path d={`M${cx - 24} ${cy - 16} L${cx + 24} ${cy - 16} L${cx + 24} ${cy - 2} Q${cx} ${cy - 6} ${cx - 24} ${cy - 2} Z`} fill={l.skin} />}
      <path
        d={mood === 'froid' ? `M${cx - 23} ${cy - 1} Q${cx} ${cy - 6} ${cx + 23} ${cy - 1}` : `M${cx - 23} ${cy + 1} Q${cx} ${cy - 15 + squint} ${cx + 23} ${cy + 1}`}
        stroke="#2A211E"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );
}

function Brows({ l, mood }: { l: Look; mood: Mood }) {
  const y = 222;
  const w = l.brow;
  const shapes: Record<Mood, [string, string]> = {
    neutre: [`M146 ${y + 2} Q166 ${y - 8} 190 ${y}`, `M210 ${y} Q234 ${y - 8} 254 ${y + 2}`],
    sourire: [`M146 ${y} Q166 ${y - 14} 190 ${y - 4}`, `M210 ${y - 4} Q234 ${y - 14} 254 ${y}`],
    froid: [`M146 ${y + 2} Q168 ${y - 2} 190 ${y + 8}`, `M210 ${y + 8} Q232 ${y - 2} 254 ${y + 2}`],
    trouble: [`M146 ${y + 6} Q168 ${y} 190 ${y - 10}`, `M210 ${y - 10} Q232 ${y} 254 ${y + 6}`],
  };
  const [a, b] = shapes[mood];
  return (
    <g stroke={l.male ? l.hairShade : '#5A4038'} strokeWidth={w} strokeLinecap="round" fill="none">
      <path d={a} />
      <path d={b} />
    </g>
  );
}

function Mouth({ l, mood }: { l: Look; mood: Mood }) {
  const y = 318;
  const d: Record<Mood, string> = {
    neutre: `M178 ${y} Q200 ${y + 4} 222 ${y}`,
    sourire: `M172 ${y - 4} Q200 ${y + 16} 228 ${y - 4}`,
    froid: `M180 ${y + 2} L220 ${y + 2}`,
    trouble: `M182 ${y + 6} Q200 ${y - 4} 218 ${y + 6}`,
  };
  return (
    <g>
      {!l.male && <path d={`M180 ${y} Q190 ${y - 7} 200 ${y - 3} Q210 ${y - 7} 220 ${y} Q200 ${y + 12} 180 ${y} Z`} fill={l.lips} opacity={mood === 'sourire' ? 0 : 0.9} />}
      <path d={d[mood]} stroke={l.male ? '#6E4A3C' : l.lips} strokeWidth={l.male ? 3.5 : 4.5} fill="none" strokeLinecap="round" />
    </g>
  );
}

export function Portrait({ id, mood = 'neutre' }: { id: CharId; mood?: Mood }) {
  const l = LOOKS[id];
  return (
    <svg className="portrait-svg" viewBox="0 0 400 560" aria-hidden="true">
      {l.hairBack && <path d={l.hairBack} fill={l.hairShade} />}
      <path d="M168 330 L168 410 C 180 420 220 420 232 410 L232 330 Z" fill={l.skinShade} />
      {l.clothes(l)}
      <ellipse cx={l.male ? 116 : 120} cy="256" rx="12" ry="20" fill={l.skinShade} />
      <ellipse cx={l.male ? 284 : 280} cy="256" rx="12" ry="20" fill={l.skinShade} />
      <path d={l.male ? HEAD_M : HEAD_F} fill={l.skin} />
      <path d="M200 340 C 236 338 268 312 278 262 C 270 330 236 352 200 352 Z" fill={l.skinShade} opacity="0.45" />
      <ellipse cx="160" cy="292" rx="18" ry="9" fill="#D98C82" opacity={mood === 'trouble' ? 0.35 : 0.18} />
      <ellipse cx="240" cy="292" rx="18" ry="9" fill="#D98C82" opacity={mood === 'trouble' ? 0.35 : 0.18} />
      <path d="M200 260 Q194 288 190 296 Q198 302 210 298" stroke={l.skinShade} strokeWidth="3" fill="none" strokeLinecap="round" />
      <Eye cx={168} l={l} mood={mood} />
      <Eye cx={232} l={l} mood={mood} />
      <Brows l={l} mood={mood} />
      <Mouth l={l} mood={mood} />
      {l.extra?.(l)}
      <path d={l.hairFront} fill={l.hair} />
    </svg>
  );
}
