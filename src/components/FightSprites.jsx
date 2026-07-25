// Hologramm-Figuren für den Dungeon-Kampf, im Stil der Charakter-Silhouette.
// Jede Figur füllt ihre Box und nutzt CSS-Klassen aus index.css für Animationen.

const grad = (id, farbe) => (
  <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stopColor={farbe} stopOpacity="0.55" />
    <stop offset="1" stopColor={farbe} stopOpacity="0.08" />
  </linearGradient>
)

function Player() {
  return (
    <svg viewBox="0 0 100 140" className="h-full w-full">
      <defs>{grad('pGrad', '#3fb6ff')}</defs>
      <g fill="url(#pGrad)" stroke="rgba(63,182,255,.75)" strokeWidth="1.2">
        <ellipse cx="50" cy="20" rx="11" ry="13" />
        <path
          d="M50 33 C42 35 34 38 31 44 C28 50 27 60 26 70 L27 84 C27 89 31 91 34 89 L36 82
             C37 70 38 58 40 50 C43 56 44 66 44 74 C44 82 42 90 41 98
             C40 108 41 118 42 128 L43 134 L57 134 L58 128
             C59 118 60 108 59 98 C58 90 56 82 56 74 C56 66 57 56 60 50
             C62 58 63 70 64 82 L66 89 C69 91 73 89 73 84 L74 70
             C73 60 72 50 69 44 C66 38 58 35 50 33 Z"
        />
      </g>
      <g fill="none" stroke="rgba(63,182,255,.4)" strokeWidth="1">
        <path d="M42 44 Q50 48 58 44" />
        <path d="M50 52 L50 74" />
      </g>
    </svg>
  )
}

function Kobold() {
  return (
    <svg viewBox="0 0 100 140" className="h-full w-full">
      <defs>{grad('kGrad', '#8fe0ff')}</defs>
      <g fill="url(#kGrad)" stroke="rgba(143,224,255,.75)" strokeWidth="1.2">
        {/* gedrungener Steinkobold */}
        <path d="M34 44 L30 30 L40 36 L50 30 L60 36 L70 30 L66 44 Z" />
        <ellipse cx="50" cy="58" rx="22" ry="20" />
        <path d="M32 74 L28 106 L38 106 L40 82 Z" />
        <path d="M68 74 L72 106 L62 106 L60 82 Z" />
        <path d="M30 62 L16 74 L22 80 L34 70 Z" />
        <path d="M70 62 L84 74 L78 80 L66 70 Z" />
      </g>
      <g fill="var(--danger)">
        <circle cx="43" cy="54" r="3" />
        <circle cx="57" cy="54" r="3" />
      </g>
    </svg>
  )
}

function Skelett() {
  return (
    <svg viewBox="0 0 100 140" className="h-full w-full">
      <defs>{grad('sGrad', '#d7ecff')}</defs>
      <g fill="url(#sGrad)" stroke="rgba(215,236,255,.75)" strokeWidth="1.2">
        <path d="M38 26 Q38 12 50 12 Q62 12 62 26 L60 38 L40 38 Z" />
        <rect x="44" y="38" width="12" height="6" />
        <path d="M34 46 L66 46 L62 78 L38 78 Z" />
        <path d="M34 48 L20 66 L26 70 L38 56 Z" />
        <path d="M66 48 L80 66 L74 70 L62 56 Z" />
        <path d="M40 78 L36 112 L44 112 L46 84 Z" />
        <path d="M60 78 L64 112 L56 112 L54 84 Z" />
      </g>
      <g stroke="rgba(11,17,32,.9)" strokeWidth="2">
        <line x1="38" y1="54" x2="62" y2="54" />
        <line x1="38" y1="62" x2="62" y2="62" />
        <line x1="38" y1="70" x2="62" y2="70" />
      </g>
      <g fill="var(--danger)">
        <circle cx="44" cy="26" r="3.5" />
        <circle cx="56" cy="26" r="3.5" />
      </g>
    </svg>
  )
}

function Wolf() {
  return (
    <svg viewBox="0 0 100 140" className="h-full w-full">
      <defs>{grad('wGrad', '#6f8db0')}</defs>
      <g fill="url(#wGrad)" stroke="rgba(143,224,255,.7)" strokeWidth="1.2">
        {/* Kopf mit Ohren */}
        <path d="M28 44 L24 26 L38 34 L50 30 L62 34 L76 26 L72 44 Z" />
        <path d="M28 44 Q50 34 72 44 L76 62 Q50 72 24 62 Z" />
        {/* Schnauze */}
        <path d="M42 62 L36 76 L50 80 L64 76 L58 62 Z" />
        {/* Körper */}
        <path d="M26 66 L18 100 L30 104 L38 78 Z" />
        <path d="M74 66 L82 100 L70 104 L62 78 Z" />
        <path d="M36 78 L34 118 L44 118 L46 88 Z" />
        <path d="M64 78 L66 118 L56 118 L54 88 Z" />
      </g>
      <g fill="var(--danger)">
        <path d="M40 48 L48 51 L40 54 Z" />
        <path d="M60 48 L52 51 L60 54 Z" />
      </g>
      <g stroke="rgba(215,236,255,.9)" strokeWidth="1.5">
        <path d="M44 76 L46 82 M50 78 L50 84 M56 76 L54 82" />
      </g>
    </svg>
  )
}

function Schatten() {
  return (
    <svg viewBox="0 0 100 140" className="h-full w-full">
      <defs>
        {grad('scGrad', '#6f8db0')}
        <filter id="scBlur">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
      </defs>
      <g filter="url(#scBlur)" opacity="0.85">
        <path
          d="M50 16 C34 20 26 36 28 54 C29 68 24 80 26 96 C28 110 36 118 50 120
             C64 118 72 110 74 96 C76 80 71 68 72 54 C74 36 66 20 50 16 Z"
          fill="url(#scGrad)"
          stroke="rgba(143,224,255,.6)"
          strokeWidth="1.2"
        />
      </g>
      <g fill="var(--xp)">
        <ellipse cx="42" cy="46" rx="4" ry="6" />
        <ellipse cx="58" cy="46" rx="4" ry="6" />
      </g>
      {/* wabernde Schleier */}
      <g fill="none" stroke="rgba(143,224,255,.35)" strokeWidth="1">
        <path d="M30 88 Q50 100 70 88">
          <animate
            attributeName="d"
            values="M30 88 Q50 100 70 88;M30 92 Q50 84 70 92;M30 88 Q50 100 70 88"
            dur="3s"
            repeatCount="indefinite"
          />
        </path>
      </g>
    </svg>
  )
}

function Vogt() {
  return (
    <svg viewBox="0 0 100 140" className="h-full w-full">
      <defs>{grad('vGrad', '#d7ecff')}</defs>
      {/* Krone */}
      <path
        d="M36 20 L36 10 L42 16 L50 6 L58 16 L64 10 L64 20 Z"
        fill="var(--xp)"
        opacity="0.8"
      />
      <g fill="url(#vGrad)" stroke="rgba(215,236,255,.8)" strokeWidth="1.3">
        <path d="M38 34 Q38 20 50 20 Q62 20 62 34 L60 46 L40 46 Z" />
        {/* Umhang */}
        <path d="M30 50 L70 50 L78 106 L22 106 Z" />
        <path d="M28 52 L14 74 L22 80 L34 62 Z" />
        <path d="M72 52 L86 74 L78 80 L66 62 Z" />
      </g>
      {/* Stab */}
      <g stroke="var(--xp)" strokeWidth="2.5" fill="none">
        <line x1="84" y1="40" x2="84" y2="110" />
        <circle cx="84" cy="34" r="6" fill="rgba(143,224,255,.4)" />
      </g>
      <g fill="var(--danger)">
        <circle cx="44" cy="34" r="3.5" />
        <circle cx="56" cy="34" r="3.5" />
      </g>
    </svg>
  )
}

function Koloss() {
  return (
    <svg viewBox="0 0 100 140" className="h-full w-full">
      <defs>{grad('coGrad', '#3fb6ff')}</defs>
      <g fill="url(#coGrad)" stroke="rgba(63,182,255,.8)" strokeWidth="1.4">
        {/* massiger Basaltkörper */}
        <path d="M36 30 L64 30 L68 46 L32 46 Z" />
        <path d="M24 48 L76 48 L82 92 L18 92 Z" />
        {/* Arme */}
        <path d="M22 50 L6 78 L18 88 L30 62 Z" />
        <path d="M78 50 L94 78 L82 88 L70 62 Z" />
        {/* Beine */}
        <path d="M30 92 L26 126 L42 126 L44 96 Z" />
        <path d="M70 92 L74 126 L58 126 L56 96 Z" />
      </g>
      {/* Risse */}
      <g stroke="var(--danger)" strokeWidth="1.5" fill="none" opacity="0.8">
        <path d="M40 54 L46 66 L38 74" />
        <path d="M62 56 L56 68 L64 80" />
      </g>
      <g fill="var(--danger)">
        <rect x="38" y="34" width="8" height="5" />
        <rect x="54" y="34" width="8" height="5" />
      </g>
    </svg>
  )
}

const SPRITE_MAP = {
  player: Player,
  kobold: Kobold,
  skelett: Skelett,
  wolf: Wolf,
  schatten: Schatten,
  vogt: Vogt,
  koloss: Koloss,
}

export default function FightSprite({ name, className = '' }) {
  const Comp = SPRITE_MAP[name] ?? Kobold
  return (
    <div className={className}>
      <Comp />
    </div>
  )
}
