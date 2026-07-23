import { createContext, useContext, useEffect, useReducer } from 'react'
import {
  getDayType,
  requiredQuestIds,
  todayKey,
  POOL_XP,
  QUESTS,
} from '../data/quests.js'
import { CLASSES } from '../data/classes.js'
import { TITLES } from '../data/titles.js'
import { ITEMS } from '../data/items.js'
import { RANK_THRESHOLDS, RANK_TESTS, nextRank } from '../data/ranks.js'
import { DUNGEONS, DUNGEON_XP } from '../data/dungeons.js'

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
  inventory: ['holzschwert', 'serienschutz'],
  rankTestActive: false,
  klasse: null,
  onboarded: false,
  unlockedTitles: ['neuling'],
  lifetime: { liegestuetze: 0, dungeons: 0, bestStreak: 0 },
  dungeonOpen: false,
  dungeonRank: null,
  dungeonHp: null,
  dungeonDone: false,
  log: [],
}

function withLog(log, text, extra = {}) {
  return [{ datum: todayKey(), text, ...extra }, ...log].slice(0, 50)
}

function xpMultiplier(state, stat) {
  let pct = 0
  for (const itemId of Object.values(state.equipment)) {
    if (!itemId) continue
    const bonus = ITEMS[itemId]?.bonus
    if (bonus?.typ === 'xp' && (!bonus.stat || bonus.stat === stat)) {
      pct += bonus.wert
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
      let { xp, level, xpGoal, points } = state
      let log = state.log
      let amount = action.amount
      if (amount > 0) {
        amount = Math.round(amount * xpMultiplier(state, action.stat))
      }
      xp += amount
      while (xp >= xpGoal) {
        xp -= xpGoal
        level += 1
        xpGoal = Math.round(xpGoal * 1.25)
        points += 3
      }
      if (level > state.level) {
        log = withLog(log, `Level ${level} erreicht`, {
          detail: `+${(level - state.level) * 3} Punkte`,
        })
      }
      let rankTestActive = state.rankTestActive
      const next = nextRank(state.rank)
      if (next && level >= RANK_THRESHOLDS[next] && !rankTestActive) {
        rankTestActive = true
        log = withLog(log, 'Aufstiegsprüfung freigeschaltet', {
          detail: `Rang ${state.rank} → ${next}`,
        })
      }
      return { ...state, xp, level, xpGoal, points, rankTestActive, log }
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
      let { dungeonOpen, dungeonRank, dungeonHp, dungeonDone } = state
      if (action.weekend) {
        if (!dungeonOpen) {
          dungeonOpen = true
          dungeonRank = state.rank
          dungeonHp = DUNGEONS[state.rank].hp
          dungeonDone = false
        }
      } else {
        dungeonOpen = false
        dungeonRank = null
        dungeonHp = null
        dungeonDone = false
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
        dungeonOpen,
        dungeonRank,
        dungeonHp,
        dungeonDone,
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
      if (action.id === 'liegestuetze') {
        next = {
          ...next,
          lifetime: {
            ...next.lifetime,
            liegestuetze:
              next.lifetime.liegestuetze +
              QUESTS.liegestuetze.reps[state.rank],
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
        rank: action.rank,
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
      const prevSteps = state.questProgress.steps ?? 0
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
      // Je 100 neue Schritte = 1 Dungeon-Schaden
      const dmg = Math.floor(steps / 100) - Math.floor(prevSteps / 100)
      if (dmg > 0) next = reducer(next, { type: 'DUNGEON_DAMAGE', amount: dmg })
      return next
    }
    case 'DUNGEON_DAMAGE': {
      if (!state.dungeonOpen || state.dungeonDone || state.dungeonHp == null) {
        return state
      }
      let lifetime = state.lifetime
      if (action.quest === 'liegestuetze' && action.reps > 0) {
        lifetime = {
          ...lifetime,
          liegestuetze: lifetime.liegestuetze + action.reps,
        }
      }
      const hp = Math.max(0, state.dungeonHp - action.amount)
      if (hp > 0) return { ...state, lifetime, dungeonHp: hp }
      // Sieg!
      const dungeon = DUNGEONS[state.dungeonRank ?? state.rank]
      const drop = ITEMS[dungeon.drop]
      let log = withLog(state.log, 'Dungeon abgeschlossen', {
        detail: `${dungeon.gegner} besiegt`,
        xp: DUNGEON_XP,
      })
      log = withLog(log, `${drop.name} erhalten`, { detail: 'Dungeon-Drop' })
      let next = {
        ...state,
        dungeonHp: 0,
        dungeonDone: true,
        lifetime: { ...lifetime, dungeons: lifetime.dungeons + 1 },
        inventory: [...state.inventory, dungeon.drop],
        log,
      }
      next = reducer(next, { type: 'ADD_XP', amount: DUNGEON_XP })
      return next
    }
    case 'RANK_TASK_PROGRESS': {
      if (!state.rankTestActive) return state
      const test = RANK_TESTS[state.rank]
      const task = test?.tasks.find((t) => t.quest === action.taskId)
      if (!task) return state
      const prev = state.questProgress.rankTest ?? {}
      const value = Math.min((prev[action.taskId] ?? 0) + action.amount, task.ziel)
      const rankTest = { ...prev, [action.taskId]: value }
      let lifetime = state.lifetime
      const added = value - (prev[action.taskId] ?? 0)
      if (action.taskId === 'liegestuetze' && added > 0) {
        lifetime = { ...lifetime, liegestuetze: lifetime.liegestuetze + added }
      }
      const passed = test.tasks.every((t) => (rankTest[t.quest] ?? 0) >= t.ziel)
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
      let log = withLog(state.log, `Rang ${newRank} erreicht`, {
        detail: 'Aufstiegsprüfung bestanden',
      })
      log = withLog(log, `${ITEMS[test.reward].name} erhalten`, {
        detail: 'Belohnung',
      })
      return {
        ...state,
        rank: newRank,
        rankTestActive: stillActive,
        lifetime,
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

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...initialState, ...JSON.parse(raw) } : initialState
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
      const dow = new Date().getDay()
      dispatch({
        type: 'NEW_DAY',
        today,
        dayType: getDayType(),
        weekend: dow === 0 || dow === 6,
      })
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
