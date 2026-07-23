import { useState } from 'react'
import { useGame } from '../context/GameContext.jsx'
import { GENDERS, anrede } from '../data/gender.js'

const orbitron = { fontFamily: "'Orbitron', sans-serif" }

const QUESTIONS = [
  {
    frage: 'Wie viele Liegestütze schaffst du am Stück?',
    optionen: ['0–10', '10–25', '25–50', '50+'],
  },
  {
    frage: 'Wie oft trainierst du pro Woche?',
    optionen: ['Gar nicht', '1–2x', '3–4x', '5+'],
  },
  {
    frage: 'Klimmzüge am Stück?',
    optionen: ['0', '1–5', '5–10', '10+'],
  },
]

function rankFromScore(score) {
  if (score <= 2) return 'E'
  if (score <= 5) return 'D'
  if (score <= 7) return 'C'
  return 'B'
}

function Onboarding() {
  const { dispatch } = useGame()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [gender, setGender] = useState(null)
  const [answers, setAnswers] = useState([])

  const score = answers.reduce((sum, a) => sum + a, 0)
  const rank = rankFromScore(score)
  const firstQuestion = 2
  const resultStep = QUESTIONS.length + firstQuestion

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

      {step >= firstQuestion && step < resultStep && (
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
          <p className="mt-3 text-[15px]">
            {QUESTIONS[step - firstQuestion].frage}
          </p>
          <div className="mt-4 flex flex-col gap-2">
            {QUESTIONS[step - firstQuestion].optionen.map((option, index) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setAnswers([...answers, index])
                  setStep(step + 1)
                }}
                className="w-full bg-transparent px-4 py-3"
                style={{
                  fontSize: '15px',
                  color: 'var(--text)',
                  background: 'var(--panel)',
                  border: '1px solid var(--line)',
                  borderRadius: '12px',
                  boxShadow: '0 0 12px rgba(63,182,255,.08)',
                }}
              >
                {option}
              </button>
            ))}
          </div>
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
              dispatch({ type: 'COMPLETE_ONBOARDING', name, gender, rank })
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
