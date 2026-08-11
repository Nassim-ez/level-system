import { createContext, useContext, useEffect, useReducer } from 'react'
import {
  getDayType,
  requiredQuestIds,
  ergaenzeZiele,
  einheitVon,
  inSekunden,
  todayKey,
  POOL_XP,
  raiseTargets,
  startVarianten,
  variantenWechsel,
  uebungZuQuest,
  varianteOffen,
  STUFENWECHSEL_ANTEIL,
  EINSTIEG_ZIEL,
  PROTEIN_XP,
} from '../data/quests.js'
import { CLASSES } from '../data/classes.js'
import { proteinBedarf } from '../data/lebensmittel.js'
import {
  TRAININGSSYSTEME,
  KLASSE_ZU_SYSTEM,
  STANDARD_SYSTEM,
  systemOder,
  uebungenImSystem,
  wechselSperre,
} from '../data/trainingssysteme.js'
import { TITLES } from '../data/titles.js'
import { normalizeGender } from '../data/gender.js'
import { auraGain } from '../data/aura.js'
import { TUER_XP, BOSS_XP, RAST_GEGNER_HEILUNG } from '../data/combat.js'
import {
  ITEMS,
  herabgestuft,
  hochgestuft,
  aufwertKosten,
  schmelzErtrag,
  rangObergrenze,
  migriereItemId,
  raritaet,
  summiereEffekte,
} from '../data/items.js'
import { zieheDrops, materialName } from '../data/loot.js'
import {
  RANK_THRESHOLDS,
  RANK_TESTS,
  buildRankTest,
  nextRank,
} from '../data/ranks.js'
import { findDungeon, doorHp } from '../data/dungeons.js'
import {
  ziehTag,
  serienFaktor,
  stufenXp,
  laufAktuell,
  MAT_PRO_TUER,
  MAT_PRO_BOSS,
  SCHLUESSEL_AB,
} from '../data/daily.js'

const STORAGE_KEY = 'system_save'

const initialState = {
  name: 'Ennis',
  level: 1,
  xp: 0,
  xpGoal: 500,
  rank: 'E',
  points: 0,
  stats: { STR: 5, VIT: 5, AGI: 5, INT: 5 },
  streak: 0,
  title: 'Neuling',
  lastDay: null,
  dayType: 'A',
  questProgress: {},
  poolTasks: [],
  drawnTask: null,
  doneToday: [],
  equipment: {
    helm: null,
    kette: null,
    umhang: null,
    brust: null,
    waffe: null,
    ring: null,
    hose: null,
    schuhe: null,
  },
  inventory: ['waff_e1', 'serienschutz'],
  rankTestActive: false,
  rankTestTasks: null, // beim Freischalten eingefrorene Prüfungsziele
  aura: 0,
  dungeon: {
    run: null,
    door: 0,
    progress: {},
    inside: false,
    enemyHp: null,
    killed: 0,
    stones: 1,
    fight: null, // laufender Kampf, wird nach jedem Zug gespeichert
  },
  materials: { basalt: 0, knochen: 0, schatten: 0, wolf: 0 },
  daily: { date: null, doors: [], progress: 0, done: false, streak: 0, fight: null },
  damagedItems: {}, // im Dungeon beschädigte Items (itemId → true)
  // Beim Tod zurückgelassene Ausrüstung, holbar durch einen erneuten Sieg
  // an derselben Tür. Mehrere Verluste an verschiedenen Türen sind möglich.
  lostItems: [],
  klasse: null,
  // Körpergewicht, ausschließlich für die Berechnung des Eiweißbedarfs
  gewicht: null,
  // Eiweiß des laufenden Tages. Der Serienzähler ist reine Anzeige:
  // kein Bonus, keine Strafe, keine Mahnung bei Nichterreichen.
  ernaehrung: { date: null, eintraege: [], streak: 0, belohnt: false },
  // Gewähltes Trainingssystem – bestimmt Wochenplan, Klasse und XP-Bonus
  system: null,
  systemGewechselt: null,
  gender: null,
  // Selbst gewählte Übungsstufen, je Quest { index, rank }
  varianten: {},
  // Beim letzten Rangaufstieg gewechselte Stufen, bis das Popup sie zeigt
  stufenWechsel: [],
  // Der Nachtherr auf dem Hohlen Thron ist gefallen – Ende der Rangleiter
  thronBezwungen: false,
  // Abschlussmeldung, bis das Popup sie gezeigt hat
  abschluss: null,
  onboarded: false,
  unlockedTitles: ['neuling'],
  lifetime: { liegestuetze: 0, klimmzuege: 0, dungeons: 0, bestStreak: 0 },
  baseTargets: {
    liegestuetze: 20,
    kniebeugen: 30,
    crunches: 25,
    klimmzuege: 3,
    dehnen: 10,
  },
  log: [],
}

// Beute aus gezogenen Drops in Inventar bzw. Materialien einsortieren
function verteileBeute(state, drops) {
  let inventory = [...state.inventory]
  let materials = { ...state.materials }
  let log = state.log
  for (const drop of drops ?? []) {
    if (drop.art === 'material') {
      materials[drop.material] = (materials[drop.material] ?? 0) + drop.menge
      log = withLog(log, `${materialName(drop.material)} ×${drop.menge}`, {
        detail: 'Materialien-Bündel',
      })
    } else {
      inventory.push(drop.itemId)
      const item = ITEMS[drop.itemId]
      log = withLog(log, `${item?.name ?? drop.itemId} erhalten`, {
        detail: drop.glueck
          ? `Glücksfund · ${raritaet(item)?.name ?? ''}`
          : `Beute · ${raritaet(item)?.name ?? ''}`,
      })
    }
  }
  return { inventory, materials, log }
}

/**
 * Sucht verlorene Ausrüstung an einer bestimmten Tür. Gibt das alte und das
 * um eine Stufe gesenkte Item zurück sowie die übrigen Einträge – oder null,
 * wenn an dieser Tür nichts liegt.
 */
function holeVerloreneZurueck(state, dungeonId, doorIndex) {
  const liste = state.lostItems ?? []
  const idx = liste.findIndex(
    (e) => e.dungeonId === dungeonId && e.doorIndex === doorIndex,
  )
  if (idx < 0) return null
  const eintrag = liste[idx]
  // Eine Rarität herunter, Gewöhnlich bleibt Gewöhnlich
  const neu = herabgestuft(eintrag.itemId) ?? eintrag.itemId
  return {
    eintrag,
    alt: eintrag.itemId,
    neu,
    rest: liste.filter((_, i) => i !== idx),
  }
}

function withLog(log, text, extra = {}) {
  return [{ datum: todayKey(), text, ...extra }, ...log].slice(0, 50)
}

// Der XP-Aufschlag haengt am Trainingssystem und gilt fuer die Kategorien,
// auf die es sich konzentriert. Eine leere Liste heisst: auf alles.
function xpMultiplier(state, kategorie) {
  if (!state.system) return 1
  const bonus = systemOder(state.system).bonus
  if (!bonus) return 1
  const trifft =
    bonus.kategorien.length === 0 ||
    (kategorie && bonus.kategorien.includes(kategorie))
  return trifft ? 1 + bonus.wert / 100 : 1
}

function unlockTitles(state) {
  let unlocked = state.unlockedTitles
  let log = state.log
  for (const titel of Object.values(TITLES)) {
    if (!titel.check || unlocked.includes(titel.id)) continue
    if (titel.check(state)) {
      unlocked = [...unlocked, titel.id]
      log = withLog(log, `Titel „${titel.name}“ freigeschaltet`, {
        detail: titel.beschreibung,
      })
    }
  }
  if (unlocked === state.unlockedTitles) return state
  return { ...state, unlockedTitles: unlocked, log }
}

function rootReducer(state, action) {
  const next = reducer(state, action)
  if (next === state) return state
  return unlockTitles(next)
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_XP': {
      let { xp, level, xpGoal, points, aura } = state
      let log = state.log
      let amount = action.amount
      if (amount > 0) {
        amount = Math.round(amount * xpMultiplier(state, action.kategorie))
      }
      xp += amount
      let auraGewinn = 0
      while (xp >= xpGoal) {
        xp -= xpGoal
        level += 1
        xpGoal = Math.round(xpGoal * 1.25)
        points += 3
        // Aura-Gewinn pro Level-Up = das erreichte Level
        auraGewinn += auraGain(level)
      }
      if (level > state.level) {
        aura += auraGewinn
        log = withLog(log, `Level ${level} erreicht`, {
          detail: `+${(level - state.level) * 3} Punkte`,
        })
        log = withLog(log, `Aura +${auraGewinn}`, {
          detail: `Aura gesamt: ${aura}`,
        })
      }
      let rankTestActive = state.rankTestActive
      let rankTestTasks = state.rankTestTasks
      const next = nextRank(state.rank)
      if (next && level >= RANK_THRESHOLDS[next] && !rankTestActive) {
        rankTestActive = true
        // Ziele einmalig einfrieren, damit spätere Boni sie nicht verschieben
        rankTestTasks = buildRankTest(state.rank, state.baseTargets)
        log = withLog(log, 'Aufstiegsprüfung freigeschaltet', {
          detail: `Rang ${state.rank} → ${next}`,
        })
      }
      return {
        ...state,
        xp,
        level,
        xpGoal,
        points,
        aura,
        rankTestActive,
        rankTestTasks,
        log,
      }
    }
    case 'SPEND_POINT': {
      if (state.points <= 0) return state
      return {
        ...state,
        points: state.points - 1,
        stats: {
          ...state.stats,
          [action.stat]: state.stats[action.stat] + 1,
        },
      }
    }
    case 'NEW_DAY': {
      if (state.lastDay === action.today) return state
      let { streak, xp, lifetime } = state
      let inventory = state.inventory
      let log = state.log
      if (state.lastDay) {
        const required = requiredQuestIds(state.system, state.dayType)
        const allDone =
          required.every((id) => state.doneToday.includes(id)) &&
          (state.questProgress.steps ?? 0) > 0
        if (allDone) {
          streak += 1
          if (streak > lifetime.bestStreak) {
            lifetime = { ...lifetime, bestStreak: streak }
          }
          log = withLog(log, 'Serie verlängert', { detail: `${streak} Tage` })
        } else if (inventory.includes('serienschutz')) {
          // Serienschutz-Stein wird automatisch verbraucht, Serie bleibt
          inventory = [...inventory]
          inventory.splice(inventory.indexOf('serienschutz'), 1)
          log = withLog(log, 'Serie gerettet', {
            detail: 'Serienschutz-Stein verbraucht',
          })
        } else {
          streak = 0
          xp = Math.max(0, xp - 50)
          log = withLog(log, 'Serie verloren', { detail: '−50 XP' })
        }
      }
      // Tages-Dungeon: neuen Lauf ziehen; ein ungeklärter Vortag beendet die Serie
      const vortagGeklaert = state.daily?.progress >= 3
      const daily = {
        date: action.today,
        doors: ziehTag(action.today, state.rank),
        progress: 0,
        done: false,
        streak: state.daily?.date ? (vortagGeklaert ? state.daily.streak : 0) : 0,
        fight: null,
      }
      if (state.daily?.date && !vortagGeklaert && (state.daily.streak ?? 0) > 0) {
        log = withLog(log, 'Tages-Serie verloren', {
          detail: 'Der Lauf von gestern blieb offen',
        })
      }

      // Eiweiß: der Tag beginnt leer. Die Serie zählt erfüllte Tage, mehr
      // nicht – kein Bonus, keine Strafe, keine Meldung beim Abreißen.
      const eiweissBedarf = proteinBedarf(state.gewicht) ?? 0
      const eiweissGestern = (state.ernaehrung?.eintraege ?? []).reduce(
        (summe, e) => summe + (e.protein ?? 0),
        0,
      )
      const eiweissGedeckt = eiweissBedarf > 0 && eiweissGestern >= eiweissBedarf
      const ernaehrung = {
        date: action.today,
        eintraege: [],
        streak: eiweissGedeckt ? (state.ernaehrung?.streak ?? 0) + 1 : 0,
        belohnt: false,
      }

      // Erledigte Wochen-Aufgaben aus dem Pool entfernen, dann neu ziehen
      const poolTasks = state.poolTasks.filter((t) => !t.done)
      const drawnTask =
        poolTasks.length > 0
          ? poolTasks[Math.floor(Math.random() * poolTasks.length)]
          : null
      return {
        ...state,
        lastDay: action.today,
        dayType: action.dayType,
        questProgress: {},
        doneToday: [],
        streak,
        xp,
        lifetime,
        inventory,
        log,
        poolTasks,
        drawnTask,
        daily,
        ernaehrung,
      }
    }
    case 'LOG_ZEIT': {
      // Sekundenübungen zählen hoch, bis das Tagesziel steht
      if (state.doneToday.includes(action.id)) return state
      const ziel = state.baseTargets?.[action.id] ?? 0
      const bisher = state.questProgress?.zeit?.[action.id] ?? 0
      const stand = Math.min(ziel, bisher + (action.sekunden ?? 0))
      const next = {
        ...state,
        questProgress: {
          ...state.questProgress,
          zeit: { ...(state.questProgress?.zeit ?? {}), [action.id]: stand },
        },
      }
      // Ziel erreicht: die Quest wird ganz normal abgeschlossen
      if (stand >= ziel && ziel > 0) {
        return reducer(next, {
          type: 'COMPLETE_QUEST',
          id: action.id,
          xp: action.xp,
          stat: action.stat,
          kategorie: action.kategorie,
          name: action.name,
        })
      }
      return next
    }
    case 'COMPLETE_QUEST': {
      if (state.doneToday.includes(action.id)) return state
      const awarded = Math.round(action.xp * xpMultiplier(state, action.kategorie))
      let next = {
        ...state,
        log: withLog(state.log, `${action.name ?? action.id} erledigt`, {
          detail: 'Quest',
          xp: awarded,
        }),
      }
      next = reducer(next, {
        type: 'ADD_XP',
        amount: action.xp,
        stat: action.stat,
        kategorie: action.kategorie,
      })
      if (action.poolId != null) {
        next = {
          ...next,
          poolTasks: next.poolTasks.map((t) =>
            t.id === action.poolId ? { ...t, done: true } : t,
          ),
        }
      }
      // Lifetime-Zähler füttern (Negativ-Klimmzüge zählen nicht als echte)
      if (action.id === 'liegestuetze' || action.id === 'klimmzuege') {
        const geleistet = state.baseTargets?.[action.id] ?? 0
        next = {
          ...next,
          lifetime: {
            ...next.lifetime,
            [action.id]: (next.lifetime[action.id] ?? 0) + geleistet,
          },
        }
      }
      return { ...next, doneToday: [...next.doneToday, action.id] }
    }
    case 'ADD_POOL_TASK': {
      const name = action.name?.trim()
      if (!name) return state
      return {
        ...state,
        poolTasks: [
          ...state.poolTasks,
          { id: Date.now(), name, done: false },
        ],
      }
    }
    case 'COMPLETE_POOL_TASK': {
      const task = state.poolTasks.find((t) => t.id === action.id)
      if (!task || task.done) return state
      if (state.drawnTask?.id === action.id) return state
      const halfXp = POOL_XP / 2
      const awarded = Math.round(halfXp * xpMultiplier(state, undefined))
      let next = {
        ...state,
        poolTasks: state.poolTasks.map((t) =>
          t.id === action.id ? { ...t, done: true } : t,
        ),
        log: withLog(state.log, `${task.name} erledigt`, {
          detail: 'Wochen-Aufgabe (ohne Ziehung)',
          xp: awarded,
        }),
      }
      next = reducer(next, { type: 'ADD_XP', amount: halfXp })
      return next
    }
    case 'COMPLETE_ONBOARDING': {
      if (state.onboarded) return state
      const levelByRank = { E: 1, D: 5, C: 10, B: 18 }
      const level = levelByRank[action.rank] ?? 1
      let xpGoal = 500
      for (let i = 1; i < level; i++) xpGoal = Math.round(xpGoal * 1.25)
      return {
        ...state,
        onboarded: true,
        name: action.name?.trim() || state.name,
        gender: normalizeGender(action.gender ?? state.gender),
        rank: action.rank,
        system: action.system ?? STANDARD_SYSTEM,
        klasse: systemOder(action.system).klasse,
        baseTargets: ergaenzeZiele(
          action.baseTargets ?? state.baseTargets,
          uebungenImSystem(action.system),
        ),
        // Wer eine Übung noch gar nicht schafft, startet auf der untersten
        // Sprosse der Leiter statt bei der Variante seines Rangs
        varianten: action.maxima
          ? startVarianten(
              action.maxima,
              action.rank,
              uebungenImSystem(action.system),
            )
          : state.varianten,
        level,
        xp: 0,
        xpGoal,
        points: 3 * (level - 1),
        log: withLog(state.log, 'Einstufung abgeschlossen', {
          detail: `Rang ${action.rank} · Level ${level}`,
        }),
      }
    }
    case 'SET_GEWICHT': {
      const gewicht = Number(action.gewicht)
      if (!Number.isFinite(gewicht) || gewicht <= 0) return state
      return { ...state, gewicht: Math.round(gewicht) }
    }
    case 'ERNAEHRUNG_ADD': {
      const eintrag = {
        lebensmittelId: action.lebensmittelId,
        menge: action.menge,
        protein: action.protein,
        zeit: new Date().toISOString(),
      }
      const ernaehrung = {
        ...state.ernaehrung,
        date: todayKey(),
        eintraege: [...(state.ernaehrung?.eintraege ?? []), eintrag],
      }
      let next = { ...state, ernaehrung }
      // Bedarf gedeckt: einmal am Tag gibt es XP und einen Log-Eintrag
      const bedarf = proteinBedarf(state.gewicht) ?? 0
      const summe = ernaehrung.eintraege.reduce((s, e) => s + (e.protein ?? 0), 0)
      if (bedarf > 0 && summe >= bedarf && !ernaehrung.belohnt) {
        next = {
          ...next,
          ernaehrung: { ...ernaehrung, belohnt: true },
          log: withLog(state.log, 'Eiweißbedarf gedeckt', {
            // Nachkommastellen deutsch schreiben
            detail: `${String(Math.round(summe * 10) / 10).replace('.', ',')} von ${bedarf} g`,
            xp: PROTEIN_XP,
          }),
        }
        next = reducer(next, { type: 'ADD_XP', amount: PROTEIN_XP })
      }
      return next
    }
    case 'ERNAEHRUNG_REMOVE': {
      const eintraege = (state.ernaehrung?.eintraege ?? []).filter(
        (_, i) => i !== action.index,
      )
      return { ...state, ernaehrung: { ...state.ernaehrung, eintraege } }
    }
    case 'SET_VARIANTE': {
      // Eigene Wahl der Übungsstufe, gilt bis zum nächsten Rangwechsel
      const uebung = uebungZuQuest(action.questId)
      const variante = uebung?.varianten?.[action.index]
      if (!variante || !varianteOffen(variante, state.rank)) return state
      return {
        ...state,
        varianten: {
          ...state.varianten,
          [action.questId]: { index: action.index, rank: state.rank },
        },
        log: withLog(state.log, `Tagesziel: ${variante.name}`, {
          detail: `${uebung.name} · selbst gewählt`,
        }),
      }
    }
    case 'CLEAR_STUFENWECHSEL': {
      if (!state.stufenWechsel?.length) return state
      return { ...state, stufenWechsel: [] }
    }
    case 'CLEAR_ABSCHLUSS': {
      if (!state.abschluss) return state
      return { ...state, abschluss: null }
    }
    case 'RESET_GAME': {
      localStorage.removeItem(STORAGE_KEY)
      return { ...initialState }
    }
    case 'SAVE_EXPORTED': {
      return {
        ...state,
        log: withLog(state.log, 'Spielstand gesichert', {
          detail: action.dateiname ?? 'Datei heruntergeladen',
        }),
      }
    }
    case 'SET_TITLE': {
      if (!state.unlockedTitles.includes(action.id)) return state
      return { ...state, title: TITLES[action.id].name }
    }
    case 'DUNGEON_SELECT': {
      // Dungeon auswählen (Türkarte ansehen) – nur außerhalb eines Laufs
      if (state.dungeon.inside) return state
      const dungeon = findDungeon(action.runId)
      if (!dungeon || dungeon.rank !== state.rank) return state
      return {
        ...state,
        dungeon: { ...state.dungeon, run: action.runId, door: 0, progress: {} },
      }
    }
    case 'DUNGEON_BACK': {
      // Zurück zur Auswahl – nur solange das Tor offen ist
      if (state.dungeon.inside) return state
      return { ...state, dungeon: { ...state.dungeon, run: null, door: 0 } }
    }
    case 'DUNGEON_OPEN_DOOR': {
      const dungeon = findDungeon(state.dungeon.run)
      const tuer = dungeon?.tueren.find((t) => t.nr === action.nr)
      if (!tuer) return state
      // Nur die nächste offene Tür ist betretbar
      const naechste = dungeon.tueren.find((t) => !state.dungeon.progress[t.nr])
      if (naechste?.nr !== action.nr) return state
      const zuerst = !state.dungeon.inside
      let log = state.log
      if (zuerst) {
        log = withLog(log, `${dungeon.name} betreten`, {
          detail: 'Das Tor hat sich geschlossen',
        })
      }
      // Ein gespeicherter Kampf gilt nur für seine eigene Tür
      const fight =
        state.dungeon.fight?.nr === action.nr ? state.dungeon.fight : null
      return {
        ...state,
        dungeon: {
          ...state.dungeon,
          inside: true,
          door: action.nr,
          enemyHp: doorHp(tuer),
          fight,
        },
        log,
      }
    }
    case 'DUNGEON_CLEAR_DOOR': {
      const dungeon = findDungeon(state.dungeon.run)
      const tuer = dungeon?.tueren.find((t) => t.nr === state.dungeon.door)
      if (!tuer || !state.dungeon.inside) return state
      const progress = { ...state.dungeon.progress, [tuer.nr]: true }
      const killed = state.dungeon.killed + tuer.anzahl
      // Beute: eine Tür gibt einen Drop, der Boss zwei
      const drops =
        action.drops ??
        zieheDrops(
          dungeon.id,
          state.rank,
          tuer.boss ? 2 : 1,
          Math.random,
          summiereEffekte(state.equipment),
        )
      const beute = verteileBeute(state, drops)

      // Hing an dieser Tür verlorene Ausrüstung, kehrt sie beschädigt und
      // eine Stufe niedriger ins Inventar zurück – nicht in den Slot.
      const geholt = holeVerloreneZurueck(state, dungeon.id, tuer.nr)
      const inventory = geholt ? [...beute.inventory, geholt.neu] : beute.inventory
      const damagedItems = geholt
        ? { ...state.damagedItems, [geholt.neu]: true }
        : state.damagedItems
      const lostItems = geholt ? geholt.rest : (state.lostItems ?? [])
      const beuteLog = geholt
        ? withLog(beute.log, `${ITEMS[geholt.neu]?.name} zurückgeholt`, {
            detail: `${raritaet(ITEMS[geholt.alt])?.name} → ${raritaet(ITEMS[geholt.neu])?.name} · beschädigt`,
          })
        : beute.log

      if (!tuer.boss) {
        let next = {
          ...state,
          inventory,
          damagedItems,
          lostItems,
          materials: beute.materials,
          dungeon: {
            ...state.dungeon,
            progress,
            killed,
            door: 0,
            enemyHp: null,
            fight: null,
          },
          log: withLog(beuteLog, `Tür ${tuer.nr} geschafft`, {
            detail: `${tuer.name} · ${tuer.anzahl}× ${tuer.gegnerart}`,
            xp: TUER_XP,
          }),
        }
        next = reducer(next, { type: 'ADD_XP', amount: TUER_XP })
        return next
      }
      // Bosssieg: Tor öffnet sich, doppelte Beute und XP
      const log = withLog(beuteLog, `${dungeon.boss} besiegt`, {
        detail: `${dungeon.name} abgeschlossen`,
        xp: BOSS_XP,
      })
      let next = {
        ...state,
        dungeon: {
          ...state.dungeon,
          run: null,
          door: 0,
          progress: {},
          inside: false,
          enemyHp: null,
          killed: 0,
          fight: null,
        },
        inventory,
        damagedItems,
        lostItems,
        materials: beute.materials,
        lifetime: {
          ...state.lifetime,
          dungeons: (state.lifetime.dungeons ?? 0) + 1,
        },
        log,
      }
      // Der Hohle Thron schließt die Rangleiter ab – einmalige Abschlussmeldung
      if (dungeon.finale && !state.thronBezwungen) {
        next.thronBezwungen = true
        next.abschluss = { dungeon: dungeon.name, boss: dungeon.boss }
        next.log = withLog(next.log, 'Die Rangleiter ist geschlossen', {
          detail: `${dungeon.boss} gefallen · ${dungeon.name}`,
        })
      }
      next = reducer(next, { type: 'ADD_XP', amount: BOSS_XP })
      return next
    }
    case 'UPGRADE_ITEM': {
      // Genau eine Rarität hoch, nie über die Obergrenze des eigenen Rangs
      const item = ITEMS[action.itemId]
      const ziel = hochgestuft(action.itemId)
      if (!item || !ziel) return state
      const beschaedigt = !!state.damagedItems?.[action.itemId]
      // Nur die Wiederherstellung darf die Rang-Grenze berühren
      if (!beschaedigt && item.rar >= rangObergrenze(state.rank)) return state

      const kosten = aufwertKosten(item.rar, beschaedigt)
      const vorrat = state.materials?.[item.material] ?? 0
      if (kosten == null || vorrat < kosten) return state

      const materials = { ...state.materials, [item.material]: vorrat - kosten }

      // Item entweder im Inventar oder am Körper ersetzen
      let inventory = [...state.inventory]
      let equipment = { ...state.equipment }
      const idx = inventory.indexOf(action.itemId)
      if (idx >= 0) {
        inventory[idx] = ziel
      } else {
        const slot = Object.keys(equipment).find(
          (s) => equipment[s] === action.itemId,
        )
        if (!slot) return state
        equipment[slot] = ziel
      }
      const damagedItems = { ...state.damagedItems }
      delete damagedItems[action.itemId]

      return {
        ...state,
        materials,
        inventory,
        equipment,
        damagedItems,
        log: withLog(
          state.log,
          `${item.name} ${beschaedigt ? 'wiederhergestellt' : 'aufgewertet'}`,
          {
            detail: `${raritaet(item)?.name} → ${raritaet(ITEMS[ziel])?.name} · ${kosten} ${materialName(item.material)}`,
          },
        ),
      }
    }
    case 'MELT_ITEM': {
      // Einschmelzen gibt Material der Item-Sorte; Getragenes bleibt tabu
      const item = ITEMS[action.itemId]
      if (!item || item.rar == null) return state
      const idx = state.inventory.indexOf(action.itemId)
      if (idx < 0) return state

      const ertrag = schmelzErtrag(item.rar)
      const inventory = [...state.inventory]
      inventory.splice(idx, 1)
      const materials = {
        ...state.materials,
        [item.material]: (state.materials?.[item.material] ?? 0) + ertrag,
      }
      const damagedItems = { ...state.damagedItems }
      delete damagedItems[action.itemId]

      return {
        ...state,
        inventory,
        materials,
        damagedItems,
        log: withLog(state.log, `${item.name} eingeschmolzen`, {
          detail: `+${ertrag} ${materialName(item.material)}`,
        }),
      }
    }
    case 'DAILY_SYNC': {
      // Kampfzustand des Tageslaufs nach jedem Zug sichern
      return { ...state, daily: { ...state.daily, fight: action.fight } }
    }
    case 'DAILY_ENSURE': {
      // Lauf für heute anlegen, falls noch keiner existiert.
      // Ältere Spielstände haben Stufen ohne XP-Wert – für die wird neu
      // gezogen. Die Ziehung hängt am Datum, es kommen also dieselben
      // Gegner heraus, nur mit den XP je Stufe.
      if (laufAktuell(state.daily, action.today)) return state
      const gleicherTag = state.daily?.date === action.today
      return {
        ...state,
        daily: {
          date: action.today,
          doors: ziehTag(action.today, state.rank),
          progress: gleicherTag ? (state.daily.progress ?? 0) : 0,
          done: gleicherTag ? !!state.daily.done : false,
          streak: state.daily?.streak ?? 0,
          fight: gleicherTag ? (state.daily.fight ?? null) : null,
        },
      }
    }
    case 'DAILY_CLEAR_DOOR': {
      const daily = state.daily
      const tuer = daily?.doors?.[daily.progress]
      if (!tuer || daily.done) return state

      const boss = !!tuer.boss
      const progress = daily.progress + 1
      const streak = boss ? (daily.streak ?? 0) + 1 : (daily.streak ?? 0)

      // Material nach Gegnersorte, mit Serien-Faktor
      const faktor = serienFaktor(streak)
      const menge = Math.round((boss ? MAT_PRO_BOSS : MAT_PRO_TUER) * faktor)
      const materials = {
        ...state.materials,
        [tuer.material]: (state.materials?.[tuer.material] ?? 0) + menge,
      }

      let inventory = state.inventory
      let log = withLog(
        state.log,
        boss ? `${tuer.gegnerart} bezwungen` : `Stufe ${tuer.nr} geschafft`,
        {
          detail: `+${menge} ${materialName(tuer.material)}${faktor > 1 ? ` · Serie ×${faktor}` : ''}`,
          xp: stufenXp(tuer),
        },
      )
      // Der siebte Tag in Folge bringt zusätzlich einen Schlüssel
      if (boss && streak === SCHLUESSEL_AB) {
        inventory = [...inventory, 'dungeonschluessel']
        log = withLog(log, 'Dungeon-Schlüssel erhalten', {
          detail: 'Sieben Tage Tages-Dungeon in Folge',
        })
      }

      let next = {
        ...state,
        materials,
        inventory,
        daily: {
          ...daily,
          progress,
          streak,
          done: boss,
          fight: null,
        },
        log,
      }
      next = reducer(next, { type: 'ADD_XP', amount: stufenXp(tuer) })
      return next
    }
    case 'DAILY_DEFEAT': {
      // Niederlage: XP bleiben, keine Materialien, keine Aura- oder Item-Folgen
      return {
        ...state,
        daily: { ...state.daily, done: true, streak: 0, fight: null },
        log: withLog(state.log, 'Tages-Dungeon gescheitert', {
          detail: 'Serie endet · morgen wartet ein neuer Lauf',
        }),
      }
    }
    case 'DAILY_LEAVE': {
      // Verlassen ist jederzeit erlaubt und beendet den Versuch nicht
      return { ...state, daily: { ...state.daily, fight: null } }
    }
    case 'DUNGEON_FIGHT_SYNC': {
      // Kampfzustand nach jedem Zug sichern
      return { ...state, dungeon: { ...state.dungeon, fight: action.fight } }
    }
    case 'DUNGEON_REST': {
      // Rasten: erholt, zurück zur Türkarte – das Tor bleibt zu
      const fight = state.dungeon.fight
      return {
        ...state,
        dungeon: {
          ...state.dungeon,
          door: 0,
          fight: fight
            ? {
                ...fight,
                gerastet: true,
                // Der aktuelle Gegner erholt sich um 25 %
                enemyHp: Math.min(
                  fight.enemyMaxHp,
                  Math.round(fight.enemyHp + fight.enemyMaxHp * RAST_GEGNER_HEILUNG),
                ),
              }
            : null,
        },
        log: withLog(state.log, 'Gerastet', {
          detail: 'Vitalität aufgefüllt · Gegner erholt sich',
        }),
      }
    }
    case 'DUNGEON_DEFEAT': {
      // Niederlage: Aura erlischt, Fortschritt weg, ein getragenes Item
      // bleibt beim Gegner zurück. Herabgestuft wird es erst bei der
      // Rückholung – hier verliert der Jäger es nur.
      const dungeon = findDungeon(state.dungeon.run)
      const tuer = dungeon?.tueren.find((t) => t.nr === state.dungeon.door)
      const getragene = Object.entries(state.equipment).filter(([, id]) => id)
      // Die Kampfansicht wählt das Teil, damit das Popup es benennen kann;
      // ohne Vorgabe entscheidet der Zufall hier.
      const gewaehlt =
        getragene.find(([slot]) => slot === action.slot) ??
        (getragene.length > 0
          ? getragene[Math.floor(Math.random() * getragene.length)]
          : null)

      let equipment = state.equipment
      let lostItems = state.lostItems ?? []
      let verlust = null
      if (gewaehlt) {
        const [slot, itemId] = gewaehlt
        equipment = { ...equipment, [slot]: null }
        verlust = {
          itemId,
          rarity: ITEMS[itemId]?.rar ?? 0,
          damaged: !!state.damagedItems?.[itemId],
          dungeonId: state.dungeon.run,
          doorIndex: state.dungeon.door,
          enemyName: tuer?.gegnerart ?? tuer?.name ?? 'Unbekannt',
          date: todayKey(),
        }
        lostItems = [...lostItems, verlust]
      }

      let log = withLog(state.log, 'Rückzug aus dem Dungeon', {
        detail: `${dungeon?.name ?? 'Dungeon'} · Fortschritt verloren`,
      })
      if (verlust) {
        log = withLog(log, `${ITEMS[verlust.itemId]?.name} zurückgelassen`, {
          detail: `${verlust.enemyName} · Tür ${verlust.doorIndex} · ${dungeon?.name ?? 'Dungeon'}`,
        })
      }
      log = withLog(log, 'Deine Aura ist erloschen', {
        detail: 'Im Dungeon gefallen',
      })
      return {
        ...state,
        aura: 0,
        equipment,
        lostItems,
        dungeon: {
          ...state.dungeon,
          run: null,
          door: 0,
          progress: {},
          inside: false,
          enemyHp: null,
          killed: 0,
          fight: null,
        },
        log,
      }
    }
    case 'DUNGEON_RETURN_STONE': {
      // Rückkehrstein: raus ohne Beute, Fortschritt verfällt, XP bleiben
      if (!state.dungeon.inside || state.dungeon.stones <= 0) return state
      const dungeon = findDungeon(state.dungeon.run)
      return {
        ...state,
        dungeon: {
          ...state.dungeon,
          stones: state.dungeon.stones - 1,
          run: null,
          door: 0,
          progress: {},
          inside: false,
          enemyHp: null,
          killed: 0,
          fight: null,
        },
        log: withLog(state.log, 'Rückkehrstein benutzt', {
          detail: `${dungeon?.name ?? 'Dungeon'} verlassen · kein Drop`,
        }),
      }
    }
    case 'SET_GENDER': {
      if (!['m', 'w'].includes(action.gender)) return state
      return { ...state, gender: action.gender }
    }
    case 'CHOOSE_SYSTEM': {
      // Erstwahl im Onboarding: Klasse und Tagesziele folgen dem System
      const system = TRAININGSSYSTEME[action.id]
      if (!system) return state
      const baseTargets = ergaenzeZiele(
        state.baseTargets,
        uebungenImSystem(system.id),
      )
      return {
        ...state,
        system: system.id,
        klasse: system.klasse,
        baseTargets,
        log: withLog(state.log, `Trainingssystem ${system.name}`, {
          detail: `Klasse ${CLASSES[system.klasse]?.name ?? system.klasse}`,
        }),
      }
    }
    case 'SWITCH_SYSTEM': {
      const system = TRAININGSSYSTEME[action.id]
      if (!system || system.id === state.system) return state
      // Höchstens ein Wechsel pro Woche
      if (wechselSperre(state.systemGewechselt) > 0) return state
      const alt = systemOder(state.system)
      // Für Übungen, die es bisher nicht gab, Ziele aus dem Bestand schätzen
      const baseTargets = ergaenzeZiele(
        state.baseTargets,
        uebungenImSystem(system.id),
      )
      return {
        ...state,
        system: system.id,
        klasse: system.klasse,
        systemGewechselt: todayKey(),
        baseTargets,
        // Der neue Plan bringt eigene Übungen mit; eigene Stufenwahl
        // und Tagesfortschritt beginnen von vorn
        varianten: {},
        doneToday: [],
        log: withLog(state.log, `Trainingssystem gewechselt`, {
          detail: `${alt.name} → ${system.name} · Klasse ${CLASSES[system.klasse]?.name ?? system.klasse}`,
        }),
      }
    }
    case 'LOG_STEPS': {
      const steps = Math.max(0, Math.floor(action.steps) || 0)
      const earned = Math.min(Math.floor(steps / 1000) * 10, action.cap)
      const already = state.questProgress.stepsXp ?? 0
      const delta = earned - already
      let next =
        delta > 0 ? reducer(state, { type: 'ADD_XP', amount: delta }) : state
      next = {
        ...next,
        questProgress: {
          ...next.questProgress,
          steps,
          stepsXp: Math.max(earned, already),
        },
      }
      return next
    }
    case 'RANK_TASK_PROGRESS': {
      if (!state.rankTestActive) return state
      const test = RANK_TESTS[state.rank]
      const tasks =
        state.rankTestTasks ??
        buildRankTest(state.rank, state.baseTargets)
      const task = tasks?.find((t) => t.quest === action.taskId)
      if (!task) return state
      const prev = state.questProgress.rankTest ?? {}
      const value = Math.min((prev[action.taskId] ?? 0) + action.amount, task.ziel)
      const rankTest = { ...prev, [action.taskId]: value }
      let lifetime = state.lifetime
      const added = value - (prev[action.taskId] ?? 0)
      // Negativ-Klimmzüge zählen nicht als echte Klimmzüge
      if (
        added > 0 &&
        (action.taskId === 'liegestuetze' ||
          (action.taskId === 'klimmzuege' && !task.negativ))
      ) {
        lifetime = {
          ...lifetime,
          [action.taskId]: (lifetime[action.taskId] ?? 0) + added,
        }
      }
      const passed = tasks.every((t) => (rankTest[t.quest] ?? 0) >= t.ziel)
      if (!passed) {
        return {
          ...state,
          lifetime,
          questProgress: { ...state.questProgress, rankTest },
        }
      }
      // Prüfung bestanden: Rang-Aufstieg + Belohnung
      const newRank = nextRank(state.rank)
      const after = nextRank(newRank)
      const stillActive = !!after && state.level >= RANK_THRESHOLDS[after]
      // Alle Tagesziele um 15 % anheben
      let baseTargets = raiseTargets(state.baseTargets)
      let log = withLog(state.log, `Rang ${newRank} erreicht`, {
        detail: 'Aufstiegsprüfung bestanden · Tagesziele +15 %',
      })
      log = withLog(log, `${ITEMS[test.reward].name} erhalten`, {
        detail: 'Belohnung',
      })

      // Mit dem neuen Rang rücken Übungen eine Sprosse hoch. Die eigene
      // Variantenwahl gilt nur bis zum Rangwechsel und fällt hier weg.
      const wechsel = variantenWechsel(
        state,
        { ...state, rank: newRank, varianten: {} },
        uebungenImSystem(state.system),
      )
      for (const w of wechsel) {
        // Die schwerere Variante erlaubt weniger Wiederholungen
        baseTargets = {
          ...baseTargets,
          [w.questId]: Math.ceil(
            (state.baseTargets?.[w.questId] ?? 0) * STUFENWECHSEL_ANTEIL,
          ),
        }
        log = withLog(log, `Neue Übungsstufe: ${w.neu}`, {
          detail: `${w.alt} → ${w.neu} · Tagesziel auf ${baseTargets[w.questId]} gesetzt`,
        })
      }

      return {
        ...state,
        rank: newRank,
        rankTestActive: stillActive,
        // Folgt direkt die nächste Prüfung, deren Ziele neu einfrieren
        rankTestTasks: stillActive ? buildRankTest(newRank, baseTargets) : null,
        lifetime,
        baseTargets,
        varianten: {},
        stufenWechsel: wechsel,
        inventory: [...state.inventory, test.reward],
        questProgress: { ...state.questProgress, rankTest: {} },
        log,
      }
    }
    case 'EQUIP_ITEM': {
      const item = ITEMS[action.itemId]
      if (!item?.slot || !state.inventory.includes(action.itemId)) return state
      const inventory = state.inventory.filter((id) => id !== action.itemId)
      const prev = state.equipment[item.slot]
      if (prev) inventory.push(prev)
      return {
        ...state,
        inventory,
        equipment: { ...state.equipment, [item.slot]: action.itemId },
        log: withLog(state.log, `${item.name} angelegt`, {
          detail: 'Ausrüstung',
        }),
      }
    }
    case 'UNEQUIP_ITEM': {
      const current = state.equipment[action.slot]
      if (!current) return state
      return {
        ...state,
        inventory: [...state.inventory, current],
        equipment: { ...state.equipment, [action.slot]: null },
      }
    }
    default:
      return state
  }
}

// Alte Materialnamen auf die vier Sorten des Händlers abbilden
const ALTE_MATERIALIEN = {
  eisenstaub: 'basalt',
  knochenmehl: 'knochen',
  nebelessenz: 'schatten',
}

function migriereSpielstand(gespeichert) {
  const inventory = (gespeichert.inventory ?? []).map(migriereItemId)
  const equipment = { ...gespeichert.equipment }
  for (const slot of Object.keys(equipment)) {
    if (equipment[slot]) equipment[slot] = migriereItemId(equipment[slot])
  }
  const damagedItems = {}
  for (const [id, wert] of Object.entries(gespeichert.damagedItems ?? {})) {
    if (wert) damagedItems[migriereItemId(id)] = true
  }
  const materials = { ...initialState.materials }
  for (const [sorte, menge] of Object.entries(gespeichert.materials ?? {})) {
    const ziel = ALTE_MATERIALIEN[sorte] ?? sorte
    if (ziel in materials) materials[ziel] += menge ?? 0
  }
  // Ältere Spielstände kennen die verlorene Ausrüstung noch nicht.
  // Einträge ohne bekanntes Item oder Dungeon wären nicht mehr einlösbar
  // und fliegen raus, statt als Karteileiche im Panel zu stehen.
  const lostItems = (gespeichert.lostItems ?? [])
    .map((e) => {
      const itemId = migriereItemId(e?.itemId)
      return {
        ...e,
        itemId,
        rarity: ITEMS[itemId]?.rar ?? e?.rarity ?? 0,
        damaged: !!e?.damaged,
      }
    })
    .filter((e) => ITEMS[e.itemId] && findDungeon(e.dungeonId))
  // Frühere Stände kannten die Negativ-Klimmzüge als eigene Quest-ID
  const doneToday = (gespeichert.doneToday ?? []).map((id) =>
    id === 'negativklimmzuege' ? 'klimmzuege' : id,
  )
  // Prüfungsaufgaben trugen ein negativ-Kennzeichen, das es nicht mehr gibt
  const rankTestTasks = gespeichert.rankTestTasks
    ? gespeichert.rankTestTasks.map(({ negativ: _negativ, ...rest }) => rest)
    : gespeichert.rankTestTasks
  const baseTargets = { ...initialState.baseTargets, ...gespeichert.baseTargets }
  // Ohne Klimmzug-Ziel lief früher der Negativ-Ersatz mit festem Ziel
  if (!baseTargets.klimmzuege) baseTargets.klimmzuege = EINSTIEG_ZIEL
  // Ausdauerübungen laufen jetzt auf Zeit. Alte Wiederholungsziele werden
  // mit dem Richtwert umgerechnet; schon umgestellte Werte liegen bereits
  // auf dem Viertelminuten-Raster und bleiben unberührt.
  const zeitUmgestellt = gespeichert.zeitUmgestellt === true
  if (!zeitUmgestellt) {
    for (const [id, wert] of Object.entries(baseTargets)) {
      if (einheitVon(id) === 'sek' && wert > 0) baseTargets[id] = inSekunden(wert)
    }
  }
  // Früher wurde eine Klasse gewählt; daraus wird das passende System
  const system =
    gespeichert.system ??
    (gespeichert.klasse ? KLASSE_ZU_SYSTEM[gespeichert.klasse] : null) ??
    (gespeichert.onboarded ? STANDARD_SYSTEM : null)
  const klasse = system ? systemOder(system).klasse : gespeichert.klasse
  return {
    ...gespeichert,
    inventory,
    equipment,
    damagedItems,
    lostItems,
    materials,
    doneToday,
    rankTestTasks,
    // Übungen des Systems brauchen ein Tagesziel, auch wenn sie neu sind
    baseTargets: system ? ergaenzeZiele(baseTargets, uebungenImSystem(system)) : baseTargets,
    system,
    klasse,
    systemGewechselt: gespeichert.systemGewechselt ?? null,
    zeitUmgestellt: true,
    gewicht: gespeichert.gewicht ?? null,
    ernaehrung: {
      date: null,
      eintraege: [],
      streak: 0,
      belohnt: false,
      ...gespeichert.ernaehrung,
    },
    varianten: gespeichert.varianten ?? {},
    stufenWechsel: gespeichert.stufenWechsel ?? [],
    thronBezwungen: gespeichert.thronBezwungen === true,
    abschluss: gespeichert.abschluss ?? null,
    gender: normalizeGender(gespeichert.gender),
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState
    return migriereSpielstand({ ...initialState, ...JSON.parse(raw) })
  } catch {
    return initialState
  }
}

// ---------------------------------------------------------------------------
// Sicherung: Spielstand als Datei aus der App heraus und wieder hinein
// ---------------------------------------------------------------------------

// Erhöhen, sobald sich das Dateiformat so ändert, dass ältere Dateien
// besonders behandelt werden müssen
export const SAVE_VERSION = 1

/** Spielstand als Datei-Inhalt, mit Version und Zeitstempel */
export function exportiereSpielstand(state) {
  return JSON.stringify(
    { ...state, version: SAVE_VERSION, exportedAt: new Date().toISOString() },
    null,
    2,
  )
}

/** Dateiname der Sicherung, z. B. system-save-2026-07-31.json */
export function sicherungsName(datum = new Date()) {
  return `system-save-${todayKey(datum)}.json`
}

/**
 * Prüft den Inhalt einer Sicherungsdatei. Gibt entweder die Eckdaten
 * zurück oder eine Meldung, warum die Datei nicht taugt. Der Spielstand
 * wird dabei nicht angefasst.
 */
export function pruefeSicherung(text) {
  let roh
  try {
    roh = JSON.parse(text)
  } catch {
    return { ok: false, fehler: 'Die Datei enthält kein lesbares JSON.' }
  }
  if (!roh || typeof roh !== 'object' || Array.isArray(roh)) {
    return { ok: false, fehler: 'Die Datei enthält keinen Spielstand.' }
  }
  // Ein Spielstand ohne diese Kerne ist keiner – egal wie alt er ist
  const kern = ['level', 'xp', 'rank']
  const fehlend = kern.filter((k) => roh[k] == null)
  if (fehlend.length === kern.length) {
    return { ok: false, fehler: 'Die Datei sieht nicht nach einem Spielstand aus.' }
  }
  if (typeof roh.level !== 'number' || typeof roh.xp !== 'number') {
    return { ok: false, fehler: 'Level oder XP fehlen bzw. sind beschädigt.' }
  }
  // Fehlende Felder älterer Versionen füllt die vorhandene Migration auf.
  // version und exportedAt beschreiben die Datei, nicht den Spielstand,
  // und bleiben deshalb draußen.
  const { version, exportedAt, ...spielstand } = roh
  const daten = migriereSpielstand({ ...initialState, ...spielstand })
  return {
    ok: true,
    daten,
    eckdaten: {
      level: daten.level,
      rank: daten.rank,
      aura: daten.aura ?? 0,
      name: daten.name,
      exportedAt: exportedAt ?? null,
      version: version ?? null,
    },
  }
}

/**
 * Schreibt eine geprüfte Sicherung in den Speicher. Der Aufrufer lädt
 * danach die App neu – erst dadurch wird der Spielstand aktiv.
 * Ohne Reload bliebe der laufende Reducer-Zustand daneben stehen.
 */
export function uebernehmeSicherung(daten) {
  const mitLog = {
    ...daten,
    log: withLog(daten.log ?? [], 'Spielstand eingespielt', {
      detail: `Level ${daten.level} · Rang ${daten.rank}`,
    }),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mitLog))
}

const GameContext = createContext(null)

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(rootReducer, null, loadState)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  useEffect(() => {
    // Tageswechsel erst nach dem Onboarding auswerten
    if (!state.onboarded) return
    const today = todayKey()
    if (state.lastDay !== today) {
      dispatch({ type: 'NEW_DAY', today, dayType: getDayType(state.system) })
    }
  }, [state.lastDay, state.onboarded, state.system])

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  return useContext(GameContext)
}
