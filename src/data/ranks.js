export const RANKS = ['E', 'D', 'C', 'B', 'A', 'S']

// Ab diesem Level wird die Aufstiegsprüfung zum jeweiligen Rang freigeschaltet
export const RANK_THRESHOLDS = { E: 1, D: 5, C: 10, B: 18, A: 28, S: 40 }

// Prüfung, um den jeweiligen Rang zu VERLASSEN (Key = aktueller Rang)
export const RANK_TESTS = {
  E: {
    beschreibung: '40 Liegestütze an einem Tag',
    tasks: [{ quest: 'liegestuetze', ziel: 40 }],
    reward: 'eisenhandschuhe',
  },
  D: {
    beschreibung: '60 Kniebeugen an einem Tag',
    tasks: [{ quest: 'kniebeugen', ziel: 60 }],
    reward: 'laeuferschuhe',
  },
  C: {
    beschreibung: '8 Klimmzüge an einem Tag',
    tasks: [{ quest: 'klimmzuege', ziel: 8 }],
    reward: 'silberkette',
  },
  B: {
    beschreibung: '100 Liegestütze an einem Tag',
    tasks: [{ quest: 'liegestuetze', ziel: 100 }],
    reward: 'kapuzenumhang',
  },
  A: {
    beschreibung: '15 Klimmzüge + 120 Kniebeugen an einem Tag',
    tasks: [
      { quest: 'klimmzuege', ziel: 15 },
      { quest: 'kniebeugen', ziel: 120 },
    ],
    reward: 'monarchenring',
  },
}

export function nextRank(rank) {
  return RANKS[RANKS.indexOf(rank) + 1] ?? null
}
