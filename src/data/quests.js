export const QUESTS = {
  liegestuetze: {
    id: 'liegestuetze',
    name: 'Liegestütze',
    unit: 'Wdh.',
    stat: 'STR',
    xp: 60,
  },
  kniebeugen: {
    id: 'kniebeugen',
    name: 'Kniebeugen',
    unit: 'Wdh.',
    stat: 'STR',
    xp: 60,
  },
  crunches: {
    id: 'crunches',
    name: 'Crunches',
    unit: 'Wdh.',
    stat: 'VIT',
    xp: 60,
  },
  dehnen: {
    id: 'dehnen',
    name: 'Dehnen',
    unit: 'Min.',
    stat: 'AGI',
    xp: 60,
  },
  klimmzuege: {
    id: 'klimmzuege',
    name: 'Klimmzüge',
    unit: 'Wdh.',
    stat: 'STR',
    xp: 60,
  },
  // Ersatz, solange noch keine echten Klimmzüge geschafft werden
  negativklimmzuege: {
    id: 'negativklimmzuege',
    name: 'Negativ-Klimmzüge',
    unit: 'Wdh.',
    stat: 'STR',
    xp: 60,
    hinweis: 'Hochspringen, dann langsam ablassen',
    festesZiel: 5,
  },
}

export const DAY_PLANS = {
  A: ['liegestuetze', 'kniebeugen'],
  B: ['crunches', 'dehnen'],
  REST: [],
}

// Optionale Bonus-Quests je Tagestyp (zählen nicht zur Serien-Pflicht)
export const BONUS_PLANS = {
  A: ['klimmzuege'],
  B: [],
  REST: [],
}

// Startwerte der Tagesziele aus den Onboarding-Maximalwerten
export const TARGET_FACTOR = 1.5 // Muskelübungen: etwas über dem Maximum
export const RANK_UP_FACTOR = 1.15 // Steigerung pro Rang-Aufstieg

export function targetsFromMaxima(maxima) {
  // Muskelübungen mindestens 1 – Klimmzüge dürfen 0 bleiben,
  // dann übernehmen die Negativ-Klimmzüge.
  const ziel = (wert) => Math.max(1, Math.ceil((wert || 0) * TARGET_FACTOR))
  return {
    liegestuetze: ziel(maxima.liegestuetze),
    kniebeugen: ziel(maxima.kniebeugen),
    crunches: ziel(maxima.crunches),
    klimmzuege: Math.ceil((maxima.klimmzuege || 0) * TARGET_FACTOR),
    dehnen: Math.max(1, Math.round(maxima.dehnen || 0)),
  }
}

export function raiseTargets(targets) {
  const raised = {}
  for (const [key, value] of Object.entries(targets)) {
    raised[key] = Math.ceil(value * RANK_UP_FACTOR)
  }
  return raised
}

// Braucht noch Negativ-Klimmzüge? (noch nie echte Klimmzüge geloggt)
export function needsNegatives(state) {
  return (state.lifetime?.klimmzuege ?? 0) === 0
}

// Liefert die tatsächlich anzuzeigende Quest inkl. persönlichem Tagesziel
export function resolveQuest(id, state) {
  const useNegatives = id === 'klimmzuege' && needsNegatives(state)
  const quest = useNegatives ? QUESTS.negativklimmzuege : QUESTS[id]
  const ziel =
    quest.festesZiel ?? state.baseTargets?.[quest.id] ?? 0
  return { ...quest, ziel }
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

// Referenzwerte für die Rang-Einstufung: Schwellen je Stufe 0–3
const SCORE_THRESHOLDS = {
  liegestuetze: [10, 25, 50],
  kniebeugen: [15, 35, 60],
  crunches: [15, 30, 50],
  klimmzuege: [1, 5, 10],
  dehnen: [5, 10, 20],
}

// Summe der relativen Leistung über alle Übungen → Rang E–B
export function rankFromMaxima(maxima) {
  let sum = 0
  for (const [key, stufen] of Object.entries(SCORE_THRESHOLDS)) {
    const value = maxima[key] || 0
    sum += stufen.filter((schwelle) => value >= schwelle).length
  }
  // auf die 0–9-Skala normieren (5 Übungen × 3 Punkte = 15)
  const score = Math.round((sum / 15) * 9)
  if (score <= 2) return 'E'
  if (score <= 5) return 'D'
  if (score <= 7) return 'C'
  return 'B'
}

export function todayKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
