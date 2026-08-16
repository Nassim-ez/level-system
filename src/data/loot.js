import { KATALOG, ITEMS, MATERIALIEN, variantId, rangObergrenze, MAX_RARITAET } from './items.js'
import { findDungeon } from './dungeons.js'

// Verteilung: 85 % eigener Rang, 12 % Glücksfund, 3 % Materialien
export const CHANCE_GLUECK = 0.12
export const CHANCE_MATERIAL = 0.03

// Materialsorten, die in einem Dungeon überhaupt vorkommen – abgelesen an
// seinen Türen, damit jeder Rang ohne eigene Tabelle mitzieht.
function dungeonMaterialien(dungeonId) {
  const dungeon = findDungeon(dungeonId)
  if (!dungeon) return null
  return new Set(dungeon.tueren.map((t) => t.material ?? 'basalt'))
}

// Passende Katalog-Items eines Dungeons; ohne Treffer der ganze Katalog
export function lootPool(dungeonId) {
  const sorten = dungeonMaterialien(dungeonId)
  if (!sorten) return KATALOG
  const treffer = KATALOG.filter((k) => sorten.has(k.mat))
  return treffer.length > 0 ? treffer : KATALOG
}

function zufall(liste, rng) {
  return liste[Math.floor(rng() * liste.length)]
}

// Materialsorte der Gegner, die im Dungeon vorkommen
function materialAusDungeon(dungeonId, rng) {
  const sorten = dungeonMaterialien(dungeonId)
  return zufall(sorten ? [...sorten] : ['basalt'], rng)
}

/**
 * Wählt das Beutestück zur Ziel-Rarität.
 * Seit es Stücke bis Mystisch gibt, fällt das echte Item des Rangs – nur
 * wenn der Pool keines in dieser Rarität führt, wird wie früher ein
 * niedrigeres Stück hochgestuft.
 */
function waehleEintrag(pool, rar, rng) {
  const eigene = pool.filter((k) => k.rarity === rar)
  return zufall(eigene.length > 0 ? eigene : pool, rng)
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

  const eintrag = waehleEintrag(pool, rar, rng)
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
