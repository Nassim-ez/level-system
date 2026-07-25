import { ITEMS, STUFEN, MATERIALIEN, variantId, naechsteStufe } from './items.js'
import { RANKS } from './ranks.js'

// Welche Qualitätsstufe zu welchem Rang gehört. Über den eigenen Rang hinaus
// darf nie mehr als eine Stufe fallen.
export const RANG_STUFE = {
  E: 'grau',
  D: 'grau',
  C: 'blau',
  B: 'blau',
  A: 'violett',
  S: 'gold',
}

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

const MATERIAL_POOL = {
  eisenhoehle: 'eisenstaub',
  knochengruft: 'knochenmehl',
  nebelwald: 'nebelessenz',
}

function zufall(liste) {
  return liste[Math.floor(Math.random() * liste.length)]
}

/**
 * Zieht einen Drop.
 * Ergebnis: { art: 'item', itemId, glueck } oder { art: 'material', material, menge }
 */
export function zieheDrop(dungeonId, rank, rng = Math.random) {
  const wurf = rng()
  const pool = LOOT_POOL[dungeonId] ?? LOOT_POOL.eisenhoehle

  if (wurf < CHANCE_MATERIAL) {
    const material = MATERIAL_POOL[dungeonId] ?? 'eisenstaub'
    return { art: 'material', material, menge: 1 + Math.floor(rng() * 3) }
  }

  const basisStufe = RANG_STUFE[rank] ?? 'grau'
  const glueck = wurf < CHANCE_MATERIAL + CHANCE_GLUECK
  let stufe = basisStufe
  if (glueck) {
    // Genau eine Stufe über dem eigenen Rang – nie mehr
    stufe = naechsteStufe(basisStufe) ?? basisStufe
  }

  const vorlage = zufall(pool)
  const itemId = variantId(vorlage, stufe)
  // Fällt die Variante aus, auf die Basisstufe zurückfallen
  if (!ITEMS[itemId]) {
    return { art: 'item', itemId: variantId(vorlage, basisStufe), glueck: false }
  }
  return { art: 'item', itemId, glueck: glueck && stufe !== basisStufe }
}

export function zieheDrops(dungeonId, rank, anzahl, rng = Math.random) {
  return Array.from({ length: anzahl }, () => zieheDrop(dungeonId, rank, rng))
}

export function materialName(id) {
  return MATERIALIEN[id]?.name ?? id
}

export { STUFEN, RANKS }
