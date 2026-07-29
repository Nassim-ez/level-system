// Linien-Symbole der acht Ausrüstungsslots.
// Einheitlich viewBox 0 0 24 24, stroke currentColor, Strichstärke 1.6.

const P = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

const PFADE = {
  // Helm mit Visierschlitz
  helm: (
    <g {...P}>
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <path d="M4 14h16l-1.5 5h-13z" />
      <path d="M9 14v5M15 14v5" />
      <path d="M8 10h8" />
    </g>
  ),
  // Kette mit Anhänger
  kette: (
    <g {...P}>
      <path d="M6 4c0 5 2.5 8 6 8s6-3 6-8" />
      <path d="M12 12v3" />
      <path d="M12 15l2.5 2.5L12 20l-2.5-2.5z" />
    </g>
  ),
  // Umhang mit Schulterspange
  umhang: (
    <g {...P}>
      <path d="M9 4l3 2 3-2" />
      <path d="M9 4C6 5.5 5 9 5 13l-1 7h6l1-9" />
      <path d="M15 4c3 1.5 4 5 4 9l1 7h-6l-1-9" />
    </g>
  ),
  // Brustpanzer
  brust: (
    <g {...P}>
      <path d="M5 5l7-2 7 2" />
      <path d="M5 5c0 7 1.5 12 7 15 5.5-3 7-8 7-15" />
      <path d="M12 3v17" />
      <path d="M7 10h10M7.5 14h9" />
    </g>
  ),
  // Schwert
  waffe: (
    <g {...P}>
      <path d="M14.5 3.5L17 6 8 15v2.5H5.5L4 16l9-9z" />
      <path d="M13 5l6 6" />
      <path d="M15.5 14.5l4 4M17.5 12.5l4 4" />
    </g>
  ),
  // Ring mit Stein
  ring: (
    <g {...P}>
      <circle cx="12" cy="15" r="5.5" />
      <path d="M9.5 6.5h5L12 10z" />
      <path d="M9.5 6.5L12 4l2.5 2.5" />
    </g>
  ),
  // Hose
  hose: (
    <g {...P}>
      <path d="M6.5 3h11l.5 5-1.5 13h-4l-.5-9-.5 9h-4L6 8z" />
      <path d="M6.5 8h11" />
    </g>
  ),
  // Stiefel
  schuhe: (
    <g {...P}>
      <path d="M8 3h4v9l6 3v4a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V3z" />
      <path d="M6 15h6" />
      <path d="M12 12l6 3" />
    </g>
  ),
}

export default function SlotIcon({ slot, size = 24, style }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      style={{ display: 'block', ...style }}
    >
      {PFADE[slot] ?? PFADE.brust}
    </svg>
  )
}
