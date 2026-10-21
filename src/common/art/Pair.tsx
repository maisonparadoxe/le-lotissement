// Béatrice et Alban, vus de loin, sous le dernier lampadaire.
// Les coordonnées sont celles de la scène du viseur (viewBox 1600 × 900) :
// le couple est centré autour de (990, 515).

export const PAIR_CENTER: [number, number] = [990, 515];

export function Pair() {
  return (
    <g>
      {/* Béatrice : manteau bordeaux, cheveux clairs */}
      <path d="M945 600 L950 505 Q965 492 980 505 L985 600 Z" fill="#3a1820" />
      <circle cx="965" cy="482" r="14" fill="#c9a98a" />
      <path d="M951 482 Q951 462 966 462 Q980 462 980 482 Q972 472 951 482 Z" fill="#c4a468" />
      {/* Alban : veste brun rouille, cheveux gris */}
      <path d="M995 600 L998 505 Q1013 493 1028 505 L1031 600 Z" fill="#6b3a22" />
      <circle cx="1013" cy="483" r="15" fill="#a67c5e" />
      <path d="M998 482 Q998 464 1013 464 Q1028 464 1028 482 Q1018 473 998 482 Z" fill="#b9b9b4" />
      {/* sa main sur lui, l'enveloppe entre eux */}
      <path d="M978 515 L997 521" stroke="#3a1820" strokeWidth="6" strokeLinecap="round" />
      <rect x="988" y="517" width="14" height="9" fill="#f3ede2" transform="rotate(-8 995 521)" />
    </g>
  );
}
