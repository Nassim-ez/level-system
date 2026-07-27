import {
  ITEMS,
  MATERIALIEN,
  variantId,
  rangObergrenze,
  MAX_RARITAET,
} from './items.js'
import { findDungeon } from './dungeons.js'

// Verteilung: 85 % eigener Rang, 12 % Glücksfund, 3 % Materialien
export const CHANCE_GLUECK = 0.12
export const CHANCE_MATERIAL = 0.03

// Welche Vorlagen in welchem Dungeon fallen können
export const LOOT_POOL = {
  eisenhoehle: [
    'eisenhandschuhe',
    'trainingsguertel',
    'jaegerhelm',
    'holzschwert',
  ],
  knochengruft: [
    'silberkette',
    'kapuzenumhang',
    'ring_schnelligkeit',
    'frostpanzer',
  ],
  nebelwald: [
    'laeuferschuhe',
    'sprintschuhe',
    'leichtgewicht_armband',
    'ring_schnelligkeit',
  ],
}

function zufall(liste, rng) {
  return liste[Math.floor(rng() * liste.length)]
}

// Materialsorte der Gegner, die im Dungeon vorkommen
function materialAusDungeon(dungeonId, rng) {
  const dungeon = findDungeon(dungeonId)
  const sorten = dungeon
    ? [...new Set(dungeon.tueren.map((t) => t.material ?? 'basalt'))]
    : ['basalt']
  return zufall(sorten, rng)
}

/**
 * Zieht einen Drop.
 * Ergebnis: { art: 'item', itemId, glueck } oder { art: 'material', material, menge }
 */
export function zieheDrop(dungeonId, rank, rng = Math.random) {
  const wurf = rng()
  const pool = LOOT_POOL[dungeonId] ?? LOOT_POOL.eisenhoehle

  if (wurf < CHANCE_MATERIAL) {
    return {
      art: 'material',
      material: materialAusDungeon(dungeonId, rng),
      menge: 1 + Math.floor(rng() * 3),
    }
  }

  const basis = rangObergrenze(rank)
  const glueck = wurf < CHANCE_MATERIAL + CHANCE_GLUECK
  // Nie mehr als eine Rarität über dem eigenen Rang
  const rar = glueck ? Math.min(MAX_RARITAET, basis + 1) : basis

  const vorlage = zufall(pool, rng)
  const itemId = variantId(vorlage, rar)
  if (!ITEMS[itemId]) {
    return { art: 'item', itemId: variantId(vorlage, basis), glueck: false }
  }
  return { art: 'item', itemId, glueck: glueck && rar !== basis }
}

export function zieheDrops(dungeonId, rank, anzahl, rng = Math.random) {
  return Array.from({ length: anzahl }, () => zieheDrop(dungeonId, rank, rng))
}

export function materialName(id) {
  return MATERIALIEN[id]?.name ?? id
}
