import { useState } from 'react'
import Panel from '../components/Panel.jsx'
import { useGame } from '../context/GameContext.jsx'
import { CLASSES } from '../data/classes.js'
import { TITLES } from '../data/titles.js'
import { anrede } from '../data/gender.js'

const orbitron = { fontFamily: "'Orbitron', sans-serif" }

function Status() {
  const { state, dispatch } = useGame()
  const { name, level, xp, xpGoal, rank, points, stats, streak, title } = state
  const [titleMenu, setTitleMenu] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <Panel title="STATUS">
        <div className="flex items-center gap-4">
          <div
            className="flex h-[74px] w-[74px] shrink-0 items-center justify-center"
            style={{
              border: '2px solid var(--glow)',
              borderRadius: '16px',
              animation: 'rank-pulse 2.5s ease-in-out infinite',
            }}
          >
            <span
              style={{
                ...orbitron,
                fontSize: '40px',
                color: 'var(--glow)',
                textShadow: '0 0 14px rgba(63,182,255,.9)',
              }}
            >
              {rank}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-[20px] font-bold">{name}</p>
            <p
              className="uppercase"
              style={{ fontSize: '12px', color: 'var(--dim)', letterSpacing: '2px' }}
            >
              {anrede(state.gender)} · Aufsteigend
            </p>
            <p
              onClick={() => setTitleMenu((v) => !v)}
              style={{ fontSize: '11px', color: 'var(--dim)', cursor: 'pointer' }}
            >
              Titel: {title} <span style={{ color: 'var(--glow)' }}>▾</span>
            </p>
            {titleMenu && (
              <div className="mt-1 flex flex-wrap gap-1">
                {state.unlockedTitles.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      dispatch({ type: 'SET_TITLE', id })
                      setTitleMenu(false)
                    }}
                    className="bg-transparent px-2 py-0.5"
                    style={{
                      fontSize: '10px',
                      color:
                        TITLES[id].name === title ? 'var(--xp)' : 'var(--dim)',
                      border: `1px solid ${
                        TITLES[id].name === title ? 'var(--xp)' : 'var(--line)'
                      }`,
                      borderRadius: '6px',
                    }}
                  >
                    {TITLES[id].name}
                  </button>
                ))}
              </div>
            )}
            {state.klasse && (
              <p style={{ fontSize: '11px', color: 'var(--glow)' }}>
                Klasse: {CLASSES[state.klasse]?.name}
              </p>
            )}
            <p style={{ ...orbitron, fontSize: '13px', color: 'var(--xp)' }}>
              LEVEL {level}
            </p>
          </div>
        </div>

        <div
          className="mt-4 h-[8px] w-full overflow-hidden rounded-full border"
          style={{ background: '#0f1a2e', borderColor: 'var(--line)' }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.min(100, (xp / xpGoal) * 100)}%`,
              background: 'linear-gradient(90deg, #2e7fd4, var(--xp))',
              boxShadow: '0 0 10px rgba(143,224,255,.8)',
              transition: 'width .5s',
            }}
          />
        </div>
        <div
          className="mt-1 flex justify-between"
          style={{ ...orbitron, fontSize: '11px', color: 'var(--dim)' }}
        >
          <span>
            {xp} / {xpGoal} XP
          </span>
          <span>NÄCHSTES LEVEL</span>
        </div>

        {points > 0 && (
          <p
            className="mt-4 text-center"
            style={{ ...orbitron, fontSize: '11px' }}
          >
            Verfügbare Punkte:{' '}
            <span
              style={{
                color: 'var(--xp)',
                textShadow: '0 0 8px rgba(143,224,255,.8)',
              }}
            >
              {points}
            </span>
          </p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3">
          {Object.entries(stats).map(([stat, value]) => (
            <div
              key={stat}
              className="flex items-center justify-between border p-3"
              style={{ borderColor: 'var(--line)', borderRadius: '12px' }}
            >
              <div>
                <p style={{ ...orbitron, fontSize: '11px', color: 'var(--dim)' }}>
                  {stat}
                </p>
                <p style={{ ...orbitron, fontSize: '18px', fontWeight: 700 }}>
                  {value}
                </p>
              </div>
              {points > 0 && (
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'SPEND_POINT', stat })}
                  className="flex h-[26px] w-[26px] items-center justify-center bg-transparent leading-none"
                  style={{
                    border: '1px solid var(--xp)',
                    color: 'var(--xp)',
                    borderRadius: '8px',
                  }}
                >
                  +
                </button>
              )}
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="TAGESSERIE">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p
              style={{
                ...orbitron,
                fontSize: '26px',
                color: 'var(--glow)',
                textShadow: '0 0 12px rgba(63,182,255,.8)',
              }}
            >
              {streak} TAGE
            </p>
            <p
              className="uppercase"
              style={{ fontSize: '12px', color: 'var(--dim)' }}
            >
              Aktuelle Serie
            </p>
          </div>
          <p
            className="max-w-[150px] text-right"
            style={{ fontSize: '12px', color: 'var(--danger)' }}
          >
            Quest heute nicht erfüllt:
            <br />
            −50 XP · Serie endet
          </p>
        </div>
      </Panel>
    </div>
  )
}

export default Status
