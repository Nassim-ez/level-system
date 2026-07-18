import { useState } from 'react'
import Panel from '../components/Panel.jsx'
import { useGame } from '../context/GameContext.jsx'
import {
  QUESTS,
  DAY_PLANS,
  DAY_LABELS,
  TABLETS_XP,
  POOL_XP,
  STEP_XP_PER_1000,
  stepXpMax,
} from '../data/quests.js'
import { RANK_TESTS, nextRank } from '../data/ranks.js'
import { DUNGEONS, DUNGEON_XP, DUNGEON_EXERCISES } from '../data/dungeons.js'
import { ITEMS } from '../data/items.js'

const orbitron = { fontFamily: "'Orbitron', sans-serif" }

function QuestRow({ name, target, stat, xp, done, onComplete }) {
  return (
    <div
      className="flex items-center justify-between gap-3 border p-3"
      style={{
        borderColor: done ? 'rgba(77,255,166,.4)' : 'var(--line)',
        borderRadius: '12px',
      }}
    >
      <div className="min-w-0">
        <p
          className="text-[16px] font-semibold"
          style={done ? { color: 'var(--ok)' } : undefined}
        >
          {name}
          {target && (
            <span style={{ color: done ? 'var(--ok)' : 'var(--xp)' }}>
              {' '}
              · {target}
            </span>
          )}
        </p>
        <p style={{ ...orbitron, fontSize: '10px', color: 'var(--dim)', letterSpacing: '1px' }}>
          {stat} · +{xp} XP
        </p>
      </div>
      {done ? (
        <span
          className="shrink-0"
          style={{
            ...orbitron,
            fontSize: '10px',
            letterSpacing: '2px',
            color: 'var(--ok)',
            textShadow: '0 0 8px rgba(77,255,166,.6)',
          }}
        >
          ✓ ERLEDIGT
        </span>
      ) : (
        <button
          type="button"
          onClick={onComplete}
          className="shrink-0 bg-transparent px-3 py-1.5"
          style={{
            ...orbitron,
            fontSize: '10px',
            letterSpacing: '2px',
            color: 'var(--glow)',
            border: '1px solid var(--glow)',
            borderRadius: '8px',
          }}
        >
          ERLEDIGT
        </button>
      )}
    </div>
  )
}

function Quests() {
  const { state, dispatch } = useGame()
  const { rank, dayType, doneToday, questProgress, drawnTask } = state
  const [stepsInput, setStepsInput] = useState('')
  const [taskInput, setTaskInput] = useState('')

  const plan = DAY_PLANS[dayType] ?? []
  const cap = stepXpMax(dayType)
  const stepsXp = questProgress.stepsXp ?? 0
  const loggedSteps = questProgress.steps ?? 0

  const logSteps = () => {
    const value = parseInt(stepsInput, 10)
    if (!Number.isNaN(value)) {
      dispatch({ type: 'LOG_STEPS', steps: value, cap })
      setStepsInput('')
    }
  }

  const test = state.rankTestActive ? RANK_TESTS[state.rank] : null
  const rankProgress = questProgress.rankTest ?? {}

  return (
    <div className="flex flex-col gap-4">
      {test && (
        <Panel title="AUFSTIEGSPRÜFUNG" accent="var(--xp)">
          <p
            className="mb-1"
            style={{ ...orbitron, fontSize: '11px', letterSpacing: '2px', color: 'var(--xp)' }}
          >
            RANG {state.rank} → {nextRank(state.rank)}
          </p>
          <p className="mb-3" style={{ fontSize: '13px', color: 'var(--dim)' }}>
            {test.beschreibung}
          </p>
          <div className="flex flex-col gap-2">
            {test.tasks.map((task) => {
              const q = QUESTS[task.quest]
              const value = rankProgress[task.quest] ?? 0
              return (
                <div
                  key={task.quest}
                  className="flex items-center justify-between gap-3 border p-3"
                  style={{ borderColor: 'var(--line)', borderRadius: '12px' }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[16px] font-semibold">{q.name}</p>
                    <div
                      className="mt-1 h-[6px] w-full overflow-hidden rounded-full"
                      style={{ background: '#0f1a2e' }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(value / task.ziel) * 100}%`,
                          background: 'linear-gradient(90deg, #2e7fd4, var(--xp))',
                          transition: 'width .3s',
                        }}
                      />
                    </div>
                    <p
                      className="mt-1"
                      style={{ ...orbitron, fontSize: '10px', color: 'var(--xp)' }}
                    >
                      {value} / {task.ziel} {q.unit}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      dispatch({
                        type: 'RANK_TASK_PROGRESS',
                        taskId: task.quest,
                        amount: 5,
                      })
                    }
                    className="shrink-0 bg-transparent px-3 py-1.5"
                    style={{
                      ...orbitron,
                      fontSize: '11px',
                      color: 'var(--xp)',
                      border: '1px solid var(--xp)',
                      borderRadius: '8px',
                    }}
                  >
                    +5
                  </button>
                </div>
              )
            })}
          </div>
        </Panel>
      )}

      {state.dungeonOpen && (
        <Panel
          title={`DUNGEON · RANG ${state.dungeonRank ?? state.rank}`}
          accent="rgba(255,77,94,.5)"
          glow="rgba(255,77,94,.15)"
        >
          {(() => {
            const dungeon = DUNGEONS[state.dungeonRank ?? state.rank]
            if (state.dungeonDone) {
              return (
                <div className="text-center">
                  <p
                    style={{
                      ...orbitron,
                      fontSize: '14px',
                      letterSpacing: '2px',
                      color: 'var(--ok)',
                      textShadow: '0 0 10px rgba(77,255,166,.6)',
                    }}
                  >
                    ABGESCHLOSSEN ✓
                  </p>
                  <p className="mt-1" style={{ fontSize: '13px', color: 'var(--dim)' }}>
                    {dungeon.gegner} besiegt · +{DUNGEON_XP} XP · Drop:{' '}
                    {ITEMS[dungeon.drop]?.name}
                  </p>
                </div>
              )
            }
            return (
              <>
                <p className="text-[16px] font-semibold">{dungeon.name}</p>
                <p
                  style={{
                    ...orbitron,
                    fontSize: '12px',
                    letterSpacing: '2px',
                    color: 'var(--danger)',
                  }}
                >
                  {dungeon.gegner}
                </p>
                <div
                  className="mt-3 h-[10px] w-full overflow-hidden rounded-full border"
                  style={{ background: '#1a0d12', borderColor: 'rgba(255,77,94,.4)' }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(state.dungeonHp / dungeon.hp) * 100}%`,
                      background: 'linear-gradient(90deg, #7a1622, var(--danger))',
                      boxShadow: '0 0 10px rgba(255,77,94,.7)',
                      transition: 'width .4s',
                    }}
                  />
                </div>
                <p
                  className="mt-1"
                  style={{ ...orbitron, fontSize: '11px', color: 'var(--danger)' }}
                >
                  {state.dungeonHp} / {dungeon.hp} HP
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {DUNGEON_EXERCISES.map((ex) => (
                    <button
                      key={ex.quest}
                      type="button"
                      onClick={() =>
                        dispatch({
                          type: 'DUNGEON_DAMAGE',
                          amount: ex.dmg,
                          quest: ex.quest,
                          reps: ex.reps,
                        })
                      }
                      className="bg-transparent px-2 py-2"
                      style={{
                        ...orbitron,
                        fontSize: '9px',
                        letterSpacing: '1px',
                        color: 'var(--text)',
                        border: '1px solid rgba(255,77,94,.4)',
                        borderRadius: '10px',
                      }}
                    >
                      +{ex.reps} {QUESTS[ex.quest].name.toUpperCase()}{' '}
                      <span style={{ color: 'var(--danger)' }}>−{ex.dmg}</span>
                    </button>
                  ))}
                </div>
                <p className="mt-2" style={{ fontSize: '11px', color: 'var(--dim)' }}>
                  Je 100 Schritte = 1 Schaden (über EINTRAGEN unten). Dungeon-Reps
                  zählen zusätzlich zu den Daily Quests.
                </p>
                <p className="mt-1" style={{ fontSize: '11px', color: 'var(--dim)' }}>
                  Schließt Sonntag Mitternacht.
                </p>
              </>
            )
          })()}
        </Panel>
      )}

      <Panel title="TÄGLICHE QUESTS">
        <p
          className="mb-3"
          style={{ ...orbitron, fontSize: '11px', color: 'var(--xp)', letterSpacing: '2px' }}
        >
          {DAY_LABELS[dayType]}
        </p>
        {dayType === 'REST' && (
          <p className="mb-3" style={{ fontSize: '13px', color: 'var(--dim)' }}>
            Heute ist Ruhetag – nur Tabletten und Schritte zählen (halbes
            Schritte-Maximum).
          </p>
        )}
        <div className="flex flex-col gap-2">
          {plan.map((id) => {
            const q = QUESTS[id]
            return (
              <QuestRow
                key={id}
                name={q.name}
                target={`${q.reps[rank]} ${q.unit}`}
                stat={q.stat}
                xp={q.xp}
                done={doneToday.includes(id)}
                onComplete={() =>
                  dispatch({
                    type: 'COMPLETE_QUEST',
                    id,
                    xp: q.xp,
                    stat: q.stat,
                    name: q.name,
                  })
                }
              />
            )
          })}
          {drawnTask && (
            <QuestRow
              name={drawnTask.name}
              stat="POOL"
              xp={POOL_XP}
              done={doneToday.includes(`pool_${drawnTask.id}`)}
              onComplete={() =>
                dispatch({
                  type: 'COMPLETE_QUEST',
                  id: `pool_${drawnTask.id}`,
                  xp: POOL_XP,
                  name: drawnTask.name,
                  poolId: drawnTask.id,
                })
              }
            />
          )}
          <QuestRow
            name="Tabletten einnehmen"
            stat="VIT"
            xp={TABLETS_XP}
            done={doneToday.includes('tabletten')}
            onComplete={() =>
              dispatch({
                type: 'COMPLETE_QUEST',
                id: 'tabletten',
                xp: TABLETS_XP,
                stat: 'VIT',
                name: 'Tabletten',
              })
            }
          />
        </div>
      </Panel>

      <Panel title="SCHRITTE">
        <p style={{ fontSize: '13px', color: 'var(--dim)' }}>
          {STEP_XP_PER_1000} XP je 1000 Schritte · max. {cap} XP
        </p>
        <div className="mt-2 flex gap-2">
          <input
            type="number"
            min="0"
            inputMode="numeric"
            value={stepsInput}
            onChange={(e) => setStepsInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && logSteps()}
            placeholder="Schritte heute"
            className="w-full min-w-0 bg-transparent px-3 py-2"
            style={{
              border: '1px solid var(--line)',
              borderRadius: '10px',
              color: 'var(--text)',
              fontSize: '15px',
            }}
          />
          <button
            type="button"
            onClick={logSteps}
            className="shrink-0 bg-transparent px-3"
            style={{
              ...orbitron,
              fontSize: '10px',
              letterSpacing: '2px',
              color: 'var(--glow)',
              border: '1px solid var(--glow)',
              borderRadius: '10px',
            }}
          >
            EINTRAGEN
          </button>
        </div>
        <p
          className="mt-2"
          style={{ ...orbitron, fontSize: '11px', color: 'var(--dim)' }}
        >
          HEUTE: {loggedSteps.toLocaleString('de-DE')} SCHRITTE ·{' '}
          <span style={{ color: 'var(--xp)' }}>
            {stepsXp} / {cap} XP
          </span>
        </p>
      </Panel>

      <Panel title="WOCHEN-AUFGABEN">
        <p style={{ fontSize: '13px', color: 'var(--dim)' }}>
          Trage hier Aufgaben für die Woche ein. Das System zieht daraus
          zufällig deine täglichen Quests.
        </p>
        {state.poolTasks.length === 0 ? (
          <p className="mt-3" style={{ fontSize: '13px', color: 'var(--dim)' }}>
            Noch keine Aufgaben – trage unten deine erste ein.
          </p>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {state.poolTasks.map((task) => {
              const isDrawn = drawnTask?.id === task.id
              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-3 border p-3"
                  style={{
                    borderColor: task.done
                      ? 'rgba(77,255,166,.4)'
                      : 'var(--line)',
                    borderRadius: '12px',
                  }}
                >
                  <p
                    className="min-w-0 text-[15px] font-semibold"
                    style={
                      task.done
                        ? {
                            color: 'var(--ok)',
                            textDecoration: 'line-through',
                          }
                        : undefined
                    }
                  >
                    {task.name}
                  </p>
                  {task.done ? (
                    <span
                      className="shrink-0"
                      style={{ fontSize: '12px', color: 'var(--ok)' }}
                    >
                      erledigt
                    </span>
                  ) : isDrawn ? (
                    <span
                      className="shrink-0"
                      style={{
                        ...orbitron,
                        fontSize: '10px',
                        letterSpacing: '1px',
                        color: 'var(--xp)',
                        textShadow: '0 0 8px rgba(143,224,255,.6)',
                      }}
                    >
                      HEUTE ALS QUEST!
                    </span>
                  ) : (
                    <div className="flex shrink-0 items-center gap-2">
                      <span style={{ fontSize: '12px', color: 'var(--dim)' }}>
                        wartet
                      </span>
                      <button
                        type="button"
                        title={`Direkt abhaken (+${POOL_XP / 2} XP)`}
                        onClick={() =>
                          dispatch({ type: 'COMPLETE_POOL_TASK', id: task.id })
                        }
                        className="flex h-[26px] w-[26px] items-center justify-center bg-transparent leading-none"
                        style={{
                          border: '1px solid var(--ok)',
                          color: 'var(--ok)',
                          borderRadius: '8px',
                          fontSize: '13px',
                        }}
                      >
                        ✓
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && taskInput.trim()) {
                dispatch({ type: 'ADD_POOL_TASK', name: taskInput })
                setTaskInput('')
              }
            }}
            placeholder="Neue Aufgabe"
            className="w-full min-w-0 bg-transparent px-3 py-2"
            style={{
              border: '1px solid var(--line)',
              borderRadius: '10px',
              color: 'var(--text)',
              fontSize: '15px',
            }}
          />
          <button
            type="button"
            onClick={() => {
              if (taskInput.trim()) {
                dispatch({ type: 'ADD_POOL_TASK', name: taskInput })
                setTaskInput('')
              }
            }}
            className="flex h-[44px] w-[44px] shrink-0 items-center justify-center bg-transparent"
            style={{
              ...orbitron,
              fontSize: '18px',
              color: 'var(--glow)',
              border: '1px solid var(--glow)',
              borderRadius: '10px',
            }}
          >
            +
          </button>
        </div>
      </Panel>
    </div>
  )
}

export default Quests
