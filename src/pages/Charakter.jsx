import { useEffect, useRef, useState } from 'react'
import Panel from '../components/Panel.jsx'
import SlotIcon from '../components/SlotIcons.jsx'
import { useGame } from '../context/GameContext.jsx'
import {
  ITEMS,
  MATERIALIEN,
  SLOT_LABELS,
  EFFECT_LABEL,
  effektListe,
  istVorteil,
  summiereEffekte,
  zaehleSetTeile,
  raritaet,
} from '../data/items.js'
import { SETS, SET_LISTE, MAX_SET_TEILE, stufeErreicht } from '../data/sets.js'
import Haendler from './Haendler.jsx'

const orbitron = { fontFamily: "'Orbitron', sans-serif" }

const LINKS = ['helm', 'kette', 'umhang', 'brust']
const RECHTS = ['waffe', 'ring', 'hose', 'schuhe']

const LEER_FARBE = '#5b7fa8'
const KACHEL_RAHMEN = '#2f5a80'

/* --------------------------------------------------------------------- */
/* Slot-Kachel                                                            */
/* --------------------------------------------------------------------- */
function Kachel({ slot, itemId, gewaehlt, beschaedigt, blitzt, onSelect }) {
  const item = itemId ? ITEMS[itemId] : null
  const rar = raritaet(item)
  const belegt = !!item
  // Punkt in der Materialfarbe: zeigt auf einen Blick, was zusammengehört
  const material = item ? MATERIALIEN[item.material] : null
  // Rot bleibt Schaden vorbehalten: die Rarität färbt Rahmen und Symbol,
  // Beschädigung zeigt allein das Kreuz-Abzeichen
  const farbe = belegt ? (rar?.color ?? 'var(--xp)') : LEER_FARBE

  return (
    <button
      type="button"
      onClick={() => onSelect(slot)}
      className={`relative w-full ${blitzt ? 'kachel-flash' : ''}`}
      style={{
        aspectRatio: '1',
        background: belegt ? '#0e1826' : '#101a28',
        border: `${belegt ? 2 : 1}px solid ${
          gewaehlt ? 'var(--glow)' : belegt ? farbe : KACHEL_RAHMEN
        }`,
        borderRadius: 12,
        color: farbe,
        boxShadow: belegt
          ? `inset 0 0 12px rgba(${rar?.rgb ?? '143,224,255'},.22)`
          : 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        padding: 2,
      }}
    >
      <SlotIcon
        slot={slot}
        size="56%"
        style={{ filter: belegt ? `drop-shadow(0 0 5px ${farbe})` : 'none' }}
      />
      <span
        style={{
          ...orbitron,
          fontSize: 6,
          letterSpacing: '.5px',
          color: belegt ? farbe : '#7f9dbe',
          lineHeight: 1,
        }}
      >
        {SLOT_LABELS[slot]}
      </span>
      {!belegt && (
        <span
          className="absolute"
          style={{
            top: 3,
            right: 4,
            ...orbitron,
            fontSize: 8,
            color: LEER_FARBE,
            lineHeight: 1,
          }}
        >
          +
        </span>
      )}
      {belegt && material && (
        <span
          className="absolute"
          title={material.name}
          style={{
            bottom: 4,
            left: 4,
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: material.color,
            boxShadow: `0 0 5px ${material.color}`,
          }}
        />
      )}
      {belegt && beschaedigt && (
        <span
          className="absolute grid place-items-center"
          title="beschädigt"
          style={{
            top: -5,
            right: -5,
            width: 15,
            height: 15,
            borderRadius: '50%',
            background: '#1a0e12',
            border: '1px solid var(--danger)',
            color: 'var(--danger)',
            fontSize: 8,
            lineHeight: 1,
          }}
        >
          ✕
        </span>
      )}
    </button>
  )
}

/* --------------------------------------------------------------------- */
/* Charakterfeld – Platzhalter für ein späteres Charakterbild              */
/* --------------------------------------------------------------------- */
function Charakterfeld({ name, rank }) {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        aspectRatio: '3 / 4',
        border: `1px solid ${KACHEL_RAHMEN}`,
        borderRadius: 14,
        background:
          'radial-gradient(ellipse 70% 55% at 50% 42%,rgba(63,182,255,.16),transparent 70%),#0b1320',
      }}
    >
      <p
        className="absolute inset-x-0 text-center"
        style={{
          top: 7,
          ...orbitron,
          fontSize: 7,
          letterSpacing: '2px',
          color: '#7f9dbe',
        }}
      >
        CHARAKTERBILD
      </p>

      {/* Linien-Silhouette einer Person */}
      <svg
        viewBox="0 0 120 160"
        className="absolute inset-0 h-full w-full"
        style={{ padding: '18px 0 22px' }}
      >
        <g
          fill="none"
          stroke="rgba(63,182,255,.4)"
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="60" cy="30" r="11" />
          <path d="M60 41v14" />
          <path d="M42 62c4-5 11-7 18-7s14 2 18 7l3 26H39z" />
          <path d="M42 62L31 88l4 3 9-20" />
          <path d="M78 62l11 26-4 3-9-20" />
          <path d="M47 88l-3 40h9l4-30" />
          <path d="M73 88l3 40h-9l-4-30" />
          <path d="M41 128h13M66 128h13" />
        </g>
      </svg>

      <div
        className="absolute inset-x-0 px-1 text-center"
        style={{ bottom: 6, ...orbitron, letterSpacing: '1px', color: 'var(--glow)' }}
      >
        <p className="truncate" style={{ fontSize: 8, lineHeight: 1.3 }}>
          {name.toUpperCase()}
        </p>
        <p style={{ fontSize: 7, lineHeight: 1.3, color: 'var(--dim)' }}>
          RANG {rank}
        </p>
      </div>
    </div>
  )
}

/* --------------------------------------------------------------------- */
/* Effekt-Chips                                                           */
/* --------------------------------------------------------------------- */
function BoniChips({ equipment }) {
  const chips = Object.entries(summiereEffekte(equipment))
    // Was sich gegenseitig aufhebt, ist kein Bonus und wäre nur „−0%"
    .filter(([, wert]) => wert !== 0)
    .map(([key, wert]) => ({
      key,
      wert,
      vorteil: istVorteil(key, wert),
      label: EFFECT_LABEL[key] ?? key,
    }))
    .sort((a, b) => Number(b.vorteil) - Number(a.vorteil) || b.wert - a.wert)

  if (chips.length === 0) {
    return (
      <p style={{ fontSize: '12px', color: 'var(--dim)' }}>
        Noch nichts ausgerüstet. Lege Teile an, um ihre Wirkung hier zu sehen.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {chips.map((c) => {
        const farbe = c.vorteil ? 'var(--xp)' : 'var(--danger)'
        const rgb = c.vorteil ? '143,224,255' : '255,77,94'
        return (
          <span
            key={c.key}
            className="min-w-0 truncate px-2 py-1"
            style={{
              fontSize: '11px',
              color: farbe,
              border: `1px solid rgba(${rgb},.5)`,
              background: `rgba(${rgb},.07)`,
              borderRadius: 8,
            }}
          >
            {c.wert > 0 ? '+' : '−'}
            {Math.abs(c.wert)}% {c.label}
          </span>
        )
      })}
    </div>
  )
}

/* --------------------------------------------------------------------- */
/* Set-Boni – je Material, sobald mindestens ein Teil getragen wird        */
/* --------------------------------------------------------------------- */
function stufenText(effects) {
  return Object.entries(effects)
    .map(([key, wert]) => {
      const label = EFFECT_LABEL[key] ?? key
      return `${wert > 0 ? '+' : '−'}${Math.abs(wert)}% ${label}`
    })
    .join(' · ')
}

function SetZeile({ set, anzahl }) {
  const material = MATERIALIEN[set.id]
  const farbe = material?.color ?? 'var(--xp)'
  const anteil = Math.min(100, (anzahl / MAX_SET_TEILE) * 100)

  return (
    <div
      className="border p-2"
      style={{ borderColor: 'var(--line)', borderRadius: 12 }}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="min-w-0 truncate text-[14px] font-semibold" style={{ color: farbe }}>
          {set.name}
        </p>
        <span
          className="shrink-0"
          style={{ ...orbitron, fontSize: 10, letterSpacing: '1px', color: 'var(--dim)' }}
        >
          {anzahl} / {MAX_SET_TEILE}
        </span>
      </div>

      {/* Fortschritt in der Materialfarbe */}
      <div
        className="mt-1.5 overflow-hidden"
        style={{ height: 4, borderRadius: 3, background: 'rgba(27,58,92,.6)' }}
      >
        <div
          style={{
            width: `${anteil}%`,
            height: '100%',
            background: farbe,
            transition: 'width .3s',
          }}
        />
      </div>

      <p className="mt-1" style={{ fontSize: '11px', color: 'var(--dim)', lineHeight: 1.4 }}>
        {set.beschreibung}
      </p>

      <div className="mt-1.5 flex flex-col gap-0.5">
        {set.stufen.map((stufe) => {
          const aktiv = stufeErreicht(stufe, anzahl)
          return (
            <p
              key={stufe.teile}
              style={{
                fontSize: '11.5px',
                lineHeight: 1.45,
                color: aktiv ? 'var(--xp)' : 'var(--dim)',
                fontWeight: aktiv ? 600 : 400,
              }}
            >
              {aktiv ? '◆' : '◇'} {stufe.teile} Teile: {stufenText(stufe.effects)}
            </p>
          )
        })}
      </div>
    </div>
  )
}

function SetBoni({ equipment }) {
  const zaehler = zaehleSetTeile(equipment)
  // Nur Sets zeigen, von denen wirklich etwas am Körper ist
  const getragen = SET_LISTE.filter((set) => (zaehler[set.id] ?? 0) > 0).sort(
    (a, b) => (zaehler[b.id] ?? 0) - (zaehler[a.id] ?? 0),
  )
  if (getragen.length === 0) return null

  return (
    <Panel title="SET-BONI">
      <div className="flex flex-col gap-2">
        {getragen.map((set) => (
          <SetZeile key={set.id} set={set} anzahl={zaehler[set.id]} />
        ))}
      </div>
      <p className="mt-3" style={{ fontSize: '11px', color: 'var(--dim)' }}>
        Gezählt wird, was du trägst – ein Teil je Slot. Beide Stufen wirken
        zusammen, sobald du vier Teile eines Materials anlegst.
      </p>
    </Panel>
  )
}

/* --------------------------------------------------------------------- */
/* Item-Zeile der Slot-Liste                                              */
/* --------------------------------------------------------------------- */
function ItemZeile({ item, slot, beschaedigt, angelegt, onAction }) {
  const rar = raritaet(item)
  const farbe = rar?.color ?? 'var(--xp)'
  return (
    <div
      className="flex items-center gap-3 border p-2"
      style={{ borderColor: 'var(--line)', borderRadius: 12 }}
    >
      <div
        className="relative grid shrink-0 place-items-center"
        style={{
          width: 52,
          height: 52,
          background: '#101a28',
          border: `1px solid rgba(${rar?.rgb ?? '143,224,255'},.5)`,
          borderRadius: 11,
          color: farbe,
        }}
      >
        <SlotIcon
          slot={slot}
          size={30}
          style={{ filter: `drop-shadow(0 0 4px ${farbe})` }}
        />
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
        <p className="truncate text-[14px] font-semibold">{item.name}</p>
        <p style={{ fontSize: '11px', lineHeight: 1.4 }}>
          {effektListe(item).map((e, i) => (
            <span key={e.key}>
              {i > 0 && <span style={{ color: 'var(--dim)' }}> · </span>}
              <span style={{ color: e.vorteil ? 'var(--xp)' : 'var(--danger)' }}>
                {e.wert > 0 ? '+' : '−'}
                {Math.abs(e.wert)}% {e.label}
              </span>
            </span>
          ))}
          {beschaedigt && (
            <>
              <span style={{ color: 'var(--dim)' }}> · </span>
              <span style={{ color: 'var(--danger)' }}>beschädigt</span>
            </>
          )}
        </p>
        {SETS[item.material] && (
          <p style={{ fontSize: '11px', color: MATERIALIEN[item.material]?.color }}>
            {SETS[item.material].name}
          </p>
        )}
        <span
          className="mt-0.5 inline-block px-1.5"
          style={{
            ...orbitron,
            fontSize: 7,
            letterSpacing: '1px',
            color: farbe,
            border: `1px solid rgba(${rar?.rgb},.5)`,
            borderRadius: 6,
          }}
        >
          {rar?.name.toUpperCase()}
        </span>
      </div>

      <button
        type="button"
        onClick={onAction}
        className="shrink-0 bg-transparent px-3 py-1.5"
        style={{
          ...orbitron,
          fontSize: 9,
          letterSpacing: '1px',
          color: angelegt ? 'var(--dim)' : 'var(--glow)',
          border: `1px solid ${angelegt ? 'var(--dim)' : 'var(--glow)'}`,
          background: 'transparent',
          borderRadius: 9,
        }}
      >
        {angelegt ? 'ABLEGEN' : 'ANLEGEN'}
      </button>
    </div>
  )
}

/* --------------------------------------------------------------------- */
function Charakter() {
  const { state, dispatch } = useGame()
  const [slot, setSlot] = useState('waffe')
  const [blitz, setBlitz] = useState(null)
  const [beimHaendler, setBeimHaendler] = useState(false)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  if (beimHaendler) return <Haendler onBack={() => setBeimHaendler(false)} />

  const getragen = state.equipment[slot]
  const passend = state.inventory.filter((id) => ITEMS[id]?.slot === slot)
  const verbrauch = state.inventory
    .map((id, i) => ({ id, i, item: ITEMS[id] }))
    .filter((e) => e.item && e.item.slot == null)

  const anlegen = (itemId) => {
    dispatch({ type: 'EQUIP_ITEM', itemId })
    setBlitz(slot)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setBlitz(null), 700)
  }

  const kachel = (s) => (
    <Kachel
      key={s}
      slot={s}
      itemId={state.equipment[s]}
      gewaehlt={slot === s}
      beschaedigt={!!state.damagedItems?.[state.equipment[s]]}
      blitzt={blitz === s}
      onSelect={setSlot}
    />
  )

  return (
    <div className="flex flex-col gap-4">
      <Panel title="AUSRÜSTUNG">
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: '66px minmax(0,1fr) 66px' }}
        >
          <div className="flex flex-col gap-2">{LINKS.map(kachel)}</div>
          <Charakterfeld name={state.name} rank={state.rank} />
          <div className="flex flex-col gap-2">{RECHTS.map(kachel)}</div>
        </div>

        <div className="mt-3">
          <p
            className="mb-2"
            style={{
              ...orbitron,
              fontSize: 8,
              letterSpacing: '2px',
              color: 'var(--dim)',
            }}
          >
            AKTIVE BONI
          </p>
          <BoniChips equipment={state.equipment} />
        </div>
      </Panel>

      <SetBoni equipment={state.equipment} />

      <Panel title={SLOT_LABELS[slot]}>
        <div className="flex flex-col gap-2">
          {getragen && (
            <ItemZeile
              item={ITEMS[getragen]}
              slot={slot}
              angelegt
              beschaedigt={!!state.damagedItems?.[getragen]}
              onAction={() => dispatch({ type: 'UNEQUIP_ITEM', slot })}
            />
          )}
          {passend.map((id, i) => (
            <ItemZeile
              key={`${id}-${i}`}
              item={ITEMS[id]}
              slot={slot}
              beschaedigt={!!state.damagedItems?.[id]}
              onAction={() => anlegen(id)}
            />
          ))}
          {!getragen && passend.length === 0 && (
            <p style={{ fontSize: '13px', color: 'var(--dim)' }}>
              Nichts für diesen Slot im Gepäck.
            </p>
          )}
        </div>
      </Panel>

      <Panel title="HÄNDLER">
        <p style={{ fontSize: '13px', color: 'var(--dim)' }}>
          Der Schmied im Zwielicht schmilzt Items zu Material und wertet deine
          Ausrüstung auf.
        </p>
        <button
          type="button"
          onClick={() => setBeimHaendler(true)}
          className="mt-3 w-full bg-transparent px-4 py-2.5"
          style={{
            ...orbitron,
            fontSize: '11px',
            letterSpacing: '2px',
            color: '#ffb347',
            border: '1px solid #ffb347',
            borderRadius: '10px',
          }}
        >
          ZUM HÄNDLER
        </button>
      </Panel>

      {verbrauch.length > 0 && (
        <Panel title="BEUTEL">
          <div className="flex flex-col gap-2">
            {verbrauch.map(({ id, i, item }) => (
              <div
                key={`${id}-${i}`}
                className="flex items-center gap-3 border p-2"
                style={{ borderColor: 'var(--line)', borderRadius: 12 }}
              >
                <span className="shrink-0" style={{ color: 'var(--glow)' }}>
                  ◆
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold">
                    {item.name}
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--dim)' }}>
                    {item.beschreibung}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  )
}

export default Charakter
