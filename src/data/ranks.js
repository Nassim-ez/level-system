export const RANKS = ['E', 'D', 'C', 'B', 'A', 'S']

// Ab diesem Level wird die Aufstiegsprüfung zum jeweiligen Rang freigeschaltet
export const RANK_THRESHOLDS = { E: 1, D: 5, C: 10, B: 18, A: 28, S: 40 }

// Prüfung, um den jeweiligen Rang zu VERLASSEN (Key = aktueller Rang).
// Die Ziele sind persönlich und werden beim Freischalten berechnet.
export const RANK_TESTS = {
  E: { quests: ['liegestuetze'], reward: 'waff_d1' },
  D: { quests: ['kniebeugen'], reward: 'schu_d1' },
  C: { quests: ['klimmzuege'], reward: 'kett_c1' },
  B: { quests: ['liegestuetze'], reward: 'umha_c1+1' },
  A: { quests: ['klimmzuege', 'kniebeugen'], reward: 'ring_c1+2' },
}

// Prüfungsziel = Vielfaches des Tagesziels, mit Mindest- und Höchstwerten
export const TEST_FACTOR_EARLY = 2 // Prüfungen E→D und D→C
export const TEST_FACTOR_LATE = 1.7 // ab C→B, da die Tagesziele schon hoch sind
export const TEST_MINIMUM = 10 // Muskelübungen
export const TEST_MINIMUM_KLIMMZUEGE = 2
export const TEST_MAXIMUM_KLIMMZUEGE = 25 // mehr an einem Tag ist unrealistisch

export function testFactor(rank) {
  return RANKS.indexOf(rank) >= RANKS.indexOf('C')
    ? TEST_FACTOR_LATE
    : TEST_FACTOR_EARLY
}

export function testTargetFor(questId, baseTargets, rank) {
  const faktor = testFactor(rank)
  if (questId === 'klimmzuege') {
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
export function buildRankTest(rank, baseTargets) {
  const test = RANK_TESTS[rank]
  if (!test) return null
  return test.quests.map((quest) => ({
    quest,
    ziel: testTargetFor(quest, baseTargets, rank),
  }))
}

export function nextRank(rank) {
  return RANKS[RANKS.indexOf(rank) + 1] ?? null
}
