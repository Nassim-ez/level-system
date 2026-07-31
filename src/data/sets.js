// ---------------------------------------------------------------------------
// Set-Boni – an das Material der Ausrüstung gekoppelt
//
// Wer mehrere Teile aus demselben Material trägt, bekommt zusätzliche
// Effekte. Die Stufen sind kumulativ: bei vier Teilen wirken der Zweier-
// und der Vierer-Bonus gleichzeitig. Mehrere Sets können nebeneinander
// aktiv sein, denn gezählt wird je Material getrennt.
//
// Die Effektschlüssel sind dieselben wie im Item-Katalog, damit die Boni
// in dieselbe Summe fließen und im Kampf identisch wirken.
// ---------------------------------------------------------------------------

export const SETS = {
  basalt: {
    id: 'basalt',
    name: 'Basalt-Set',
    beschreibung: 'Stein liegt schwer in der Hand und hält, was auf dich einschlägt.',
    stufen: [
      { teile: 2, effects: { dmgKraft: 6 } },
      { teile: 4, effects: { block: 10 } },
    ],
  },
  knochen: {
    id: 'knochen',
    name: 'Knochen-Set',
    beschreibung: 'Was einmal getragen hat, trägt wieder – aus der Mitte heraus.',
    stufen: [
      { teile: 2, effects: { dmgCore: 6 } },
      { teile: 4, effects: { heal: 12 } },
    ],
  },
  schatten: {
    id: 'schatten',
    name: 'Schatten-Set',
    beschreibung: 'Im Halbdunkel findest du, was andere übersehen.',
    stufen: [
      { teile: 2, effects: { luck: 6 } },
      { teile: 4, effects: { dmgTempo: 10 } },
    ],
  },
  wolf: {
    id: 'wolf',
    name: 'Wolf-Set',
    beschreibung: 'Das Rudel läuft weiter, wenn dem Einzelnen längst die Luft fehlt.',
    stufen: [
      { teile: 2, effects: { vit: 8 } },
      { teile: 4, effects: { dmgAusdauer: 10 } },
    ],
  },
}

export const SET_LISTE = Object.values(SETS)

// Höchste Teilezahl, die überhaupt noch etwas freischaltet
export const MAX_SET_TEILE = Math.max(
  ...SET_LISTE.flatMap((s) => s.stufen.map((st) => st.teile)),
)

/**
 * Effekte, die ein Set bei der gegebenen Teilezahl beisteuert.
 * Alle erreichten Stufen zählen zusammen.
 */
export function setBoni(setId, anzahl) {
  const set = SETS[setId]
  if (!set) return {}
  const summe = {}
  for (const stufe of set.stufen) {
    if (anzahl < stufe.teile) continue
    for (const [key, wert] of Object.entries(stufe.effects)) {
      summe[key] = (summe[key] ?? 0) + wert
    }
  }
  return summe
}

/** Ist diese Stufe mit der getragenen Teilezahl erreicht? */
export function stufeErreicht(stufe, anzahl) {
  return anzahl >= stufe.teile
}
