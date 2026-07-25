import { useState } from 'react'
import { useGame } from '../context/GameContext.jsx'
import { GENDERS, anrede } from '../data/gender.js'
import { QUESTS, rankFromMaxima, targetsFromMaxima } from '../data/quests.js'

const orbitron = { fontFamily: "'Orbitron', sans-serif" }

// Je Übung: Maximalwert am Stück abfragen
const QUESTIONS = [
  {
    key: 'liegestuetze',
    frage: 'Wie viele Liegestütze schaffst du am Stück?',
    einheit: 'Wiederholungen',
    stufen: [0, 5, 10, 20, 30, 50],
  },
  {
    key: 'kniebeugen',
    frage: 'Wie viele Kniebeugen schaffst du am Stück?',
    einheit: 'Wiederholungen',
    stufen: [0, 10, 20, 30, 50, 70],
  },
  {
    key: 'crunches',
    frage: 'Wie viele Crunches schaffst du am Stück?',
    einheit: 'Wiederholungen',
    stufen: [0, 10, 20, 30, 45, 60],
  },
  {
    key: 'klimmzuege',
    frage: 'Wie viele Klimmzüge schaffst du?',
    einheit: 'Wiederholungen',
    stufen: [0, 1, 3, 5, 10, 15],
    hinweis: 'Ehrlich bleiben – 0 ist völlig in Ordnung.',
  },
  {
    key: 'dehnen',
    frage: 'Wie viele Minuten kannst du am Stück dehnen/mobilisieren?',
    einheit: 'Minuten',
    stufen: [5, 10, 15, 20, 30],
  },
]

function Onboarding() {
  const { dispatch } = useGame()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [gender, setGender] = useState(null)
  const [maxima, setMaxima] = useState({})
  const [entry, setEntry] = useState('')

  const rank = rankFromMaxima(maxima)
  const baseTargets = targetsFromMaxima(maxima)
  const firstQuestion = 2
  const summaryStep = QUESTIONS.length + firstQuestion
  const resultStep = summaryStep + 1

  const currentQuestion = QUESTIONS[step - firstQuestion]
  const submitValue = (value) => {
    setMaxima({ ...maxima, [currentQuestion.key]: value })
    setEntry('')
    setStep(step + 1)
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-6 py-10">
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

      {step === 0 && (
        <div className="mt-4 w-full max-w-[340px] text-center">
          <p
            style={{
              ...orbitron,
              fontSize: '18px',
              color: 'var(--xp)',
              textShadow: '0 0 14px rgba(143,224,255,.9)',
            }}
          >
            SYSTEM-INITIALISIERUNG
          </p>
          <p className="mt-3 text-[15px]">
            Wie lautet dein Name, {anrede(gender)}?
          </p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && name.trim() && setStep(1)}
            placeholder="Dein Name"
            className="mt-4 w-full bg-transparent px-4 py-3 text-center"
            style={{
              border: '1px solid var(--line)',
              borderRadius: '12px',
              color: 'var(--text)',
              fontSize: '16px',
            }}
          />
          <button
            type="button"
            disabled={!name.trim()}
            onClick={() => setStep(1)}
            className="mt-4 bg-transparent px-6 py-2 disabled:opacity-40"
            style={{
              ...orbitron,
              fontSize: '11px',
              letterSpacing: '2px',
              color: 'var(--glow)',
              border: '1px solid var(--glow)',
              borderRadius: '10px',
            }}
          >
            WEITER
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="mt-4 w-full max-w-[340px] text-center">
          <p
            style={{
              ...orbitron,
              fontSize: '18px',
              color: 'var(--xp)',
              textShadow: '0 0 14px rgba(143,224,255,.9)',
            }}
          >
            IDENTIFIKATION
          </p>
          <p className="mt-3 text-[15px]">Wähle deine Erscheinung</p>
          <div className="mt-4 flex flex-col gap-2">
            {GENDERS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setGender(id)
                  setStep(firstQuestion)
                }}
                className="w-full bg-transparent px-4 py-3"
                style={{
                  ...orbitron,
                  fontSize: '13px',
                  letterSpacing: '2px',
                  color: 'var(--text)',
                  background: 'var(--panel)',
                  border: '1px solid var(--line)',
                  borderRadius: '12px',
                  boxShadow: '0 0 12px rgba(63,182,255,.08)',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {step >= firstQuestion && step < summaryStep && (
        <div className="mt-4 w-full max-w-[340px] text-center">
          <p
            style={{
              ...orbitron,
              fontSize: '18px',
              color: 'var(--xp)',
              textShadow: '0 0 14px rgba(143,224,255,.9)',
            }}
          >
            EINSTUFUNG
          </p>
          <p
            className="mt-1"
            style={{ ...orbitron, fontSize: '10px', color: 'var(--dim)', letterSpacing: '2px' }}
          >
            FRAGE {step - firstQuestion + 1} / {QUESTIONS.length}
          </p>
          <p className="mt-3 text-[15px]">{currentQuestion.frage}</p>
          {currentQuestion.hinweis && (
            <p className="mt-1" style={{ fontSize: '12px', color: 'var(--dim)' }}>
              {currentQuestion.hinweis}
            </p>
          )}

          {/* Schnellauswahl */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {currentQuestion.stufen.map((stufe) => (
              <button
                key={stufe}
                type="button"
                onClick={() => submitValue(stufe)}
                className="bg-transparent px-4 py-2"
                style={{
                  ...orbitron,
                  fontSize: '14px',
                  color: 'var(--text)',
                  background: 'var(--panel)',
                  border: '1px solid var(--line)',
                  borderRadius: '10px',
                  minWidth: '58px',
                }}
              >
                {stufe}
              </button>
            ))}
          </div>

          {/* Freie Zahleneingabe */}
          <div className="mt-4 flex gap-2">
            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && entry !== '') {
                  submitValue(Math.max(0, parseInt(entry, 10) || 0))
                }
              }}
              placeholder={`Genauer Wert (${currentQuestion.einheit})`}
              className="w-full min-w-0 bg-transparent px-3 py-2 text-center"
              style={{
                border: '1px solid var(--line)',
                borderRadius: '10px',
                color: 'var(--text)',
                fontSize: '15px',
              }}
            />
            <button
              type="button"
              disabled={entry === ''}
              onClick={() => submitValue(Math.max(0, parseInt(entry, 10) || 0))}
              className="shrink-0 bg-transparent px-4 disabled:opacity-40"
              style={{
                ...orbitron,
                fontSize: '10px',
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
      )}

      {step === summaryStep && (
        <div className="mt-4 w-full max-w-[340px] text-center">
          <p
            style={{
              ...orbitron,
              fontSize: '18px',
              color: 'var(--xp)',
              textShadow: '0 0 14px rgba(143,224,255,.9)',
            }}
          >
            DEINE STARTZIELE
          </p>
          <p className="mt-2" style={{ fontSize: '13px', color: 'var(--dim)' }}>
            Aus deinen Angaben berechnet – fordernd, aber machbar (auf 2 Sätze
            verteilbar).
          </p>
          <div className="mt-4 flex flex-col gap-2">
            {Object.entries(baseTargets).map(([key, ziel]) => {
              // Ohne echte Klimmzüge startet man mit Negativ-Klimmzügen
              const ersatz = key === 'klimmzuege' && ziel === 0
              const quest = ersatz ? QUESTS.negativklimmzuege : QUESTS[key]
              const anzeige = ersatz ? quest.festesZiel : ziel
              return (
                <div
                  key={key}
                  className="flex items-center justify-between px-4 py-2.5"
                  style={{
                    background: 'var(--panel)',
                    border: '1px solid var(--line)',
                    borderRadius: '12px',
                  }}
                >
                  <span className="text-[15px]">{quest.name}</span>
                  <span
                    style={{
                      ...orbitron,
                      fontSize: '15px',
                      color: 'var(--xp)',
                      textShadow: '0 0 8px rgba(143,224,255,.6)',
                    }}
                  >
                    {anzeige} {quest.unit}
                  </span>
                </div>
              )
            })}
          </div>
          {(maxima.klimmzuege || 0) === 0 && (
            <p className="mt-3" style={{ fontSize: '12px', color: 'var(--dim)' }}>
              Noch keine Klimmzüge? Du startest mit Negativ-Klimmzügen
              (langsam ablassen), bis der erste echte sitzt.
            </p>
          )}
          <button
            type="button"
            onClick={() => setStep(resultStep)}
            className="mt-5 bg-transparent px-6 py-2.5"
            style={{
              ...orbitron,
              fontSize: '11px',
              letterSpacing: '2px',
              color: 'var(--glow)',
              border: '1px solid var(--glow)',
              borderRadius: '10px',
            }}
          >
            WEITER
          </button>
        </div>
      )}

      {step === resultStep && (
        <div className="mt-4 w-full max-w-[340px] text-center">
          <p
            style={{
              ...orbitron,
              fontSize: '18px',
              color: 'var(--xp)',
              textShadow: '0 0 14px rgba(143,224,255,.9)',
            }}
          >
            EINSTUFUNG ABGESCHLOSSEN
          </p>
          <div
            className="mx-auto mt-6 flex h-[100px] w-[100px] items-center justify-center"
            style={{
              border: '2px solid var(--glow)',
              borderRadius: '20px',
              animation: 'rank-pulse 2.5s ease-in-out infinite',
            }}
          >
            <span
              style={{
                ...orbitron,
                fontSize: '52px',
                color: 'var(--glow)',
                textShadow: '0 0 16px rgba(63,182,255,.9)',
              }}
            >
              {rank}
            </span>
          </div>
          <p
            className="mt-4"
            style={{ ...orbitron, fontSize: '13px', letterSpacing: '2px' }}
          >
            RANG {rank}
          </p>
          <button
            type="button"
            onClick={() =>
              dispatch({
                type: 'COMPLETE_ONBOARDING',
                name,
                gender,
                rank,
                baseTargets,
              })
            }
            className="mt-6 bg-transparent px-6 py-3"
            style={{
              ...orbitron,
              fontSize: '11px',
              letterSpacing: '2px',
              color: 'var(--glow)',
              border: '1px solid var(--glow)',
              borderRadius: '10px',
              boxShadow: '0 0 14px rgba(63,182,255,.3)',
            }}
          >
            Dein Aufstieg beginnt jetzt.
          </button>
        </div>
      )}
    </div>
  )
}

export default Onboarding
