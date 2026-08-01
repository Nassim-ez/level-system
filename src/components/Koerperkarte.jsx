import { MUSKEL_NAMEN } from '../data/uebungen.js'

// ---------------------------------------------------------------------------
// Körperkarte: Silhouette von vorne und hinten, beanspruchte Muskeln farbig.
// Die Formen sind bewusst grob – sie sollen zeigen, wo gearbeitet wird,
// keine anatomische Zeichnung ersetzen.
// ---------------------------------------------------------------------------

const PRIMAER = 'var(--glow)'
const SEKUNDAER = 'rgba(63,182,255,.32)'
const RUHIG = 'rgba(63,182,255,.07)'
const UMRISS = 'rgba(63,182,255,.45)'

// Muskelflächen je Ansicht. Was in einer Ansicht nicht sichtbar ist,
// fehlt dort schlicht.
const REGIONEN = {
  vorne: {
    nacken: <path d="M43 27 h14 l-2 5 h-10 z" />,
    schulter: (
      <>
        <ellipse cx="30" cy="38" rx="7" ry="6" />
        <ellipse cx="70" cy="38" rx="7" ry="6" />
      </>
    ),
    brust: (
      <>
        <path d="M38 36 q8 -2 11 2 v9 q-7 3 -11 -1 z" />
        <path d="M62 36 q-8 -2 -11 2 v9 q7 3 11 -1 z" />
      </>
    ),
    bizeps: (
      <>
        <ellipse cx="26" cy="52" rx="4.5" ry="9" />
        <ellipse cx="74" cy="52" rx="4.5" ry="9" />
      </>
    ),
    unterarm: (
      <>
        <ellipse cx="22" cy="70" rx="4" ry="9" />
        <ellipse cx="78" cy="70" rx="4" ry="9" />
      </>
    ),
    bauch: <path d="M43 49 h14 v27 q-7 3 -14 0 z" />,
    seite: (
      <>
        <path d="M37 50 q4 0 5 3 v20 q-4 -1 -6 -5 z" />
        <path d="M63 50 q-4 0 -5 3 v20 q4 -1 6 -5 z" />
      </>
    ),
    huefte: (
      <>
        <path d="M40 78 q5 2 5 8 l-4 6 q-4 -6 -4 -12 z" />
        <path d="M60 78 q-5 2 -5 8 l4 6 q4 -6 4 -12 z" />
      </>
    ),
    oberschenkel: (
      <>
        <ellipse cx="42" cy="112" rx="7" ry="19" />
        <ellipse cx="58" cy="112" rx="7" ry="19" />
      </>
    ),
    wade: (
      <>
        <ellipse cx="42" cy="155" rx="5" ry="13" />
        <ellipse cx="58" cy="155" rx="5" ry="13" />
      </>
    ),
  },
  hinten: {
    nacken: <path d="M42 26 h16 q-2 8 -8 8 q-6 0 -8 -8 z" />,
    schulter: (
      <>
        <ellipse cx="30" cy="38" rx="7" ry="6" />
        <ellipse cx="70" cy="38" rx="7" ry="6" />
      </>
    ),
    ruecken: <path d="M37 36 q13 -3 26 0 l-3 30 q-10 3 -20 0 z" />,
    trizeps: (
      <>
        <ellipse cx="26" cy="52" rx="4.5" ry="9" />
        <ellipse cx="74" cy="52" rx="4.5" ry="9" />
      </>
    ),
    unterarm: (
      <>
        <ellipse cx="22" cy="70" rx="4" ry="9" />
        <ellipse cx="78" cy="70" rx="4" ry="9" />
      </>
    ),
    unterruecken: <path d="M41 67 h18 l-2 12 q-7 2 -14 0 z" />,
    gesaess: (
      <>
        <path d="M40 81 q5 -2 9 1 v10 q-7 3 -10 -3 z" />
        <path d="M60 81 q-5 -2 -9 1 v10 q7 3 10 -3 z" />
      </>
    ),
    beinbeuger: (
      <>
        <ellipse cx="42" cy="114" rx="7" ry="19" />
        <ellipse cx="58" cy="114" rx="7" ry="19" />
      </>
    ),
    wade: (
      <>
        <ellipse cx="42" cy="155" rx="5.5" ry="14" />
        <ellipse cx="58" cy="155" rx="5.5" ry="14" />
      </>
    ),
  },
}

// Umriss der Figur, für beide Ansichten gleich
function Silhouette() {
  return (
    <g fill="none" stroke={UMRISS} strokeWidth="1.1" strokeLinejoin="round">
      <circle cx="50" cy="16" r="9" />
      <path d="M45 25 h10" />
      <path d="M50 26 q-13 1 -20 9 l-9 40 h6 l7 -26 -2 27 q9 4 18 4 t18 -4 l-2 -27 7 26 h6 l-9 -40 q-7 -8 -20 -9 z" />
      <path d="M35 79 q15 5 30 0 l-4 30 -3 62 h-9 l-2 -50 -2 50 h-9 l-3 -62 z" />
      <path d="M36 172 h11 M53 172 h11" />
    </g>
  )
}

function Ansicht({ titel, seite, primaer, sekundaer }) {
  const regionen = REGIONEN[seite]
  return (
    <div className="min-w-0 flex-1 text-center">
      <svg viewBox="0 0 100 185" className="w-full" style={{ maxHeight: 230 }}>
        {/* Erst die ruhigen Flächen, dann die beanspruchten darüber */}
        {Object.entries(regionen).map(([muskel, form]) => {
          const aktiv = primaer.includes(muskel)
          const neben = !aktiv && sekundaer.includes(muskel)
          return (
            <g
              key={muskel}
              fill={aktiv ? PRIMAER : neben ? SEKUNDAER : RUHIG}
              style={
                aktiv
                  ? { filter: 'drop-shadow(0 0 4px rgba(63,182,255,.65))' }
                  : undefined
              }
            >
              {form}
            </g>
          )
        })}
        <Silhouette />
      </svg>
      <p
        style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: 8,
          letterSpacing: '2px',
          color: 'var(--dim)',
        }}
      >
        {titel}
      </p>
    </div>
  )
}

function Legende({ primaer, sekundaer }) {
  const eintraege = [
    ...primaer.map((m) => ({ m, aktiv: true })),
    ...sekundaer.filter((m) => !primaer.includes(m)).map((m) => ({ m, aktiv: false })),
  ]
  return (
    <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1">
      {eintraege.map(({ m, aktiv }) => (
        <span
          key={m}
          className="flex min-w-0 items-center gap-1.5"
          style={{ fontSize: '11px', color: aktiv ? 'var(--xp)' : 'var(--dim)' }}
        >
          <i
            className="shrink-0"
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: aktiv ? PRIMAER : SEKUNDAER,
            }}
          />
          {MUSKEL_NAMEN[m] ?? m}
        </span>
      ))}
    </div>
  )
}

function Koerperkarte({ primaer = [], sekundaer = [] }) {
  return (
    <div>
      <div className="flex items-start justify-center gap-2">
        <Ansicht titel="VORNE" seite="vorne" primaer={primaer} sekundaer={sekundaer} />
        <Ansicht titel="HINTEN" seite="hinten" primaer={primaer} sekundaer={sekundaer} />
      </div>
      <Legende primaer={primaer} sekundaer={sekundaer} />
      <p
        className="mt-2 text-center"
        style={{ fontSize: '10.5px', color: 'var(--dim)' }}
      >
        Kräftig eingefärbt: Hauptarbeit · gedämpft: unterstützend
      </p>
    </div>
  )
}

export default Koerperkarte
