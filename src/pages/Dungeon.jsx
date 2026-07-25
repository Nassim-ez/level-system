import { useEffect, useState } from 'react'
import Panel from '../components/Panel.jsx'
import { useGame } from '../context/GameContext.jsx'
import {
  GEFAHRSTUFEN,
  HOEHERE_DUNGEONS,
  dungeonsByRank,
  findDungeon,
} from '../data/dungeons.js'
import DungeonFight from './DungeonFight.jsx'

const orbitron = { fontFamily: "'Orbitron', sans-serif" }

function GateOverlay({ onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2200)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: 'rgba(2,4,9,.88)', backdropFilter: 'blur(4px)' }}
    >
      <div className="text-center">
        <svg width="120" height="120" viewBox="0 0 120 120" className="mx-auto">
          {/* Zwei Torflügel, die sich schließen */}
          <g fill="none" stroke="var(--danger)" strokeWidth="2">
            <path d="M20 100 L20 40 Q20 20 44 20 L44 100">
              <animate
                attributeName="opacity"
                values="0.3;1;0.6"
                dur="2s"
                repeatCount="indefinite"
              />
            </path>
            <path d="M100 100 L100 40 Q100 20 76 20 L76 100">
              <animate
                attributeName="opacity"
                values="0.3;1;0.6"
                dur="2s"
                repeatCount="indefinite"
              />
            </path>
            <line x1="20" y1="100" x2="100" y2="100" />
          </g>
          <g stroke="var(--danger)" strokeWidth="3" strokeLinecap="round">
            <line x1="44" y1="60" x2="44" y2="60">
              <animate
                attributeName="x2"
                values="44;60"
                dur="1.1s"
                fill="freeze"
              />
            </line>
            <line x1="76" y1="60" x2="76" y2="60">
              <animate
                attributeName="x2"
                values="76;60"
                dur="1.1s"
                fill="freeze"
              />
            </line>
          </g>
        </svg>
        <p
          className="mt-6"
          style={{
            ...orbitron,
            fontSize: '18px',
            letterSpacing: '3px',
            color: 'var(--danger)',
            textShadow: '0 0 18px rgba(255,77,94,.9)',
          }}
        >
          DAS TOR SCHLIESST SICH
        </p>
        <p className="mt-2" style={{ fontSize: '13px', color: 'var(--dim)' }}>
          Es öffnet sich erst wieder, wenn der Boss fällt – oder du.
        </p>
      </div>
    </div>
  )
}

function Auswahl({ state, dispatch }) {
  const eigene = dungeonsByRank(state.rank)

  return (
    <div className="flex flex-col gap-4">
      <Panel title={`DUNGEONS · RANG ${state.rank}`}>
        {eigene.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--dim)' }}>
            Für deinen Rang sind noch keine Dungeons hinterlegt.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {eigene.map((d) => {
              const gefahr = GEFAHRSTUFEN[d.gefahr]
              const gesperrt = state.dungeon.inside && state.dungeon.run !== d.id
              return (
                <button
                  key={d.id}
                  type="button"
                  disabled={gesperrt}
                  onClick={() => dispatch({ type: 'DUNGEON_SELECT', runId: d.id })}
                  className="w-full border p-3 text-left disabled:opacity-40"
                  style={{
                    borderColor: 'var(--line)',
                    borderRadius: '12px',
                    background: 'transparent',
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p
                      className="text-[16px] font-semibold"
                      style={{ color: gefahr.color }}
                    >
                      {d.name}
                    </p>
                    <span
                      className="shrink-0 px-2 py-0.5"
                      style={{
                        ...orbitron,
                        fontSize: '8px',
                        letterSpacing: '1px',
                        color: gefahr.color,
                        border: `1px solid ${gefahr.color}`,
                        borderRadius: '6px',
                      }}
                    >
                      {gefahr.name.toUpperCase()}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--dim)' }}>
                    {d.beschreibung}
                    {gesperrt && ' · GESPERRT'}
                  </p>
                </button>
              )
            })}
          </div>
        )}
        {state.dungeon.inside && (
          <p className="mt-3" style={{ fontSize: '12px', color: 'var(--danger)' }}>
            Du bist bereits in einem Dungeon. Andere Tore bleiben verschlossen,
            bis du ihn beendest.
          </p>
        )}
      </Panel>

      <Panel title="HÖHERE RÄNGE">
        <div className="flex flex-col gap-2">
          {HOEHERE_DUNGEONS.map((d) => (
            <div
              key={d.name}
              className="flex items-center justify-between gap-3 border p-3"
              style={{ borderColor: 'var(--line)', borderRadius: '12px', opacity: 0.4 }}
            >
              <div className="min-w-0">
                <p
                  className="text-[15px] font-semibold"
                  style={{ color: GEFAHRSTUFEN[d.gefahr].color }}
                >
                  {d.name}
                </p>
                <p style={{ fontSize: '11px', color: 'var(--dim)' }}>
                  Rang {d.rank} · Boss: {d.boss}
                </p>
              </div>
              <span
                className="shrink-0 px-2 py-0.5"
                style={{
                  ...orbitron,
                  fontSize: '9px',
                  letterSpacing: '1px',
                  color: 'var(--dim)',
                  border: '1px solid var(--line)',
                  borderRadius: '8px',
                }}
              >
                {d.rank}-RANG
              </span>
            </div>
          ))}
        </div>
        <p className="mt-3" style={{ fontSize: '12px', color: 'var(--dim)' }}>
          Dein Rang bestimmt den Zugang. Als D-Rang öffnen sich E- und
          D-Dungeons.
        </p>
      </Panel>
    </div>
  )
}

function Tuerkarte({ state, dispatch, dungeon, onFight }) {
  const { progress, inside, door } = state.dungeon
  const geschafft = dungeon.tueren.filter((t) => progress[t.nr]).length
  const naechste = dungeon.tueren.find((t) => !progress[t.nr])
  const gefahr = GEFAHRSTUFEN[dungeon.gefahr]

  return (
    <div className="flex flex-col gap-4">
      {inside && (
        <div
          className="border px-3 py-2 text-center"
          style={{
            borderColor: 'rgba(255,77,94,.5)',
            borderRadius: '12px',
            background: 'rgba(255,77,94,.06)',
          }}
        >
          <p
            style={{
              ...orbitron,
              fontSize: '10px',
              letterSpacing: '2px',
              color: 'var(--danger)',
            }}
          >
            TOR GESCHLOSSEN · DU BIST IM DUNGEON · TÜR{' '}
            {door || Math.min(geschafft + 1, dungeon.tueren.length)}/
            {dungeon.tueren.length}
          </p>
        </div>
      )}

      <Panel title={dungeon.name.toUpperCase()} accent={gefahr.color}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <p style={{ fontSize: '12px', color: 'var(--dim)' }}>
            {dungeon.beschreibung}
          </p>
          {!inside && (
            <button
              type="button"
              onClick={() => dispatch({ type: 'DUNGEON_BACK' })}
              className="shrink-0 bg-transparent px-3 py-1.5"
              style={{
                ...orbitron,
                fontSize: '9px',
                letterSpacing: '2px',
                color: 'var(--dim)',
                border: '1px solid var(--line)',
                borderRadius: '8px',
              }}
            >
              ZURÜCK
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {dungeon.tueren.map((tuer) => {
            const fertig = !!progress[tuer.nr]
            const offen = naechste?.nr === tuer.nr
            const aktiv = inside && door === tuer.nr
            const farbe = fertig
              ? 'var(--ok)'
              : offen
                ? tuer.boss
                  ? 'var(--danger)'
                  : 'var(--glow)'
                : '#31465f'
            return (
              <div
                key={tuer.nr}
                className="border p-3"
                style={{
                  borderColor: tuer.boss
                    ? 'rgba(255,77,94,.5)'
                    : aktiv
                      ? 'var(--glow)'
                      : 'var(--line)',
                  borderRadius: '12px',
                  boxShadow: aktiv ? '0 0 14px rgba(63,182,255,.25)' : 'none',
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="w-[22px] shrink-0 text-center"
                      style={{ ...orbitron, fontSize: '15px', color: farbe }}
                    >
                      {tuer.boss ? '★' : tuer.nr}
                    </span>
                    <div className="min-w-0">
                      <p
                        className="text-[15px] font-semibold"
                        style={{ color: fertig || offen ? 'var(--text)' : '#31465f' }}
                      >
                        {offen || fertig ? tuer.name : '???'}
                      </p>
                      <p style={{ fontSize: '11px', color: 'var(--dim)' }}>
                        {offen || fertig
                          ? `${tuer.anzahl > 1 ? `${tuer.anzahl} Gegner · je ` : ''}${tuer.hp} HP`
                          : 'Unbekannt'}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      style={{
                        ...orbitron,
                        fontSize: '9px',
                        letterSpacing: '1px',
                        color: farbe,
                      }}
                    >
                      {fertig ? 'GESCHAFFT' : offen ? 'OFFEN' : 'VERSCHLOSSEN'}
                    </p>
                    {offen && !aktiv && (
                      <button
                        type="button"
                        onClick={() => {
                          dispatch({ type: 'DUNGEON_OPEN_DOOR', nr: tuer.nr })
                          onFight()
                        }}
                        className="mt-1 bg-transparent px-3 py-1"
                        style={{
                          ...orbitron,
                          fontSize: '9px',
                          letterSpacing: '2px',
                          color: tuer.boss ? 'var(--danger)' : 'var(--glow)',
                          border: `1px solid ${tuer.boss ? 'var(--danger)' : 'var(--glow)'}`,
                          borderRadius: '8px',
                        }}
                      >
                        BETRETEN
                      </button>
                    )}
                    {aktiv && (
                      <button
                        type="button"
                        onClick={() => onFight()}
                        className="mt-1 bg-transparent px-3 py-1"
                        style={{
                          ...orbitron,
                          fontSize: '9px',
                          letterSpacing: '2px',
                          color: 'var(--glow)',
                          border: '1px solid var(--glow)',
                          borderRadius: '8px',
                        }}
                      >
                        KAMPF
                      </button>
                    )}
                  </div>
                </div>
                {aktiv && (
                  <p
                    className="mt-2"
                    style={{ fontSize: '11px', color: 'var(--dim)' }}
                  >
                    Angriff: {tuer.angriffsname} · {tuer.schaden} Schaden alle{' '}
                    {tuer.intervall}s · Block {Math.round(tuer.blockchance * 100)}%
                    {tuer.ausweichrate
                      ? ` · Ausweichen ${Math.round(tuer.ausweichrate * 100)}%`
                      : ''}
                    {tuer.combo ? ' · Combo' : ''}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        <p className="mt-3" style={{ fontSize: '11px', color: 'var(--dim)' }}>
          Dein Fortschritt wird gespeichert – auch wenn du die App schließt.
        </p>
      </Panel>

      {inside && (
        <Panel
          title="AUSWEG"
          accent="rgba(255,77,94,.4)"
          titleColor="var(--danger)"
          glow="rgba(255,77,94,.12)"
        >
          <p style={{ fontSize: '12px', color: 'var(--dim)' }}>
            Ein Rückkehrstein bringt dich sofort heraus. Dein Dungeon-Fortschritt
            verfällt, gesammelte XP behältst du – Beute gibt es keine.
          </p>
          <button
            type="button"
            disabled={state.dungeon.stones <= 0}
            onClick={() => dispatch({ type: 'DUNGEON_RETURN_STONE' })}
            className="mt-3 w-full bg-transparent px-4 py-2.5 disabled:opacity-40"
            style={{
              ...orbitron,
              fontSize: '10px',
              letterSpacing: '2px',
              color: 'var(--danger)',
              border: '1px solid var(--danger)',
              borderRadius: '10px',
            }}
          >
            RÜCKKEHRSTEIN BENUTZEN ({state.dungeon.stones})
          </button>
        </Panel>
      )}
    </div>
  )
}

function Dungeon() {
  const { state, dispatch } = useGame()
  const [gate, setGate] = useState(false)
  // Ein laufender Kampf wird nach App-Neustart direkt fortgesetzt
  const [imKampf, setImKampf] = useState(
    () => !!state.dungeon.fight && state.dungeon.door > 0,
  )
  const dungeon = findDungeon(state.dungeon.run)

  // Einmalige Einblendung, sobald sich das Tor schließt
  const [warInside, setWarInside] = useState(state.dungeon.inside)
  useEffect(() => {
    if (state.dungeon.inside && !warInside) setGate(true)
    setWarInside(state.dungeon.inside)
  }, [state.dungeon.inside, warInside])

  // Kampf nur mit betretener Tür; nach Sieg/Rückzug zurück zur Karte
  const kampfAktiv = imKampf && !gate && state.dungeon.door > 0
  useEffect(() => {
    if (state.dungeon.door === 0) setImKampf(false)
  }, [state.dungeon.door])

  return (
    <>
      {gate && <GateOverlay onDone={() => setGate(false)} />}
      {kampfAktiv && <DungeonFight onExit={() => setImKampf(false)} />}
      {dungeon ? (
        <Tuerkarte
          state={state}
          dispatch={dispatch}
          dungeon={dungeon}
          onFight={() => setImKampf(true)}
        />
      ) : (
        <Auswahl state={state} dispatch={dispatch} />
      )}
    </>
  )
}

export default Dungeon
