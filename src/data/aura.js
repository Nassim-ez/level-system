import { RANKS } from './ranks.js'

// Aura-Gewinn pro Level-Up = das erreichte Level
export function auraGain(level) {
  return level
}

// Maximal mögliche Aura auf einem Level = Summe 1..level
export function maxAura(level) {
  return (level * (level + 1)) / 2
}

export function auraQuote(aura, level) {
  const max = maxAura(level)
  return max > 0 ? Math.min(1, aura / max) : 0
}

// Stufen nach Quote; bonus = Einschüchterungsbonus auf Schaden in Prozent
export const AURA_STAGES = [
  { min: 0, name: 'Erloschen', bonus: 0 },
  { min: 0.2, name: 'Flackernd', bonus: 4 },
  { min: 0.4, name: 'Stetig', bonus: 8 },
  { min: 0.6, name: 'Strahlend', bonus: 12 },
  { min: 0.8, name: 'Brennend', bonus: 18 },
  { min: 0.95, name: 'Unantastbar', bonus: 25 },
]

export function auraStage(aura, level) {
  const quote = auraQuote(aura, level)
  let stage = AURA_STAGES[0]
  for (const s of AURA_STAGES) {
    if (quote >= s.min) stage = s
  }
  return stage
}

// Wirkung gestaffelt nach Rangverhältnis: voller Bonus unter dem eigenen
// Rang, halber bei gleichem Rang, keiner darüber – egal ob Boss oder nicht.
export function auraDamageBonus(aura, level, ownRank, enemyRank) {
  const { bonus } = auraStage(aura, level)
  if (!bonus) return 0
  const own = RANKS.indexOf(ownRank)
  const enemy = RANKS.indexOf(enemyRank ?? ownRank)
  if (enemy < own) return bonus
  if (enemy === own) return bonus / 2
  return 0
}
