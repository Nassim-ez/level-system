import { SYSTEM_LISTE } from '../data/trainingssysteme.js'
import { CLASSES } from '../data/classes.js'
import { KATEGORIE_NAMEN } from '../data/uebungen.js'

const orbitron = { fontFamily: "'Orbitron', sans-serif" }

// Karten der fünf Trainingssysteme – im Onboarding und beim Wechsel
function SystemKarten({ aktiv, onWaehlen, knopfText = 'WÄHLEN', gesperrt = false }) {
  return (
    <div className="flex flex-col gap-3">
      {SYSTEM_LISTE.map((system) => {
        const istAktiv = system.id === aktiv
        return (
          <div
            key={system.id}
            className="border p-3"
            style={{
              borderColor: istAktiv ? 'var(--glow)' : 'var(--line)',
              borderRadius: 14,
              background: istAktiv ? 'rgba(63,182,255,.07)' : 'var(--panel)',
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p
                  className="text-[16px] font-semibold"
                  style={{ color: istAktiv ? 'var(--glow)' : 'var(--text)' }}
                >
                  {system.name}
                </p>
                <p style={{ ...orbitron, fontSize: 8, letterSpacing: '1px', color: 'var(--dim)' }}>
                  KLASSE {CLASSES[system.klasse]?.name.toUpperCase() ?? system.klasse}
                </p>
              </div>
              {istAktiv && (
                <span
                  className="shrink-0"
                  style={{ ...orbitron, fontSize: 8, letterSpacing: '1px', color: 'var(--glow)' }}
                >
                  AKTIV
                </span>
              )}
            </div>

            <p className="mt-2" style={{ fontSize: '12.5px', lineHeight: 1.5 }}>
              {system.beschreibung}
            </p>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {system.fokus.map((k) => (
                <span
                  key={k}
                  className="px-1.5 py-0.5"
                  style={{
                    ...orbitron,
                    fontSize: 7,
                    letterSpacing: '1px',
                    color: 'var(--glow)',
                    border: '1px solid rgba(63,182,255,.4)',
                    borderRadius: 6,
                  }}
                >
                  {(KATEGORIE_NAMEN[k] ?? k).toUpperCase()}
                </span>
              ))}
              <span
                className="px-1.5 py-0.5"
                style={{
                  ...orbitron,
                  fontSize: 7,
                  letterSpacing: '1px',
                  color: 'var(--xp)',
                  border: '1px solid rgba(143,224,255,.4)',
                  borderRadius: 6,
                }}
              >
                +{system.bonus.wert}% XP
              </span>
            </div>

            <p className="mt-2" style={{ fontSize: '11px', color: 'var(--dim)' }}>
              Braucht: {system.geraet ?? 'nichts'} · {system.rotation.length} Trainingstage
              im Wechsel
            </p>

            {system.hinweis && (
              <p
                className="mt-2 border px-2 py-1.5"
                style={{
                  fontSize: '11px',
                  lineHeight: 1.45,
                  color: 'var(--warn)',
                  borderColor: 'rgba(255,179,71,.4)',
                  borderRadius: 8,
                }}
              >
                {system.hinweis}
              </p>
            )}

            {!istAktiv && (
              <button
                type="button"
                disabled={gesperrt}
                onClick={() => onWaehlen(system.id)}
                className="mt-3 w-full bg-transparent px-4 py-2 disabled:opacity-40"
                style={{
                  ...orbitron,
                  fontSize: '10px',
                  letterSpacing: '2px',
                  color: 'var(--glow)',
                  border: '1px solid var(--glow)',
                  borderRadius: 10,
                }}
              >
                {knopfText}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default SystemKarten
