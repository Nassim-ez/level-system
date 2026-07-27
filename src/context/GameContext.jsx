import { createContext, useContext, useEffect, useReducer } from 'react'
import {
  getDayType,
  requiredQuestIds,
  todayKey,
  POOL_XP,
  raiseTargets,
  needsNegatives,
} from '../data/quests.js'
import { CLASSES } from '../data/classes.js'
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
} from '../data/items.js'
import { zieheDrops, materialName } from '../data/loot.js'
import {
  RANK_THRESHOLDS,
  RANK_TESTS,
  buildRankTest,
  nextRank,
} from '../data/ranks.js'
import { findDungeon, doorHp } from '../data/dungeons.js'

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
  inventory: ['holzschwert__r0', 'serienschutz'],
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
  damagedItems: {}, // im Dungeon beschädigte Items (itemId → true)
  klasse: null,
  gender: null,
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

function withLog(log, text, extra = {}) {
  return [{ datum: todayKey(), text, ...extra }, ...log].slice(0, 50)
}

// Effektive Stats: Basis plus Item-Boni minus Debuffs
export function effectiveStats(state) {
  const stats = { ...state.stats }
  for (const itemId of Object.values(state.equipment)) {
    const item = ITEMS[itemId]
    if (!item) continue
    if (item.bonus?.typ === 'stat' && item.bonus.stat) {
      stats[item.bonus.stat] = (stats[item.bonus.stat] ?? 0) + item.bonus.wert
    }
    if (item.debuff?.typ === 'stat' && item.debuff.stat) {
      stats[item.debuff.stat] = Math.max(
        0,
        (stats[item.debuff.stat] ?? 0) - item.debuff.wert,
      )
    }
  }
  return stats
}

function xpMultiplier(state, stat) {
  let pct = 0
  for (const itemId of Object.values(state.equipment)) {
    if (!itemId) continue
    const item = ITEMS[itemId]
    const bonus = item?.bonus
    if (bonus?.typ === 'xp' && (!bonus.stat || bonus.stat === stat)) {
      pct += bonus.wert
    }
    const debuff = item?.debuff
    if (debuff?.typ === 'xp' && (!debuff.stat || debuff.stat === stat)) {
      pct -= debuff.wert
    }
  }
  const klasse = state.klasse ? CLASSES[state.klasse] : null
  if (klasse && (!klasse.stat || klasse.stat === stat)) pct += klasse.wert
  return 1 + pct / 100
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
        amount = Math.round(amount * xpMultiplier(state, action.stat))
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
        rankTestTasks = buildRankTest(
          state.rank,
          state.baseTargets,
          needsNegatives(state),
        )
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
        const required = requiredQuestIds(state.dayType)
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
      }
    }
    case 'COMPLETE_QUEST': {
      if (state.doneToday.includes(action.id)) return state
      const awarded = Math.round(action.xp * xpMultiplier(state, action.stat))
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
        baseTargets: action.baseTargets ?? state.baseTargets,
        level,
        xp: 0,
        xpGoal,
        points: 3 * (level - 1),
        log: withLog(state.log, 'Einstufung abgeschlossen', {
          detail: `Rang ${action.rank} · Level ${level}`,
        }),
      }
    }
    case 'RESET_GAME': {
      localStorage.removeItem(STORAGE_KEY)
      return { ...initialState }
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
      const drops = action.drops ?? zieheDrops(dungeon.id, state.rank, tuer.boss ? 2 : 1)
      const beute = verteileBeute(state, drops)

      if (!tuer.boss) {
        let next = {
          ...state,
          inventory: beute.inventory,
          materials: beute.materials,
          dungeon: {
            ...state.dungeon,
            progress,
            killed,
            door: 0,
            enemyHp: null,
            fight: null,
          },
          log: withLog(beute.log, `Tür ${tuer.nr} geschafft`, {
            detail: `${tuer.name} · ${tuer.anzahl}× ${tuer.gegnerart}`,
            xp: TUER_XP,
          }),
        }
        next = reducer(next, { type: 'ADD_XP', amount: TUER_XP })
        return next
      }
      // Bosssieg: Tor öffnet sich, doppelte Beute und XP
      const log = withLog(beute.log, `${dungeon.boss} besiegt`, {
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
        inventory: beute.inventory,
        materials: beute.materials,
        lifetime: {
          ...state.lifetime,
          dungeons: (state.lifetime.dungeons ?? 0) + 1,
        },
        log,
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
      // Niederlage: Aura erlischt, Fortschritt weg, ein getragenes Item leidet
      const getragene = Object.entries(state.equipment).filter(([, id]) => id)
      let equipment = state.equipment
      let damagedItems = state.damagedItems
      let beschaedigt = null
      if (getragene.length > 0) {
        const [slot, itemId] =
          getragene[Math.floor(Math.random() * getragene.length)]
        const schlechter = herabgestuft(itemId)
        if (schlechter) {
          // Eine Rarität herunter, Gewöhnlich bleibt Gewöhnlich
          equipment = { ...equipment, [slot]: schlechter }
          damagedItems = { ...damagedItems, [schlechter]: true }
          beschaedigt = { alt: itemId, neu: schlechter }
        } else {
          damagedItems = { ...damagedItems, [itemId]: true }
          beschaedigt = { alt: itemId, neu: itemId }
        }
      }
      const dungeon = findDungeon(state.dungeon.run)
      let log = withLog(state.log, 'Rückzug aus dem Dungeon', {
        detail: `${dungeon?.name ?? 'Dungeon'} · Fortschritt verloren`,
      })
      if (beschaedigt) {
        const alt = ITEMS[beschaedigt.alt]
        const neu = ITEMS[beschaedigt.neu]
        log = withLog(log, `${alt.name} beschädigt`, {
          detail:
            beschaedigt.alt === beschaedigt.neu
              ? 'Bereits gewöhnlich – keine weitere Stufe'
              : `${raritaet(alt)?.name} → ${raritaet(neu)?.name}`,
        })
      }
      log = withLog(log, 'Deine Aura ist erloschen', {
        detail: 'Im Dungeon gefallen',
      })
      return {
        ...state,
        aura: 0,
        equipment,
        damagedItems,
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
    case 'CHOOSE_CLASS': {
      if (state.klasse || !CLASSES[action.id]) return state
      return {
        ...state,
        klasse: action.id,
        log: withLog(state.log, `Klasse ${CLASSES[action.id].name} gewählt`, {
          detail: 'Die Wahl ist endgültig',
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
        buildRankTest(state.rank, state.baseTargets, needsNegatives(state))
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
      const baseTargets = raiseTargets(state.baseTargets)
      let log = withLog(state.log, `Rang ${newRank} erreicht`, {
        detail: 'Aufstiegsprüfung bestanden · Tagesziele +15 %',
      })
      log = withLog(log, `${ITEMS[test.reward].name} erhalten`, {
        detail: 'Belohnung',
      })
      const zwischenstand = { ...state, lifetime, baseTargets }
      return {
        ...state,
        rank: newRank,
        rankTestActive: stillActive,
        // Folgt direkt die nächste Prüfung, deren Ziele neu einfrieren
        rankTestTasks: stillActive
          ? buildRankTest(newRank, baseTargets, needsNegatives(zwischenstand))
          : null,
        lifetime,
        baseTargets,
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
  return {
    ...gespeichert,
    inventory,
    equipment,
    damagedItems,
    materials,
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
      dispatch({ type: 'NEW_DAY', today, dayType: getDayType() })
    }
  }, [state.lastDay, state.onboarded])

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  return useContext(GameContext)
}
