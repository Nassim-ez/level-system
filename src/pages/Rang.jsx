import Panel from '../components/Panel.jsx'
import { useGame } from '../context/GameContext.jsx'
import { RANKS, RANK_THRESHOLDS, buildRankTest, nextRank } from '../data/ranks.js'
import { resolveQuest } from '../data/quests.js'

const orbitron = { fontFamily: "'Orbitron', sans-serif" }

function Rang() {
  const { state } = useGame()
  const currentIndex = RANKS.indexOf(state.rank)
  const next = nextRank(state.rank)
  const levelsLeft = next ? RANK_THRESHOLDS[next] - state.level : 0

  // Prüfungsziele: aktiv = eingefroren, sonst Vorschau aus aktuellen Zielen
  const tasks = next
    ? (state.rankTestActive && state.rankTestTasks) ||
      buildRankTest(state.rank, state.baseTargets)
    : null
  const zielText = tasks
    ?.map((t) => `${t.ziel} ${resolveQuest(t.quest, state).name}`)
    .join(' + ')

  return (
    <Panel title="RANG">
      <div className="flex flex-col gap-2">
        {[...RANKS].reverse().map((rank) => {
          const index = RANKS.indexOf(rank)
          const isCurrent = index === currentIndex
          const isDone = index < currentIndex
          const isLocked = index > currentIndex

          return (
            <div
              key={rank}
              className="flex items-center gap-4 border p-3"
              style={{
                borderColor: isCurrent ? 'var(--glow)' : 'var(--line)',
                borderRadius: '12px',
                boxShadow: isCurrent ? '0 0 14px rgba(63,182,255,.35)' : 'none',
              }}
            >
              <span
                className="w-[36px] shrink-0 text-center"
                style={{
                  ...orbitron,
                  fontSize: '24px',
                  color: isCurrent
                    ? 'var(--glow)'
                    : isDone
                      ? 'var(--dim)'
                      : '#31465f',
                  textShadow: isCurrent ? '0 0 12px rgba(63,182,255,.9)' : 'none',
                }}
              >
                {isLocked ? '?' : rank}
              </span>
              <div className="min-w-0">
                <p
                  style={{
                    ...orbitron,
                    fontSize: '12px',
                    letterSpacing: '2px',
                    color: isLocked ? '#31465f' : 'var(--text)',
                  }}
                >
                  {isLocked ? '???' : `RANG ${rank}`}
                </p>
                {isCurrent && (
                  <p
                    style={{
                      ...orbitron,
                      fontSize: '9px',
                      letterSpacing: '2px',
                      color: 'var(--glow)',
                    }}
                  >
                    DU BIST HIER
                  </p>
                )}
                {isDone && (
                  <p
                    style={{
                      ...orbitron,
                      fontSize: '9px',
                      letterSpacing: '2px',
                      color: 'var(--dim)',
                    }}
                  >
                    ABGESCHLOSSEN
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {next && (
        <p
          className="mt-4"
          style={{
            fontSize: '13px',
            color: state.rankTestActive ? 'var(--xp)' : 'var(--text)',
          }}
        >
          {state.rankTestActive
            ? 'Aufstiegsprüfung verfügbar – siehe Quests!'
            : `Noch ${levelsLeft} Level bis zur Aufstiegsprüfung`}
        </p>
      )}
      {next && zielText && (
        <p className="mt-1" style={{ fontSize: '12px', color: 'var(--dim)' }}>
          {state.rankTestActive ? 'Dein Prüfungsziel' : 'Voraussichtlich'}:{' '}
          <span style={{ color: 'var(--xp)' }}>{zielText}</span> an einem Tag
        </p>
      )}
      <p className="mt-1" style={{ fontSize: '12px', color: 'var(--dim)' }}>
        Höhere Ränge werden erst beim Aufstieg enthüllt.
      </p>
    </Panel>
  )
}

export default Rang
