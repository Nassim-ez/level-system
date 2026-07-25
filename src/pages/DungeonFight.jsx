import { useEffect, useRef, useState } from 'react'
import { useGame } from '../context/GameContext.jsx'
import FightSprite from '../components/FightSprites.jsx'
import { findDungeon, spriteFor } from '../data/dungeons.js'
import { auraDamageBonus, auraStage } from '../data/aura.js'
import {
  ANGRIFFE,
  ARTEN,
  MAX_VITALITAET,
  MAX_HEILUNGEN,
  HEILUNG_PRO_STUFE,
  BELASTUNG_LABELS,
  BELASTUNG_VIERTEL,
  belastungsStufe,
  blockChance,
  berechneSchaden,
  gegnerSchaden,
  bossPhase,
  FLUCH_HEILUNG,
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
    enemyIndex: 0, // wievielter Gegner der Gruppe
    zug: 0,
    naechsterAngriff: tuer.intervall,
    phase: 0,
    fluch: false,
    blockBereit: false,
    log: [`${tuer.anzahl}× ${tuer.gegnerart} stellen sich dir entgegen.`],
  }
}

function Leiste({ wert, max, farbe, glow, hoehe = 8 }) {
  return (
    <div
      className="w-full overflow-hidden rounded-full border"
      style={{ height: hoehe, background: '#0f1a2e', borderColor: 'var(--line)' }}
    >
      <div
        className="h-full rounded-full"
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
  const [anim, setAnim] = useState({ player: '', enemy: '' })
  const [popup, setPopup] = useState(null)
  const [info, setInfo] = useState(false)
  const [floater, setFloater] = useState(null)
  const timers = useRef([])

  // Nach jedem Zug speichern
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
        log: ['Du hast gerastet. Der Gegner hat sich erholt.'],
      }))
    }
  }, [k?.gerastet])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  // Während des Kampfes scrollt nichts im Hintergrund
  useEffect(() => {
    const vorher = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = vorher
    }
  }, [])

  if (!dungeon || !tuer || !k) return null

  const auraBonus = auraDamageBonus(
    state.aura,
    state.level,
    state.rank,
    dungeon.rank,
    !!tuer.boss,
  )
  const stufe = belastungsStufe(k.belastung)
  const gegnerRest = tuer.anzahl - k.enemyIndex
  // Sofort sperren, sobald der Kampf entschieden ist – das Popup folgt verzögert
  const kampfVorbei = !!popup || !!k.beendet

  const merke = (text, kk) => [text, ...(kk.log ?? [])].slice(0, 2)

  const zeigeFloater = (text, farbe, seite) => {
    setFloater({ text, farbe, seite, id: Date.now() })
    timers.current.push(setTimeout(() => setFloater(null), 1000))
  }

  const animiere = (wer, klasse) => {
    setAnim((a) => ({ ...a, [wer]: klasse }))
    timers.current.push(
      setTimeout(() => setAnim((a) => ({ ...a, [wer]: '' })), 500),
    )
  }

  // --- Gegnerzug ---------------------------------------------------------
  function gegnerZug(kk, blockArt) {
    let neu = { ...kk }
    const dmg = gegnerSchaden({
      gegner: tuer,
      welcher: neu.enemyIndex,
      phase: neu.phase,
      geblockt: blockArt,
    })
    if (blockArt === 'voll') {
      neu.log = merke(`Plank hält! ${tuer.angriffsname} abgewehrt.`, neu)
    } else {
      neu.vitalitaet = Math.max(0, neu.vitalitaet - dmg)
      animiere('player', 'fight-hit')
      zeigeFloater(`−${dmg}`, 'var(--danger)', 'links')
      neu.log = merke(
        blockArt === 'teilweise'
          ? `Block misslungen – ${tuer.angriffsname} trifft für ${dmg}.`
          : `${tuer.gegnerart} nutzt ${tuer.angriffsname}: ${dmg} Schaden.`,
        neu,
      )
    }
    animiere('enemy', 'fight-attack-left')
    neu.naechsterAngriff = tuer.intervall
    neu.blockBereit = false
    if (neu.vitalitaet <= 0) {
      neu.beendet = 'niederlage'
      niederlage()
    }
    return neu
  }

  function niederlage() {
    timers.current.push(
      setTimeout(() => setPopup({ art: 'niederlage' }), 500),
    )
  }

  // --- Spielerzug --------------------------------------------------------
  function angreifen(angriff) {
    if (kampfVorbei) return
    setK((kk) => {
      let neu = { ...kk }
      const dmg = berechneSchaden({
        angriff,
        gegner: tuer,
        rank: state.rank,
        belastung: neu.belastung,
        auraBonus,
        phase: neu.phase,
      })
      // Ausweichen
      if (tuer.ausweichrate && Math.random() < tuer.ausweichrate) {
        neu.log = merke(`${tuer.gegnerart} weicht deinem Angriff aus!`, neu)
        zeigeFloater('DANEBEN', 'var(--dim)', 'rechts')
      } else if (tuer.blockchance && Math.random() < tuer.blockchance) {
        const rest = Math.max(1, Math.round(dmg * 0.3))
        neu.enemyHp = Math.max(0, neu.enemyHp - rest)
        neu.log = merke(`${tuer.gegnerart} blockt ab – nur ${rest} Schaden.`, neu)
        zeigeFloater(`−${rest}`, 'var(--dim)', 'rechts')
        animiere('enemy', 'fight-hit')
      } else {
        neu.enemyHp = Math.max(0, neu.enemyHp - dmg)
        const art = ARTEN[angriff.art]
        neu.log = merke(
          `${angriff.name}: ${dmg} ${art.name}-Schaden${auraBonus > 0 ? ' (Aura)' : ''}.`,
          neu,
        )
        zeigeFloater(`−${dmg}`, art.color, 'rechts')
        animiere('enemy', 'fight-hit')
      }
      animiere('player', 'fight-attack-right')
      neu.belastung += angriff.belastung
      neu.zug += 1

      // Boss-Phasen
      if (tuer.boss) {
        const p = bossPhase(neu.enemyHp, neu.enemyMaxHp)
        if (p > neu.phase) {
          neu.phase = p
          neu.fluch = true
          neu.log = merke(
            `${tuer.gegnerart} wechselt in Phase ${p + 1} – ein Fluch legt sich auf dich!`,
            neu,
          )
        }
      }

      // Gegner besiegt?
      if (neu.enemyHp <= 0) {
        animiere('enemy', 'fight-die')
        if (neu.enemyIndex + 1 < tuer.anzahl) {
          neu.enemyIndex += 1
          neu.enemyHp = tuer.hp
          neu.naechsterAngriff = tuer.intervall
          neu.log = merke(
            `Gegner ${neu.enemyIndex} fällt – der nächste rückt nach und schlägt härter zu!`,
            neu,
          )
          return neu
        }
        neu.beendet = 'sieg'
        timers.current.push(setTimeout(() => setPopup({ art: 'sieg' }), 600))
        return neu
      }

      // Gegnerangriff fällig?
      neu.naechsterAngriff -= 1
      if (neu.naechsterAngriff <= 0) {
        neu = gegnerZug(neu, neu.blockBereit ? 'voll' : null)
      } else if (neu.naechsterAngriff === 1) {
        neu.log = merke(`${tuer.gegnerart} holt aus: ${tuer.angriffsname}!`, neu)
      }
      return neu
    })
  }

  // --- Reaktionen --------------------------------------------------------
  function blocken() {
    if (kampfVorbei) return
    setK((kk) => {
      let neu = { ...kk, belastung: kk.belastung + 3, zug: kk.zug + 1 }
      const chance = blockChance(tuer)
      const erfolg = Math.random() < chance
      neu.naechsterAngriff -= 1
      if (neu.naechsterAngriff <= 0) {
        neu = gegnerZug(neu, erfolg ? 'voll' : 'teilweise')
      } else {
        neu.blockBereit = erfolg
        neu.log = merke(
          erfolg
            ? 'Plank steht – du bist bereit zu blocken.'
            : 'Deine Plank wackelt – der nächste Treffer sitzt.',
          neu,
        )
      }
      return neu
    })
  }

  function heilen() {
    if (kampfVorbei) return
    setK((kk) => {
      if (kk.heilungen <= 0) return kk
      let heilung = HEILUNG_PRO_STUFE[belastungsStufe(kk.belastung)]
      if (kk.fluch) heilung = Math.round(heilung * FLUCH_HEILUNG)
      let neu = {
        ...kk,
        heilungen: kk.heilungen - 1,
        vitalitaet: Math.min(MAX_VITALITAET, kk.vitalitaet + heilung),
        belastung: Math.max(0, kk.belastung - 5),
        zug: kk.zug + 1,
      }
      neu.log = merke(
        `Dehnen: +${heilung} Vitalität${kk.fluch ? ' (Fluch schwächt dich)' : ''}.`,
        neu,
      )
      zeigeFloater(`+${heilung}`, 'var(--ok)', 'links')
      neu.naechsterAngriff -= 1
      if (neu.naechsterAngriff <= 0) neu = gegnerZug(neu, null)
      return neu
    })
  }

  // --- Abschluss ---------------------------------------------------------
  function siegBestaetigen() {
    dispatch({ type: 'DUNGEON_CLEAR_DOOR' })
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

  const auraStufe = auraStage(state.aura, state.level)

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col"
      style={{ height: '100dvh', background: 'var(--bg)' }}
    >
      {/* Kopfzeile */}
      <div
        className="flex shrink-0 items-center justify-between border-b px-3 py-2"
        style={{ borderColor: 'var(--line)' }}
      >
        <button
          type="button"
          onClick={rasten}
          className="bg-transparent px-3 py-1.5"
          style={{
            ...orbitron,
            fontSize: '9px',
            letterSpacing: '2px',
            color: 'var(--ok)',
            border: '1px solid var(--ok)',
            borderRadius: '8px',
          }}
        >
          RASTEN
        </button>
        <p style={{ ...orbitron, fontSize: '11px', letterSpacing: '2px' }}>
          TÜR {tuer.nr} / {dungeon.tueren.length}
        </p>
        <button
          type="button"
          onClick={() => setInfo((v) => !v)}
          className="bg-transparent px-3 py-1.5"
          style={{
            ...orbitron,
            fontSize: '9px',
            letterSpacing: '2px',
            color: 'var(--glow)',
            border: '1px solid var(--glow)',
            borderRadius: '8px',
          }}
        >
          INFO
        </button>
      </div>

      {/* Arena */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 py-2">
        <div className="flex min-h-0 flex-1 items-stretch justify-between gap-2">
          {/* Spieler */}
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="relative flex min-h-0 flex-1 items-center justify-center">
              {auraStufe.bonus > 0 && (
                <div
                  className="aura-ring absolute rounded-full"
                  style={{
                    width: '78%',
                    aspectRatio: '1',
                    border: '1px solid var(--xp)',
                    opacity: 0.65,
                  }}
                />
              )}
              <FightSprite
                name="player"
                className={`relative h-full w-full fight-idle ${anim.player}`}
              />
              {floater?.seite === 'links' && (
                <span
                  key={floater.id}
                  className="float-up absolute left-1/2 top-4"
                  style={{ ...orbitron, fontSize: '15px', color: floater.farbe }}
                >
                  {floater.text}
                </span>
              )}
            </div>
            <p
              className="mt-1 truncate text-center"
              style={{ ...orbitron, fontSize: '9px', letterSpacing: '1px' }}
            >
              {state.name.toUpperCase()}
            </p>
            <Leiste
              wert={k.vitalitaet}
              max={MAX_VITALITAET}
              farbe="linear-gradient(90deg,#7a1622,var(--danger))"
              glow="0 0 8px rgba(255,77,94,.6)"
            />
            <p
              className="text-center"
              style={{ ...orbitron, fontSize: '8px', color: 'var(--dim)' }}
            >
              {k.vitalitaet} / {MAX_VITALITAET}
            </p>
          </div>

          {/* Gegner */}
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="relative flex min-h-0 flex-1 items-center justify-center">
              <FightSprite
                name={spriteFor(tuer.gegnerart)}
                className={`h-full w-full fight-idle ${anim.enemy}`}
              />
              {floater?.seite === 'rechts' && (
                <span
                  key={floater.id}
                  className="float-up absolute left-1/2 top-4"
                  style={{ ...orbitron, fontSize: '15px', color: floater.farbe }}
                >
                  {floater.text}
                </span>
              )}
              <div className="absolute right-0 top-0 flex flex-col items-end gap-1">
                {gegnerRest > 1 && (
                  <span
                    className="px-1.5 py-0.5"
                    style={{
                      ...orbitron,
                      fontSize: '8px',
                      color: 'var(--text)',
                      border: '1px solid var(--line)',
                      borderRadius: '5px',
                      background: 'rgba(10,17,32,.9)',
                    }}
                  >
                    ×{gegnerRest}
                  </span>
                )}
                <span
                  className="px-1.5 py-0.5"
                  style={{
                    ...orbitron,
                    fontSize: '7px',
                    letterSpacing: '1px',
                    color: k.phase > 0 ? 'var(--danger)' : 'var(--dim)',
                    border: `1px solid ${k.phase > 0 ? 'var(--danger)' : 'var(--line)'}`,
                    borderRadius: '5px',
                    background: 'rgba(10,17,32,.9)',
                  }}
                >
                  {k.enemyHp / k.enemyMaxHp <= 0.33
                    ? 'VERZWEIFELT'
                    : k.enemyHp / k.enemyMaxHp <= 0.66
                      ? 'ANGESCHLAGEN'
                      : 'WACHSAM'}
                </span>
                {auraBonus > 0 && (
                  <span
                    className="px-1.5 py-0.5"
                    style={{
                      ...orbitron,
                      fontSize: '7px',
                      letterSpacing: '1px',
                      color: 'var(--xp)',
                      border: '1px solid var(--xp)',
                      borderRadius: '5px',
                      background: 'rgba(10,17,32,.9)',
                      textShadow: '0 0 6px rgba(143,224,255,.7)',
                    }}
                  >
                    EINGESCHÜCHTERT
                  </span>
                )}
              </div>
            </div>
            <p
              className="mt-1 truncate text-center"
              style={{ ...orbitron, fontSize: '9px', letterSpacing: '1px' }}
            >
              {tuer.gegnerart.toUpperCase()}
            </p>
            <Leiste
              wert={k.enemyHp}
              max={k.enemyMaxHp}
              farbe="linear-gradient(90deg,#7a1622,var(--danger))"
              glow="0 0 8px rgba(255,77,94,.6)"
            />
            <p
              className="text-center"
              style={{ ...orbitron, fontSize: '8px', color: 'var(--dim)' }}
            >
              {k.enemyHp} / {k.enemyMaxHp}
            </p>
          </div>
        </div>

        {/* Kampflog, zwei Zeilen */}
        <div
          className="mt-2 shrink-0 border px-2 py-1"
          style={{
            borderColor: 'var(--line)',
            borderRadius: '8px',
            background: 'rgba(10,17,32,.85)',
            height: '38px',
          }}
        >
          {k.log.slice(0, 2).map((zeile, i) => (
            <p
              key={i}
              className="truncate"
              style={{
                fontSize: '10px',
                color: i === 0 ? 'var(--text)' : 'var(--dim)',
                lineHeight: '17px',
              }}
            >
              {zeile}
            </p>
          ))}
        </div>
      </div>

      {/* Belastung + Aura */}
      <div className="flex shrink-0 gap-3 px-3 pt-1">
        <div className="flex-1">
          <p style={{ ...orbitron, fontSize: '8px', color: 'var(--dim)' }}>
            BELASTUNG · {BELASTUNG_LABELS[stufe]}
          </p>
          <Leiste
            wert={k.belastung}
            max={BELASTUNG_VIERTEL}
            farbe={
              stufe === 0
                ? 'var(--ok)'
                : stufe === 1
                  ? 'var(--xp)'
                  : 'var(--danger)'
            }
            glow="none"
            hoehe={5}
          />
        </div>
        <div className="flex-1">
          <p style={{ ...orbitron, fontSize: '8px', color: 'var(--dim)' }}>
            AURA · {auraStufe.name.toUpperCase()}
          </p>
          <Leiste
            wert={auraStufe.bonus}
            max={25}
            farbe="var(--xp)"
            glow="0 0 6px rgba(143,224,255,.6)"
            hoehe={5}
          />
        </div>
      </div>

      {/* Ankündigung */}
      <p
        className={`shrink-0 px-3 py-1 text-center ${k.naechsterAngriff <= 1 ? 'warn-blink' : ''}`}
        style={{
          ...orbitron,
          fontSize: '9px',
          letterSpacing: '1px',
          color: k.naechsterAngriff <= 1 ? 'var(--danger)' : 'var(--dim)',
        }}
      >
        {k.naechsterAngriff <= 1
          ? `⚠ ${tuer.angriffsname.toUpperCase()} KOMMT`
          : `NÄCHSTER ANGRIFF IN ${k.naechsterAngriff} ZÜGEN`}
      </p>

      {/* Angriffe */}
      <div className="grid shrink-0 grid-cols-3 gap-1.5 px-3">
        {ANGRIFFE.map((a) => {
          const art = ARTEN[a.art]
          const schwach = tuer.schwaechen?.includes(a.art)
          const resist = tuer.resistenzen?.includes(a.art)
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => angreifen(a)}
              className="bg-transparent px-1 py-1.5"
              style={{
                border: `1px solid ${schwach ? 'var(--ok)' : 'var(--line)'}`,
                borderRadius: '9px',
                opacity: resist ? 0.55 : 1,
              }}
            >
              <p style={{ ...orbitron, fontSize: '8px', letterSpacing: '0.5px' }}>
                {a.kurz}
              </p>
              <p style={{ fontSize: '9px', color: art.color }}>
                {a.reps} {a.einheit}
                {schwach ? ' ▲' : resist ? ' ▼' : ''}
              </p>
            </button>
          )
        })}
      </div>

      {/* Reaktionen */}
      <div className="grid shrink-0 grid-cols-2 gap-1.5 px-3 pb-3 pt-1.5">
        <button
          type="button"
          onClick={blocken}
          className="bg-transparent py-2"
          style={{
            ...orbitron,
            fontSize: '9px',
            letterSpacing: '1px',
            color: 'var(--glow)',
            border: '1px solid var(--glow)',
            borderRadius: '9px',
          }}
        >
          PLANK · BLOCKEN
        </button>
        <button
          type="button"
          onClick={heilen}
          disabled={k.heilungen <= 0}
          className="bg-transparent py-2 disabled:opacity-40"
          style={{
            ...orbitron,
            fontSize: '9px',
            letterSpacing: '1px',
            color: 'var(--ok)',
            border: '1px solid var(--ok)',
            borderRadius: '9px',
          }}
        >
          DEHNEN · HEILEN ({k.heilungen})
        </button>
      </div>

      {/* Info-Einblendung */}
      {info && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center px-6"
          style={{ background: 'rgba(2,4,9,.85)' }}
          onClick={() => setInfo(false)}
        >
          <div
            className="w-full max-w-[320px] rounded-[16px] border p-4"
            style={{ background: 'var(--panel)', borderColor: 'var(--glow)' }}
          >
            <p style={{ ...orbitron, fontSize: '11px', color: 'var(--glow)', letterSpacing: '2px' }}>
              ◆ {tuer.gegnerart.toUpperCase()}
            </p>
            <p className="mt-2" style={{ fontSize: '12px', color: 'var(--dim)' }}>
              Angriff: {tuer.angriffsname} · {tuer.schaden} Schaden alle{' '}
              {tuer.intervall} Züge
            </p>
            <p style={{ fontSize: '12px', color: 'var(--ok)' }}>
              Schwach gegen:{' '}
              {tuer.schwaechen?.map((s) => ARTEN[s].name).join(', ') || '–'}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--danger)' }}>
              Resistent gegen:{' '}
              {tuer.resistenzen?.map((s) => ARTEN[s].name).join(', ') || '–'}
            </p>
            <p className="mt-2" style={{ fontSize: '11px', color: 'var(--dim)' }}>
              Block-Chance: {Math.round(blockChance(tuer) * 100)}% · Ausweichen:{' '}
              {Math.round((tuer.ausweichrate ?? 0) * 100)}%
              {tuer.combo ? ' · Combo' : ''}
            </p>
            <p className="mt-2" style={{ fontSize: '11px', color: 'var(--xp)' }}>
              Einschüchterung: +{auraBonus}% Schaden
            </p>
          </div>
        </div>
      )}

      {/* Ergebnis */}
      {popup && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center px-6"
          style={{ background: 'rgba(2,4,9,.85)' }}
        >
          <div
            className="w-full max-w-[320px] rounded-[16px] border p-5 text-center"
            style={{
              background: 'var(--panel)',
              borderColor:
                popup.art === 'sieg' ? 'var(--ok)' : 'var(--danger)',
              boxShadow: `0 0 30px ${popup.art === 'sieg' ? 'rgba(77,255,166,.3)' : 'rgba(255,77,94,.3)'}`,
            }}
          >
            <p
              style={{
                ...orbitron,
                fontSize: '18px',
                letterSpacing: '2px',
                color: popup.art === 'sieg' ? 'var(--ok)' : 'var(--danger)',
              }}
            >
              {popup.art === 'sieg' ? 'TÜR GESCHAFFT' : 'RÜCKZUG'}
            </p>
            <p className="mt-2 text-[13px]" style={{ color: 'var(--dim)' }}>
              {popup.art === 'sieg'
                ? tuer.boss
                  ? `${dungeon.boss} ist besiegt – der Dungeon ist abgeschlossen!`
                  : `${tuer.name} ist geräumt.`
                : 'Du wirst aus dem Dungeon getragen. Deine XP behältst du, deine Aura nicht.'}
            </p>
            <button
              type="button"
              onClick={
                popup.art === 'sieg' ? siegBestaetigen : niederlageBestaetigen
              }
              className="mt-4 bg-transparent px-5 py-2"
              style={{
                ...orbitron,
                fontSize: '10px',
                letterSpacing: '2px',
                color: popup.art === 'sieg' ? 'var(--ok)' : 'var(--danger)',
                border: `1px solid ${popup.art === 'sieg' ? 'var(--ok)' : 'var(--danger)'}`,
                borderRadius: '10px',
              }}
            >
              WEITER
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DungeonFight
