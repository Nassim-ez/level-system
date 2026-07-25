export const RANKS = ['E', 'D', 'C', 'B', 'A', 'S']

// Ab diesem Level wird die Aufstiegsprüfung zum jeweiligen Rang freigeschaltet
export const RANK_THRESHOLDS = { E: 1, D: 5, C: 10, B: 18, A: 28, S: 40 }

// Prüfung, um den jeweiligen Rang zu VERLASSEN (Key = aktueller Rang).
// Die Ziele sind persönlich und werden beim Freischalten berechnet.
export const RANK_TESTS = {
  E: { quests: ['liegestuetze'], reward: 'eisenhandschuhe__blau' },
  D: { quests: ['kniebeugen'], reward: 'laeuferschuhe__blau' },
  C: { quests: ['klimmzuege'], reward: 'silberkette__blau' },
  B: { quests: ['liegestuetze'], reward: 'kapuzenumhang__violett' },
  A: { quests: ['klimmzuege', 'kniebeugen'], reward: 'monarchenring__gold' },
}

// Prüfungsziel = Vielfaches des Tagesziels, mit Mindest- und Höchstwerten
export const TEST_FACTOR_EARLY = 2 // Prüfungen E→D und D→C
export const TEST_FACTOR_LATE = 1.7 // ab C→B, da die Tagesziele schon hoch sind
export const TEST_MINIMUM = 10 // Muskelübungen
export const TEST_MINIMUM_KLIMMZUEGE = 2
export const TEST_MAXIMUM_KLIMMZUEGE = 25 // mehr an einem Tag ist unrealistisch
export const TEST_NEGATIVE_KLIMMZUEGE = 8 // solange Negativ-Ersatz aktiv

export function testFactor(rank) {
  return RANKS.indexOf(rank) >= RANKS.indexOf('C')
    ? TEST_FACTOR_LATE
    : TEST_FACTOR_EARLY
}

export function testTargetFor(questId, baseTargets, negatives = false, rank) {
  const faktor = testFactor(rank)
  if (questId === 'klimmzuege') {
    if (negatives) return TEST_NEGATIVE_KLIMMZUEGE
    const ziel = Math.max(
      TEST_MINIMUM_KLIMMZUEGE,
      Math.ceil((baseTargets?.klimmzuege ?? 0) * faktor),
    )
    return Math.min(TEST_MAXIMUM_KLIMMZUEGE, ziel)
  }
  return Math.max(
    TEST_MINIMUM,
    Math.ceil((baseTargets?.[questId] ?? 0) * faktor),
  )
}

// Friert die Prüfungsziele beim Freischalten ein
export function buildRankTest(rank, baseTargets, negatives = false) {
  const test = RANK_TESTS[rank]
  if (!test) return null
  return test.quests.map((quest) => ({
    quest,
    // Bei aktiver Negativ-Ersetzung zählt die Negativ-Variante
    negativ: quest === 'klimmzuege' && negatives,
    ziel: testTargetFor(quest, baseTargets, negatives, rank),
  }))
}

export function nextRank(rank) {
  return RANKS[RANKS.indexOf(rank) + 1] ?? null
}
