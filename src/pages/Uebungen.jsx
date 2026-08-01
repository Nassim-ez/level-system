import { useState } from 'react'
import Panel from '../components/Panel.jsx'
import Koerperkarte from '../components/Koerperkarte.jsx'
import { useGame } from '../context/GameContext.jsx'
import { UEBUNGEN, KATEGORIE_NAMEN } from '../data/uebungen.js'
import { QUESTS, aktuelleVariante } from '../data/quests.js'
import { RANKS } from '../data/ranks.js'

const orbitron = { fontFamily: "'Orbitron', sans-serif" }

const FILTER = [
  { id: 'alle', name: 'Alle' },
  ...Object.entries(KATEGORIE_NAMEN).map(([id, name]) => ({ id, name })),
]

/* --------------------------------------------------------------------- */
/* Schwierigkeit als fünf Punkte                                          */
/* --------------------------------------------------------------------- */
function Stufenpunkte({ stufe, gedaempft = false }) {
  return (
    <span
      className="flex shrink-0 items-center gap-[3px]"
      title={`Schwierigkeit ${stufe} von 5`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <i
          key={n}
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background:
              n <= stufe
                ? gedaempft
                  ? 'var(--dim)'
                  : 'var(--xp)'
                : 'transparent',
            border: `1px solid ${n <= stufe ? 'transparent' : 'var(--line)'}`,
          }}
        />
      ))}
    </span>
  )
}

function KategorieBadge({ kategorie }) {
  return (
    <span
      className="shrink-0 px-1.5 py-0.5"
      style={{
        ...orbitron,
        fontSize: 7,
        letterSpacing: '1px',
        color: 'var(--glow)',
        border: '1px solid rgba(63,182,255,.4)',
        borderRadius: 6,
      }}
    >
      {KATEGORIE_NAMEN[kategorie]?.toUpperCase() ?? kategorie}
    </span>
  )
}

/* --------------------------------------------------------------------- */
/* Übersicht                                                              */
/* --------------------------------------------------------------------- */
function Uebersicht({ onOeffnen, onZurueck }) {
  const [filter, setFilter] = useState('alle')
  const liste =
    filter === 'alle'
      ? UEBUNGEN
      : UEBUNGEN.filter((u) => u.kategorie === filter)

  return (
    <div className="flex flex-col gap-4">
      <Panel title="ÜBUNGEN">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p style={{ fontSize: '12px', color: 'var(--dim)' }}>
            {liste.length} Übungen · Ausführung, Fehler und Varianten
          </p>
          <button
            type="button"
            onClick={onZurueck}
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
            ZURÜCK
          </button>
        </div>

        {/* Filterleiste */}
        <div className="flex flex-wrap gap-1.5">
          {FILTER.map((f) => {
            const aktiv = filter === f.id
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className="bg-transparent px-2.5 py-1"
                style={{
                  ...orbitron,
                  fontSize: 9,
                  letterSpacing: '1px',
                  color: aktiv ? 'var(--glow)' : 'var(--dim)',
                  border: `1px solid ${aktiv ? 'var(--glow)' : 'var(--line)'}`,
                  background: aktiv ? 'rgba(63,182,255,.08)' : 'transparent',
                  borderRadius: 8,
                }}
              >
                {f.name.toUpperCase()}
              </button>
            )
          })}
        </div>

        <div className="mt-3 flex flex-col gap-2">
          {liste.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => onOeffnen(u.id)}
              className="w-full border p-3 text-left"
              style={{
                borderColor: 'var(--line)',
                borderRadius: 12,
                background: 'transparent',
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="min-w-0 truncate text-[15px] font-semibold">
                  {u.name}
                </p>
                <Stufenpunkte stufe={u.stufe} />
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <KategorieBadge kategorie={u.kategorie} />
                {u.geraet && (
                  <span style={{ fontSize: '11px', color: 'var(--warn)' }}>
                    benötigt: {u.geraet}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </Panel>

      <Hinweisfuss />
    </div>
  )
}

/* --------------------------------------------------------------------- */
/* Detailansicht                                                          */
/* --------------------------------------------------------------------- */
function Detail({ uebung, state, dispatch, onZurueck }) {
  const rank = state.rank
  const eigenerIndex = RANKS.indexOf(rank)
  // Gehört zu dieser Übung eine Tages-Quest? Dann ist die Stufe wählbar.
  const questId = Object.values(QUESTS).find((q) => q.uebungId === uebung.id)?.id
  const gewaehlt = questId ? aktuelleVariante(questId, state) : null

  return (
    <div className="flex flex-col gap-4">
      <Panel title={KATEGORIE_NAMEN[uebung.kategorie]?.toUpperCase() ?? 'ÜBUNG'}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[19px] font-semibold">{uebung.name}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <KategorieBadge kategorie={uebung.kategorie} />
              <Stufenpunkte stufe={uebung.stufe} />
              <span style={{ fontSize: '11px', color: 'var(--dim)' }}>
                Stufe {uebung.stufe} / 5
              </span>
            </div>
            <p className="mt-1" style={{ fontSize: '12px', color: 'var(--dim)' }}>
              Gerät:{' '}
              {uebung.geraet ? (
                <span style={{ color: 'var(--warn)' }}>{uebung.geraet}</span>
              ) : (
                'keines nötig'
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onZurueck}
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
            ZURÜCK
          </button>
        </div>

        <div className="mt-3">
          <Koerperkarte primaer={uebung.primaer} sekundaer={uebung.sekundaer} />
        </div>
      </Panel>

      <Panel title="AUSFÜHRUNG">
        <ol className="flex flex-col gap-2">
          {uebung.ausfuehrung.map((schritt, i) => (
            <li key={i} className="flex gap-2.5">
              <span
                className="grid shrink-0 place-items-center"
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  border: '1px solid rgba(63,182,255,.45)',
                  ...orbitron,
                  fontSize: 9,
                  color: 'var(--glow)',
                }}
              >
                {i + 1}
              </span>
              <span style={{ fontSize: '13.5px', lineHeight: 1.55 }}>{schritt}</span>
            </li>
          ))}
        </ol>
      </Panel>

      <Panel title="HÄUFIGE FEHLER">
        <ul className="flex flex-col gap-2">
          {uebung.fehler.map((f, i) => (
            <li key={i} className="flex gap-2.5">
              <span className="shrink-0" style={{ color: 'var(--warn)', fontSize: 13 }}>
                ⚠
              </span>
              <span style={{ fontSize: '13.5px', lineHeight: 1.55 }}>{f}</span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="HINTERGRUND">
        <p style={{ fontSize: '13.5px', lineHeight: 1.6 }}>{uebung.hinweis}</p>
        <div className="mt-3 flex flex-col gap-1.5">
          {uebung.belege.map((b, i) => (
            <p key={i} style={{ fontSize: '11px', lineHeight: 1.5, color: 'var(--dim)' }}>
              {b}
            </p>
          ))}
        </div>
      </Panel>

      <Panel title="VARIANTEN">
        {questId && (
          <p className="mb-2" style={{ fontSize: '11.5px', color: 'var(--dim)' }}>
            Deine Wahl gilt bis zum nächsten Rangwechsel. Eine leichtere Stufe
            lässt die Wiederholungszahl unverändert.
          </p>
        )}
        <div className="flex flex-col gap-2">
          {uebung.varianten.map((v, i) => {
            const index = RANKS.indexOf(v.rang)
            const gesperrt = index > eigenerIndex
            // Hervorgehoben wird, was gerade als Tagesziel gilt; ohne
            // Quest-Bezug bleibt es beim Rangvergleich
            const passend = gewaehlt
              ? gewaehlt.index === i
              : !gesperrt && v.rang === rank
            return (
              <div
                key={i}
                className="border p-2.5"
                style={{
                  borderColor: passend ? 'var(--glow)' : 'var(--line)',
                  borderRadius: 12,
                  background: passend ? 'rgba(63,182,255,.07)' : 'transparent',
                  opacity: gesperrt ? 0.45 : 1,
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <p
                    className="min-w-0 truncate text-[14px] font-semibold"
                    style={{ color: passend ? 'var(--glow)' : 'var(--text)' }}
                  >
                    {v.name}
                  </p>
                  <div className="flex shrink-0 items-center gap-2">
                    <Stufenpunkte stufe={v.stufe} gedaempft={gesperrt} />
                    {gesperrt && (
                      <span
                        style={{
                          ...orbitron,
                          fontSize: 8,
                          letterSpacing: '1px',
                          color: 'var(--dim)',
                        }}
                      >
                        AB RANG {v.rang}
                      </span>
                    )}
                    {passend && (
                      <span
                        style={{
                          ...orbitron,
                          fontSize: 8,
                          letterSpacing: '1px',
                          color: 'var(--glow)',
                        }}
                      >
                        {questId ? 'TAGESZIEL' : 'DEIN RANG'}
                      </span>
                    )}
                  </div>
                </div>
                <p className="mt-0.5" style={{ fontSize: '11.5px', color: 'var(--dim)' }}>
                  {v.tipp}
                </p>
                {questId && !gesperrt && !passend && (
                  <button
                    type="button"
                    onClick={() =>
                      dispatch({ type: 'SET_VARIANTE', questId, index: i })
                    }
                    className="mt-2 w-full bg-transparent px-3 py-1.5"
                    style={{
                      ...orbitron,
                      fontSize: 9,
                      letterSpacing: '1.5px',
                      color: 'var(--glow)',
                      border: '1px solid rgba(63,182,255,.5)',
                      borderRadius: 9,
                    }}
                  >
                    ALS TAGESZIEL WÄHLEN
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </Panel>

      <Hinweisfuss />
    </div>
  )
}

function Hinweisfuss() {
  return (
    <p
      className="px-1 pb-1"
      style={{ fontSize: '11px', lineHeight: 1.5, color: 'var(--dim)' }}
    >
      Diese Angaben ersetzen keine ärztliche oder physiotherapeutische Beratung.
      Bei Schmerzen oder Vorerkrankungen halte Rücksprache.
    </p>
  )
}

/* --------------------------------------------------------------------- */
function Uebungen({ onZurueck, startUebung = null }) {
  const { state, dispatch } = useGame()
  const [offen, setOffen] = useState(startUebung)
  const uebung = offen ? UEBUNGEN.find((u) => u.id === offen) : null

  if (uebung) {
    return (
      <Detail
        uebung={uebung}
        state={state}
        dispatch={dispatch}
        // Wer direkt auf einer Übung eingestiegen ist, kommt mit einem Schritt
        // wieder dorthin zurück, statt in der Liste zu landen
        onZurueck={() =>
          offen === startUebung ? onZurueck() : setOffen(null)
        }
      />
    )
  }
  return <Uebersicht onOeffnen={setOffen} onZurueck={onZurueck} />
}

export default Uebungen
