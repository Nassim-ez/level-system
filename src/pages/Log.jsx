import { useEffect, useState } from 'react'
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

function ResetConfirmPopup({ onCancel, onConfirm }) {
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: 'rgba(2,4,9,.7)', backdropFilter: 'blur(3px)' }}
    >
      <div
        className="w-full max-w-[340px] rounded-[18px] border p-5 text-center"
        style={{
          background: 'var(--panel)',
          borderColor: 'var(--danger)',
          boxShadow: '0 0 40px rgba(255,77,94,.3)',
        }}
      >
        <p
          style={{
            ...orbitron,
            fontSize: '10px',
            letterSpacing: '3px',
            color: 'var(--danger)',
          }}
        >
          ◆ SYSTEM
        </p>
        <p
          className="mt-3"
          style={{
            ...orbitron,
            fontSize: '20px',
            color: 'var(--danger)',
            textShadow: '0 0 14px rgba(255,77,94,.8)',
          }}
        >
          ⚠ WARNUNG
        </p>
        <p className="mt-3 text-[14px]">
          Willst du wirklich neu beginnen? Dein gesamter Fortschritt geht
          verloren. Das kann nicht rückgängig gemacht werden.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={onCancel}
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
            disabled={countdown > 0}
            onClick={onConfirm}
            className="w-full bg-transparent px-4 py-2 disabled:opacity-40"
            style={{
              ...orbitron,
              fontSize: '11px',
              letterSpacing: '2px',
              color: 'var(--danger)',
              border: '1px solid var(--danger)',
              borderRadius: '10px',
            }}
          >
            {countdown > 0
              ? `JA, ZURÜCKSETZEN (${countdown})`
              : 'JA, ZURÜCKSETZEN'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Log() {
  const { state, dispatch } = useGame()
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <div className="flex flex-col gap-4">
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

      <Panel
        title="GEFAHRENZONE"
        accent="rgba(255,77,94,.4)"
        titleColor="var(--danger)"
        glow="rgba(255,77,94,.12)"
      >
        <p style={{ fontSize: '13px', color: 'var(--dim)' }}>
          Setzt das komplette System zurück – Level, Rang, XP, Items, Serie und
          Log werden unwiderruflich gelöscht.
        </p>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="mt-3 w-full bg-transparent px-4 py-2.5"
          style={{
            ...orbitron,
            fontSize: '11px',
            letterSpacing: '2px',
            color: 'var(--danger)',
            border: '1px solid var(--danger)',
            borderRadius: '10px',
          }}
        >
          SYSTEM ZURÜCKSETZEN
        </button>
      </Panel>

      {confirmOpen && (
        <ResetConfirmPopup
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => {
            setConfirmOpen(false)
            dispatch({ type: 'RESET_GAME' })
          }}
        />
      )}
    </div>
  )
}

export default Log
