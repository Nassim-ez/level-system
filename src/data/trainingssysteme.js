// ---------------------------------------------------------------------------
// Trainingssysteme
//
// Das gewählte System bestimmt, welche Übungen an welchem Tag anstehen und
// welche Klasse der Jäger führt. Alle Übungen sind IDs aus uebungen.js – die
// tatsächlich angezeigte Variante hängt weiterhin am Rang.
//
// plan:     Tagestyp → Liste von Übungs-IDs
// rotation: Reihenfolge der Tagestypen über die Trainingstage (Mo–Sa)
// bonus:    Kategorien mit XP-Aufschlag; leer bedeutet „auf alles"
// ---------------------------------------------------------------------------

export const TRAININGSSYSTEME = {
  krafttraining: {
    id: 'krafttraining',
    name: 'Krafttraining',
    klasse: 'krieger',
    beschreibung:
      'Schwere Grundübungen, wenige Wiederholungen, viel Erholung. Der geradlinige Weg zu mehr Kraft.',
    fokus: ['kraft', 'core'],
    bonus: { kategorien: ['kraft'], wert: 25 },
    geraet: 'Stange für Klimmzüge, Stuhl oder Barren für Dips',
    rotation: ['A', 'B', 'C'],
    plan: {
      A: ['liegestuetze', 'kniebeugen'],
      B: ['klimmzuege', 'dips'],
      C: ['crunches', 'superman'],
    },
  },
  calisthenics: {
    id: 'calisthenics',
    name: 'Calisthenics',
    klasse: 'assassine',
    beschreibung:
      'Körperbeherrschung mit dem eigenen Gewicht. Zug, Druck und Rumpf greifen ineinander.',
    fokus: ['kraft', 'tempo'],
    bonus: { kategorien: ['kraft', 'tempo'], wert: 25 },
    geraet: 'Stange',
    rotation: ['A', 'B', 'C'],
    plan: {
      A: ['liegestuetze', 'pike'],
      B: ['klimmzuege', 'beinheben'],
      C: ['kniebeugen', 'burpees'],
    },
  },
  gym_calisthenics: {
    id: 'gym_calisthenics',
    name: 'Gym und Calisthenics',
    klasse: 'monarch',
    beschreibung:
      'Alles gleichzeitig, dafür breiter verteilt. Vier Tage decken Kraft, Rumpf, Ausdauer und Tempo ab.',
    fokus: ['kraft', 'core', 'ausdauer', 'tempo'],
    bonus: { kategorien: [], wert: 10 },
    geraet: 'Stange, Stuhl oder Barren, eine Stufe',
    rotation: ['A', 'B', 'C', 'D'],
    plan: {
      A: ['liegestuetze', 'dips'],
      B: ['klimmzuege', 'beinheben'],
      C: ['kniebeugen', 'stepups'],
      D: ['burpees', 'bergsteiger'],
    },
  },
  mobility: {
    id: 'mobility',
    name: 'Beweglichkeit',
    klasse: 'heiler',
    beschreibung:
      'Täglich der Mobility-Ablauf, dazu abwechselnd eine leichte Kraftübung. Für steife Schultern und Hüften.',
    fokus: ['mobility'],
    bonus: { kategorien: ['mobility'], wert: 25 },
    geraet: 'Türrahmen und freie Wand',
    rotation: ['A', 'B'],
    plan: {
      A: ['dehnen', 'kniebeugen'],
      B: ['dehnen', 'superman'],
    },
  },
  ausdauer_fettabbau: {
    id: 'ausdauer_fettabbau',
    name: 'Ausdauer und Fettabbau',
    klasse: 'laeufer',
    beschreibung:
      'Puls hoch, wenig Pause, kein Gerät. Kräftigt Herz und Kreislauf und verbraucht viel Energie.',
    fokus: ['ausdauer', 'tempo'],
    bonus: { kategorien: ['ausdauer', 'tempo'], wert: 25 },
    geraet: 'Stufe oder stabiler Stuhl',
    // Fettabbau entsteht über die Energiebilanz. Das gehört sichtbar dazu,
    // damit niemand das Training für den entscheidenden Hebel hält.
    hinweis:
      'Fettabbau entsteht über die Energiebilanz, also vor allem über die Ernährung. Training unterstützt das, ersetzt es aber nicht.',
    rotation: ['A', 'B', 'C'],
    plan: {
      A: ['knielauf', 'hampelmaenner'],
      B: ['bergsteiger', 'skater'],
      C: ['burpees', 'stepups'],
    },
  },
}

export const SYSTEM_LISTE = Object.values(TRAININGSSYSTEME)
export const STANDARD_SYSTEM = 'krafttraining'

// Frühere Klassenwahl auf das passende System abbilden
export const KLASSE_ZU_SYSTEM = {
  krieger: 'krafttraining',
  assassine: 'calisthenics',
  monarch: 'gym_calisthenics',
  gelehrter: 'gym_calisthenics',
  heiler: 'mobility',
  laeufer: 'ausdauer_fettabbau',
  // Der Tank stand für Widerstandsfähigkeit – am nächsten liegt das
  // Krafttraining mit seinen schweren Grundübungen.
  tank: 'krafttraining',
}

// Frühestens nach so vielen Tagen darf erneut gewechselt werden
export const WECHSEL_SPERRE_TAGE = 7

export function systemOder(id) {
  return TRAININGSSYSTEME[id] ?? TRAININGSSYSTEME[STANDARD_SYSTEM]
}

/** Alle Übungs-IDs, die ein System über die Woche verlangt */
export function uebungenImSystem(systemId) {
  const system = systemOder(systemId)
  const ids = new Set()
  for (const tag of system.rotation) {
    for (const questId of system.plan[tag] ?? []) ids.add(questId)
  }
  return [...ids]
}

/**
 * Tagestyp für ein Datum. Der Sonntag bleibt in jedem System Ruhetag,
 * die übrigen sechs Tage laufen durch die Rotation.
 */
export function tagestyp(systemId, date = new Date()) {
  const wochentag = date.getDay()
  if (wochentag === 0) return 'REST'
  const system = systemOder(systemId)
  const index = (wochentag - 1) % system.rotation.length
  return system.rotation[index]
}

export function tagesplan(systemId, tagestypId) {
  if (tagestypId === 'REST') return []
  return systemOder(systemId).plan[tagestypId] ?? []
}

/** Verbleibende Tage bis zum nächsten erlaubten Wechsel */
export function wechselSperre(letzterWechsel, heute = new Date()) {
  if (!letzterWechsel) return 0
  const [j, m, t] = letzterWechsel.split('-').map(Number)
  const damals = new Date(j, m - 1, t)
  const tage = Math.floor((heute - damals) / 86400000)
  return Math.max(0, WECHSEL_SPERRE_TAGE - tage)
}
