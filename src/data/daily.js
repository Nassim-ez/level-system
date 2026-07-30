import { RANG_FAKTOR } from './combat.js'

// ---------------------------------------------------------------------------
// Tages-Dungeon: eigener Gegner-Pool, überschneidet sich nicht mit den
// Haupt-Dungeons. Drei kurze Stufen, deutlich schwächer als die Türläufe.
// ---------------------------------------------------------------------------

// Kleinvieh für die ersten zwei Stufen
export const KLEINVIEH = [
  { id: 'splitterling', name: 'Splitterling', sprite: 'koloss', material: 'basalt', schwaechen: { kraft: 2 }, angriffsname: 'Splitterhieb' },
  { id: 'rippenhund', name: 'Rippenhund', sprite: 'wolf', material: 'knochen', schwaechen: { tempo: 2 }, angriffsname: 'Rippenbiss' },
  { id: 'moderschleicher', name: 'Moderschleicher', sprite: 'schatten', material: 'schatten', schwaechen: { ausdauer: 2 }, angriffsname: 'Modergriff' },
  { id: 'streuner', name: 'Streuner', sprite: 'wolf', material: 'wolf', schwaechen: {}, combo: true, angriffsname: 'Streifhieb' },
  { id: 'kalkfaust', name: 'Kalkfaust', sprite: 'koloss', material: 'basalt', schwaechen: { core: 2 }, angriffsname: 'Kalkschlag' },
  { id: 'grabkriecher', name: 'Grabkriecher', sprite: 'skelett', material: 'knochen', schwaechen: { kraft: 2 }, angriffsname: 'Grabkralle' },
  { id: 'nebelfetzen', name: 'Nebelfetzen', sprite: 'schatten', material: 'schatten', schwaechen: { ausdauer: 2 }, angriffsname: 'Nebelstoß' },
  { id: 'zahnwelpe', name: 'Zahnwelpe', sprite: 'wolf', material: 'wolf', schwaechen: { tempo: 2 }, angriffsname: 'Zahnschnapp' },
]

// Tages-Bosse für die dritte Stufe
export const TAGESBOSSE = [
  { id: 'huetera', name: 'Hüter der Schwelle', sprite: 'koloss', material: 'basalt', schwaechen: { kraft: 2 }, angriffsname: 'Schwellenschlag' },
  { id: 'knochenschinder', name: 'Knochenschinder', sprite: 'vogt', material: 'knochen', schwaechen: { core: 2 }, angriffsname: 'Schinderhaken' },
  { id: 'zwielichtwaerter', name: 'Zwielichtwärter', sprite: 'schatten', material: 'schatten', schwaechen: { ausdauer: 2 }, angriffsname: 'Zwielichtschnitt' },
  { id: 'narbenwolf', name: 'Narbenwolf', sprite: 'wolf', material: 'wolf', schwaechen: {}, combo: true, angriffsname: 'Narbenriss' },
  { id: 'mahlzahn', name: 'Mahlzahn', sprite: 'koloss', material: 'basalt', schwaechen: { tempo: 2 }, angriffsname: 'Mahlbiss' },
]

// Grundwerte der drei Stufen, vor dem Rangfaktor.
// Die XP sind bewusst knapp, damit der Haupt-Dungeon pro Durchgang
// ertragreicher bleibt: 15 + 15 + 25 = 55 XP für den ganzen Lauf.
export const STUFEN = [
  { nr: 1, anzahl: 2, hp: 12, schaden: 5, xp: 15 },
  { nr: 2, anzahl: 2, hp: 18, schaden: 6, xp: 15 },
  { nr: 3, anzahl: 1, hp: 60, schaden: 10, xp: 25, boss: true },
]

// XP des kompletten Laufs
export const DAILY_LAUF_XP = STUFEN.reduce((s, t) => s + t.xp, 0)

// XP einer Stufe, auch wenn die Tür aus einem älteren Spielstand stammt
export function stufenXp(tuer) {
  if (typeof tuer?.xp === 'number') return tuer.xp
  return STUFEN.find((st) => st.nr === tuer?.nr)?.xp ?? 0
}

/**
 * Ist der gespeicherte Lauf für heute brauchbar? Ältere Spielstände haben
 * Stufen ohne XP-Wert und müssen neu gezogen werden.
 */
export function laufAktuell(daily, heute) {
  return (
    daily?.date === heute &&
    daily.doors?.length === 3 &&
    daily.doors.every((t) => typeof t.xp === 'number')
  )
}

export const DAILY_INTERVALL = 4
export const DAILY_BLOCKCHANCE = 0.8

// Belohnung: Material je Tür bzw. Boss
export const MAT_PRO_TUER = 1
export const MAT_PRO_BOSS = 3

// Serien-Faktoren auf die Materialien
export const SERIE_FAKTOR_3 = 1.5
export const SERIE_FAKTOR_7 = 2
export const SCHLUESSEL_AB = 7

export function serienFaktor(streak) {
  if (streak >= 7) return SERIE_FAKTOR_7
  if (streak >= 3) return SERIE_FAKTOR_3
  return 1
}

// ---------------------------------------------------------------------------
// Deterministische Ziehung: derselbe Tag ergibt denselben Lauf
// ---------------------------------------------------------------------------
function seedAus(text) {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(a) {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Zieht den Lauf eines Tages: zwei Kleinvieh-Gruppen und einen Tages-Boss.
 * datum als Seed – ein Reload würfelt nicht neu.
 */
export function ziehTag(datum, rank) {
  const rng = mulberry32(seedAus(`${datum}|${rank}`))
  const faktor = RANG_FAKTOR[rank] ?? 1

  const erster = Math.floor(rng() * KLEINVIEH.length)
  let zweiter = Math.floor(rng() * KLEINVIEH.length)
  if (zweiter === erster) zweiter = (zweiter + 1) % KLEINVIEH.length
  const boss = TAGESBOSSE[Math.floor(rng() * TAGESBOSSE.length)]

  const gegner = [KLEINVIEH[erster], KLEINVIEH[zweiter], boss]

  return STUFEN.map((stufe, i) => {
    const g = gegner[i]
    return {
      nr: stufe.nr,
      stufe: stufe.nr,
      name: g.name,
      gegnerart: g.name,
      sprite: g.sprite,
      material: g.material,
      anzahl: stufe.anzahl,
      hp: Math.round(stufe.hp * faktor),
      schaden: Math.round(stufe.schaden * faktor),
      intervall: DAILY_INTERVALL,
      blockchance: DAILY_BLOCKCHANCE,
      schwaechen: g.schwaechen,
      resistenzen: {},
      combo: !!g.combo,
      boss: !!stufe.boss,
      xp: stufe.xp,
      angriffsname: g.angriffsname,
    }
  })
}

// Schwäche als lesbarer Text
export function schwaecheText(tuer) {
  if (tuer.combo) return 'Übungswechsel'
  const eintrag = Object.entries(tuer.schwaechen ?? {})[0]
  if (!eintrag) return 'keine'
  const namen = { kraft: 'Kraft', core: 'Core', ausdauer: 'Ausdauer', tempo: 'Tempo' }
  return `${namen[eintrag[0]] ?? eintrag[0]} ×${eintrag[1]}`
}
