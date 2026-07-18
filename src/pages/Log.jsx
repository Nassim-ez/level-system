import Panel from '../components/Panel.jsx'
import { useGame } from '../context/GameContext.jsx'
import { todayKey } from '../data/quests.js'

const orbitron = { fontFamily: "'Orbitron', sans-serif" }

function formatDatum(datum) {
  const today = todayKey()
  const gestern = new Date()
  gestern.setDate(gestern.getDate() - 1)
  if (datum === today) return 'HEUTE'
  if (datum === todayKey(gestern)) return 'GESTERN'
  const [, m, d] = datum.split('-')
  return `${d}.${m}.`
}

function Log() {
  const { state } = useGame()

  return (
    <Panel title="LOG">
      {state.log.length === 0 ? (
        <p style={{ fontSize: '13px', color: 'var(--dim)' }}>
          Noch keine Einträge. Schließe Quests ab, um dein Abenteuer zu
          dokumentieren.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {state.log.map((entry, index) => (
            <div key={index} className="flex items-start gap-3">
              <span
                className="w-[64px] shrink-0 pt-[2px]"
                style={{
                  ...orbitron,
                  fontSize: '10px',
                  letterSpacing: '1px',
                  color: 'var(--glow)',
                }}
              >
                {formatDatum(entry.datum)}
              </span>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold">
                  {entry.text}
                  {entry.xp != null && (
                    <span
                      className="ml-2"
                      style={{ ...orbitron, fontSize: '10px', color: 'var(--xp)' }}
                    >
                      +{entry.xp} XP
                    </span>
                  )}
                </p>
                {entry.detail && (
                  <p style={{ fontSize: '11px', color: 'var(--dim)' }}>
                    {entry.detail}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  )
}

export default Log
