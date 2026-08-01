import { UEBUNGEN } from './uebungen.js'
import { RANKS } from './ranks.js'

// Jede Trainings-Quest zeigt auf eine Übung der Datenbank. Wie sie heißt,
// entscheidet die Variante – die hängt am Rang oder an der eigenen Wahl.
export const QUESTS = {
  liegestuetze: {
    id: 'liegestuetze',
    uebungId: 'liegestuetze',
    unit: 'Wdh.',
    stat: 'STR',
    xp: 60,
  },
  kniebeugen: {
    id: 'kniebeugen',
    uebungId: 'kniebeugen',
    unit: 'Wdh.',
    stat: 'STR',
    xp: 60,
  },
  crunches: {
    id: 'crunches',
    uebungId: 'crunches',
    unit: 'Wdh.',
    stat: 'VIT',
    xp: 60,
  },
  dehnen: {
    id: 'dehnen',
    uebungId: 'hueftbeuger',
    unit: 'Min.',
    stat: 'AGI',
    xp: 60,
  },
  klimmzuege: {
    id: 'klimmzuege',
    uebungId: 'klimmzuege',
    unit: 'Wdh.',
    stat: 'STR',
    xp: 60,
  },
}

// ---------------------------------------------------------------------------
// Varianten: welche Stufe der Leiter gilt gerade?
// ---------------------------------------------------------------------------

export function uebungZuQuest(questId) {
  const uebungId = QUESTS[questId]?.uebungId
  return uebungId ? UEBUNGEN.find((u) => u.id === uebungId) : null
}

/** Ist diese Variante beim gegebenen Rang schon freigeschaltet? */
export function varianteOffen(variante, rank) {
  return RANKS.indexOf(variante.rang) <= RANKS.indexOf(rank)
}

/**
 * Automatischer Vorschlag: die schwerste Variante, deren Rang der Jäger
 * bereits erreicht hat. Die Leitern beginnen sämtlich bei E, es bleibt
 * also immer mindestens die erste übrig.
 */
export function vorgeschlagenerIndex(uebung, rank) {
  if (!uebung?.varianten?.length) return 0
  let treffer = 0
  uebung.varianten.forEach((v, i) => {
    if (varianteOffen(v, rank)) treffer = i
  })
  return treffer
}

/**
 * Tatsächlich geltende Variante. Eine eigene Wahl schlägt den Vorschlag,
 * gilt aber nur bis zum nächsten Rangwechsel – danach greift wieder die
 * Automatik.
 */
export function aktuelleVariante(questId, state) {
  const uebung = uebungZuQuest(questId)
  if (!uebung) return null
  const wahl = state?.varianten?.[questId]
  const index =
    wahl && wahl.rank === state.rank && uebung.varianten[wahl.index]
      ? wahl.index
      : vorgeschlagenerIndex(uebung, state?.rank ?? 'E')
  return { ...uebung.varianten[index], index, uebung }
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

// Startziel, wenn eine Übung noch gar nicht gelingt
export const EINSTIEG_ZIEL = 5

export function targetsFromMaxima(maxima) {
  const ziel = (wert) =>
    wert > 0 ? Math.max(1, Math.ceil(wert * TARGET_FACTOR)) : EINSTIEG_ZIEL
  return {
    liegestuetze: ziel(maxima.liegestuetze),
    kniebeugen: ziel(maxima.kniebeugen),
    crunches: ziel(maxima.crunches),
    klimmzuege: ziel(maxima.klimmzuege),
    dehnen: Math.max(1, Math.round(maxima.dehnen || 0)),
  }
}

/**
 * Startvarianten aus der Einstufung. Wer eine Übung noch gar nicht schafft,
 * beginnt auf der untersten Sprosse – bei Klimmzügen also beim schrägen
 * Rudern statt an der Stange. Das ersetzt die frühere Sonderregel für
 * Negativ-Klimmzüge.
 */
export function startVarianten(maxima, rank) {
  const wahl = {}
  for (const questId of Object.keys(QUESTS)) {
    const uebung = uebungZuQuest(questId)
    if (!uebung) continue
    if ((maxima?.[questId] ?? 0) > 0) continue
    // Nur wenn der Vorschlag überhaupt höher läge, lohnt der Eintrag
    if (vorgeschlagenerIndex(uebung, rank) > 0) {
      wahl[questId] = { index: 0, rank }
    }
  }
  return wahl
}

export function raiseTargets(targets) {
  const raised = {}
  for (const [key, value] of Object.entries(targets)) {
    raised[key] = Math.ceil(value * RANK_UP_FACTOR)
  }
  return raised
}

// Liefert die anzuzeigende Quest: Name aus der Variante, Ziel aus den
// persönlichen Tageszielen
export function resolveQuest(id, state) {
  const quest = QUESTS[id]
  if (!quest) return null
  const variante = aktuelleVariante(id, state)
  return {
    ...quest,
    name: variante?.name ?? quest.id,
    hinweis: variante?.tipp,
    variante,
    ziel: state.baseTargets?.[id] ?? 0,
  }
}

/**
 * Vergleicht die geltenden Varianten vor und nach einem Rangwechsel.
 * Liefert je Quest den Wechsel, damit die App ihn zeigen und das
 * Tagesziel anpassen kann.
 */
export function variantenWechsel(vorher, nachher) {
  const wechsel = []
  for (const questId of Object.keys(QUESTS)) {
    const alt = aktuelleVariante(questId, vorher)
    const neu = aktuelleVariante(questId, nachher)
    if (!alt || !neu || alt.index === neu.index) continue
    wechsel.push({
      questId,
      uebungName: neu.uebung.name,
      alt: alt.name,
      neu: neu.name,
      tipp: neu.tipp,
      stufe: neu.stufe,
    })
  }
  return wechsel
}

// Anteil, auf den das Tagesziel bei einer schwereren Variante fällt
export const STUFENWECHSEL_ANTEIL = 0.6

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
