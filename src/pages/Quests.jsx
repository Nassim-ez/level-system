import { useState } from 'react'
import Panel from '../components/Panel.jsx'
import { useGame } from '../context/GameContext.jsx'
import {
  QUESTS,
  DAY_PLANS,
  BONUS_PLANS,
  DAY_LABELS,
  TABLETS_XP,
  POOL_XP,
  STEP_XP_PER_1000,
  stepXpMax,
  resolveQuest,
  needsNegatives,
} from '../data/quests.js'
import { RANK_TESTS, buildRankTest, nextRank } from '../data/ranks.js'
import Uebungen from './Uebungen.jsx'

const orbitron = { fontFamily: "'Orbitron', sans-serif" }

function QuestRow({ name, target, stat, xp, hinweis, done, onComplete }) {
  return (
    <div
      className="flex items-center justify-between gap-3 border p-3"
      style={{
        borderColor: done ? 'rgba(143,224,255,.4)' : 'var(--line)',
        borderRadius: '12px',
      }}
    >
      <div className="min-w-0">
        <p
          className="text-[16px] font-semibold"
          style={done ? { color: 'var(--xp)' } : undefined}
        >
          {name}
          {target && (
            <span style={{ color: 'var(--xp)' }}>
              {' '}
              · {target}
            </span>
          )}
        </p>
        <p style={{ ...orbitron, fontSize: '10px', color: 'var(--dim)', letterSpacing: '1px' }}>
          {stat} · +{xp} XP
        </p>
        {hinweis && (
          <p style={{ fontSize: '11px', color: 'var(--dim)' }}>{hinweis}</p>
        )}
      </div>
      {done ? (
        <span
          className="shrink-0"
          style={{
            ...orbitron,
            fontSize: '10px',
            letterSpacing: '2px',
            color: 'var(--xp)',
            textShadow: '0 0 8px rgba(143,224,255,.6)',
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
  const { dayType, doneToday, questProgress, drawnTask } = state
  const [stepsInput, setStepsInput] = useState('')
  const [taskInput, setTaskInput] = useState('')
  const [beiUebungen, setBeiUebungen] = useState(false)

  const plan = DAY_PLANS[dayType] ?? []
  const bonusPlan = BONUS_PLANS[dayType] ?? []
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
  const rankTasks = state.rankTestActive
    ? (state.rankTestTasks ??
      buildRankTest(state.rank, state.baseTargets, needsNegatives(state)))
    : null
  const rankProgress = questProgress.rankTest ?? {}

  if (beiUebungen) return <Uebungen onZurueck={() => setBeiUebungen(false)} />

  return (
    <div className="flex flex-col gap-4">
      <Panel title="ÜBUNGSWISSEN">
        <p style={{ fontSize: '13px', color: 'var(--dim)' }}>
          Ausführung, häufige Fehler, beanspruchte Muskeln und die Leiter von
          leicht nach schwer – zu jeder Übung des Systems.
        </p>
        <button
          type="button"
          onClick={() => setBeiUebungen(true)}
          className="mt-3 w-full bg-transparent px-4 py-2.5"
          style={{
            ...orbitron,
            fontSize: '11px',
            letterSpacing: '2px',
            color: 'var(--glow)',
            border: '1px solid var(--glow)',
            borderRadius: '10px',
          }}
        >
          ÜBUNGEN ANSEHEN
        </button>
      </Panel>

      {test && (
        <Panel title="AUFSTIEGSPRÜFUNG" accent="var(--xp)">
          <p
            className="mb-1"
            style={{ ...orbitron, fontSize: '11px', letterSpacing: '2px', color: 'var(--xp)' }}
          >
            RANG {state.rank} → {nextRank(state.rank)}
          </p>
          <p className="mb-3" style={{ fontSize: '13px', color: 'var(--dim)' }}>
            {rankTasks
              .map((t) => {
                const q = t.negativ ? QUESTS.negativklimmzuege : QUESTS[t.quest]
                return `${t.ziel} ${q.name}`
              })
              .join(' + ')}{' '}
            an einem Tag
          </p>
          <div className="flex flex-col gap-2">
            {rankTasks.map((task) => {
              const q = task.negativ
                ? QUESTS.negativklimmzuege
                : QUESTS[task.quest]
              const value = rankProgress[task.quest] ?? 0
              const tagesziel = task.negativ
                ? QUESTS.negativklimmzuege.festesZiel
                : state.baseTargets?.[task.quest]
              return (
                <div
                  key={task.quest}
                  className="flex items-center justify-between gap-3 border p-3"
                  style={{ borderColor: 'var(--line)', borderRadius: '12px' }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[16px] font-semibold">{q.name}</p>
                    <p style={{ fontSize: '11px', color: 'var(--dim)' }}>
                      Prüfungsziel: {task.ziel} · dein Tagesziel: {tagesziel}
                    </p>
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
            const q = resolveQuest(id, state)
            return (
              <QuestRow
                key={id}
                name={q.name}
                target={`${q.ziel} ${q.unit}`}
                stat={q.stat}
                xp={q.xp}
                done={doneToday.includes(q.id)}
                onComplete={() =>
                  dispatch({
                    type: 'COMPLETE_QUEST',
                    id: q.id,
                    xp: q.xp,
                    stat: q.stat,
                    name: q.name,
                  })
                }
              />
            )
          })}
          {bonusPlan.map((id) => {
            const q = resolveQuest(id, state)
            return (
              <QuestRow
                key={q.id}
                name={q.name}
                target={`${q.ziel} ${q.unit}`}
                stat={`BONUS · ${q.stat}`}
                xp={q.xp}
                hinweis={q.hinweis}
                done={doneToday.includes(q.id)}
                onComplete={() =>
                  dispatch({
                    type: 'COMPLETE_QUEST',
                    id: q.id,
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
                      ? 'rgba(143,224,255,.4)'
                      : 'var(--line)',
                    borderRadius: '12px',
                  }}
                >
                  <p
                    className="min-w-0 text-[15px] font-semibold"
                    style={
                      task.done
                        ? {
                            color: 'var(--xp)',
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
                      style={{ fontSize: '12px', color: 'var(--xp)' }}
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
                          border: '1px solid var(--xp)',
                          color: 'var(--xp)',
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
