import { useEffect, useRef, useState } from 'react'
import { useGame } from '../context/GameContext.jsx'
import FightSprite from '../components/FightSprites.jsx'
import { findDungeon } from '../data/dungeons.js'
import {
  ITEMS,
  MATERIALIEN,
  herabgestuft,
  raritaet,
  summiereEffekte,
} from '../data/items.js'
import { zieheDrops } from '../data/loot.js'
import {
  serienFaktor,
  MAT_PRO_TUER,
  MAT_PRO_BOSS,
} from '../data/daily.js'
import { auraDamageBonus, auraStage } from '../data/aura.js'
import {
  ANGRIFFE,
  ARTEN,
  MAX_VITALITAET,
  maxVitalitaet,
  belastungMit,
  heilMenge,
  MAX_HEILUNGEN,
  HEILUNG_ANTEIL,
  BELASTUNG_LABELS,
  BELASTUNG_BLOCK,
  BELASTUNG_HEILEN,
  belastungsStufe,
  blockChanceDetail,
  berechneSchaden,
  gegnerSchaden,
  TREFFER_DECKEL,
  moodIndex,
  phasenIndex,
  phasenText,
  MOODS,
  AMBER,
  BELASTUNG_FARBEN,
  COMBO_MAX,
  FLUCH_CHANCE,
  FLUCH_DAUER,
} from '../data/combat.js'

const orbitron = { fontFamily: "'Orbitron', sans-serif" }

// Aufsteigende Staubpartikel – links blau (eigene Seite), rechts rot
const STAUB = [
  { left: '14%', dauer: 7.5, delay: 0, farbe: 'rgba(63,182,255,.55)' },
  { left: '27%', dauer: 9.2, delay: 2.4, farbe: 'rgba(143,224,255,.45)' },
  { left: '38%', dauer: 8.1, delay: 4.1, farbe: 'rgba(63,182,255,.35)' },
  { left: '62%', dauer: 8.6, delay: 1.2, farbe: 'rgba(255,77,94,.45)' },
  { left: '74%', dauer: 7.1, delay: 3.3, farbe: 'rgba(255,77,94,.55)' },
  { left: '86%', dauer: 9.8, delay: 5.2, farbe: 'rgba(255,107,120,.35)' },
]

function neuerKampf(tuer, maxVit = MAX_VITALITAET) {
  return {
    nr: tuer.nr,
    maxVit,
    vitalitaet: maxVit,
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
        borderColor: mine ? '#1b3a5c' : '#3a1a22',
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

function DungeonFight({ onExit, daily = false }) {
  const { state, dispatch } = useGame()
  // Der Tageslauf nutzt dieselbe Ansicht, aber ohne Tor-Mechanik
  const dungeon = daily
    ? { id: 'daily', name: 'Tages-Dungeon', rank: state.rank, tueren: state.daily.doors }
    : findDungeon(state.dungeon.run)
  const tuer = daily
    ? state.daily.doors?.[state.daily.progress]
    : dungeon?.tueren.find((t) => t.nr === state.dungeon.door)
  const gespeichert = daily ? state.daily.fight : state.dungeon.fight

  const effekte = summiereEffekte(state.equipment)
  const maxVit = maxVitalitaet(effekte)
  const [k, setK] = useState(
    () => gespeichert ?? (tuer ? neuerKampf(tuer, maxVit) : null),
  )
  const [pAnim, setPAnim] = useState('')
  const [eAnim, setEAnim] = useState('')
  const [shake, setShake] = useState(false)
  const [slam, setSlam] = useState(false)
  const [flies, setFlies] = useState([])
  const [popup, setPopup] = useState(null)
  const [info, setInfo] = useState(false)
  const timers = useRef([])
  const merkFlag = useRef(false)

  useEffect(() => {
    if (k) dispatch({ type: daily ? 'DAILY_SYNC' : 'DUNGEON_FIGHT_SYNC', fight: k })
  }, [k, dispatch, daily])

  // Nach dem Rasten: Werte auffrischen
  useEffect(() => {
    if (k?.gerastet) {
      setK((alt) => ({
        ...alt,
        gerastet: false,
        maxVit,
        vitalitaet: maxVit,
        belastung: 0,
        heilungen: MAX_HEILUNGEN,
        block: 'offen',
        zug: 0,
        fluch: 0,
        log: ['Du hast gerastet. Der Gegner hat sich erholt.'],
      }))
    }
  }, [k?.gerastet, maxVit])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  useEffect(() => {
    const vorher = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = vorher
    }
  }, [])

  // Torschluss-Einblendung nur im Hauptlauf
  useEffect(() => {
    if (!daily && !merkFlag.current && state.dungeon.inside && (k?.zug ?? 0) === 0) {
      merkFlag.current = true
    }
  }, [daily, state.dungeon.inside, k?.zug])

  if (!dungeon || !tuer || !k) return null

  const auraBonus = auraDamageBonus(
    state.aura,
    state.level,
    state.rank,
    dungeon.rank,
  )
  const stufe = belastungsStufe(k.belastung)
  const blockDetail = blockChanceDetail(tuer, {
    level: state.level,
    aura: state.aura,
    effekte,
  })
  // Obergrenze eines einzelnen Treffers, wie sie gegnerSchaden anwendet
  const deckelWert = Math.max(
    1,
    Math.round((k.maxVit ?? maxVit) * TREFFER_DECKEL),
  )
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
    const { schaden: dmg, gedeckelt } = gegnerSchaden({
      gegner: tuer,
      lebende: neu.lebende,
      block,
      maxVit: neu.maxVit ?? maxVit,
    })
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
    // Deckelung sichtbar machen, sonst wirkt der Schaden willkürlich niedrig
    if (gedeckelt) {
      neu.log = nachricht(
        `Abgefangen: höchstens ${Math.round(TREFFER_DECKEL * 100)}% Vitalität pro Treffer.`,
        'sys',
        neu,
      )
    }
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
      // Im Hauptlauf bleibt ein getragenes Teil beim Gegner zurück. Die Wahl
      // fällt hier, damit das Popup es beim Namen nennen kann.
      const verlust = daily ? null : waehleVerlust()
      timers.current.push(
        setTimeout(() => setPopup({ art: 'niederlage', verlust }), 700),
      )
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
        effekte,
      })
      if (neu.fluch > 0) neu.fluch -= 1

      neu.enemyHp = Math.max(0, neu.enemyHp - schaden)
      neu.belastung += belastung
      fliegen(`-${schaden}`, stark ? 'crit' : '', true)
      anim('e', 'flinch', 300)
      ruettel()
      neu.log = nachricht(`${a.name} trifft für ${schaden} Schaden.`, 'me', neu)

      // Phasenwechsel: der Gegner meldet sich, sobald er eine Stufe fällt
      const vorherigePhase = neu.phase ?? 0
      const jetzigePhase = phasenIndex(neu.enemyHp, neu.enemyMaxHp, tuer.phasen)
      if (jetzigePhase > vorherigePhase && neu.enemyHp > 0) {
        neu.phase = jetzigePhase
        const text = phasenText(tuer, jetzigePhase)
        if (text) neu.log = nachricht(text, 'bad', neu)
      }

      if (neu.enemyHp === 0) {
        neu.lebende -= 1
        if (neu.lebende > 0) {
          anim('e', 'die', 400)
          neu.enemyHp = tuer.hp
          neu.phase = 0
          neu.log = nachricht(`Ein Gegner fällt. Noch ${neu.lebende}.`, 'good', neu)
          return zugEnde(neu)
        }
        // Kammer geräumt
        anim('e', 'die', 1100)
        neu.beendet = 'sieg'
        // Der Tageslauf gibt Material, der Hauptlauf gezogene Beute
        const drops = daily
          ? [
              {
                art: 'material',
                material: tuer.material,
                menge: Math.round(
                  (tuer.boss ? MAT_PRO_BOSS : MAT_PRO_TUER) *
                    serienFaktor((state.daily.streak ?? 0) + (tuer.boss ? 1 : 0)),
                ),
              },
            ]
          : zieheDrops(dungeon.id, state.rank, tuer.boss ? 2 : 1, Math.random, effekte)
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
      const haelt = Math.random() < blockDetail.chance
      let neu = {
        ...kk,
        belastung: kk.belastung + belastungMit(BELASTUNG_BLOCK, effekte),
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
      const h = heilMenge(eff, kk.maxVit ?? maxVit, effekte)
      let neu = {
        ...kk,
        heilungen: kk.heilungen - 1,
        vitalitaet: Math.min(kk.maxVit ?? maxVit, kk.vitalitaet + h),
        belastung: kk.belastung + belastungMit(BELASTUNG_HEILEN, effekte),
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
  // Welches getragene Teil bleibt bei einer Niederlage zurück?
  function waehleVerlust() {
    const getragene = Object.entries(state.equipment).filter(([, id]) => id)
    if (getragene.length === 0) return null
    const [slot, itemId] =
      getragene[Math.floor(Math.random() * getragene.length)]
    return { slot, itemId }
  }

  // Liegt an dieser Tür verlorene Ausrüstung?
  const verloreneHier =
    !daily && tuer
      ? (state.lostItems ?? []).find(
          (e) => e.dungeonId === dungeon?.id && e.doorIndex === tuer.nr,
        )
      : null

  function siegBestaetigen() {
    if (daily) {
      dispatch({ type: 'DAILY_CLEAR_DOOR' })
      setPopup(null)
      onExit()
      return
    }
    // Erst die Rückholung zeigen, dann erst den Sieg buchen – sonst wäre der
    // Eintrag schon fort, wenn das Popup ihn benennen soll.
    if (verloreneHier) {
      setPopup({ art: 'zurueck', drops: popup.drops, eintrag: verloreneHier })
      return
    }
    dispatch({ type: 'DUNGEON_CLEAR_DOOR', drops: popup.drops })
    setPopup(null)
    onExit()
  }
  function rueckholungBestaetigen() {
    dispatch({ type: 'DUNGEON_CLEAR_DOOR', drops: popup.drops })
    setPopup(null)
    onExit()
  }
  function niederlageBestaetigen() {
    dispatch(
      daily
        ? { type: 'DAILY_DEFEAT' }
        : { type: 'DUNGEON_DEFEAT', slot: popup.verlust?.slot },
    )
    setPopup(null)
    onExit()
  }

  // Sieg und Rückholung tragen die helle Akzentfarbe, die Niederlage Rot
  const popupFarbe =
    popup?.art === 'sieg'
      ? 'var(--glow)'
      : popup?.art === 'zurueck'
        ? 'var(--xp)'
        : 'var(--danger)'
  const popupSchein =
    popup?.art === 'niederlage' ? 'rgba(255,77,94,.3)' : 'rgba(63,182,255,.3)'
  // Im Tageslauf jederzeit verlassen, im Hauptlauf rasten
  function verlassen() {
    dispatch({ type: daily ? 'DAILY_LEAVE' : 'DUNGEON_REST' })
    onExit()
  }

  const restZuege = tuer.intervall - (k.zug % tuer.intervall)
  const gleichAngriff = restZuege === 1

  return (
    <div
      className="fixed inset-0 z-40 mx-auto flex flex-col overflow-hidden"
      style={{
        height: '100dvh',
        maxWidth: 430,
        background: 'var(--bg)',
        padding: '10px 12px 12px',
      }}
    >
      {/* Kopfzeile */}
      <div className="flex shrink-0 items-center gap-2 px-0.5 pb-2">
        <button
          type="button"
          onClick={verlassen}
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
          {daily ? 'VERLASSEN' : 'RASTEN'}
        </button>
        <p
          className="flex-1 text-center"
          style={{ ...orbitron, fontSize: '10px', letterSpacing: '2px', color: 'var(--glow)' }}
        >
          {daily ? 'STUFE' : 'TÜR'} {tuer.nr} / {dungeon.tueren.length}
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
              style={{ height: 'min(38vh, 168px)' }}
            />
            <div className="mt-0.5 text-center">
              <div style={{ ...orbitron, fontSize: '12px', fontWeight: 900, color: 'var(--glow)' }}>
                {state.name}
              </div>
            </div>
            <Leiste
              wert={k.vitalitaet}
              max={k.maxVit ?? maxVit}
              mine
              farbe={
                k.vitalitaet <= (k.maxVit ?? maxVit) * 0.3
                  ? 'linear-gradient(90deg,#8b1a28,#ff4d5e)'
                  : 'linear-gradient(90deg,#2e7fd4,#8fe0ff)'
              }
              glow="0 0 9px rgba(63,182,255,.4)"
            />
            <div style={{ ...orbitron, fontSize: '8.5px', color: 'var(--dim)', marginTop: 3 }}>
              {k.vitalitaet} / {k.maxVit ?? maxVit} VIT
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
              style={{ height: 'min(38vh, 168px)' }}
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

        {/* Aufsteigender Staub */}
        {STAUB.map((d, i) => (
          <span
            key={i}
            className="dust"
            style={{
              left: d.left,
              background: d.farbe,
              animationDuration: `${d.dauer}s`,
              animationDelay: `${d.delay}s`,
            }}
          />
        ))}

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
                        ? 'var(--xp)'
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
          <div className="min-w-0">
            <b className="block truncate" style={{ ...orbitron, fontSize: '8px', letterSpacing: '1.5px', color: 'var(--dim)', marginBottom: 3 }}>
              BELASTUNG {k.belastung} · {BELASTUNG_LABELS[stufe]}
            </b>
            <div
              className="flex overflow-hidden rounded-lg border"
              style={{ height: 8, background: '#0c1420', borderColor: 'var(--line)' }}
            >
              <i style={{ width: `${Math.min(k.belastung, 100) / 3}%`, background: BELASTUNG_FARBEN[0], transition: 'width .35s' }} />
              <i style={{ width: `${Math.min(Math.max(k.belastung - 100, 0), 100) / 3}%`, background: BELASTUNG_FARBEN[1], transition: 'width .35s' }} />
              <i style={{ width: `${Math.min(Math.max(k.belastung - 200, 0), 100) / 3}%`, background: BELASTUNG_FARBEN[2], transition: 'width .35s' }} />
            </div>
          </div>
          <div className="min-w-0">
            <b className="block truncate" style={{ ...orbitron, fontSize: '8px', letterSpacing: '1.5px', color: 'var(--dim)', marginBottom: 3 }}>
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
            color: gleichAngriff ? 'var(--danger)' : AMBER,
          }}
        >
          {gleichAngriff
            ? `${tuer.gegnerart} holt aus – ${tuer.angriffsname} im nächsten Zug!`
            : `${tuer.gegnerart} sammelt Kraft · ${tuer.angriffsname} in ${restZuege} Zügen`}
        </div>
      </div>

      {/* Angriffe */}
      <div className="grid shrink-0 grid-cols-3 gap-1.5" style={{ marginTop: 6 }}>
        {ANGRIFFE.map((a) => {
          const art = ARTEN[a.art]
          const schwach = tuer.schwaechen?.[a.art] > 1
          const resist = tuer.resistenzen?.[a.art] < 1
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => angreifen(a)}
              className="min-w-0 text-center"
              style={{
                border: `1px solid ${schwach ? 'var(--xp)' : 'rgba(63,182,255,.6)'}`,
                background: 'rgba(63,182,255,.08)',
                color: 'var(--text)',
                borderRadius: '9px',
                padding: '6px 4px',
                fontSize: '11.5px',
                fontWeight: 600,
                lineHeight: 1.15,
                opacity: resist ? 0.55 : 1,
              }}
            >
              <span className="block truncate">{a.name}</span>
              <small
                style={{
                  ...orbitron,
                  display: 'block',
                  fontSize: '6.5px',
                  letterSpacing: '.5px',
                  color: schwach ? 'var(--xp)' : art.color,
                  marginTop: 1,
                }}
              >
                {a.einheit}
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
          className="text-center"
          style={{
            border: '1px solid rgba(63,182,255,.4)',
            background: 'rgba(63,182,255,.04)',
            color: 'var(--text)',
            borderRadius: '9px',
            padding: '6px 6px',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: 1.15,
          }}
        >
          Plank
          <small style={{ ...orbitron, display: 'block', fontSize: '6.5px', letterSpacing: '1px', color: 'var(--dim)', marginTop: 1 }}>
            BLOCKEN {blockDetail.gesamt}%
          </small>
        </button>
        <button
          type="button"
          onClick={heilen}
          disabled={k.heilungen <= 0}
          className="text-center disabled:opacity-40"
          style={{
            border: '1px solid rgba(63,182,255,.4)',
            background: 'rgba(63,182,255,.04)',
            color: 'var(--text)',
            borderRadius: '9px',
            padding: '6px 6px',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: 1.15,
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
              Blockchance <span style={{ color: 'var(--glow)' }}>{blockDetail.gesamt}%</span> ·
              Heilungen: <span style={{ color: 'var(--xp)' }}>{k.heilungen}</span> ·
              Einschüchterung: <span style={{ color: 'var(--xp)' }}>+{auraBonus}%</span>
            </p>
            <p style={{ fontSize: '12px', color: 'var(--dim)', marginTop: 4 }}>
              Ein einzelner Treffer nimmt höchstens{' '}
              <span style={{ color: 'var(--warn)' }}>
                {Math.round(TREFFER_DECKEL * 100)}%
              </span>{' '}
              deiner Vitalität – höchstens {deckelWert} von{' '}
              {k.maxVit ?? maxVit}.
            </p>
            <p style={{ ...orbitron, fontSize: '10px', color: 'var(--dim)', marginTop: 3 }}>
              Basis {blockDetail.basis}% · Aura{' '}
              {blockDetail.aura >= 0 ? '+' : ''}
              {blockDetail.aura} · Level{' '}
              {blockDetail.level >= 0 ? '+' : ''}
              {blockDetail.level}
              {blockDetail.ausruestung !== 0 && (
                <>
                  {' '}· Ausrüstung {blockDetail.ausruestung >= 0 ? '+' : ''}
                  {blockDetail.ausruestung}
                </>
              )}{' '}
              ={' '}
              <span style={{ color: 'var(--glow)' }}>{blockDetail.gesamt}%</span>
              {blockDetail.basis +
                blockDetail.aura +
                blockDetail.level +
                blockDetail.ausruestung !==
                blockDetail.gesamt && ' (Grenze)'}
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
              border: `1px solid ${popupFarbe}`,
              boxShadow: `0 0 40px ${popupSchein}`,
            }}
          >
            <div style={{ fontSize: 36 }}>
              {popup.art === 'sieg'
                ? tuer.boss
                  ? '👑'
                  : '⚔️'
                : popup.art === 'zurueck'
                  ? '🎒'
                  : '🛡️'}
            </div>
            <h2
              style={{
                ...orbitron,
                fontSize: '15px',
                letterSpacing: '3px',
                color: popupFarbe,
                margin: '6px 0 10px',
              }}
            >
              {popup.art === 'sieg'
                ? tuer.boss
                  ? 'BOSS BEZWUNGEN'
                  : daily
                    ? 'STUFE GESCHAFFT'
                    : 'TÜR GEÖFFNET'
                : popup.art === 'zurueck'
                  ? 'ZURÜCKGEHOLT'
                  : 'RÜCKZUG'}
            </h2>
            <p style={{ color: 'var(--dim)', fontSize: '13.5px', lineHeight: 1.6 }}>
              {popup.art === 'sieg'
                ? tuer.boss
                  ? `${dungeon.name} ist abgeschlossen.`
                  : `${daily ? 'Stufe' : 'Tür'} ${tuer.nr} ist frei. Der Weg führt weiter.`
                : popup.art === 'zurueck'
                  ? `${ITEMS[popup.eintrag.itemId]?.name} lag beim ${popup.eintrag.enemyName}. Du nimmst es wieder an dich – gezeichnet vom Liegenbleiben.`
                  : 'Deine Vitalität ist erschöpft. Das System zieht dich aus dem Dungeon.'}
            </p>

            {popup.art === 'zurueck' &&
              (() => {
                const alt = ITEMS[popup.eintrag.itemId]
                const neu = ITEMS[herabgestuft(popup.eintrag.itemId) ?? popup.eintrag.itemId]
                const altR = raritaet(alt)
                const neuR = raritaet(neu)
                return (
                  <div
                    className="mt-3 flex items-center justify-center gap-3 border px-3 py-2"
                    style={{ borderColor: 'var(--line)', borderRadius: 10 }}
                  >
                    <span style={{ fontSize: '11px', color: altR?.color }}>
                      {altR?.name}
                    </span>
                    <span style={{ color: 'var(--dim)', fontSize: '12px' }}>→</span>
                    <span style={{ fontSize: '11px', color: neuR?.color }}>
                      {neuR?.name}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--danger)' }}>
                      · beschädigt
                    </span>
                  </div>
                )
              })()}
            {popup.art === 'zurueck' && (
              <p className="mt-2" style={{ fontSize: '11.5px', color: 'var(--dim)' }}>
                Es liegt im Inventar. Der Schmied stellt es zum halben Preis
                wieder her.
              </p>
            )}

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
                  const farbe = raritaet(item)?.color ?? 'var(--glow)'
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
                        {item.name} <span style={{ fontSize: '10px' }}>{raritaet(item)?.name}</span>
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
            {popup.art === 'niederlage' && popup.verlust && (
              <p
                className="mt-3 border px-3 py-2"
                style={{
                  fontSize: '13px',
                  lineHeight: 1.55,
                  color: 'var(--text)',
                  borderColor: 'rgba(255,77,94,.5)',
                  borderRadius: 10,
                  background: 'rgba(255,77,94,.06)',
                }}
              >
                Der{' '}
                <span style={{ color: raritaet(ITEMS[popup.verlust.itemId])?.color }}>
                  {ITEMS[popup.verlust.itemId]?.name}
                </span>{' '}
                bleibt beim {tuer.gegnerart} · Tür {tuer.nr} · {dungeon.name}.
              </p>
            )}
            {popup.art === 'niederlage' && (
              <div style={{ ...orbitron, color: 'var(--danger)', fontSize: '12px', marginTop: 10, lineHeight: 1.9 }}>
                {daily ? (
                  <>
                    XP bleiben dir
                    <br />
                    Keine Materialien · Tages-Serie endet
                    <br />
                    Morgen wartet ein neuer Lauf
                  </>
                ) : (
                  <>
                    Aura erlischt
                    <br />
                    {popup.verlust
                      ? 'Hol es dir an derselben Tür zurück'
                      : 'Du trägst nichts – nichts geht verloren'}
                    <br />
                    Durchgang beginnt wieder bei Tür 1
                  </>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={
                popup.art === 'sieg'
                  ? siegBestaetigen
                  : popup.art === 'zurueck'
                    ? rueckholungBestaetigen
                    : niederlageBestaetigen
              }
              className="mt-4 w-full bg-transparent"
              style={{
                ...orbitron,
                letterSpacing: '2px',
                fontSize: '11px',
                color: popupFarbe,
                border: `1px solid ${popupFarbe}`,
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
