import { useState } from 'react'
import Panel from '../components/Panel.jsx'
import { useGame } from '../context/GameContext.jsx'
import {
  ITEMS,
  SLOT_LABELS,
  STUFEN_INFO,
  MATERIALIEN,
  bonusText,
  debuffText,
  hochgestuft,
  aufwertungKosten,
  reparaturKosten,
  kostenErfuellt,
  fehlendeMaterialien,
} from '../data/items.js'

const orbitron = { fontFamily: "'Orbitron', sans-serif" }

// Slot-Boxen: feste Positionen [slot, boxX, boxY]
const LEFT_SLOTS = [
  ['helm', 20, 20],
  ['umhang', 20, 104],
  ['ring', 20, 188],
  ['hose', 20, 272],
]
const RIGHT_SLOTS = [
  ['kette', 336, 20],
  ['brust', 336, 104],
  ['waffe', 336, 188],
  ['schuhe', 336, 272],
]

// Ankerpunkte am Körper – pro Figur-Variante angepasst
const ANCHORS = {
  m: {
    helm: [196, 34],
    umhang: [166, 94],
    ring: [150, 202],
    hose: [188, 218],
    kette: [205, 74],
    brust: [214, 126],
    waffe: [250, 202],
    schuhe: [216, 340],
  },
  w: {
    helm: [196, 34],
    umhang: [175, 92],
    ring: [160, 204],
    hose: [186, 224],
    kette: [205, 74],
    brust: [212, 126],
    waffe: [240, 204],
    schuhe: [215, 342],
  },
}

const BODY_PATH_M = `
  M192 64 L191 76
  C182 80 170 84 163 92
  C155 98 152 108 150 120
  C148 140 146 160 145 180
  L146 200
  C146 208 150 212 154 210
  L158 202
  C160 185 162 160 165 138
  C167 124 170 114 174 108
  C178 120 180 140 181 158
  C182 172 180 186 177 198
  C175 210 174 222 176 236
  C178 254 181 268 183 282
  C185 296 186 310 187 326
  L188 336
  C184 340 176 344 172 346
  C168 348 170 350 174 350
  L196 350 L197 332
  C196 316 195 300 194 284
  C193 272 194 258 196 244
  C198 234 200 228 200 224
  C200 228 202 234 204 244
  C206 258 207 272 206 284
  C205 300 204 316 203 332
  L204 350 L226 350
  C230 350 232 348 228 346
  C224 344 216 340 212 336
  L213 326
  C214 310 215 296 217 282
  C219 268 222 254 224 236
  C226 222 225 210 223 198
  C220 186 218 172 219 158
  C220 140 222 120 226 108
  C230 114 233 124 235 138
  C238 160 240 185 242 202
  L246 210
  C250 212 254 208 254 200
  L255 180
  C254 160 252 140 250 120
  C248 108 245 98 237 92
  C230 84 218 80 209 76
  L208 64
  C203 67 197 67 192 64 Z
`

// Weibliche Variante: schmalere Schultern, schmalere Taille, breitere Hüfte
const BODY_PATH_W = `
  M193 64 L192 76
  C185 80 177 84 172 90
  C164 97 160 106 158 118
  C156 138 155 158 154 178
  L155 198
  C155 206 158 210 162 208
  L166 200
  C168 184 169 158 171 140
  C172 126 174 116 178 110
  C181 124 184 138 185 154
  C186 168 185 182 184 196
  C183 206 177 216 172 227
  C165 235 161 242 161 250
  C162 264 168 276 174 288
  C179 301 182 314 185 326
  L186 336
  C182 340 175 344 171 346
  C167 348 169 350 173 350
  L196 350 L197 330
  C196 314 195 298 194 282
  C193 270 194 256 197 244
  C199 234 200 228 200 224
  C200 228 201 234 203 244
  C206 256 207 270 206 282
  C205 298 204 314 203 330
  L204 350 L227 350
  C231 350 233 348 229 346
  C225 344 218 340 214 336
  L215 326
  C218 314 221 301 226 288
  C232 276 238 264 239 250
  C239 242 235 235 228 227
  C223 216 217 206 216 196
  C215 182 214 168 215 154
  C216 138 219 124 222 110
  C226 116 228 126 229 140
  C231 158 232 184 234 200
  L238 208
  C242 210 245 206 245 198
  L246 178
  C245 158 244 138 242 118
  C240 106 236 97 228 90
  C223 84 215 80 208 76
  L207 64
  C202 67 198 67 193 64 Z
`

const ANATOMY_M = [
  'M181 92 Q200 100 219 92',
  'M184 118 Q200 127 216 118',
  'M200 132 L200 192',
  'M189 152 L211 152',
  'M190 170 L210 170',
]

const ANATOMY_W = [
  'M180 92 Q200 100 220 92',
  'M186 120 Q200 130 214 120',
  'M200 130 L200 196',
  'M191 150 L209 150',
  'M192 172 L208 172',
]

const FIGURES = {
  m: { path: BODY_PATH_M, anatomy: ANATOMY_M, anchors: ANCHORS.m },
  w: { path: BODY_PATH_W, anatomy: ANATOMY_W, anchors: ANCHORS.w },
}

function SlotBox({
  slot,
  x,
  y,
  equippedId,
  availableCount,
  selected,
  beschaedigt,
  onSelect,
}) {
  const stufeFarbe = equippedId
    ? (STUFEN_INFO[ITEMS[equippedId]?.stufe]?.color ?? 'var(--xp)')
    : null
  return (
    <g
      transform={`translate(${x},${y})`}
      onClick={() => onSelect(slot)}
      style={{ cursor: 'pointer' }}
    >
      <rect
        width="44"
        height="44"
        rx="8"
        fill="rgba(10,17,32,.92)"
        stroke={
          beschaedigt
            ? 'var(--danger)'
            : selected
              ? 'var(--glow)'
              : (stufeFarbe ?? 'var(--line)')
        }
        strokeWidth={beschaedigt ? 2 : 1}
      />
      <path
        d="M1 9 L1 1 L9 1 M35 1 L43 1 L43 9 M43 35 L43 43 L35 43 M9 43 L1 43 L1 35"
        fill="none"
        stroke="var(--glow)"
        strokeWidth="1.5"
        opacity="0.9"
      />
      {equippedId ? (
        <text
          x="22"
          y="29"
          textAnchor="middle"
          fontSize="16"
          fill={stufeFarbe}
          style={{ textShadow: `0 0 6px ${stufeFarbe}` }}
        >
          ◆
        </text>
      ) : (
        <text
          x="22"
          y="30"
          textAnchor="middle"
          fontSize="20"
          fill="var(--glow)"
          style={orbitron}
        >
          +
        </text>
      )}
      <text
        x="22"
        y="56"
        textAnchor="middle"
        fontSize="8"
        letterSpacing="1"
        fill="var(--dim)"
        style={orbitron}
      >
        {SLOT_LABELS[slot]}
      </text>
      <text
        x="22"
        y="66"
        textAnchor="middle"
        fontSize="7"
        letterSpacing="1"
        fill={
          beschaedigt
            ? 'var(--danger)'
            : equippedId
              ? stufeFarbe
              : availableCount > 0
                ? 'var(--ok)'
                : 'var(--dim)'
        }
        style={orbitron}
      >
        {equippedId
          ? beschaedigt
            ? 'BESCHÄDIGT'
            : 'AKTIV'
          : availableCount > 0
            ? `${availableCount} VERF.`
            : 'LEER'}
      </text>
    </g>
  )
}

function CharakterFigur({ state, selected, onSelect }) {
  const availableFor = (slot) =>
    state.inventory.filter((id) => ITEMS[id]?.slot === slot).length

  const allSlots = [...LEFT_SLOTS, ...RIGHT_SLOTS]
  const fig = FIGURES[state.gender] ?? FIGURES.m

  return (
    <svg viewBox="0 0 400 370" className="w-full">
      <defs>
        <linearGradient id="bodyGrad" x1="0" y1="24" x2="0" y2="350" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="rgba(63,182,255,.4)" />
          <stop offset="1" stopColor="rgba(63,182,255,.06)" />
        </linearGradient>
        <filter id="figGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* HUD-Kreise hinter der Figur */}
      <circle
        cx="200"
        cy="190"
        r="88"
        fill="none"
        stroke="#1e4a70"
        strokeWidth="1"
        strokeDasharray="6 8"
        opacity="0.7"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 200 190"
          to="360 200 190"
          dur="40s"
          repeatCount="indefinite"
        />
      </circle>
      <circle
        cx="200"
        cy="190"
        r="128"
        fill="none"
        stroke="#1e4a70"
        strokeWidth="1"
        strokeDasharray="2 10"
        opacity="0.5"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="360 200 190"
          to="0 200 190"
          dur="60s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Verbindungslinien Box → Körperteil */}
      {LEFT_SLOTS.map(([slot, x, y]) => {
        const [ax, ay] = fig.anchors[slot]
        return (
          <g key={slot}>
            <line x1={x + 44} y1={y + 22} x2={ax} y2={ay} stroke="#1e4a70" strokeWidth="1" />
            <circle cx={ax} cy={ay} r="2.5" fill="var(--glow)" opacity="0.8" />
          </g>
        )
      })}
      {RIGHT_SLOTS.map(([slot, x, y]) => {
        const [ax, ay] = fig.anchors[slot]
        return (
          <g key={slot}>
            <line x1={x} y1={y + 22} x2={ax} y2={ay} stroke="#1e4a70" strokeWidth="1" />
            <circle cx={ax} cy={ay} r="2.5" fill="var(--glow)" opacity="0.8" />
          </g>
        )
      })}

      {/* Weicher Glow unter der Figur */}
      <g filter="url(#figGlow)" opacity="0.6">
        <ellipse cx="200" cy="42" rx="15" ry="19" fill="rgba(63,182,255,.5)" />
        <path d={fig.path} fill="rgba(63,182,255,.5)" />
      </g>

      {/* Hologramm-Silhouette */}
      <g>
        <ellipse
          cx="200"
          cy="42"
          rx="15"
          ry="19"
          fill="url(#bodyGrad)"
          stroke="rgba(63,182,255,.6)"
          strokeWidth="1"
        />
        <path
          d={fig.path}
          fill="url(#bodyGrad)"
          stroke="rgba(63,182,255,.6)"
          strokeWidth="1"
        />
        {/* Anatomie-Linien */}
        <g fill="none" stroke="rgba(63,182,255,.35)" strokeWidth="1">
          {fig.anatomy.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
        {/* Scanlinie */}
        <rect x="142" width="116" height="2" fill="var(--glow)" opacity="0.45">
          <animate
            attributeName="y"
            values="24;348;24"
            dur="5s"
            repeatCount="indefinite"
          />
        </rect>
      </g>

      {/* Slot-Boxen */}
      {allSlots.map(([slot, x, y]) => (
        <SlotBox
          key={slot}
          slot={slot}
          x={x}
          y={y}
          equippedId={state.equipment[slot]}
          availableCount={availableFor(slot)}
          selected={selected === slot}
          beschaedigt={!!state.damagedItems?.[state.equipment[slot]]}
          onSelect={onSelect}
        />
      ))}
    </svg>
  )
}

function Kostenzeile({ kosten, materials }) {
  const fehlt = fehlendeMaterialien(kosten, materials)
  return (
    <span style={{ fontSize: '10px', color: 'var(--dim)' }}>
      {Object.entries(kosten).map(([mat, menge], i) => (
        <span key={mat}>
          {i > 0 && ' · '}
          <span
            style={{
              color: fehlt[mat] ? 'var(--danger)' : 'var(--ok)',
            }}
          >
            {menge} {MATERIALIEN[mat].name}
          </span>
          {fehlt[mat] ? ` (−${fehlt[mat]})` : ''}
        </span>
      ))}
    </span>
  )
}

function Haendler({ state, dispatch }) {
  // Alles was der Spieler besitzt: Inventar plus getragene Ausrüstung
  const besitz = [
    ...state.inventory,
    ...Object.values(state.equipment).filter(Boolean),
  ]
  const aufwertbar = besitz.filter((id) => ITEMS[id]?.stufe && hochgestuft(id))
  const beschaedigte = besitz.filter((id) => state.damagedItems?.[id])

  return (
    <Panel title="HÄNDLER">
      <div className="mb-3 flex flex-wrap gap-2">
        {Object.values(MATERIALIEN).map((m) => (
          <span
            key={m.id}
            className="px-2 py-0.5"
            style={{
              ...orbitron,
              fontSize: '9px',
              color: m.color,
              border: `1px solid ${m.color}`,
              borderRadius: '6px',
            }}
          >
            {m.name}: {state.materials?.[m.id] ?? 0}
          </span>
        ))}
      </div>

      {beschaedigte.length > 0 && (
        <>
          <p
            className="mb-2"
            style={{ ...orbitron, fontSize: '9px', letterSpacing: '2px', color: 'var(--danger)' }}
          >
            WIEDERHERSTELLEN
          </p>
          <div className="mb-3 flex flex-col gap-2">
            {beschaedigte.map((id, i) => {
              const item = ITEMS[id]
              const ziel = hochgestuft(id)
              const kosten = ziel ? reparaturKosten(ITEMS[ziel].stufe) : null
              const machbar = !kosten || kostenErfuellt(kosten, state.materials)
              return (
                <div
                  key={`${id}-${i}`}
                  className="flex items-center justify-between gap-2 border p-2"
                  style={{ borderColor: 'var(--danger)', borderRadius: '10px' }}
                >
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold">
                      {item.name}
                    </p>
                    {kosten ? (
                      <Kostenzeile kosten={kosten} materials={state.materials} />
                    ) : (
                      <span style={{ fontSize: '10px', color: 'var(--dim)' }}>
                        kostenlos
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={!machbar}
                    onClick={() => dispatch({ type: 'REPAIR_ITEM', itemId: id })}
                    className="shrink-0 bg-transparent px-2 py-1 disabled:opacity-40"
                    style={{
                      ...orbitron,
                      fontSize: '9px',
                      letterSpacing: '1px',
                      color: 'var(--danger)',
                      border: '1px solid var(--danger)',
                      borderRadius: '8px',
                    }}
                  >
                    REPARIEREN
                  </button>
                </div>
              )
            })}
          </div>
        </>
      )}

      <p
        className="mb-2"
        style={{ ...orbitron, fontSize: '9px', letterSpacing: '2px', color: 'var(--glow)' }}
      >
        AUFWERTEN
      </p>
      {aufwertbar.length === 0 ? (
        <p style={{ fontSize: '12px', color: 'var(--dim)' }}>
          Keine Items, die sich weiter aufwerten lassen.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {aufwertbar.map((id, i) => {
            const item = ITEMS[id]
            const ziel = hochgestuft(id)
            const zielItem = ITEMS[ziel]
            const kosten = aufwertungKosten(zielItem.stufe)
            const machbar = kostenErfuellt(kosten, state.materials)
            return (
              <div
                key={`${id}-${i}`}
                className="flex items-center justify-between gap-2 border p-2"
                style={{ borderColor: 'var(--line)', borderRadius: '10px' }}
              >
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold">
                    {item.name}{' '}
                    <span style={{ color: STUFEN_INFO[item.stufe].color }}>
                      {item.stufe}
                    </span>
                    <span style={{ color: 'var(--dim)' }}> → </span>
                    <span style={{ color: STUFEN_INFO[zielItem.stufe].color }}>
                      {zielItem.stufe}
                    </span>
                  </p>
                  <Kostenzeile kosten={kosten} materials={state.materials} />
                </div>
                <button
                  type="button"
                  disabled={!machbar}
                  onClick={() => dispatch({ type: 'UPGRADE_ITEM', itemId: id })}
                  className="shrink-0 bg-transparent px-2 py-1 disabled:opacity-40"
                  style={{
                    ...orbitron,
                    fontSize: '9px',
                    letterSpacing: '1px',
                    color: 'var(--ok)',
                    border: '1px solid var(--ok)',
                    borderRadius: '8px',
                  }}
                >
                  AUFWERTEN
                </button>
              </div>
            )
          })}
        </div>
      )}
    </Panel>
  )
}

function Charakter() {
  const { state, dispatch } = useGame()
  const [selected, setSelected] = useState(null)

  const equippedId = selected ? state.equipment[selected] : null
  const equippedItem = equippedId ? ITEMS[equippedId] : null
  const matching = selected
    ? state.inventory.filter((id) => ITEMS[id]?.slot === selected)
    : []

  const activeBoni = Object.values(state.equipment)
    .filter(Boolean)
    .map((id) => ITEMS[id])
    .filter((item) => item?.bonus)
    .map((item) => `${item.name} ${bonusText(item)}`)

  const unequipped = state.inventory.map((id) => ITEMS[id]).filter(Boolean)

  return (
    <div className="flex flex-col gap-4">
      <Panel title="CHARAKTER">
        <CharakterFigur
          state={state}
          selected={selected}
          onSelect={(slot) => setSelected(slot === selected ? null : slot)}
        />

        {selected && (
          <div
            className="mt-3 border p-3"
            style={{ borderColor: 'var(--line)', borderRadius: '12px' }}
          >
            <p
              className="mb-2"
              style={{ ...orbitron, fontSize: '10px', letterSpacing: '2px', color: 'var(--glow)' }}
            >
              SLOT · {SLOT_LABELS[selected]}
            </p>
            {equippedItem && (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[15px] font-semibold">
                    <span style={{ color: 'var(--xp)' }}>◆</span>{' '}
                    {equippedItem.name}
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--ok)' }}>
                    {bonusText(equippedItem)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    dispatch({ type: 'UNEQUIP_ITEM', slot: selected })
                  }}
                  className="shrink-0 bg-transparent px-3 py-1.5"
                  style={{
                    ...orbitron,
                    fontSize: '10px',
                    letterSpacing: '2px',
                    color: 'var(--danger)',
                    border: '1px solid var(--danger)',
                    borderRadius: '8px',
                  }}
                >
                  ABLEGEN
                </button>
              </div>
            )}
            {!equippedItem && matching.length === 0 && (
              <p style={{ fontSize: '13px', color: 'var(--dim)' }}>
                Keine passenden Items im Inventar.
              </p>
            )}
            {matching.map((id, index) => {
              const item = ITEMS[id]
              return (
                <div
                  key={`${id}-${index}`}
                  className="flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-[15px] font-semibold">{item.name}</p>
                    <p style={{ fontSize: '12px', color: 'var(--ok)' }}>
                      {bonusText(item)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'EQUIP_ITEM', itemId: id })}
                    className="shrink-0 bg-transparent px-3 py-1.5"
                    style={{
                      ...orbitron,
                      fontSize: '10px',
                      letterSpacing: '2px',
                      color: 'var(--ok)',
                      border: '1px solid var(--ok)',
                      borderRadius: '8px',
                    }}
                  >
                    ANLEGEN
                  </button>
                </div>
              )
            })}
          </div>
        )}

        <p className="mt-3" style={{ fontSize: '12px', color: 'var(--ok)' }}>
          Aktive Boni:{' '}
          {activeBoni.length > 0 ? (
            activeBoni.join(' · ')
          ) : (
            <span style={{ color: 'var(--dim)' }}>keine</span>
          )}
        </p>
      </Panel>

      <Haendler state={state} dispatch={dispatch} />

      <Panel title="INVENTAR">
        {unequipped.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--dim)' }}>
            Items erhältst du aus Dungeons und Level-Aufstiegen.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {unequipped.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className="flex items-center gap-3 border p-3"
                style={{ borderColor: 'var(--line)', borderRadius: '12px' }}
              >
                <span
                  className="shrink-0"
                  style={{
                    color: STUFEN_INFO[item.stufe]?.color ?? 'var(--glow)',
                    fontSize: '14px',
                  }}
                >
                  ◆
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold">
                    {item.name}
                    {item.stufe && (
                      <span
                        className="ml-1"
                        style={{
                          fontSize: '10px',
                          color: STUFEN_INFO[item.stufe].color,
                        }}
                      >
                        {STUFEN_INFO[item.stufe].name}
                      </span>
                    )}
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--dim)' }}>
                    {item.beschreibung}
                  </p>
                  {item.debuff && (
                    <p style={{ fontSize: '11px', color: 'var(--danger)' }}>
                      {debuffText(item)}
                    </p>
                  )}
                </div>
                <span
                  className="shrink-0 px-2 py-0.5"
                  style={{
                    ...orbitron,
                    fontSize: '8px',
                    letterSpacing: '1px',
                    color: 'var(--dim)',
                    border: '1px solid var(--line)',
                    borderRadius: '6px',
                  }}
                >
                  {item.slot ? SLOT_LABELS[item.slot] : 'VERBRAUCH'}
                </span>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  )
}

export default Charakter
