// Vue du viseur : la même image sur l'écran principal et sur le téléphone.
// Le monde est zoomé autour du point visé ; l'image se floute quand la mise
// au point est mauvaise.

import './../styles/viewfinder.css';
import { Pair } from './art/Pair.tsx';

export interface ViewfinderView {
  x: number;
  y: number;
  zoom: number;
  focus: number;
}

export const VIEW_DEFAULT: ViewfinderView = { x: 50, y: 50, zoom: 1, focus: 0 };

export function focusColor(focus: number): string {
  return focus >= 0.7 ? '#9fd2a6' : focus >= 0.3 ? '#e8b86b' : '#d9443f';
}

function Scene() {
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="vf-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#070b12" />
          <stop offset="1" stopColor="#1b2740" />
        </linearGradient>
        <radialGradient id="vf-glow">
          <stop offset="0" stopColor="#f7d9a0" stopOpacity="0.85" />
          <stop offset="0.4" stopColor="#f2c98a" stopOpacity="0.28" />
          <stop offset="1" stopColor="#f2c98a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#vf-sky)" />
      {Array.from({ length: 40 }, (_, i) => (
        <circle key={i} cx={(i * 337) % 1600} cy={(i * 151) % 300} r={i % 5 === 0 ? 1.8 : 1.1} fill="#f3ede2" opacity={0.2 + (i % 4) * 0.12} />
      ))}
      <path d="M0 420 C 200 380 380 420 560 395 C 760 370 900 420 1100 392 C 1300 365 1450 410 1600 390 L1600 640 L0 640 Z" fill="#0d1715" />
      <rect y="440" width="1600" height="120" rx="40" fill="#0f2019" />
      <rect y="600" width="1600" height="300" fill="#141d1a" />
      <path d="M700 600 L1300 600 L1500 900 L500 900 Z" fill="#252b35" />
      {/* piliers du portail */}
      <rect x="760" y="360" width="70" height="240" fill="#4b5262" />
      <rect x="1150" y="360" width="70" height="240" fill="#4b5262" />
      <rect x="752" y="348" width="86" height="16" fill="#5b6273" />
      <rect x="1142" y="348" width="86" height="16" fill="#5b6273" />
      {/* lampadaire */}
      <circle cx="1090" cy="420" r="210" fill="url(#vf-glow)" />
      <rect x="1087" y="425" width="6" height="175" fill="#0c0c0e" />
      <rect x="1077" y="408" width="26" height="22" rx="4" fill="#f7d9a0" />
      <path d="M1072 408 L1090 392 L1108 408 Z" fill="#0c0c0e" />
      <Pair />
    </svg>
  );
}

export function ViewfinderWorld({ view, label }: { view: ViewfinderView; label?: string }) {
  const { x, y, zoom, focus } = view;
  const col = focusColor(focus);
  const blur = zoom > 1.2 ? (1 - focus) * 3.5 : 0;
  return (
    <div className="vf" style={{ ['--vf-col' as string]: col }}>
      <div
        className="vf-world"
        style={{
          transformOrigin: `${x}% ${y}%`,
          transform: `translate(${50 - x}%, ${50 - y}%) scale(${zoom})`,
          filter: `blur(${blur}px)`,
        }}
      >
        <Scene />
      </div>
      <div className="vf-vignette" />
      <div className="vf-reticle">
        <i /> <i /> <i /> <i />
        <b />
      </div>
      <div className="vf-hud">
        <span className="vf-rec">● REC</span>
        <span>×{zoom.toFixed(1)}</span>
      </div>
      {label && <div className="vf-label">{label}</div>}
    </div>
  );
}
