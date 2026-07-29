import { KATALOG, ITEMS, MATERIALIEN, variantId, rangObergrenze, MAX_RARITAET } from './items.js'
import { findDungeon } from './dungeons.js'

// Verteilung: 85 % eigener Rang, 12 % Glücksfund, 3 % Materialien
export const CHANCE_GLUECK = 0.12
export const CHANCE_MATERIAL = 0.03

// Welche Materialsorte ein Dungeon bevorzugt – daraus ergibt sich der Loot-Pool
const DUNGEON_MATERIAL = {
  eisenhoehle: 'basalt',
  knochengruft: 'knochen',
  nebelwald: 'wolf',
}

// Passende Katalog-Items eines Dungeons; ohne Treffer der ganze Katalog
export function lootPool(dungeonId) {
  const mat = DUNGEON_MATERIAL[dungeonId]
  const treffer = KATALOG.filter((k) => k.mat === mat || k.mat === 'schatten')
  return treffer.length > 0 ? treffer : KATALOG
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
export function zieheDrop(dungeonId, rank, rng = Math.random, effekte = {}) {
  const wurf = rng()
  const pool = lootPool(dungeonId)

  if (wurf < CHANCE_MATERIAL) {
    return {
      art: 'material',
      material: materialAusDungeon(dungeonId, rng),
      menge: 1 + Math.floor(rng() * 3),
    }
  }

  const basis = rangObergrenze(rank)
  // Der luck-Effekt der Ausrüstung erhöht die Glücksfund-Chance
  const glueckChance = CHANCE_GLUECK * (1 + (effekte?.luck ?? 0) / 100)
  const glueck = wurf < CHANCE_MATERIAL + glueckChance
  // Nie mehr als eine Rarität über dem eigenen Rang
  const rar = glueck ? Math.min(MAX_RARITAET, basis + 1) : basis

  const eintrag = zufall(pool, rng)
  // Aufwertungsstufen bis zur Ziel-Rarität, nie unter die Katalog-Rarität
  const stufen = Math.max(0, rar - eintrag.rarity)
  const itemId = variantId(eintrag.id, stufen)
  if (!ITEMS[itemId]) return { art: 'item', itemId: eintrag.id, glueck: false }
  return { art: 'item', itemId, glueck: glueck && rar !== basis }
}

export function zieheDrops(dungeonId, rank, anzahl, rng = Math.random, effekte = {}) {
  return Array.from({ length: anzahl }, () =>
    zieheDrop(dungeonId, rank, rng, effekte),
  )
}

export function materialName(id) {
  return MATERIALIEN[id]?.name ?? id
}
