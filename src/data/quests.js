export const QUESTS = {
  liegestuetze: {
    id: 'liegestuetze',
    name: 'Liegestütze',
    unit: 'Wdh.',
    stat: 'STR',
    xp: 60,
    reps: { E: 20, D: 30, C: 40, B: 55, A: 70, S: 100 },
  },
  kniebeugen: {
    id: 'kniebeugen',
    name: 'Kniebeugen',
    unit: 'Wdh.',
    stat: 'STR',
    xp: 60,
    reps: { E: 30, D: 40, C: 55, B: 70, A: 90, S: 120 },
  },
  crunches: {
    id: 'crunches',
    name: 'Crunches',
    unit: 'Wdh.',
    stat: 'VIT',
    xp: 60,
    reps: { E: 25, D: 35, C: 45, B: 60, A: 80, S: 100 },
  },
  dehnen: {
    id: 'dehnen',
    name: 'Dehnen',
    unit: 'Min.',
    stat: 'AGI',
    xp: 60,
    reps: { E: 10, D: 10, C: 15, B: 15, A: 20, S: 20 },
  },
  klimmzuege: {
    id: 'klimmzuege',
    name: 'Klimmzüge',
    unit: 'Wdh.',
    stat: 'STR',
    xp: 60,
    reps: { E: 3, D: 5, C: 8, B: 12, A: 15, S: 20 },
  },
}

export const DAY_PLANS = {
  A: ['liegestuetze', 'kniebeugen'],
  B: ['crunches', 'dehnen'],
  REST: [],
}

export const DAY_LABELS = {
  A: 'TAG A · KRAFT',
  B: 'TAG B · CORE & MOBILITÄT',
  REST: 'RUHETAG · REGENERATION',
}

export const TABLETS_XP = 20
export const POOL_XP = 30
export const STEP_XP_PER_1000 = 10
export const STEP_XP_MAX = 60

export function getDayType(date = new Date()) {
  const day = date.getDay()
  if (day === 0) return 'REST'
  return day === 1 || day === 3 || day === 5 ? 'A' : 'B'
}

export function stepXpMax(dayType) {
  return dayType === 'REST' ? STEP_XP_MAX / 2 : STEP_XP_MAX
}

export function requiredQuestIds(dayType) {
  return [...(DAY_PLANS[dayType] ?? []), 'tabletten']
}

export function todayKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
