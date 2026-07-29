import { useRef, useState } from 'react'
import Panel from '../components/Panel.jsx'
import { useGame } from '../context/GameContext.jsx'
import {
  ITEMS,
  MATERIALIEN,
  SLOT_LABELS,
  aufwertKosten,
  schmelzErtrag,
  rangObergrenze,
  hochgestuft,
  effektListe,
  raritaet,
} from '../data/items.js'

const orbitron = { fontFamily: "'Orbitron', sans-serif" }

const SPRUECHE = {
  start: 'Bring mir, was du nicht mehr brauchst. Aus Altem wird Neues.',
  melt: 'Der Ofen ist heiß. Was soll hinein?',
  up: 'Zeig her. Mit genug Material mache ich mehr daraus.',
}

/* --------------------------------------------------------------------- */
/* Szene: Kapuzenfigur mit Laterne, Glut, Lichtschächten                   */
/* --------------------------------------------------------------------- */
function Huette({ spruch, figurAnim }) {
  return (
    <div
      className="relative mb-3 overflow-hidden"
      style={{
        height: 230,
        border: '1px solid #2a2338',
        borderRadius: 16,
        background:
          'radial-gradient(ellipse 60% 45% at 50% 38%,rgba(255,179,71,.16),transparent 70%),linear-gradient(180deg,#0b0a12 0%,#0a0d16 60%,#070910 100%)',
      }}
    >
      {/* Lichtschächte */}
      <div className="absolute inset-0" style={{ opacity: 0.5 }}>
        {['22%', '47%', '71%'].map((l) => (
          <i
            key={l}
            className="absolute top-0"
            style={{
              left: l,
              width: 1,
              height: '100%',
              background:
                'linear-gradient(180deg,rgba(255,179,71,.25),transparent)',
            }}
          />
        ))}
      </div>

      {/* Glutfunken */}
      {[
        { left: '26%', dur: 5.4, delay: 0 },
        { left: '44%', dur: 6.8, delay: 1.4 },
        { left: '63%', dur: 6, delay: 2.9 },
        { left: '76%', dur: 7.2, delay: 4.1 },
      ].map((e) => (
        <span
          key={e.left}
          className="ember"
          style={{
            left: e.left,
            animationDuration: `${e.dur}s`,
            animationDelay: `${e.delay}s`,
          }}
        />
      ))}

      {/* Figur */}
      <div
        className="absolute"
        style={{ left: '50%', top: 14, transform: 'translateX(-50%)', width: 190, height: 190 }}
      >
        <svg
          viewBox="0 0 200 200"
          style={{
            width: '100%',
            height: '100%',
            overflow: 'visible',
            filter: 'drop-shadow(0 0 16px rgba(255,179,71,.25))',
          }}
        >
          <g id="merch" className={figurAnim}>
            {/* Umhang */}
            <path
              d="M100 40 q34 8 40 46 l14 92 q-54 16 -108 0 l14 -92 q6 -38 40 -46 z"
              fill="#161226"
              stroke="#4a3f6b"
              strokeWidth="1.6"
            />
            <path
              d="M46 178 q14 8 26 2 q12 8 28 2 q16 6 28 -2 q14 6 26 -2 l2 8 q-56 16 -112 0 z"
              fill="#0f0c1c"
              stroke="#4a3f6b"
              strokeWidth="1.2"
            />
            {/* Kapuze */}
            <path
              d="M100 22 q30 4 32 34 q-32 16 -64 0 q2 -30 32 -34 z"
              fill="#1c1730"
              stroke="#5b4d85"
              strokeWidth="1.6"
            />
            <path d="M76 52 q24 12 48 0 q-4 18 -24 20 q-20 -2 -24 -20 z" fill="#080610" />
            <g className="hoodeye" fill="#ffb347">
              <circle cx="91" cy="58" r="2.8" />
              <circle cx="109" cy="58" r="2.8" />
              <circle cx="91" cy="58" r="6" opacity=".22" />
              <circle cx="109" cy="58" r="6" opacity=".22" />
            </g>
            {/* Runen */}
            <g stroke="#7f6bd6" strokeWidth="1.4" fill="none" opacity=".75">
              <path d="M84 104 h16 M92 96 v16" />
              <path d="M110 118 l8 8 M118 118 l-8 8" />
              <path d="M80 134 q10 -6 20 0" />
            </g>
            {/* Arm mit Laterne */}
            <path
              d="M132 74 q14 6 16 22"
              stroke="#4a3f6b"
              strokeWidth="7"
              fill="none"
              strokeLinecap="round"
            />
            <g className="lant">
              <line x1="132" y1="66" x2="132" y2="96" stroke="#5b4d85" strokeWidth="1.4" />
              <path
                d="M120 96 h24 l4 8 v22 l-4 8 h-24 l-4 -8 v-22 z"
                fill="#120f1e"
                stroke="#7a6494"
                strokeWidth="1.4"
              />
              <g className="flame">
                <ellipse cx="132" cy="117" rx="8" ry="11" fill="#ffb347" opacity=".85" />
                <ellipse cx="132" cy="119" rx="4" ry="6" fill="#fff3d6" />
                <circle cx="132" cy="117" r="22" fill="#ffb347" opacity=".14" />
              </g>
            </g>
            {/* Arm über der Brust */}
            <path
              d="M68 78 q-12 14 -6 30 q18 10 34 2"
              stroke="#4a3f6b"
              strokeWidth="7"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        </svg>
      </div>

      {/* Abgedunkelte Ränder */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%,transparent 45%,rgba(0,0,0,.55) 100%)',
        }}
      />

      {/* Sprechzeile */}
      <div
        className="absolute text-center"
        style={{
          left: 12,
          right: 12,
          bottom: 9,
          fontSize: '13.5px',
          color: '#e6d3ae',
          textShadow: '0 0 12px rgba(255,179,71,.35)',
          lineHeight: 1.45,
          minHeight: 38,
        }}
      >
        <b
          style={{
            ...orbitron,
            display: 'block',
            fontSize: '9px',
            letterSpacing: '3px',
            color: '#ffb347',
            marginBottom: 4,
          }}
        >
          DER SCHMIED IM ZWIELICHT
        </b>
        {spruch}
      </div>
    </div>
  )
}

/* --------------------------------------------------------------------- */
/* Item-Zeile                                                              */
/* --------------------------------------------------------------------- */
function Zeile({ item, rechts, unterzeile, beschaedigt, gone, blitzt, refCb }) {
  const rar = raritaet(item)
  const prisma = rar?.prisma
  return (
    <div
      ref={refCb}
      className={`relative flex items-center gap-[11px] border-b py-[11px] ${gone ? 'row-gone' : ''}`}
      style={{ borderColor: 'rgba(27,58,92,.45)', paddingInline: 4 }}
    >
      <div
        className={`relative grid shrink-0 place-items-center ${blitzt ? 'ic-up' : ''} ${prisma ? 'prisma' : ''}`}
        style={{
          width: 38,
          height: 38,
          borderRadius: 11,
          fontSize: 15,
          border: `1px solid rgba(${rar?.rgb},.5)`,
          color: prisma ? '#0a0f18' : rar?.color,
          background: prisma ? undefined : `rgba(${rar?.rgb},.08)`,
          transition: '.45s',
        }}
      >
        ◆
        {beschaedigt && (
          <span
            className="absolute grid place-items-center"
            style={{
              top: -4,
              right: -4,
              width: 15,
              height: 15,
              borderRadius: '50%',
              background: '#1a0e12',
              border: '1px solid var(--danger)',
              color: 'var(--danger)',
              fontSize: 8,
            }}
          >
            ✕
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] font-semibold">{item.name}</div>
        <div style={{ fontSize: '11.5px', color: 'var(--dim)', marginTop: 1 }}>
          {unterzeile}
        </div>
      </div>

      <span
        className={prisma ? 'prisma' : ''}
        style={{
          ...orbitron,
          fontSize: '7.5px',
          letterSpacing: '1.5px',
          borderRadius: 7,
          padding: '2px 7px',
          border: `1px solid rgba(${rar?.rgb},.5)`,
          color: prisma ? '#0a0f18' : rar?.color,
          background: prisma ? undefined : `rgba(${rar?.rgb},.08)`,
          whiteSpace: 'nowrap',
        }}
      >
        {rar?.name.toUpperCase()}
      </span>

      {rechts}
    </div>
  )
}

// Effekte farbig: Vorteile in var(--xp), Nachteile in var(--danger)
function Effekte({ item }) {
  const liste = effektListe(item)
  if (liste.length === 0) return null
  return (
    <span>
      {liste.map((e, i) => (
        <span key={e.key}>
          {i > 0 && <span style={{ color: 'var(--dim)' }}> · </span>}
          <span style={{ color: e.wert > 0 ? 'var(--xp)' : 'var(--danger)' }}>
            {e.wert > 0 ? '+' : '−'}
            {Math.abs(e.wert)}% {e.label}
          </span>
        </span>
      ))}
    </span>
  )
}

function Knopf({ text, onClick, aus, fix }) {
  return (
    <button
      type="button"
      disabled={aus}
      onClick={onClick}
      className="shrink-0"
      style={{
        ...orbitron,
        fontSize: '8.5px',
        letterSpacing: '1px',
        borderRadius: 9,
        padding: '8px 10px',
        whiteSpace: 'nowrap',
        background: aus
          ? 'transparent'
          : fix
            ? 'rgba(255,179,71,.08)'
            : 'rgba(63,182,255,.08)',
        border: `1px solid ${aus ? '#2a3a52' : fix ? '#ffb347' : 'var(--glow)'}`,
        color: aus ? '#3f5470' : fix ? '#ffb347' : 'var(--glow)',
        cursor: aus ? 'not-allowed' : 'pointer',
      }}
    >
      {text}
    </button>
  )
}

/* --------------------------------------------------------------------- */
function Haendler({ onBack }) {
  const { state, dispatch } = useGame()
  const [tab, setTab] = useState('melt')
  const [spruch, setSpruch] = useState(SPRUECHE.start)
  const [figurAnim, setFigurAnim] = useState('')
  const [gone, setGone] = useState(null)
  const [blitz, setBlitz] = useState(null)
  const [popMat, setPopMat] = useState(null)
  const [funken, setFunken] = useState([])
  const zeilenRefs = useRef({})
  const matRefs = useRef({})
  const timers = useRef([])

  const grenze = rangObergrenze(state.rank)

  const animiere = (klasse) => {
    setFigurAnim(klasse)
    timers.current.push(setTimeout(() => setFigurAnim(''), 900))
  }

  const wechsle = (v) => {
    setTab(v)
    setSpruch(v === 'melt' ? SPRUECHE.melt : SPRUECHE.up)
  }

  // Funken von der Zeile in den Materialbeutel
  const sprueheFunken = (itemId, material) => {
    const von = zeilenRefs.current[itemId]?.getBoundingClientRect()
    const nach = matRefs.current[material]?.getBoundingClientRect()
    if (!von || !nach) return
    const farbe = MATERIALIEN[material].color
    const neue = Array.from({ length: 8 }, (_, i) => ({
      id: `${Date.now()}-${i}`,
      farbe,
      x: von.left + von.width / 2,
      y: von.top + von.height / 2,
      dx: nach.left + nach.width / 2 - (von.left + von.width / 2) + (Math.random() * 30 - 15),
      dy: nach.top + nach.height / 2 - (von.top + von.height / 2) + (Math.random() * 20 - 10),
      dauer: 600 + Math.random() * 260,
    }))
    setFunken((f) => [...f, ...neue])
    timers.current.push(
      setTimeout(() => setFunken((f) => f.filter((x) => !neue.includes(x))), 900),
    )
  }

  function schmelzen(item) {
    const ertrag = schmelzErtrag(item.rar)
    sprueheFunken(item.id, item.material)
    setGone(item.id)
    animiere('nod')
    setSpruch(
      `Der Ofen nimmt ${item.name}. ${ertrag} × ${MATERIALIEN[item.material].name} für dich.`,
    )
    timers.current.push(
      setTimeout(() => {
        dispatch({ type: 'MELT_ITEM', itemId: item.id })
        setGone(null)
        setPopMat(item.material)
        timers.current.push(setTimeout(() => setPopMat(null), 600))
      }, 520),
    )
  }

  function aufwerten(item, beschaedigt) {
    const ziel = hochgestuft(item.id)
    if (!ziel) return
    setBlitz(item.id)
    animiere('raise')
    setSpruch(
      beschaedigt
        ? 'Wiederhergestellt. Es trägt die alte Kraft zurück.'
        : `Sieh nur – ${raritaet(ITEMS[ziel])?.name}. Nicht schlecht für deinen Rang.`,
    )
    timers.current.push(
      setTimeout(() => {
        dispatch({ type: 'UPGRADE_ITEM', itemId: item.id })
        setBlitz(null)
      }, 400),
    )
  }

  // Inventar (schmelzbar) und Gesamtbesitz (aufwertbar)
  const inventar = state.inventory
    .map((id, i) => ({ id, i, item: ITEMS[id] }))
    .filter((e) => e.item?.rar != null)
  const getragen = Object.entries(state.equipment)
    .filter(([, id]) => id && ITEMS[id]?.rar != null)
    .map(([slot, id]) => ({ id, slot, item: ITEMS[id] }))

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-3 bg-transparent px-3 py-1.5"
        style={{
          ...orbitron,
          fontSize: '9px',
          letterSpacing: '2px',
          color: 'var(--dim)',
          border: '1px solid var(--line)',
          borderRadius: 9,
        }}
      >
        ‹ ZURÜCK
      </button>

      <Huette spruch={spruch} figurAnim={figurAnim} />

      {/* Tabs */}
      <div className="mb-3 grid grid-cols-2 gap-2">
        {[
          ['melt', 'SCHMELZEN'],
          ['up', 'AUFWERTEN'],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => wechsle(id)}
            style={{
              ...orbitron,
              fontSize: '10px',
              letterSpacing: '2px',
              padding: 11,
              borderRadius: 12,
              background: tab === id ? 'rgba(63,182,255,.08)' : 'transparent',
              border: `1px solid ${tab === id ? 'var(--glow)' : 'var(--line)'}`,
              color: tab === id ? 'var(--glow)' : 'var(--dim)',
              boxShadow: tab === id ? '0 0 14px rgba(63,182,255,.18)' : 'none',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'melt' ? (
        <Panel title="SCHMELZOFEN">
          <p className="mb-2" style={{ fontSize: '12px', color: 'var(--dim)' }}>
            Items werden zu Material. Ausgerüstete Teile kannst du nicht
            einschmelzen.
          </p>
          {inventar.length === 0 && getragen.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--dim)' }}>
              Nichts da, was der Ofen nehmen könnte.
            </p>
          ) : (
            <>
              {inventar.map(({ id, i, item }) => (
                <Zeile
                  key={`${id}-${i}`}
                  item={item}
                  beschaedigt={!!state.damagedItems?.[id]}
                  gone={gone === id}
                  refCb={(el) => (zeilenRefs.current[id] = el)}
                  unterzeile={
                    <>
                      {schmelzErtrag(item.rar)} × {MATERIALIEN[item.material].name}
                      <br />
                      <Effekte item={item} />
                    </>
                  }
                  rechts={
                    <Knopf
                      text={`+${schmelzErtrag(item.rar)}`}
                      onClick={() => schmelzen(item)}
                    />
                  }
                />
              ))}
              {getragen.map(({ id, slot, item }) => (
                <Zeile
                  key={`eq-${slot}`}
                  item={item}
                  beschaedigt={!!state.damagedItems?.[id]}
                  unterzeile={
                    <>
                      Getragen · {SLOT_LABELS[slot]}
                      <br />
                      <Effekte item={item} />
                    </>
                  }
                  rechts={<Knopf text="AUSGERÜSTET" aus />}
                />
              ))}
            </>
          )}
        </Panel>
      ) : (
        <Panel title={`AUFWERTUNG · RANG ${state.rank}`}>
          <p className="mb-2" style={{ fontSize: '12px', color: 'var(--dim)' }}>
            Eine Stufe pro Vorgang. Höher als die Rarität deines Rangs geht
            nicht.
          </p>
          {inventar.length === 0 && getragen.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--dim)' }}>
              Du trägst nichts, was sich aufwerten ließe.
            </p>
          ) : (
            [...inventar, ...getragen].map((e, idx) => {
              const { id, item } = e
              const beschaedigt = !!state.damagedItems?.[id]
              const amMax = item.rar >= grenze && !beschaedigt
              const ziel = hochgestuft(id)
              const kosten = aufwertKosten(item.rar, beschaedigt)
              const vorrat = state.materials?.[item.material] ?? 0
              const reicht = kosten != null && vorrat >= kosten

              let rechts
              if (amMax || !ziel) {
                rechts = <Knopf text={`RANG ${state.rank} MAX`} aus />
              } else if (!reicht) {
                rechts = <Knopf text={`${kosten} NÖTIG`} aus />
              } else {
                rechts = (
                  <Knopf
                    text={beschaedigt ? `FIX ${kosten}` : `${kosten}`}
                    fix={beschaedigt}
                    onClick={() => aufwerten(item, beschaedigt)}
                  />
                )
              }

              const unterzeile =
                amMax || !ziel ? (
                  <Effekte item={item} />
                ) : (
                  `${beschaedigt ? 'Wiederherstellen · ' : ''}${raritaet(ITEMS[ziel])?.name} · ${kosten} × ${MATERIALIEN[item.material].name}`
                )

              return (
                <Zeile
                  key={`up-${id}-${idx}`}
                  item={item}
                  beschaedigt={beschaedigt}
                  blitzt={blitz === id}
                  unterzeile={unterzeile}
                  rechts={rechts}
                />
              )
            })
          )}
        </Panel>
      )}

      <Panel title="MATERIALBEUTEL">
        <div className="grid grid-cols-2 gap-2">
          {Object.values(MATERIALIEN).map((m) => (
            <div
              key={m.id}
              ref={(el) => (matRefs.current[m.id] = el)}
              className={`flex items-center gap-[9px] ${popMat === m.id ? 'mat-pop' : ''}`}
              style={{
                border: '1px solid var(--line)',
                borderRadius: 11,
                padding: '9px 10px',
                background: 'rgba(63,182,255,.03)',
              }}
            >
              <span
                className="shrink-0"
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: 2,
                  transform: 'rotate(45deg)',
                  background: m.color,
                }}
              />
              <span
                className="min-w-0 flex-1 truncate"
                style={{ fontSize: '12.5px', color: 'var(--dim)' }}
              >
                {m.name}
              </span>
              <span style={{ ...orbitron, fontSize: '13px', fontWeight: 700, color: m.color }}>
                {state.materials?.[m.id] ?? 0}
              </span>
            </div>
          ))}
        </div>
      </Panel>

      {/* Fliegende Funken */}
      {funken.map((f) => (
        <span
          key={f.id}
          className="spark"
          style={{
            left: f.x,
            top: f.y,
            background: f.farbe,
            '--dx': `${f.dx}px`,
            '--dy': `${f.dy}px`,
            animationDuration: `${f.dauer}ms`,
          }}
        />
      ))}
    </div>
  )
}

export default Haendler
