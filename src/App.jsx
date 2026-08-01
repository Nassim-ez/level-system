import { useEffect, useRef, useState } from 'react'
import { useGame } from './context/GameContext.jsx'
import { CLASSES, CLASS_UNLOCK_LEVEL } from './data/classes.js'
import { TITLES } from './data/titles.js'
import Onboarding from './pages/Onboarding.jsx'
import Status from './pages/Status.jsx'
import Quests from './pages/Quests.jsx'
import Charakter from './pages/Charakter.jsx'
import Rang from './pages/Rang.jsx'
import Dungeon from './pages/Dungeon.jsx'
import Log from './pages/Log.jsx'

const iconProps = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

const HouseIcon = () => (
  <svg {...iconProps}>
    <path d="M3 11 12 3l9 8" />
    <path d="M5 10v10h14V10" />
    <path d="M10 20v-6h4v6" />
  </svg>
)

const SwordsIcon = () => (
  <svg {...iconProps}>
    <path d="M4 4l11 11" />
    <path d="M4 4h4M4 4v4" />
    <path d="M20 4 9 15" />
    <path d="M20 4h-4M20 4v4" />
    <path d="M7 17l-3 3M17 17l3 3" />
  </svg>
)

const PersonIcon = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c1.5-4 5-5.5 8-5.5s6.5 1.5 8 5.5" />
  </svg>
)

const TriangleIcon = () => (
  <svg {...iconProps}>
    <path d="M12 4 21 20H3z" />
  </svg>
)

const PortalIcon = () => (
  <svg {...iconProps}>
    <path d="M5 21V10a7 7 0 0 1 14 0v11" />
    <path d="M3 21h18" />
    <path d="M10 21v-9a2 2 0 0 1 4 0v9" />
  </svg>
)

const ListIcon = () => (
  <svg {...iconProps}>
    <path d="M9 6h11M9 12h11M9 18h11" />
    <path d="M4 6h.01M4 12h.01M4 18h.01" />
  </svg>
)

const TABS = [
  { id: 'status', label: 'STATUS', icon: HouseIcon, page: Status },
  { id: 'quests', label: 'QUESTS', icon: SwordsIcon, page: Quests },
  { id: 'char', label: 'CHAR', icon: PersonIcon, page: Charakter },
  { id: 'rang', label: 'RANG', icon: TriangleIcon, page: Rang },
  { id: 'dungeon', label: 'DUNGEON', icon: PortalIcon, page: Dungeon },
  { id: 'log', label: 'LOG', icon: ListIcon, page: Log },
]

function SystemPopup({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: 'rgba(2,4,9,.7)', backdropFilter: 'blur(3px)' }}
    >
      <div
        className="w-full max-w-[340px] rounded-[18px] border p-5 text-center"
        style={{
          background: 'var(--panel)',
          borderColor: 'var(--glow)',
          boxShadow: '0 0 40px rgba(63,182,255,.35)',
        }}
      >
        <p
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '10px',
            letterSpacing: '3px',
            color: 'var(--glow)',
          }}
        >
          ◆ SYSTEM
        </p>
        <p
          className="mt-3"
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '20px',
            color: 'var(--xp)',
            textShadow: '0 0 14px rgba(143,224,255,.9)',
          }}
        >
          {title}
        </p>
        {children}
        <button
          type="button"
          onClick={onClose}
          className="mt-4 bg-transparent px-5 py-2"
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '11px',
            letterSpacing: '2px',
            color: 'var(--glow)',
            border: '1px solid var(--glow)',
            borderRadius: '10px',
          }}
        >
          OK
        </button>
      </div>
    </div>
  )
}

function snapshot(state) {
  return {
    onboarded: state.onboarded,
    level: state.level,
    rank: state.rank,
    unlockedTitles: state.unlockedTitles,
  }
}

function PopupManager() {
  const { state, dispatch } = useGame()
  const [queue, setQueue] = useState([])
  const prev = useRef(snapshot(state))

  useEffect(() => {
    const p = prev.current
    prev.current = snapshot(state)
    // Onboarding-Sprünge (Level/Rang aus der Einstufung) nicht feiern
    if (p.onboarded !== state.onboarded) return
    const add = []
    for (let level = p.level + 1; level <= state.level; level++) {
      add.push({ type: 'level', level })
    }
    if (state.rank !== p.rank) {
      add.push({ type: 'rank', rank: state.rank })
    }
    for (const id of state.unlockedTitles) {
      if (!p.unlockedTitles.includes(id)) {
        add.push({
          type: 'titel',
          name: TITLES[id].name,
          beschreibung: TITLES[id].beschreibung,
        })
      }
    }
    // Beim Rangaufstieg gewechselte Übungsstufen in einem Popup sammeln
    if (state.stufenWechsel?.length) {
      add.push({ type: 'stufen', liste: state.stufenWechsel })
    }
    if (add.length > 0) setQueue((q) => [...q, ...add])
  }, [state])

  const current = queue[0]
  if (!current) return null
  const close = () => {
    if (current.type === 'stufen') dispatch({ type: 'CLEAR_STUFENWECHSEL' })
    setQueue((q) => q.slice(1))
  }

  if (current.type === 'stufen') {
    const mehrere = current.liste.length > 1
    return (
      <SystemPopup
        title={mehrere ? 'NEUE ÜBUNGSSTUFEN' : 'NEUE ÜBUNGSSTUFE'}
        onClose={close}
      >
        <div className="mt-3 flex flex-col gap-2">
          {current.liste.map((w) => (
            <div
              key={w.questId}
              className="border px-3 py-2 text-left"
              style={{ borderColor: 'var(--line)', borderRadius: 10 }}
            >
              <p
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: 9,
                  letterSpacing: '1px',
                  color: 'var(--dim)',
                }}
              >
                {w.uebungName.toUpperCase()}
              </p>
              <p className="mt-1" style={{ fontSize: '12.5px', color: 'var(--dim)' }}>
                {w.alt}
              </p>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--xp)' }}>
                ↳ {w.neu}
              </p>
              {w.tipp && (
                <p className="mt-0.5" style={{ fontSize: '11.5px', color: 'var(--dim)', lineHeight: 1.45 }}>
                  {w.tipp}
                </p>
              )}
            </div>
          ))}
        </div>
        <p className="mt-3" style={{ fontSize: '12px', color: 'var(--warn)', lineHeight: 1.5 }}>
          Die schwereren Stufen erlauben weniger Wiederholungen – deine
          Tagesziele wurden entsprechend zurückgesetzt.
        </p>
      </SystemPopup>
    )
  }

  if (current.type === 'level') {
    return (
      <SystemPopup title="LEVEL UP!" onClose={close}>
        <p className="mt-2 text-[15px]">
          Level{' '}
          <span
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--xp)',
            }}
          >
            {current.level}
          </span>{' '}
          · +3 Punkte
        </p>
      </SystemPopup>
    )
  }
  if (current.type === 'rank') {
    return (
      <SystemPopup title="RANG-AUFSTIEG!" onClose={close}>
        <p className="mt-2 text-[15px]">
          Du bist jetzt Rang{' '}
          <span
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: '20px',
              fontWeight: 700,
              color: 'var(--glow)',
              textShadow: '0 0 10px rgba(63,182,255,.9)',
            }}
          >
            {current.rank}
          </span>
        </p>
        <p className="mt-1" style={{ fontSize: '12px', color: 'var(--dim)' }}>
          Eine Belohnung wurde deinem Inventar hinzugefügt.
        </p>
      </SystemPopup>
    )
  }
  return (
    <SystemPopup title="NEUER TITEL!" onClose={close}>
      <p className="mt-2 text-[15px] font-bold">„{current.name}“</p>
      <p className="mt-1" style={{ fontSize: '12px', color: 'var(--dim)' }}>
        {current.beschreibung} · Im Status antippbar wechseln.
      </p>
    </SystemPopup>
  )
}

function ClassChoicePopup() {
  const { state, dispatch } = useGame()
  const [hidden, setHidden] = useState(false)

  if (hidden || state.klasse || state.level < CLASS_UNLOCK_LEVEL) return null
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto px-6 py-8"
      style={{ background: 'rgba(2,4,9,.85)', backdropFilter: 'blur(4px)' }}
    >
      <div className="mx-auto w-full max-w-[360px]">
        <p
          className="text-center"
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '10px',
            letterSpacing: '3px',
            color: 'var(--glow)',
          }}
        >
          ◆ SYSTEM
        </p>
        <p
          className="mt-2 text-center"
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '20px',
            color: 'var(--xp)',
            textShadow: '0 0 14px rgba(143,224,255,.9)',
          }}
        >
          KLASSENWAHL
        </p>
        <p className="mt-1 text-center text-[14px]">Wähle deinen Pfad</p>
        <p
          className="mt-1 text-center"
          style={{ fontSize: '12px', color: 'var(--danger)' }}
        >
          Die Wahl ist endgültig und kann nicht geändert werden.
        </p>
        <div className="mt-5 flex flex-col gap-3">
          {Object.values(CLASSES).map((klasse) => (
            <div
              key={klasse.id}
              className="flex items-center justify-between gap-3 rounded-[14px] border p-4"
              style={{
                background: 'var(--panel)',
                borderColor: 'var(--line)',
                boxShadow: '0 0 14px rgba(63,182,255,.12)',
              }}
            >
              <div>
                <p
                  style={{
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: '14px',
                    letterSpacing: '1px',
                  }}
                >
                  {klasse.name}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--dim)' }}>
                  {klasse.beschreibung}
                </p>
              </div>
              <button
                type="button"
                onClick={() => dispatch({ type: 'CHOOSE_CLASS', id: klasse.id })}
                className="shrink-0 bg-transparent px-3 py-1.5"
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: '10px',
                  letterSpacing: '2px',
                  color: 'var(--glow)',
                  border: '1px solid var(--glow)',
                  borderRadius: '8px',
                }}
              >
                WÄHLEN
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setHidden(true)}
          className="mx-auto mt-4 block bg-transparent px-4 py-2"
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '10px',
            letterSpacing: '2px',
            color: 'var(--dim)',
            border: 'none',
          }}
        >
          SPÄTER ENTSCHEIDEN
        </button>
      </div>
    </div>
  )
}

function App() {
  const { state } = useGame()
  const [active, setActive] = useState('status')
  const ActivePage = TABS.find((t) => t.id === active).page

  useEffect(() => {
    if (!state.onboarded) setActive('status')
  }, [state.onboarded])

  if (!state.onboarded) return <Onboarding />

  return (
    <>
      <PopupManager />
      <ClassChoicePopup />
      <main className="px-4 pb-24 pt-6">
        <ActivePage />
      </main>

      <nav
        className="fixed bottom-0 left-1/2 flex w-full max-w-[430px] -translate-x-1/2 justify-around border-t px-1 py-2 backdrop-blur"
        style={{
          background: 'rgba(8,13,24,.95)',
          borderColor: 'var(--line)',
        }}
      >
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = tab.id === active
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className="flex flex-1 flex-col items-center gap-1 bg-transparent px-1 py-1"
              style={{
                color: isActive ? 'var(--glow)' : 'var(--dim)',
                textShadow: isActive ? '0 0 8px rgba(63,182,255,.8)' : 'none',
              }}
            >
              <Icon />
              <span
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: '9px',
                  letterSpacing: '0.5px',
                }}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </nav>
    </>
  )
}

export default App
