import { auraBlockBonus } from './aura.js'

// Angriffsart → Effekt-Schlüssel der Ausrüstung
export const ART_EFFEKT = {
  kraft: 'dmgKraft',
  core: 'dmgCore',
  ausdauer: 'dmgAusdauer',
  tempo: 'dmgTempo',
}

// ---------------------------------------------------------------------------
// Kampfsystem der Tür-Dungeons. Mechanik und Werte 1:1 aus dungeon-mockup.html,
// ergänzt um die beiden eigenen Regeln dieses Projekts:
//   – Rang-Schadensmultiplikator (E ×1 … S ×3,5)
//   – Einschüchterungsbonus aus der Aura
// ---------------------------------------------------------------------------

// Eigene Aktionen sind durchgehend blau; Rot bleibt dem Gegner vorbehalten.
export const ARTEN = {
  kraft: { id: 'kraft', name: 'Kraft', color: 'var(--glow)' },
  core: { id: 'core', name: 'Core', color: 'var(--xp)' },
  ausdauer: { id: 'ausdauer', name: 'Ausdauer', color: '#6fa8dc' },
  tempo: { id: 'tempo', name: 'Tempo', color: '#5ecbff' },
}

// Die sechs Angriffe wie im Mockup. basis = Schaden vor allen Multiplikatoren,
// er ist zugleich der Belastungszuwachs.
export const ANGRIFFE = [
  { id: 'liegestuetze', name: 'Liegestütze', art: 'kraft', menge: 5, einheit: '+5', basis: 5 },
  { id: 'kniebeugen', name: 'Kniebeugen', art: 'kraft', menge: 5, einheit: '+5', basis: 5 },
  { id: 'klimmzuege', name: 'Klimmzüge', art: 'kraft', menge: 1, einheit: '+1 ×5', basis: 5 },
  { id: 'crunches', name: 'Crunches', art: 'core', menge: 5, einheit: '+5', basis: 5 },
  // Ausdauer läuft auf Zeit: 15 Sekunden kosten so viel Belastung wie
  // früher 20 Wiederholungen und richten denselben Schaden an
  { id: 'knielauf', name: 'Knielauf', art: 'ausdauer', menge: 15, einheit: '+15 Sek', basis: 10, zeit: true },
  { id: 'burpees', name: 'Burpees', art: 'tempo', menge: 5, einheit: '+5 ×3', basis: 15 },
]

// Schaden skaliert mit dem Rang
export const RANG_FAKTOR = { E: 1, D: 1.3, C: 1.7, B: 2.2, A: 2.8, S: 3.5 }

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

export const BELASTUNG_LABELS = ['100%', '50%', '25%']

// Spielerwerte
export const MAX_VITALITAET = 100

// Wirksame Maximal-Vitalität mit dem vit-Effekt der Ausrüstung
export function maxVitalitaet(effekte) {
  const vit = effekte?.vit ?? 0
  return Math.max(20, Math.round(MAX_VITALITAET * (1 + vit / 100)))
}
export const MAX_HEILUNGEN = 3
// Heilung in Anteilen der Maximal-Vitalität, je Belastungsstufe
export const HEILUNG_ANTEIL = [0.25, 0.15, 0.08]

// Belastungskosten der Reaktionen
export const BELASTUNG_BLOCK = 9
export const BELASTUNG_HEILEN = 6

// Blocken: bei Erfolg 30 % Schaden, bei gebrochenem Block 85 %
export const BLOCK_ERFOLG_SCHADEN = 0.3
export const BLOCK_BRUCH_SCHADEN = 0.85

// Ein einzelner Treffer nimmt höchstens diesen Anteil der Maximal-Vitalität.
// Damit bleibt nach jedem Angriff eine Reaktion möglich und die Ankündigung
// behält ihren Sinn – sonst könnte ein Boss aus voller Vitalität töten.
export const TREFFER_DECKEL = 0.7

// Blockchance: Basiswert des Gegners plus Aura und Level-Vorsprung
export const LEVEL_PRO_STUFE = 1.5
export const LEVEL_GRENZE = 15
export const BLOCK_MIN = 0.15
export const BLOCK_MAX = 0.9

/**
 * Aufschlüsselung der Blockchance.
 * gegner: Tür-Objekt (blockchance, stufe/hp als Gegnerstärke)
 * spieler: { level, aura }
 */
export function blockChanceDetail(gegner, spieler) {
  const basis = (gegner?.blockchance ?? 0.75) * 100
  const aura = auraBlockBonus(spieler?.aura ?? 0, spieler?.level ?? 1)
  const roh = ((spieler?.level ?? 1) - (gegner?.stufe ?? 1)) * LEVEL_PRO_STUFE
  // Erst runden, dann summieren – so ergibt die angezeigte Aufschlüsselung
  // exakt den Gesamtwert
  const level = Math.round(
    Math.max(-LEVEL_GRENZE, Math.min(LEVEL_GRENZE, roh)),
  )
  // Ausrüstung wirkt in Prozentpunkten auf die Blockchance
  const ausruestung = spieler?.effekte?.block ?? 0
  const summe = basis + aura + level + ausruestung
  const gesamt = Math.max(BLOCK_MIN * 100, Math.min(BLOCK_MAX * 100, summe))
  return {
    basis: Math.round(basis),
    aura,
    level: Math.round(level),
    ausruestung: Math.round(ausruestung),
    gesamt: Math.round(gesamt),
    chance: gesamt / 100,
  }
}

export function blockChance(gegner, spieler) {
  return blockChanceDetail(gegner, spieler).chance
}

// Gruppen: jeder weitere lebende Gegner erhöht den Schaden um 30 %
export const GRUPPEN_BONUS = 0.3

// Combo: Übungswechsel gegen combo-Gegner steigert den Schaden
export const COMBO_MAX = 3
export const COMBO_PRO_STUFE = 0.25

// Boss-Fluch: 40 % Chance je Angriff, senkt drei Züge lang den Schaden
export const FLUCH_CHANCE = 0.4
export const FLUCH_DAUER = 3
export const FLUCH_FAKTOR = 0.7

// Amber ist ausschließlich der Angriffs-Ankündigung vorbehalten
export const AMBER = '#ffb347'

// Stimmungen nach HP-Anteil – Rot-Skala, kein Gelb/Orange
export const MOODS = [
  ['GELASSEN', '#6f8db0'],
  ['GEREIZT', '#e08a95'],
  ['WÜTEND', '#ff6b78'],
  ['RASEND', '#ff4d5e'],
]

// Belastungsleiste: blau → amber → rot
export const BELASTUNG_FARBEN = ['#3fb6ff', AMBER, '#ff4d5e']

export function moodIndex(hp, maxHp) {
  const pct = hp / maxHp
  return pct > 0.75 ? 0 : pct > 0.5 ? 1 : pct > 0.25 ? 2 : 3
}

// ---------------------------------------------------------------------------
// Phasen eines Bosses
//
// Standardmäßig folgen die Phasen den vier Stimmungsstufen, also drei
// Wechsel über den Kampf. Ein Boss kann mit dem Feld `phasen` eine eigene
// Staffelung mitbringen: je Eintrag der HP-Anteil, ab dem sie gilt, und der
// Text, der beim Übergang erscheint.
// ---------------------------------------------------------------------------
export const PHASEN_STANDARD = [0.75, 0.5, 0.25, 0]

/**
 * Aktuelle Phase eines Gegners. Ohne eigene Staffelung entspricht sie der
 * Stimmungsstufe, damit sich am Verhalten bestehender Bosse nichts ändert.
 */
export function phasenIndex(hp, maxHp, phasen) {
  const grenzen = phasen?.length
    ? phasen.map((p) => p.ab ?? 0)
    : PHASEN_STANDARD
  const pct = maxHp > 0 ? hp / maxHp : 0
  let index = 0
  grenzen.forEach((grenze, i) => {
    if (pct <= grenze) index = i
  })
  // Über der obersten Grenze steht immer die erste Phase
  return pct > grenzen[0] ? 0 : index
}

/** Text zum Phasenwechsel, sofern der Gegner einen mitbringt */
export function phasenText(tuer, index) {
  if (tuer?.phasen?.length) return tuer.phasen[index]?.text ?? null
  return tuer?.mood?.[index] ?? null
}

// XP wie im Mockup
export const TUER_XP = 60
export const BOSS_XP = 200

// Rasten heilt den aktuellen Gegner
export const RAST_GEGNER_HEILUNG = 0.25

/**
 * Schaden eines Spielerangriffs.
 * Schwächen und Resistenzen sind Multiplikatoren direkt aus der Tür.
 */
export function berechneSchaden({
  angriff,
  gegner,
  rank,
  belastung,
  auraBonus = 0,
  combo = 1,
  fluch = 0,
  effekte = {},
}) {
  const basis = angriff.basis
  const f = belastungsFaktor(belastung)
  let mul = gegner.schwaechen?.[angriff.art] ?? gegner.resistenzen?.[angriff.art] ?? 1
  if (gegner.combo) mul *= 1 + (combo - 1) * COMBO_PRO_STUFE
  if (fluch > 0) mul *= FLUCH_FAKTOR
  mul *= RANG_FAKTOR[rank] ?? 1
  mul *= 1 + auraBonus / 100
  // Ausrüstung: Aufschlag der passenden Art plus dmgAll
  const artBonus = effekte[ART_EFFEKT[angriff.art]] ?? 0
  const alleBonus = effekte.dmgAll ?? 0
  mul *= 1 + (artBonus + alleBonus) / 100
  // Belastung je Aktion, durch load beeinflusst
  const last = Math.max(
    1,
    Math.round(basis * (1 + (effekte.load ?? 0) / 100)),
  )
  return {
    schaden: Math.max(1, Math.round(basis * mul * f)),
    stark: artBonus + alleBonus > 0 || mul > (RANG_FAKTOR[rank] ?? 1),
    belastung: last,
  }
}

// Belastungskosten einer Reaktion mit dem load-Effekt
export function belastungMit(basis, effekte) {
  return Math.max(1, Math.round(basis * (1 + (effekte?.load ?? 0) / 100)))
}

// Heilmenge mit dem heal-Effekt
export function heilMenge(anteil, maxVit, effekte) {
  return Math.max(
    1,
    Math.round(maxVit * anteil * (1 + (effekte?.heal ?? 0) / 100)),
  )
}

/**
 * Schaden eines Gegnerangriffs.
 * block: null (nicht geblockt) | 'gehalten' | 'gebrochen'
 * maxVit: wirksame Maximal-Vitalität für die Deckelung
 *
 * Gibt { schaden, gedeckelt } zurück – gedeckelt sagt, ob TREFFER_DECKEL
 * gegriffen hat, damit das Kampflog es kenntlich machen kann.
 */
export function gegnerSchaden({
  gegner,
  lebende = 1,
  block = null,
  maxVit = MAX_VITALITAET,
  rng = Math.random,
}) {
  let dmg = gegner.schaden + Math.round(rng() * 4)
  if (lebende > 1) dmg = Math.round(dmg * (1 + (lebende - 1) * GRUPPEN_BONUS))
  if (block === 'gehalten') dmg = Math.round(dmg * BLOCK_ERFOLG_SCHADEN)
  else if (block === 'gebrochen') dmg = Math.round(dmg * BLOCK_BRUCH_SCHADEN)
  dmg = Math.max(1, dmg)
  const deckel = Math.max(1, Math.round(maxVit * TREFFER_DECKEL))
  return { schaden: Math.min(dmg, deckel), gedeckelt: dmg > deckel }
}
