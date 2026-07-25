import { useEffect, useRef, useState } from 'react'
import { useGame } from '../context/GameContext.jsx'
import FightSprite from '../components/FightSprites.jsx'
import { findDungeon } from '../data/dungeons.js'
import { ITEMS, STUFEN_INFO, MATERIALIEN } from '../data/items.js'
import { zieheDrops } from '../data/loot.js'
import { auraDamageBonus, auraStage } from '../data/aura.js'
import {
  ANGRIFFE,
  ARTEN,
  MAX_VITALITAET,
  MAX_HEILUNGEN,
  HEILUNG_ANTEIL,
  BELASTUNG_LABELS,
  BELASTUNG_BLOCK,
  BELASTUNG_HEILEN,
  belastungsStufe,
  blockChance,
  berechneSchaden,
  gegnerSchaden,
  moodIndex,
  MOODS,
  COMBO_MAX,
  FLUCH_CHANCE,
  FLUCH_DAUER,
} from '../data/combat.js'

const orbitron = { fontFamily: "'Orbitron', sans-serif" }

function neuerKampf(tuer) {
  return {
    nr: tuer.nr,
    vitalitaet: MAX_VITALITAET,
    belastung: 0,
    heilungen: MAX_HEILUNGEN,
    enemyHp: tuer.hp,
    enemyMaxHp: tuer.hp,
    lebende: tuer.anzahl,
    zug: 0,
    // 'offen' = kein Block, 'gehalten' = Block steht, 'gebrochen' = Block versagt
    block: 'offen',
    letzteArt: '',
    combo: 1,
    fluch: 0,
    log: [],
  }
}

function Leiste({ wert, max, farbe, glow, hoehe = 9, mine }) {
  return (
    <div
      className="w-[88%] overflow-hidden rounded-lg border"
      style={{
        height: hoehe,
        background: '#140c12',
        borderColor: mine ? '#1b4a38' : '#3a1a22',
      }}
    >
      <div
        className="h-full"
        style={{
          width: `${Math.max(0, Math.min(100, (wert / max) * 100))}%`,
          background: farbe,
          boxShadow: glow,
          transition: 'width .35s',
        }}
      />
    </div>
  )
}

function DungeonFight({ onExit }) {
  const { state, dispatch } = useGame()
  const dungeon = findDungeon(state.dungeon.run)
  const tuer = dungeon?.tueren.find((t) => t.nr === state.dungeon.door)

  const [k, setK] = useState(
    () => state.dungeon.fight ?? (tuer ? neuerKampf(tuer) : null),
  )
  const [pAnim, setPAnim] = useState('')
  const [eAnim, setEAnim] = useState('')
  const [shake, setShake] = useState(false)
  const [slam, setSlam] = useState(false)
  const [roar, setRoar] = useState(null)
  const [flies, setFlies] = useState([])
  const [popup, setPopup] = useState(null)
  const [info, setInfo] = useState(false)
  const timers = useRef([])
  const merkFlag = useRef(false)

  useEffect(() => {
    if (k) dispatch({ type: 'DUNGEON_FIGHT_SYNC', fight: k })
  }, [k, dispatch])

  // Nach dem Rasten: Werte auffrischen
  useEffect(() => {
    if (k?.gerastet) {
      setK((alt) => ({
        ...alt,
        gerastet: false,
        vitalitaet: MAX_VITALITAET,
        belastung: 0,
        heilungen: MAX_HEILUNGEN,
        block: 'offen',
        zug: 0,
        fluch: 0,
        log: ['Du hast gerastet. Der Gegner hat sich erholt.'],
      }))
    }
  }, [k?.gerastet])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  useEffect(() => {
    const vorher = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = vorher
    }
  }, [])

  // Torschluss-Einblendung beim ersten Betreten
  useEffect(() => {
    if (!merkFlag.current && state.dungeon.inside && (k?.zug ?? 0) === 0) {
      merkFlag.current = true
    }
  }, [state.dungeon.inside, k?.zug])

  if (!dungeon || !tuer || !k) return null

  const auraBonus = auraDamageBonus(
    state.aura,
    state.level,
    state.rank,
    dungeon.rank,
  )
  const stufe = belastungsStufe(k.belastung)
  const kampfVorbei = !!popup || !!k.beendet
  const auraStufe = auraStage(state.aura, state.level)
  const mi = moodIndex(k.enemyHp, k.enemyMaxHp)

  const nachricht = (text, art, kk) => [{ text, art }, ...(kk.log ?? [])].slice(0, 2)

  const fliegen = (text, klasse, rechts) => {
    const id = Date.now() + Math.random()
    setFlies((f) => [...f, { id, text, klasse, rechts }])
    timers.current.push(setTimeout(() => setFlies((f) => f.filter((x) => x.id !== id)), 1000))
  }
  const ruettel = () => {
    setShake(true)
    timers.current.push(setTimeout(() => setShake(false), 300))
  }
  const anim = (wer, klasse, ms) => {
    const setter = wer === 'p' ? setPAnim : setEAnim
    setter(klasse)
    timers.current.push(setTimeout(() => setter(''), ms))
  }

  // --- Gegnerzug ---------------------------------------------------------
  function gegnerAngriff(kk) {
    let neu = { ...kk }
    anim('e', 'lunge', 500)
    anim('p', 'hurt', 350)
    ruettel()
    setSlam(true)
    timers.current.push(setTimeout(() => setSlam(false), 600))

    const block = neu.block === 'offen' ? null : neu.block
    const dmg = gegnerSchaden({ gegner: tuer, lebende: neu.lebende, block })
    neu.vitalitaet = Math.max(0, neu.vitalitaet - dmg)
    fliegen(`-${dmg}`, '', false)

    const zusatz =
      block === 'gehalten'
        ? ' – geblockt!'
        : block === 'gebrochen'
          ? ' – dein Block bricht!'
          : ''
    neu.log = nachricht(
      `${tuer.gegnerart} setzt ${tuer.angriffsname} ein: −${dmg} Vitalität${zusatz}`,
      'bad',
      neu,
    )
    neu.block = 'offen'

    // Bosse belegen dich gelegentlich mit einem Fluch
    if (tuer.boss && Math.random() < FLUCH_CHANCE && neu.vitalitaet > 0) {
      neu.fluch = FLUCH_DAUER
      neu.log = nachricht(
        'Ein Fluch legt sich auf deine Arme: −30% Schaden.',
        'bad',
        neu,
      )
    }
    if (neu.vitalitaet <= 0) {
      neu.beendet = 'niederlage'
      timers.current.push(setTimeout(() => setPopup({ art: 'niederlage' }), 700))
    }
    return neu
  }

  // Zugzähler: kündigt an bzw. löst den Gegnerangriff aus
  function zugEnde(kk) {
    let neu = { ...kk, zug: kk.zug + 1 }
    if (neu.zug % tuer.intervall === 0) return gegnerAngriff(neu)
    return neu
  }

  // --- Spielerzug --------------------------------------------------------
  function angreifen(a) {
    if (kampfVorbei) return
    setK((kk) => {
      let neu = { ...kk }

      // Combo-Gegner: Übungswechsel steigert, Wiederholung bricht
      if (tuer.combo) {
        if (neu.letzteArt && neu.letzteArt !== a.art) {
          neu.combo = Math.min(COMBO_MAX, neu.combo + 1)
        } else if (neu.letzteArt === a.art) {
          if (neu.combo > 1) {
            neu.log = nachricht('Er hat sich angepasst – Combo gebrochen.', 'bad', neu)
          }
          neu.combo = 1
        }
      }
      neu.letzteArt = a.art
      anim('p', 'strike', 400)

      // Ausweichen
      if (tuer.ausweichrate && Math.random() < tuer.ausweichrate) {
        fliegen('VERFEHLT', 'miss', true)
        neu.log = nachricht(`${a.name} – er ist ausgewichen.`, 'bad', neu)
        return zugEnde(neu)
      }

      const { schaden, stark, belastung } = berechneSchaden({
        angriff: a,
        gegner: tuer,
        rank: state.rank,
        belastung: neu.belastung,
        auraBonus,
        combo: neu.combo,
        fluch: neu.fluch,
      })
      if (neu.fluch > 0) neu.fluch -= 1

      neu.enemyHp = Math.max(0, neu.enemyHp - schaden)
      neu.belastung += belastung
      fliegen(`-${schaden}`, stark ? 'crit' : '', true)
      anim('e', 'flinch', 300)
      ruettel()
      neu.log = nachricht(`${a.name} trifft für ${schaden} Schaden.`, 'me', neu)

      if (neu.enemyHp === 0) {
        neu.lebende -= 1
        if (neu.lebende > 0) {
          anim('e', 'die', 400)
          neu.enemyHp = tuer.hp
          neu.log = nachricht(`Ein Gegner fällt. Noch ${neu.lebende}.`, 'good', neu)
          return zugEnde(neu)
        }
        // Kammer geräumt
        anim('e', 'die', 1100)
        neu.beendet = 'sieg'
        const drops = zieheDrops(dungeon.id, state.rank, tuer.boss ? 2 : 1)
        timers.current.push(setTimeout(() => setPopup({ art: 'sieg', drops }), 900))
        return neu
      }
      return zugEnde(neu)
    })
  }

  // --- Reaktionen --------------------------------------------------------
  function blocken() {
    if (kampfVorbei) return
    setK((kk) => {
      // Der Wurf entscheidet jetzt, ob der Block hält oder bricht – das Ergebnis
      // gilt auch, wenn der Angriff erst in einem späteren Zug kommt.
      const haelt = Math.random() < blockChance(tuer)
      let neu = {
        ...kk,
        belastung: kk.belastung + BELASTUNG_BLOCK,
        block: haelt ? 'gehalten' : 'gebrochen',
      }
      anim('p', 'brace', 500)
      neu.log = nachricht(
        haelt
          ? 'Du gehst in den Plank und spannst alles an.'
          : 'Deine Plank wackelt – der nächste Treffer sitzt.',
        haelt ? 'me' : 'bad',
        neu,
      )
      return zugEnde(neu)
    })
  }

  function heilen() {
    if (kampfVorbei) return
    setK((kk) => {
      if (kk.heilungen <= 0) {
        return { ...kk, log: nachricht('Keine Kraft mehr zum Regenerieren.', 'bad', kk) }
      }
      const eff = HEILUNG_ANTEIL[belastungsStufe(kk.belastung)]
      const h = Math.round(MAX_VITALITAET * eff)
      let neu = {
        ...kk,
        heilungen: kk.heilungen - 1,
        vitalitaet: Math.min(MAX_VITALITAET, kk.vitalitaet + h),
        belastung: kk.belastung + BELASTUNG_HEILEN,
      }
      fliegen(`+${h}`, 'crit', false)
      neu.log = nachricht(
        `Dehnen und tief atmen – ${h} Vitalität zurück.` +
          (kk.belastung >= 100 ? ' Ermüdet erholst du dich schlechter.' : ''),
        'good',
        neu,
      )
      return zugEnde(neu)
    })
  }

  // --- Abschluss ---------------------------------------------------------
  function siegBestaetigen() {
    dispatch({ type: 'DUNGEON_CLEAR_DOOR', drops: popup.drops })
    setPopup(null)
    onExit()
  }
  function niederlageBestaetigen() {
    dispatch({ type: 'DUNGEON_DEFEAT' })
    setPopup(null)
    onExit()
  }
  function rasten() {
    dispatch({ type: 'DUNGEON_REST' })
    onExit()
  }

  const restZuege = tuer.intervall - (k.zug % tuer.intervall)
  const gleichAngriff = restZuege === 1

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col"
      style={{ height: '100dvh', background: 'var(--bg)', padding: '10px 12px 12px' }}
    >
      {/* Kopfzeile */}
      <div className="flex shrink-0 items-center gap-2 px-0.5 pb-2">
        <button
          type="button"
          onClick={rasten}
          className="bg-transparent px-2.5 py-1.5"
          style={{
            ...orbitron,
            fontSize: '9px',
            letterSpacing: '1px',
            color: 'var(--dim)',
            border: '1px solid var(--line)',
            borderRadius: '9px',
          }}
        >
          RASTEN
        </button>
        <p
          className="flex-1 text-center"
          style={{ ...orbitron, fontSize: '10px', letterSpacing: '2px', color: 'var(--glow)' }}
        >
          TÜR {tuer.nr} / {dungeon.tueren.length}
        </p>
        <button
          type="button"
          onClick={() => setInfo(true)}
          className="bg-transparent px-2.5 py-1.5"
          style={{
            ...orbitron,
            fontSize: '9px',
            letterSpacing: '1px',
            color: 'var(--dim)',
            border: '1px solid var(--line)',
            borderRadius: '9px',
          }}
        >
          INFO
        </button>
      </div>

      {/* Arena */}
      <div
        className={`relative min-h-0 flex-1 overflow-hidden ${shake ? 'arena-shake' : ''}`}
        style={{
          border: `1px solid ${mi === 3 ? 'rgba(255,77,94,.7)' : 'rgba(255,77,94,.3)'}`,
          borderRadius: '14px',
          background:
            'radial-gradient(ellipse at 50% 78%,rgba(255,77,94,.09),transparent 60%),#090c15',
          boxShadow: mi === 3 ? 'inset 0 0 40px rgba(255,77,94,.16)' : 'none',
        }}
      >
        <div className="absolute inset-0 flex items-end justify-between px-1 pb-[46px]">
          {/* Spieler */}
          <div className="relative flex w-[47%] flex-col items-center">
            <FightSprite
              name="player"
              id="pfig"
              className={`w-full ${pAnim}`}
              style={{ height: 'min(34vh, 140px)' }}
            />
            <div className="mt-0.5 text-center">
              <div style={{ ...orbitron, fontSize: '12px', fontWeight: 900, color: 'var(--glow)' }}>
                {state.name}
              </div>
            </div>
            <Leiste
              wert={k.vitalitaet}
              max={MAX_VITALITAET}
              mine
              farbe={
                k.vitalitaet <= MAX_VITALITAET * 0.3
                  ? 'linear-gradient(90deg,#8b1a28,#ff4d5e)'
                  : 'linear-gradient(90deg,#1e7f52,#4dffa6)'
              }
              glow="0 0 9px rgba(77,255,166,.4)"
            />
            <div style={{ ...orbitron, fontSize: '8.5px', color: 'var(--dim)', marginTop: 3 }}>
              {k.vitalitaet} / {MAX_VITALITAET} VIT
            </div>
          </div>

          {/* Gegner */}
          <div className="relative flex w-[47%] flex-col items-center">
            {tuer.anzahl > 1 && (
              <span
                className="absolute right-0.5 top-0 z-[2] px-1.5 py-0.5"
                style={{
                  ...orbitron,
                  fontSize: '9px',
                  color: 'var(--dim)',
                  border: '1px solid var(--line)',
                  borderRadius: '8px',
                  background: 'rgba(5,7,13,.7)',
                }}
              >
                ×{k.lebende}
              </span>
            )}
            <FightSprite
              name={tuer.sprite}
              id="efig"
              className={`w-full ${eAnim} ${mi === 3 && !kampfVorbei ? 'rage' : ''}`}
              style={{ height: 'min(34vh, 140px)' }}
            />
            <div className="mt-0.5 text-center">
              <div style={{ ...orbitron, fontSize: '12px', fontWeight: 900 }}>
                {tuer.gegnerart}
              </div>
              <div className="mt-0.5 flex flex-wrap justify-center gap-1">
                <span
                  className="inline-block px-1.5 py-0.5"
                  style={{
                    ...orbitron,
                    fontSize: '7.5px',
                    letterSpacing: '1.5px',
                    color: MOODS[mi][1],
                    border: `1px solid ${MOODS[mi][1]}`,
                    borderRadius: '7px',
                  }}
                >
                  {MOODS[mi][0]}
                </span>
                {auraBonus > 0 && (
                  <span
                    className="inline-block px-1.5 py-0.5"
                    style={{
                      ...orbitron,
                      fontSize: '7.5px',
                      letterSpacing: '1.5px',
                      color: 'var(--xp)',
                      border: '1px solid var(--xp)',
                      borderRadius: '7px',
                      textShadow: '0 0 6px rgba(143,224,255,.7)',
                    }}
                  >
                    EINGESCHÜCHTERT
                  </span>
                )}
              </div>
            </div>
            <Leiste
              wert={k.enemyHp}
              max={k.enemyMaxHp}
              farbe="linear-gradient(90deg,#8b1a28,#ff4d5e)"
              glow="0 0 9px rgba(255,77,94,.4)"
            />
            <div style={{ ...orbitron, fontSize: '8.5px', color: 'var(--dim)', marginTop: 3 }}>
              {k.enemyHp} / {k.enemyMaxHp} HP
            </div>
          </div>
        </div>

        {/* Schadenszahlen */}
        {flies.map((f) => (
          <div
            key={f.id}
            className={`dmgnum ${f.klasse}`}
            style={{ left: f.rechts ? '74%' : '26%' }}
          >
            {f.text}
          </div>
        ))}
        {slam && <div className="slam" />}
        {roar && <div className="roar">{roar}</div>}

        {/* Kampflog, zwei Zeilen */}
        <div className="pointer-events-none absolute bottom-[5px] left-[9px] right-[9px] z-[3]">
          {k.log.slice(0, 2).map((z, i) => (
            <div
              key={i}
              className="blog-line truncate"
              style={{
                fontSize: '11.5px',
                lineHeight: 1.5,
                color:
                  z.art === 'me'
                    ? 'var(--text)'
                    : z.art === 'bad'
                      ? 'var(--danger)'
                      : z.art === 'good'
                        ? 'var(--ok)'
                        : 'var(--dim)',
              }}
            >
              › {z.text}
            </div>
          ))}
        </div>
      </div>

      {/* Belastung + Aura */}
      <div className="shrink-0 pt-[7px]">
        <div className="grid grid-cols-2 gap-[9px]">
          <div>
            <b style={{ ...orbitron, fontSize: '8px', letterSpacing: '1.5px', color: 'var(--dim)', display: 'block', marginBottom: 3 }}>
              BELASTUNG {k.belastung} · {BELASTUNG_LABELS[stufe]}
            </b>
            <div
              className="flex overflow-hidden rounded-lg border"
              style={{ height: 8, background: '#0c1420', borderColor: 'var(--line)' }}
            >
              <i style={{ width: `${Math.min(k.belastung, 100) / 3}%`, background: 'var(--ok)', transition: 'width .35s' }} />
              <i style={{ width: `${Math.min(Math.max(k.belastung - 100, 0), 100) / 3}%`, background: '#ffd95e', transition: 'width .35s' }} />
              <i style={{ width: `${Math.min(Math.max(k.belastung - 200, 0), 100) / 3}%`, background: '#ff9440', transition: 'width .35s' }} />
            </div>
          </div>
          <div>
            <b style={{ ...orbitron, fontSize: '8px', letterSpacing: '1.5px', color: 'var(--dim)', display: 'block', marginBottom: 3 }}>
              AURA {state.aura} · {auraStufe.name.toUpperCase()}
            </b>
            <div
              className="overflow-hidden rounded-lg border"
              style={{ height: 8, background: '#0c1420', borderColor: 'var(--line)' }}
            >
              <i
                className="block h-full"
                style={{
                  width: `${(auraStufe.bonus / 25) * 100}%`,
                  background: 'linear-gradient(90deg,#2e7fd4,#8fe0ff)',
                  transition: 'width .35s',
                }}
              />
            </div>
          </div>
        </div>

        {/* Ankündigung */}
        <div
          className={`flex h-5 items-center ${gleichAngriff ? 'tele-now' : ''}`}
          style={{
            marginTop: 6,
            fontSize: '11.5px',
            color: gleichAngriff ? 'var(--danger)' : '#ffd95e',
          }}
        >
          {gleichAngriff
            ? `${tuer.gegnerart} holt aus – ${tuer.angriffsname} im nächsten Zug!`
            : `${tuer.gegnerart} sammelt Kraft · ${tuer.angriffsname} in ${restZuege} Zügen`}
        </div>
      </div>

      {/* Angriffe */}
      <div className="grid shrink-0 grid-cols-2 gap-1.5" style={{ marginTop: 6 }}>
        {ANGRIFFE.map((a) => {
          const art = ARTEN[a.art]
          const schwach = tuer.schwaechen?.[a.art] > 1
          const resist = tuer.resistenzen?.[a.art] < 1
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => angreifen(a)}
              className="text-left"
              style={{
                border: `1px solid ${schwach ? 'var(--ok)' : 'var(--glow)'}`,
                background: 'rgba(63,182,255,.08)',
                color: 'var(--text)',
                borderRadius: '10px',
                padding: '7px 8px',
                fontSize: '13.5px',
                fontWeight: 600,
                lineHeight: 1.1,
                opacity: resist ? 0.6 : 1,
              }}
            >
              {a.name}
              <small
                style={{
                  ...orbitron,
                  display: 'block',
                  fontSize: '7px',
                  letterSpacing: '1px',
                  color: schwach ? 'var(--ok)' : art.color,
                  marginTop: 1,
                }}
              >
                {a.einheit} · {art.name.toUpperCase()}
                {schwach ? ' ▲' : resist ? ' ▼' : ''}
              </small>
            </button>
          )
        })}
      </div>

      {/* Reaktionen */}
      <div className="grid shrink-0 grid-cols-2 gap-1.5" style={{ marginTop: 6 }}>
        <button
          type="button"
          onClick={blocken}
          className="text-left"
          style={{
            border: '1px solid var(--ok)',
            background: 'rgba(77,255,166,.07)',
            color: 'var(--text)',
            borderRadius: '10px',
            padding: '7px 6px',
            fontSize: '12.5px',
            fontWeight: 600,
            lineHeight: 1.1,
          }}
        >
          Plank
          <small style={{ ...orbitron, display: 'block', fontSize: '6.5px', letterSpacing: '1px', color: 'var(--dim)', marginTop: 1 }}>
            BLOCKEN {Math.round(blockChance(tuer) * 100)}%
          </small>
        </button>
        <button
          type="button"
          onClick={heilen}
          disabled={k.heilungen <= 0}
          className="text-left disabled:opacity-40"
          style={{
            border: '1px solid var(--ok)',
            background: 'rgba(77,255,166,.07)',
            color: 'var(--text)',
            borderRadius: '10px',
            padding: '7px 6px',
            fontSize: '12.5px',
            fontWeight: 600,
            lineHeight: 1.1,
          }}
        >
          Dehnen
          <small style={{ ...orbitron, display: 'block', fontSize: '6.5px', letterSpacing: '1px', color: 'var(--dim)', marginTop: 1 }}>
            HEILEN ({k.heilungen})
          </small>
        </button>
      </div>

      {/* Info */}
      {info && (
        <div
          className="fixed inset-0 z-[60] grid place-items-center p-[22px]"
          style={{ background: 'rgba(3,5,10,.9)', backdropFilter: 'blur(3px)' }}
          onClick={() => setInfo(false)}
        >
          <div
            className="w-full max-w-[340px] rounded-2xl p-[22px]"
            style={{ background: 'var(--panel)', border: '1px solid var(--glow)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ ...orbitron, fontSize: '12px', letterSpacing: '3px', color: 'var(--glow)', marginBottom: 12 }}>
              {tuer.gegnerart.toUpperCase()}
            </h3>
            <b style={{ ...orbitron, fontSize: '9px', letterSpacing: '1px', color: 'var(--dim)', display: 'block' }}>
              ANFÄLLIG GEGEN
            </b>
            <div className="mt-1">
              {tuer.combo ? (
                <span className="tag-w">Übungswechsel ×1,5</span>
              ) : Object.keys(tuer.schwaechen ?? {}).length > 0 ? (
                Object.entries(tuer.schwaechen).map(([a, m]) => (
                  <span key={a} className="tag-w">
                    {ARTEN[a].name} ×{m}
                  </span>
                ))
              ) : (
                <span className="tag-r">keine bekannte Schwäche</span>
              )}
            </div>
            <b style={{ ...orbitron, fontSize: '9px', letterSpacing: '1px', color: 'var(--dim)', display: 'block', marginTop: 12 }}>
              RESISTENT
            </b>
            <div className="mt-1">
              {Object.entries(tuer.resistenzen ?? {}).map(([a, m]) => (
                <span key={a} className="tag-r">
                  {ARTEN[a].name} ×{String(m).replace('.', ',')}
                </span>
              ))}
              {tuer.ausweichrate && <span className="tag-r">weicht oft aus</span>}
              {Object.keys(tuer.resistenzen ?? {}).length === 0 && !tuer.ausweichrate && (
                <span className="tag-w">keine</span>
              )}
            </div>
            <b style={{ ...orbitron, fontSize: '9px', letterSpacing: '1px', color: 'var(--dim)', display: 'block', marginTop: 12 }}>
              GEGEN IHN
            </b>
            <p style={{ fontSize: '12px', color: 'var(--dim)', marginTop: 4 }}>
              Blockchance <span style={{ color: 'var(--glow)' }}>{Math.round(blockChance(tuer) * 100)}%</span> ·
              Heilungen: <span style={{ color: 'var(--ok)' }}>{k.heilungen}</span> ·
              Einschüchterung: <span style={{ color: 'var(--xp)' }}>+{auraBonus}%</span>
            </p>
            <b style={{ ...orbitron, fontSize: '9px', letterSpacing: '1px', color: 'var(--dim)', display: 'block', marginTop: 12 }}>
              BEUTE
            </b>
            <p style={{ ...orbitron, fontSize: '18px', letterSpacing: '6px', color: 'var(--dim)', marginTop: 4 }}>
              ? ? ?
            </p>
            <p style={{ fontSize: '11px', color: 'var(--dim)' }}>
              {tuer.boss ? 'Zwei Funde' : 'Ein Fund'} · wird nach dem Sieg aufgedeckt
            </p>
            <button
              type="button"
              onClick={() => setInfo(false)}
              className="mt-4 w-full bg-transparent"
              style={{
                ...orbitron,
                letterSpacing: '2px',
                fontSize: '11px',
                color: 'var(--glow)',
                border: '1px solid var(--glow)',
                borderRadius: '11px',
                padding: 11,
              }}
            >
              SCHLIESSEN
            </button>
          </div>
        </div>
      )}

      {/* Ergebnis */}
      {popup && (
        <div
          className="fixed inset-0 z-[60] grid place-items-center p-[22px]"
          style={{ background: 'rgba(3,5,10,.9)', backdropFilter: 'blur(3px)' }}
        >
          <div
            className="w-full max-w-[340px] rounded-2xl p-[22px] text-center"
            style={{
              background: 'var(--panel)',
              border: `1px solid ${popup.art === 'sieg' ? 'var(--ok)' : 'var(--danger)'}`,
              boxShadow: `0 0 40px ${popup.art === 'sieg' ? 'rgba(77,255,166,.3)' : 'rgba(255,77,94,.3)'}`,
            }}
          >
            <div style={{ fontSize: 36 }}>
              {popup.art === 'sieg' ? (tuer.boss ? '👑' : '⚔️') : '🛡️'}
            </div>
            <h2
              style={{
                ...orbitron,
                fontSize: '15px',
                letterSpacing: '3px',
                color: popup.art === 'sieg' ? 'var(--ok)' : 'var(--danger)',
                margin: '6px 0 10px',
              }}
            >
              {popup.art === 'sieg'
                ? tuer.boss
                  ? 'BOSS BEZWUNGEN'
                  : 'TÜR GEÖFFNET'
                : 'RÜCKZUG'}
            </h2>
            <p style={{ color: 'var(--dim)', fontSize: '13.5px', lineHeight: 1.6 }}>
              {popup.art === 'sieg'
                ? tuer.boss
                  ? `${dungeon.name} ist abgeschlossen.`
                  : `Tür ${tuer.nr} ist frei. Der Weg führt weiter.`
                : 'Deine Vitalität ist erschöpft. Das System zieht dich aus dem Dungeon.'}
            </p>

            {popup.art === 'sieg' && (
              <div className="mt-3 flex flex-col gap-2">
                {popup.drops?.map((drop, i) => {
                  if (drop.art === 'material') {
                    const m = MATERIALIEN[drop.material]
                    return (
                      <div key={i} className="border px-2 py-1.5" style={{ borderColor: m.color, borderRadius: 8 }}>
                        <p style={{ fontSize: '13px', color: m.color }}>
                          {m.name} ×{drop.menge}
                        </p>
                      </div>
                    )
                  }
                  const item = ITEMS[drop.itemId]
                  const farbe = STUFEN_INFO[item.stufe].color
                  return (
                    <div
                      key={i}
                      style={{
                        border: `1px solid ${farbe}`,
                        borderRadius: 8,
                        padding: '6px 8px',
                        boxShadow: drop.glueck ? `0 0 18px ${farbe}` : 'none',
                      }}
                    >
                      <p style={{ fontSize: '13px', color: farbe }}>
                        {item.name} <span style={{ fontSize: '10px' }}>{STUFEN_INFO[item.stufe].name}</span>
                      </p>
                      {drop.glueck && (
                        <p style={{ ...orbitron, fontSize: '9px', color: farbe, textShadow: `0 0 8px ${farbe}` }}>
                          ✦ GLÜCKSFUND ✦
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
            {popup.art === 'niederlage' && (
              <div style={{ ...orbitron, color: 'var(--danger)', fontSize: '12px', marginTop: 10, lineHeight: 1.9 }}>
                Aura erlischt
                <br />
                Ein getragenes Item wird beschädigt
                <br />
                Durchgang beginnt wieder bei Tür 1
              </div>
            )}

            <button
              type="button"
              onClick={popup.art === 'sieg' ? siegBestaetigen : niederlageBestaetigen}
              className="mt-4 w-full bg-transparent"
              style={{
                ...orbitron,
                letterSpacing: '2px',
                fontSize: '11px',
                color: popup.art === 'sieg' ? 'var(--ok)' : 'var(--danger)',
                border: `1px solid ${popup.art === 'sieg' ? 'var(--ok)' : 'var(--danger)'}`,
                borderRadius: '11px',
                padding: 11,
              }}
            >
              BESTÄTIGEN
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DungeonFight
