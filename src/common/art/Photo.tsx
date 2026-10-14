// Photos reçues par l'héroïne (pièces du dossier).

function BeaAlban({ blur }: { blur: boolean }) {
  return (
    <svg className="photo-svg" viewBox="0 0 800 600" role="img" aria-label={blur ? 'Photo floue de deux silhouettes sous un lampadaire' : 'Photo de nuit : deux personnes très proches sous un lampadaire, l’une remet une enveloppe à l’autre'}>
      <defs>
        <radialGradient id="bg-glow" cx="0.62" cy="0.3">
          <stop offset="0" stopColor="#f7d9a0" stopOpacity="0.9" />
          <stop offset="0.5" stopColor="#f2c98a" stopOpacity="0.25" />
          <stop offset="1" stopColor="#f2c98a" stopOpacity="0" />
        </radialGradient>
        <filter id="bg-blur">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <filter id="bg-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" />
          <feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.3 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
      </defs>
      <rect width="800" height="600" fill="#0b111b" />
      <g filter={blur ? 'url(#bg-blur)' : undefined}>
        <rect width="800" height="600" fill="url(#bg-glow)" />
        <rect y="470" width="800" height="130" fill="#161e1d" />
        <rect x="560" y="120" width="12" height="380" fill="#0c0c0e" />
        <rect x="544" y="96" width="44" height="34" rx="6" fill="#f7d9a0" />
        <g transform="translate(330 300) scale(3.4) translate(-990 -515)">
          <path d="M945 600 L950 505 Q965 492 980 505 L985 600 Z" fill="#4a2028" />
          <circle cx="965" cy="482" r="14" fill="#d2b190" />
          <path d="M951 482 Q951 462 966 462 Q980 462 980 482 Q972 472 951 482 Z" fill="#d1b274" />
          <path d="M995 600 L998 505 Q1013 493 1028 505 L1031 600 Z" fill="#1d3a30" />
          <circle cx="1013" cy="483" r="15" fill="#b08463" />
          <path d="M998 482 Q998 464 1013 464 Q1028 464 1028 482 Q1018 473 998 482 Z" fill="#c4c4bf" />
          <path d="M978 515 L997 521" stroke="#4a2028" strokeWidth="6" strokeLinecap="round" />
          <rect x="988" y="517" width="14" height="9" fill="#f3ede2" transform="rotate(-8 995 521)" />
        </g>
      </g>
      <rect width="800" height="600" filter="url(#bg-grain)" />
      <text x="770" y="570" textAnchor="end" fontFamily="'Courier New', monospace" fontSize="28" fontWeight="bold" fill="#f28c28" opacity="0.9">
        00:21
      </text>
    </svg>
  );
}

export function Photo({ id }: { id: string }) {
  if (id === 'bea-alban') return <BeaAlban blur={false} />;
  if (id === 'bea-alban-floue') return <BeaAlban blur />;
  if (id !== 'pavillon-2347') return null;
  return (
    <svg className="photo-svg" viewBox="0 0 800 600" role="img" aria-label="Photo de nuit : le pavillon de la piscine, une voiture rouge garée devant, une silhouette derrière la vitre. Horodatage 21.06.2016 23:47.">
      <defs>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
          <feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.35 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <radialGradient id="flash" cx="0.5" cy="0.55" r="0.75">
          <stop offset="0" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.75" />
        </radialGradient>
      </defs>
      <rect width="800" height="600" fill="#0C121B" />
      <path d="M0 260 C 160 230 300 260 420 240 C 560 220 680 250 800 230 L800 380 L0 380 Z" fill="#0F1A17" />
      <rect x="220" y="150" width="400" height="200" fill="#2A6F73" opacity="0.55" />
      {[220, 300, 380, 460, 540, 620].map((x) => (
        <rect key={x} x={x - 3} y="150" width="6" height="200" fill="#0A0D12" />
      ))}
      <rect x="208" y="138" width="424" height="16" fill="#0A0D12" />
      {/* silhouette derrière la vitre */}
      <ellipse cx="500" cy="220" rx="16" ry="20" fill="#0A0D12" opacity="0.9" />
      <path d="M470 350 C 470 270 485 245 500 245 C 515 245 530 270 530 350 Z" fill="#0A0D12" opacity="0.9" />
      <rect y="350" width="800" height="250" fill="#262B33" />
      <path d="M140 400 L660 400 L760 600 L40 600 Z" fill="#2BB3B1" opacity="0.65" />
      {/* petite voiture rouge */}
      <g transform="translate(150 300)">
        <path d="M10 70 C 10 40 30 30 60 26 C 80 0 150 0 170 26 C 200 30 220 42 220 70 L220 84 L10 84 Z" fill="#9E1F2C" />
        <path d="M70 28 C 86 8 144 8 160 28 Z" fill="#6E8A9A" opacity="0.7" />
        <line x1="115" y1="10" x2="115" y2="28" stroke="#9E1F2C" strokeWidth="4" />
        <circle cx="55" cy="84" r="18" fill="#111" />
        <circle cx="180" cy="84" r="18" fill="#111" />
        <rect x="206" y="52" width="12" height="8" fill="#F2C98A" />
      </g>
      <rect width="800" height="600" fill="url(#flash)" />
      <rect width="800" height="600" filter="url(#grain)" />
      <text x="770" y="570" textAnchor="end" fontFamily="'Courier New', monospace" fontSize="30" fontWeight="bold" fill="#F28C28" opacity="0.9">
        21.06.2016 23:47
      </text>
    </svg>
  );
}
