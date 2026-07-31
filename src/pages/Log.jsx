import { useEffect, useRef, useState } from 'react'
import Panel from '../components/Panel.jsx'
import {
  useGame,
  exportiereSpielstand,
  sicherungsName,
  pruefeSicherung,
  uebernehmeSicherung,
} from '../context/GameContext.jsx'
import { todayKey } from '../data/quests.js'
import { GENDERS } from '../data/gender.js'

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

/* --------------------------------------------------------------------- */
/* Sicherung: Spielstand aus der App heraus und wieder hinein             */
/* --------------------------------------------------------------------- */
function datumLesbar(iso) {
  if (!iso) return 'unbekannt'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return 'unbekannt'
  return d.toLocaleDateString('de-DE')
}

function ImportConfirmPopup({ eckdaten, onCancel, onConfirm }) {
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

        <div
          className="mt-4 border px-3 py-2"
          style={{ borderColor: 'var(--line)', borderRadius: 10 }}
        >
          <p style={{ fontSize: '13.5px', color: 'var(--xp)', lineHeight: 1.6 }}>
            Level {eckdaten.level} · Rang {eckdaten.rank} · Aura {eckdaten.aura}
          </p>
          <p style={{ fontSize: '11.5px', color: 'var(--dim)' }}>
            erstellt am {datumLesbar(eckdaten.exportedAt)}
          </p>
        </div>

        <p className="mt-3 text-[14px]">
          Dieser Spielstand ersetzt deinen aktuellen. Was jetzt auf dem Gerät
          liegt, ist danach fort.
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
            onClick={onConfirm}
            className="w-full bg-transparent px-4 py-2"
            style={{
              ...orbitron,
              fontSize: '11px',
              letterSpacing: '2px',
              color: 'var(--danger)',
              border: '1px solid var(--danger)',
              borderRadius: '10px',
            }}
          >
            SPIELSTAND ERSETZEN
          </button>
        </div>
      </div>
    </div>
  )
}

function Sicherung({ state, dispatch }) {
  const [fehler, setFehler] = useState(null)
  const [pruefung, setPruefung] = useState(null)
  const dateiFeld = useRef(null)

  function exportieren() {
    const dateiname = sicherungsName()
    const blob = new Blob([exportiereSpielstand(state)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = dateiname
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    setFehler(null)
    dispatch({ type: 'SAVE_EXPORTED', dateiname })
  }

  function dateiGewaehlt(event) {
    const datei = event.target.files?.[0]
    // Feld leeren, damit dieselbe Datei erneut gewählt werden kann
    event.target.value = ''
    if (!datei) return
    const leser = new FileReader()
    leser.onerror = () => setFehler('Die Datei konnte nicht gelesen werden.')
    leser.onload = () => {
      const ergebnis = pruefeSicherung(String(leser.result))
      if (!ergebnis.ok) {
        setPruefung(null)
        setFehler(ergebnis.fehler)
        return
      }
      setFehler(null)
      setPruefung(ergebnis)
    }
    leser.readAsText(datei)
  }

  return (
    <>
      <Panel title="SICHERUNG">
        <p style={{ fontSize: '13px', color: 'var(--dim)' }}>
          Dein Spielstand liegt nur auf diesem Gerät. Sichere ihn regelmäßig.
        </p>

        <div className="mt-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={exportieren}
            className="w-full bg-transparent px-4 py-2.5"
            style={{
              ...orbitron,
              fontSize: '11px',
              letterSpacing: '2px',
              color: 'var(--glow)',
              border: '1px solid var(--glow)',
              borderRadius: '10px',
            }}
          >
            EXPORTIEREN
          </button>
          <button
            type="button"
            onClick={() => dateiFeld.current?.click()}
            className="w-full bg-transparent px-4 py-2.5"
            style={{
              ...orbitron,
              fontSize: '11px',
              letterSpacing: '2px',
              color: 'var(--xp)',
              border: '1px solid var(--xp)',
              borderRadius: '10px',
            }}
          >
            IMPORTIEREN
          </button>
          <input
            ref={dateiFeld}
            type="file"
            accept="application/json,.json"
            onChange={dateiGewaehlt}
            className="hidden"
          />
        </div>

        {fehler && (
          <p
            className="mt-3 border px-3 py-2"
            style={{
              fontSize: '12.5px',
              lineHeight: 1.5,
              color: 'var(--danger)',
              borderColor: 'rgba(255,77,94,.5)',
              background: 'rgba(255,77,94,.06)',
              borderRadius: 10,
            }}
          >
            {fehler} Dein Spielstand bleibt unverändert.
          </p>
        )}
      </Panel>

      {pruefung && (
        <ImportConfirmPopup
          eckdaten={pruefung.eckdaten}
          onCancel={() => setPruefung(null)}
          onConfirm={() => {
            uebernehmeSicherung(pruefung.daten)
            window.location.reload()
          }}
        />
      )}
    </>
  )
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

function GenderPopup({ current, onSelect, onClose }) {
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
        <p
          style={{
            ...orbitron,
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
            ...orbitron,
            fontSize: '18px',
            color: 'var(--xp)',
            textShadow: '0 0 14px rgba(143,224,255,.9)',
          }}
        >
          ERSCHEINUNG
        </p>
        <p className="mt-2 text-[13px]" style={{ color: 'var(--dim)' }}>
          Wähle deine Erscheinung
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {GENDERS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              className="w-full bg-transparent px-3 py-4"
              style={{
                ...orbitron,
                fontSize: '11px',
                letterSpacing: '2px',
                color: id === current ? 'var(--xp)' : 'var(--text)',
                border: `1px solid ${id === current ? 'var(--xp)' : 'var(--line)'}`,
                borderRadius: '12px',
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 bg-transparent px-5 py-2"
          style={{
            ...orbitron,
            fontSize: '11px',
            letterSpacing: '2px',
            color: 'var(--dim)',
            border: '1px solid var(--line)',
            borderRadius: '10px',
          }}
        >
          SCHLIESSEN
        </button>
      </div>
    </div>
  )
}

function Log() {
  const { state, dispatch } = useGame()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [genderOpen, setGenderOpen] = useState(false)

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

      <Sicherung state={state} dispatch={dispatch} />

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
        <button
          type="button"
          onClick={() => setGenderOpen(true)}
          className="mt-2 w-full bg-transparent px-4 py-2"
          style={{
            ...orbitron,
            fontSize: '10px',
            letterSpacing: '2px',
            color: 'var(--dim)',
            border: '1px solid var(--line)',
            borderRadius: '10px',
          }}
        >
          ERSCHEINUNG ÄNDERN
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

      {genderOpen && (
        <GenderPopup
          current={state.gender}
          onSelect={(gender) => {
            dispatch({ type: 'SET_GENDER', gender })
            setGenderOpen(false)
          }}
          onClose={() => setGenderOpen(false)}
        />
      )}
    </div>
  )
}

export default Log
