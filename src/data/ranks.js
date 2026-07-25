export const RANKS = ['E', 'D', 'C', 'B', 'A', 'S']

// Ab diesem Level wird die Aufstiegsprüfung zum jeweiligen Rang freigeschaltet
export const RANK_THRESHOLDS = { E: 1, D: 5, C: 10, B: 18, A: 28, S: 40 }

// Prüfung, um den jeweiligen Rang zu VERLASSEN (Key = aktueller Rang).
// Die Ziele sind persönlich und werden beim Freischalten berechnet.
export const RANK_TESTS = {
  E: { quests: ['liegestuetze'], reward: 'eisenhandschuhe' },
  D: { quests: ['kniebeugen'], reward: 'laeuferschuhe' },
  C: { quests: ['klimmzuege'], reward: 'silberkette' },
  B: { quests: ['liegestuetze'], reward: 'kapuzenumhang' },
  A: { quests: ['klimmzuege', 'kniebeugen'], reward: 'monarchenring' },
}

// Prüfungsziel = doppeltes Tagesziel, mit Mindestwerten
export const TEST_FACTOR = 2
export const TEST_MINIMUM = 10 // Muskelübungen
export const TEST_MINIMUM_KLIMMZUEGE = 2
export const TEST_NEGATIVE_KLIMMZUEGE = 8 // solange Negativ-Ersatz aktiv

export function testTargetFor(questId, baseTargets, negatives = false) {
  if (questId === 'klimmzuege') {
    if (negatives) return TEST_NEGATIVE_KLIMMZUEGE
    return Math.max(
      TEST_MINIMUM_KLIMMZUEGE,
      Math.ceil((baseTargets?.klimmzuege ?? 0) * TEST_FACTOR),
    )
  }
  return Math.max(
    TEST_MINIMUM,
    Math.ceil((baseTargets?.[questId] ?? 0) * TEST_FACTOR),
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
    ziel: testTargetFor(quest, baseTargets, negatives),
  }))
}

export function nextRank(rank) {
  return RANKS[RANKS.indexOf(rank) + 1] ?? null
}
