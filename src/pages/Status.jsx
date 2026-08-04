import { useState } from 'react'
import Panel from '../components/Panel.jsx'
import { useGame } from '../context/GameContext.jsx'
import { CLASSES } from '../data/classes.js'
import SystemKarten from '../components/SystemKarten.jsx'
import {
  systemOder,
  wechselSperre,
  WECHSEL_SPERRE_TAGE,
} from '../data/trainingssysteme.js'
import { TITLES } from '../data/titles.js'
import { anrede } from '../data/gender.js'
import { auraQuote, auraStage } from '../data/aura.js'

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
            <p style={{ fontSize: '11px', color: 'var(--dim)' }}>
              Aura: <span style={{ color: 'var(--xp)' }}>{state.aura}</span> ·{' '}
              {auraStage(state.aura, level).name}
            </p>
            <div
              className="mt-1 h-[4px] w-[120px] overflow-hidden rounded-full"
              style={{ background: '#0f1a2e' }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${auraQuote(state.aura, level) * 100}%`,
                  background: 'var(--xp)',
                  boxShadow: '0 0 8px rgba(143,224,255,.7)',
                  transition: 'width .4s',
                }}
              />
            </div>
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
      <TrainingssystemPanel />
      <GewichtPanel />
    </div>
  )
}

/* --------------------------------------------------------------------- */
/* Körpergewicht – ausschließlich Grundlage des Eiweißbedarfs             */
/* --------------------------------------------------------------------- */
function GewichtPanel() {
  const { state, dispatch } = useGame()
  const [bearbeiten, setBearbeiten] = useState(false)
  const [wert, setWert] = useState('')

  if (!state.gewicht && !bearbeiten) return null

  const zahl = Number(wert.replace(',', '.'))
  const gueltig = Number.isFinite(zahl) && zahl > 0

  return (
    <Panel title="KÖRPERGEWICHT">
      {bearbeiten ? (
        <>
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="decimal"
              value={wert}
              onChange={(e) => setWert(e.target.value)}
              placeholder={String(state.gewicht ?? '')}
              className="min-w-0 flex-1 px-3 py-2"
              style={{
                background: '#0e1826',
                border: '1px solid var(--line)',
                borderRadius: 10,
                color: 'var(--text)',
                fontSize: '16px',
              }}
            />
            <span style={{ ...orbitron, fontSize: '12px', color: 'var(--dim)' }}>KG</span>
          </div>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => setBearbeiten(false)}
              className="flex-1 bg-transparent px-3 py-2"
              style={{
                ...orbitron,
                fontSize: '10px',
                letterSpacing: '2px',
                color: 'var(--dim)',
                border: '1px solid var(--line)',
                borderRadius: 10,
              }}
            >
              ABBRECHEN
            </button>
            <button
              type="button"
              disabled={!gueltig}
              onClick={() => {
                dispatch({ type: 'SET_GEWICHT', gewicht: zahl })
                setBearbeiten(false)
                setWert('')
              }}
              className="flex-1 bg-transparent px-3 py-2 disabled:opacity-40"
              style={{
                ...orbitron,
                fontSize: '10px',
                letterSpacing: '2px',
                color: 'var(--glow)',
                border: '1px solid var(--glow)',
                borderRadius: 10,
              }}
            >
              SPEICHERN
            </button>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p style={{ ...orbitron, fontSize: '18px', color: 'var(--xp)' }}>
              {state.gewicht} kg
            </p>
            <p style={{ fontSize: '11.5px', color: 'var(--dim)' }}>
              Grundlage des Eiweißbedarfs, sonst nichts.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setBearbeiten(true)}
            className="shrink-0 bg-transparent px-3 py-1.5"
            style={{
              ...orbitron,
              fontSize: 9,
              letterSpacing: '2px',
              color: 'var(--dim)',
              border: '1px solid var(--line)',
              borderRadius: 8,
            }}
          >
            ÄNDERN
          </button>
        </div>
      )}
    </Panel>
  )
}

/* --------------------------------------------------------------------- */
/* Trainingssystem: Anzeige und Wechsel                                   */
/* --------------------------------------------------------------------- */
function TrainingssystemPanel() {
  const { state, dispatch } = useGame()
  const [offen, setOffen] = useState(false)
  const [frage, setFrage] = useState(null)
  const system = systemOder(state.system)
  const restTage = wechselSperre(state.systemGewechselt)

  return (
    <>
      <Panel title="TRAININGSSYSTEM">
        <p className="text-[16px] font-semibold" style={{ color: 'var(--glow)' }}>
          {system.name}
        </p>
        <p style={{ fontSize: '12.5px', color: 'var(--dim)', lineHeight: 1.5 }}>
          {system.beschreibung}
        </p>
        <p className="mt-2" style={{ fontSize: '12px' }}>
          Klasse{' '}
          <span style={{ color: 'var(--xp)' }}>
            {CLASSES[system.klasse]?.name ?? system.klasse}
          </span>{' '}
          · +{system.bonus.wert}% XP
          {system.bonus.kategorien.length > 0
            ? ` auf ${system.bonus.kategorien.join(' und ')}`
            : ' auf alles'}
        </p>

        {restTage > 0 ? (
          <p
            className="mt-3 border px-3 py-2"
            style={{
              fontSize: '12px',
              lineHeight: 1.5,
              color: 'var(--warn)',
              borderColor: 'rgba(255,179,71,.4)',
              borderRadius: 10,
            }}
          >
            Gewechselt wird höchstens alle {WECHSEL_SPERRE_TAGE} Tage. Noch{' '}
            {restTage} {restTage === 1 ? 'Tag' : 'Tage'}, dann geht es wieder.
          </p>
        ) : (
          <button
            type="button"
            onClick={() => setOffen((o) => !o)}
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
            {offen ? 'ABBRECHEN' : 'TRAININGSSYSTEM WECHSELN'}
          </button>
        )}

        {offen && restTage === 0 && (
          <div className="mt-3">
            <SystemKarten
              aktiv={state.system}
              knopfText="ZU DIESEM WECHSELN"
              onWaehlen={(id) => setFrage(id)}
            />
          </div>
        )}
      </Panel>

      {frage && (
        <WechselPopup
          zielId={frage}
          aktuellName={system.name}
          onAbbruch={() => setFrage(null)}
          onBestaetigen={() => {
            dispatch({ type: 'SWITCH_SYSTEM', id: frage })
            setFrage(null)
            setOffen(false)
          }}
        />
      )}
    </>
  )
}

function WechselPopup({ zielId, aktuellName, onAbbruch, onBestaetigen }) {
  const ziel = systemOder(zielId)
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
          boxShadow: '0 0 40px rgba(63,182,255,.3)',
        }}
      >
        <p style={{ ...orbitron, fontSize: '10px', letterSpacing: '3px', color: 'var(--glow)' }}>
          ◆ SYSTEM
        </p>
        <p
          className="mt-3"
          style={{ ...orbitron, fontSize: '16px', color: 'var(--xp)' }}
        >
          SYSTEM WECHSELN
        </p>
        <p className="mt-3 text-[14px]" style={{ lineHeight: 1.55 }}>
          {aktuellName} → <b style={{ color: 'var(--xp)' }}>{ziel.name}</b>
        </p>
        <p className="mt-2" style={{ fontSize: '12.5px', color: 'var(--dim)', lineHeight: 1.5 }}>
          Level, Rang und Aura bleiben. Für neue Übungen schätzt das System
          deine Tagesziele aus dem bisherigen Stand. Der nächste Wechsel ist
          erst in {WECHSEL_SPERRE_TAGE} Tagen möglich.
        </p>
        {ziel.hinweis && (
          <p className="mt-3" style={{ fontSize: '12px', color: 'var(--warn)', lineHeight: 1.5 }}>
            {ziel.hinweis}
          </p>
        )}
        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={onAbbruch}
            className="w-full bg-transparent px-4 py-2"
            style={{
              ...orbitron,
              fontSize: '11px',
              letterSpacing: '2px',
              color: 'var(--dim)',
              border: '1px solid var(--line)',
              borderRadius: '10px',
            }}
          >
            ABBRECHEN
          </button>
          <button
            type="button"
            onClick={onBestaetigen}
            className="w-full bg-transparent px-4 py-2"
            style={{
              ...orbitron,
              fontSize: '11px',
              letterSpacing: '2px',
              color: 'var(--glow)',
              border: '1px solid var(--glow)',
              borderRadius: '10px',
            }}
          >
            WECHSELN
          </button>
        </div>
      </div>
    </div>
  )
}

export default Status
