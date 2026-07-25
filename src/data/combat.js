// ---------------------------------------------------------------------------
// Kampfsystem der Tür-Dungeons
// ---------------------------------------------------------------------------

// Schadensarten
export const ARTEN = {
  kraft: { id: 'kraft', name: 'Kraft', color: 'var(--danger)' },
  core: { id: 'core', name: 'Core', color: 'var(--xp)' },
  ausdauer: { id: 'ausdauer', name: 'Ausdauer', color: 'var(--ok)' },
  tempo: { id: 'tempo', name: 'Tempo', color: 'var(--glow)' },
}

// Die sechs Angriffe. faktor = Schaden pro Wiederholung/Einheit.
export const ANGRIFFE = [
  { id: 'liegestuetze', name: 'Liegestütze', kurz: 'LIEGE', art: 'kraft', reps: 5, einheit: 'Wdh.', faktor: 1, belastung: 6 },
  { id: 'kniebeugen', name: 'Kniebeugen', kurz: 'KNIE', art: 'kraft', reps: 5, einheit: 'Wdh.', faktor: 1, belastung: 5 },
  { id: 'klimmzuege', name: 'Klimmzüge', kurz: 'KLIMM', art: 'kraft', reps: 2, einheit: 'Wdh.', faktor: 5, belastung: 14 },
  { id: 'crunches', name: 'Crunches', kurz: 'CRUNCH', art: 'core', reps: 5, einheit: 'Wdh.', faktor: 1, belastung: 4 },
  { id: 'burpees', name: 'Burpees', kurz: 'BURPEE', art: 'ausdauer', reps: 5, einheit: 'Wdh.', faktor: 3, belastung: 12 },
  { id: 'schattenboxen', name: 'Schattenboxen', kurz: 'SCHATTEN', art: 'tempo', reps: 1, einheit: 'Min.', faktor: 8, belastung: 9 },
]

// Schaden skaliert mit dem Rang
export const RANG_FAKTOR = { E: 1, D: 1.3, C: 1.7, B: 2.2, A: 2.8, S: 3.5 }

export const SCHWAECHE_MULT = 1.5
export const RESISTENZ_MULT = 0.6

// Belastungsstufen: ab 100 halber, ab 200 viertel Schaden
export const BELASTUNG_HALB = 100
export const BELASTUNG_VIERTEL = 200

export function belastungsStufe(belastung) {
  if (belastung >= BELASTUNG_VIERTEL) return 2
  if (belastung >= BELASTUNG_HALB) return 1
  return 0
}

export function belastungsFaktor(belastung) {
  return [1, 0.5, 0.25][belastungsStufe(belastung)]
}

export const BELASTUNG_LABELS = ['FRISCH', 'ERSCHÖPFT', 'AM LIMIT']

// Spielerwerte
export const MAX_VITALITAET = 100
export const MAX_HEILUNGEN = 3
// Heilung wird mit steigender Belastung schwächer
export const HEILUNG_PRO_STUFE = [25, 15, 8]

// Blocken (Plank): Grundchance, gegnerabhängig gesenkt
export const BLOCK_GRUND = 0.75
export const BLOCK_MISSERFOLG_SCHADEN = 0.85

export function blockChance(gegner) {
  let chance = BLOCK_GRUND
  if (gegner.combo) chance -= 0.1
  if (gegner.boss) chance -= 0.1
  chance -= (gegner.ausweichrate ?? 0) * 0.2
  return Math.max(0.3, chance)
}

// Nachrückende Gegner einer Gruppe schlagen härter zu
export const NACHRUECK_BONUS = 0.1

// Bosse: Phasenwechsel bei 66 % und 33 %
export const BOSS_PHASEN = [0.66, 0.33]
export const BOSS_PHASEN_SCHADEN = 0.25 // je Phase +25 % Schaden
export const FLUCH_HEILUNG = 0.5 // Fluch halbiert die Heilung

export function bossPhase(hp, maxHp) {
  const quote = hp / maxHp
  if (quote <= BOSS_PHASEN[1]) return 2
  if (quote <= BOSS_PHASEN[0]) return 1
  return 0
}

// XP pro geschaffter Tür (Boss-XP kommt aus dungeons.js)
export const TUER_XP = 40

// Rasten heilt den aktuellen Gegner
export const RAST_GEGNER_HEILUNG = 0.25

export function berechneSchaden({
  angriff,
  gegner,
  rank,
  belastung,
  auraBonus = 0,
  phase = 0,
}) {
  const basis = angriff.reps * angriff.faktor
  let mult = RANG_FAKTOR[rank] ?? 1
  if (gegner.schwaechen?.includes(angriff.art)) mult *= SCHWAECHE_MULT
  if (gegner.resistenzen?.includes(angriff.art)) mult *= RESISTENZ_MULT
  mult *= belastungsFaktor(belastung)
  mult *= 1 + auraBonus / 100
  // Bosse werden in späteren Phasen zäher
  if (phase > 0) mult *= 1 - phase * 0.05
  return Math.max(1, Math.round(basis * mult))
}

export function gegnerSchaden({ gegner, welcher = 0, phase = 0, geblockt }) {
  let dmg = gegner.schaden * (1 + welcher * NACHRUECK_BONUS)
  if (phase > 0) dmg *= 1 + phase * BOSS_PHASEN_SCHADEN
  if (geblockt === 'teilweise') dmg *= BLOCK_MISSERFOLG_SCHADEN
  if (geblockt === 'voll') return 0
  return Math.max(1, Math.round(dmg))
}
