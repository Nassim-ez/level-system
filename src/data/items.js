import { setBoni } from './sets.js'

// ---------------------------------------------------------------------------
// Raritäten – sechs Stufen, Index 0..5 (Farben aus haendler-mockup.html)
// ---------------------------------------------------------------------------
export const RARITAETEN = [
  { name: 'Gewöhnlich', color: '#93a4bd', rgb: '147,164,189' },
  { name: 'Selten', color: '#4db8ff', rgb: '77,184,255' },
  { name: 'Episch', color: '#b479ff', rgb: '180,121,255' },
  { name: 'Legendär', color: '#ffca4d', rgb: '255,202,77' },
  { name: 'Heroisch', color: '#ff5a6e', rgb: '255,90,110' },
  { name: 'Mystisch', color: '#ffffff', rgb: '255,255,255', prisma: true },
]

export const MAX_RARITAET = RARITAETEN.length - 1

// Rarität ist an den Rang gekoppelt
export const RANG_RARITAET = { E: 0, D: 1, C: 2, B: 3, A: 4, S: 5 }

export function rangObergrenze(rank) {
  return RANG_RARITAET[rank] ?? 0
}

// Schmelzertrag und Aufwertungskosten je Rarität
export const SCHMELZ_ERTRAG = [2, 5, 10, 18, 32, 60]
export const AUFWERT_KOSTEN = [8, 20, 45, 90, 180]

export function schmelzErtrag(rar) {
  return SCHMELZ_ERTRAG[rar] ?? 0
}

export function aufwertKosten(rar, beschaedigt = false) {
  const basis = AUFWERT_KOSTEN[rar]
  if (basis == null) return null
  return beschaedigt ? Math.round(basis / 2) : basis
}

// ---------------------------------------------------------------------------
// Materialien
// ---------------------------------------------------------------------------
export const MATERIALIEN = {
  basalt: { id: 'basalt', name: 'Basaltsplitter', color: '#93a4bd' },
  knochen: { id: 'knochen', name: 'Knochenmehl', color: '#e6dcc4' },
  schatten: { id: 'schatten', name: 'Schattenfaser', color: '#b479ff' },
  wolf: { id: 'wolf', name: 'Wolfsfell', color: '#c98a5b' },
}

export const SPRITE_MATERIAL = {
  kobold: 'basalt',
  koloss: 'basalt',
  skelett: 'knochen',
  vogt: 'knochen',
  schatten: 'schatten',
  wolf: 'wolf',
}

export function materialFuerSprite(sprite) {
  return SPRITE_MATERIAL[sprite] ?? 'basalt'
}

// ---------------------------------------------------------------------------
// Item-Katalog über alle Ränge (48 Items, sechs je Slot, Raritäten 0–5)
// Ab Legendär trägt jedes Stück einen Buff und einen Debuff; load- und
// dmgAll-Items bleiben im Buff schwächer, weil sie breiter wirken.
// Effekte in Prozent, negativ = Debuff:
//   dmgKraft, dmgCore, dmgAusdauer, dmgTempo, dmgAll – Schaden je Angriffsart
//   vit   – maximale Vitalität
//   block – Blockchance (Prozentpunkte)
//   luck  – Glücksfund-Chance beim Loot
//   load  – Belastungszuwachs je Aktion (negativ = weniger Belastung)
//   heal  – Wirkung von Dehnen/Heilen
// ---------------------------------------------------------------------------
export const KATALOG = [
  // HELM
  { id: 'helm_e1', slot: 'helm', name: 'Kobold-Kappe', rarity: 0, mat: 'knochen',
    effects: { vit: 4 } },
  { id: 'helm_d1', slot: 'helm', name: 'Kapuze des Spähers', rarity: 1, mat: 'schatten',
    effects: { dmgAusdauer: 8, dmgKraft: -4 } },
  { id: 'helm_c1', slot: 'helm', name: 'Helm des Knochenvogts', rarity: 2, mat: 'knochen',
    effects: { dmgCore: 12, dmgTempo: -5 } },

  // KETTE
  { id: 'kett_e1', slot: 'kette', name: 'Amulett der Ruhe', rarity: 0, mat: 'knochen',
    effects: { heal: 6 } },
  { id: 'kett_d1', slot: 'kette', name: 'Knochensplitter-Amulett', rarity: 1, mat: 'knochen',
    effects: { dmgCore: 8, vit: -3 } },
  { id: 'kett_c1', slot: 'kette', name: 'Wolfszahn-Kette', rarity: 2, mat: 'wolf',
    effects: { vit: 14, dmgTempo: -6 } },

  // UMHANG
  { id: 'umha_e1', slot: 'umhang', name: 'Zerschlissener Mantel', rarity: 0, mat: 'schatten',
    effects: { luck: 4 } },
  { id: 'umha_d1', slot: 'umhang', name: 'Umhang der Stille', rarity: 1, mat: 'schatten',
    effects: { luck: 9, vit: -4 } },
  { id: 'umha_c1', slot: 'umhang', name: 'Nebelmantel', rarity: 2, mat: 'schatten',
    effects: { luck: 14, block: -6 } },

  // BRUST
  { id: 'brus_e1', slot: 'brust', name: 'Lederwams', rarity: 0, mat: 'wolf',
    effects: { block: 5 } },
  { id: 'brus_d1', slot: 'brust', name: 'Bandagen des Ausdauernden', rarity: 1, mat: 'knochen',
    effects: { load: -8, dmgAll: -4 } },
  { id: 'brus_c1', slot: 'brust', name: 'Basaltpanzer', rarity: 2, mat: 'basalt',
    effects: { block: 15, dmgTempo: -7 } },

  // WAFFE
  { id: 'waff_e1', slot: 'waffe', name: 'Übungsstab', rarity: 0, mat: 'basalt',
    effects: { dmgKraft: 5 } },
  { id: 'waff_d1', slot: 'waffe', name: 'Skelettklinge', rarity: 1, mat: 'knochen',
    effects: { dmgKraft: 9, dmgAusdauer: -4 } },
  { id: 'waff_c1', slot: 'waffe', name: 'Splitterhammer des Kolosses', rarity: 2, mat: 'basalt',
    effects: { dmgKraft: 15, dmgTempo: -7 } },

  // RING
  { id: 'ring_e1', slot: 'ring', name: 'Schlichter Reif', rarity: 0, mat: 'basalt',
    effects: { dmgTempo: 4 } },
  { id: 'ring_d1', slot: 'ring', name: 'Ring der Schnelligkeit', rarity: 1, mat: 'schatten',
    effects: { dmgTempo: 9, dmgKraft: -4 } },
  { id: 'ring_c1', slot: 'ring', name: 'Siegel des Rudelführers', rarity: 2, mat: 'wolf',
    effects: { dmgAll: 13, block: -8 } },

  // HOSE
  { id: 'hose_e1', slot: 'hose', name: 'Grobe Beinlinge', rarity: 0, mat: 'wolf',
    effects: { dmgAusdauer: 4 } },
  { id: 'hose_d1', slot: 'hose', name: 'Läuferhose', rarity: 1, mat: 'wolf',
    effects: { dmgAusdauer: 9, dmgCore: -4 } },
  { id: 'hose_c1', slot: 'hose', name: 'Schattengewebte Hose', rarity: 2, mat: 'schatten',
    effects: { dmgAusdauer: 13, vit: -6 } },

  // SCHUHE
  { id: 'schu_e1', slot: 'schuhe', name: 'Abgetragene Stiefel', rarity: 0, mat: 'knochen',
    effects: { dmgTempo: 4 } },
  { id: 'schu_d1', slot: 'schuhe', name: 'Aschesohlen', rarity: 1, mat: 'basalt',
    effects: { dmgTempo: 10, block: -5 } },
  { id: 'schu_c1', slot: 'schuhe', name: 'Pfoten des Rudels', rarity: 2, mat: 'wolf',
    effects: { dmgTempo: 14, dmgKraft: -6 } },

  // ---- LEGENDÄR (Rang B) · Aschewüste, Spiegelhallen, Der Schlund --------
  { id: 'helm_b1', slot: 'helm', name: 'Maske des Spiegelwächters', rarity: 3, mat: 'knochen',
    effects: { vit: 18, dmgTempo: -8 } },
  { id: 'kett_b1', slot: 'kette', name: 'Kadaverzahn-Amulett', rarity: 3, mat: 'wolf',
    effects: { load: -17, dmgAll: -9 } },
  { id: 'umha_b1', slot: 'umhang', name: 'Schleier des Zerrbilds', rarity: 3, mat: 'schatten',
    effects: { luck: 19, block: -8 } },
  { id: 'brus_b1', slot: 'brust', name: 'Kürass des Ödwächters', rarity: 3, mat: 'basalt',
    effects: { block: 20, dmgTempo: -9 } },
  { id: 'waff_b1', slot: 'waffe', name: 'Klinge des Glasgängers', rarity: 3, mat: 'basalt',
    effects: { dmgKraft: 20, dmgCore: -9 } },
  { id: 'ring_b1', slot: 'ring', name: 'Ring des Echofressers', rarity: 3, mat: 'schatten',
    effects: { dmgCore: 19, dmgKraft: -8 } },
  { id: 'hose_b1', slot: 'hose', name: 'Kadaverfell-Hose', rarity: 3, mat: 'wolf',
    effects: { dmgAusdauer: 19, vit: -8 } },
  { id: 'schu_b1', slot: 'schuhe', name: 'Schlundwurm-Stiefel', rarity: 3, mat: 'knochen',
    effects: { dmgTempo: 20, block: -9 } },

  // ---- HEROISCH (Rang A) · Sturmauge, Blutmondzinne, Wandelgang ----------
  { id: 'helm_a1', slot: 'helm', name: 'Sturmhaube des Blitzträgers', rarity: 4, mat: 'basalt',
    effects: { dmgCore: 24, dmgAusdauer: -10 } },
  { id: 'kett_a1', slot: 'kette', name: 'Amulett des Zinnenwarts', rarity: 4, mat: 'knochen',
    effects: { heal: 25, dmgKraft: -10 } },
  { id: 'umha_a1', slot: 'umhang', name: 'Mantel des Schwellenwesens', rarity: 4, mat: 'schatten',
    effects: { luck: 24, vit: -10 } },
  { id: 'brus_a1', slot: 'brust', name: 'Harnisch des Torhüters', rarity: 4, mat: 'knochen',
    effects: { block: 26, dmgAusdauer: -11 } },
  { id: 'waff_a1', slot: 'waffe', name: 'Sturmstab des Hagelwerfers', rarity: 4, mat: 'basalt',
    effects: { dmgKraft: 26, dmgTempo: -11 } },
  { id: 'ring_a1', slot: 'ring', name: 'Reif des Rotpelzes', rarity: 4, mat: 'wolf',
    effects: { dmgAll: 22, block: -11 } },
  { id: 'hose_a1', slot: 'hose', name: 'Schrittgewand des Wandlers', rarity: 4, mat: 'schatten',
    effects: { dmgAusdauer: 25, dmgCore: -10 } },
  { id: 'schu_a1', slot: 'schuhe', name: 'Klauen der Wirbelbestie', rarity: 4, mat: 'wolf',
    effects: { dmgTempo: 25, dmgKraft: -10 } },

  // ---- MYSTISCH (Rang S) · Scherbenhimmel, Stille Wiege, Hohler Thron ----
  { id: 'helm_s1', slot: 'helm', name: 'Krone des Nachtherrn', rarity: 5, mat: 'schatten',
    effects: { dmgAll: 28, vit: -14 } },
  { id: 'kett_s1', slot: 'kette', name: 'Kette des Kronvogts', rarity: 5, mat: 'basalt',
    effects: { vit: 30, dmgTempo: -12 } },
  { id: 'umha_s1', slot: 'umhang', name: 'Mantel der Summstille', rarity: 5, mat: 'schatten',
    effects: { luck: 31, block: -13 } },
  { id: 'brus_s1', slot: 'brust', name: 'Brustplatte der Himmelsscherbe', rarity: 5, mat: 'basalt',
    effects: { block: 32, dmgAusdauer: -14 } },
  { id: 'waff_s1', slot: 'waffe', name: 'Zepter des Kronlosen', rarity: 5, mat: 'knochen',
    effects: { dmgKraft: 32, dmgCore: -14 } },
  { id: 'ring_s1', slot: 'ring', name: 'Kometensiegel', rarity: 5, mat: 'wolf',
    effects: { dmgCore: 30, dmgKraft: -12 } },
  { id: 'hose_s1', slot: 'hose', name: 'Läufe der Kometenhunde', rarity: 5, mat: 'wolf',
    effects: { dmgAusdauer: 30, dmgTempo: -12 } },
  { id: 'schu_s1', slot: 'schuhe', name: 'Tritte des Thronwächters', rarity: 5, mat: 'knochen',
    effects: { dmgTempo: 31, dmgKraft: -13 } },
]

// Anzeigetexte für die UI
export const EFFECT_LABEL = {
  dmgKraft: 'Kraft-Schaden',
  dmgCore: 'Core-Schaden',
  dmgAusdauer: 'Ausdauer-Schaden',
  dmgTempo: 'Tempo-Schaden',
  dmgAll: 'Schaden gesamt',
  vit: 'Vitalität',
  block: 'Blockchance',
  luck: 'Glücksfund-Chance',
  load: 'Belastung je Aktion',
  heal: 'Heilwirkung',
}

// Beim Aufwerten wachsen die Vorteile, die Nachteile bleiben wie sie sind
export const AUFWERT_FAKTOR = 1.5

// Item-ID einer Ausführung: "<id>+<stufen>" aufgewertet,
// "<id>-<stufen>" abgenutzt – Letzteres entsteht, wenn im Dungeon
// zurückgelassene Ausrüstung zurückgeholt wird.
export function variantId(basisId, stufen) {
  if (stufen > 0) return `${basisId}+${stufen}`
  if (stufen < 0) return `${basisId}-${-stufen}`
  return basisId
}

// Schlüssel, bei denen ein niedrigerer Wert besser ist
export const NIEDRIGER_IST_BESSER = ['load']

// Ob ein Effekt für den Spieler vorteilhaft ist – nicht das Vorzeichen
// allein entscheidet: weniger Belastung je Aktion ist ein Vorteil.
export function istVorteil(key, wert) {
  return NIEDRIGER_IST_BESSER.includes(key) ? wert < 0 : wert > 0
}

function skaliere(effects, stufen) {
  if (stufen === 0) return { ...effects }
  const out = {}
  for (const [key, wert] of Object.entries(effects)) {
    if (istVorteil(key, wert)) {
      // Vorteile wachsen mit jeder Stufe und schrumpfen darunter, bleiben
      // aber spürbar: mindestens 1. Das Vorzeichen bleibt erhalten, damit
      // auch ein Vorteil mit negativem Wert – weniger Belastung – mitwächst.
      const betrag = Math.max(
        1,
        Math.round(Math.abs(wert) * Math.pow(AUFWERT_FAKTOR, stufen)),
      )
      out[key] = wert < 0 ? -betrag : betrag
    } else {
      out[key] = wert // Nachteile skalieren nicht mit
    }
  }
  return out
}

function baueItems() {
  const items = {}
  for (const eintrag of KATALOG) {
    const maxStufen = MAX_RARITAET - eintrag.rarity
    // Auch die abgenutzten Stufen bis hinunter zu Gewöhnlich anlegen
    for (let s = -eintrag.rarity; s <= maxStufen; s++) {
      const rar = eintrag.rarity + s
      const id = variantId(eintrag.id, s)
      items[id] = {
        id,
        basisId: eintrag.id,
        stufen: s,
        name: eintrag.name,
        basisName: eintrag.name,
        slot: eintrag.slot,
        material: eintrag.mat,
        rar,
        effects: skaliere(eintrag.effects, s),
      }
    }
  }
  items.dungeonschluessel = {
    id: 'dungeonschluessel',
    basisId: 'dungeonschluessel',
    stufen: 0,
    name: 'Dungeon-Schlüssel',
    basisName: 'Dungeon-Schlüssel',
    slot: null,
    material: 'basalt',
    rar: null,
    verbrauchbar: true,
    beschreibung:
      'Belohnung für sieben Tage Tages-Dungeon in Folge. Öffnet verschlossene Wege.',
    effects: {},
  }
  items.serienschutz = {
    id: 'serienschutz',
    basisId: 'serienschutz',
    stufen: 0,
    name: 'Serienschutz-Stein',
    basisName: 'Serienschutz-Stein',
    slot: null,
    material: 'basalt',
    rar: null,
    verbrauchbar: true,
    beschreibung:
      'Rettet die Tagesserie bei einem Fehltag. Wird automatisch verbraucht.',
    effects: {},
  }
  return items
}

export const ITEMS = baueItems()

// ---------------------------------------------------------------------------
// Set-Zählung: getragene Teile je Material, ein Teil pro Slot
// ---------------------------------------------------------------------------
export function zaehleSetTeile(equipment) {
  const zaehler = {}
  for (const [slot, id] of Object.entries(equipment ?? {})) {
    const item = ITEMS[id]
    // Nur was tatsächlich in einem Slot steckt – Verbrauchsgüter zählen nicht
    if (!item?.material || item.slot !== slot) continue
    zaehler[item.material] = (zaehler[item.material] ?? 0) + 1
  }
  return zaehler
}

/** Set-Effekte der getragenen Ausrüstung, über alle Materialien summiert */
export function summiereSetBoni(equipment) {
  const summe = {}
  for (const [material, anzahl] of Object.entries(zaehleSetTeile(equipment))) {
    for (const [key, wert] of Object.entries(setBoni(material, anzahl))) {
      summe[key] = (summe[key] ?? 0) + wert
    }
  }
  return summe
}

// ---------------------------------------------------------------------------
// Wirksame Effekte der getragenen Ausrüstung, aufsummiert.
// Set-Boni fließen in dieselbe Summe, damit sie überall dort wirken, wo
// auch die Item-Effekte greifen – Kampf, Blockchance, Beute, Anzeige.
// ---------------------------------------------------------------------------
export function summiereEffekte(equipment) {
  const summe = {}
  for (const id of Object.values(equipment ?? {})) {
    const item = ITEMS[id]
    if (!item?.effects) continue
    for (const [key, wert] of Object.entries(item.effects)) {
      summe[key] = (summe[key] ?? 0) + wert
    }
  }
  for (const [key, wert] of Object.entries(summiereSetBoni(equipment))) {
    summe[key] = (summe[key] ?? 0) + wert
  }
  return summe
}

// ---------------------------------------------------------------------------
// Migration: alte Varianten-IDs auf den neuen Katalog abbilden
// ---------------------------------------------------------------------------
const ALTE_STUFEN = { grau: 0, blau: 1, violett: 2, gold: 3 }
// Slot der früheren Vorlagen, um passenden Ersatz zu finden
const ALTE_SLOTS = {
  ring_schnelligkeit: 'ring',
  leichtgewicht_armband: 'kette',
  sprintschuhe: 'schuhe',
  eisenhandschuhe: 'waffe',
  laeuferschuhe: 'schuhe',
  silberkette: 'kette',
  kapuzenumhang: 'umhang',
  monarchenring: 'ring',
  trainingsguertel: 'hose',
  jaegerhelm: 'helm',
  frostpanzer: 'brust',
  daemonenklinge: 'waffe',
  monarchenkrone: 'helm',
  holzschwert: 'waffe',
}

// Ersatz mit gleichem Slot und möglichst gleicher Rarität. Seit der Katalog
// bis Mystisch reicht, gibt es für jede alte Stufe ein echtes Stück – die
// frühere Deckelung auf Episch entfällt.
function ersatzFuer(slot, rar) {
  const kandidaten = KATALOG.filter((k) => k.slot === slot)
  if (kandidaten.length === 0) return null
  const ziel = Math.max(0, Math.min(MAX_RARITAET, rar))
  const treffer = kandidaten.find((k) => k.rarity === ziel) ?? kandidaten[0]
  const stufen = Math.max(0, ziel - treffer.rarity)
  return variantId(treffer.id, stufen)
}

export function migriereItemId(id) {
  if (!id || typeof id !== 'string') return id
  if (ITEMS[id]) return id

  // "<vorlage>__r<n>" oder "<vorlage>__grau" …
  const m = id.match(/^(.+?)__(?:r(\d)|(grau|blau|violett|gold))$/)
  if (m) {
    const vorlage = m[1]
    const rar = m[2] != null ? Number(m[2]) : ALTE_STUFEN[m[3]]
    const slot = ALTE_SLOTS[vorlage]
    if (slot) return ersatzFuer(slot, rar) ?? id
  }
  // Ganz alte IDs ohne Stufe
  if (ALTE_SLOTS[id]) return ersatzFuer(ALTE_SLOTS[id], 0) ?? id
  return id
}

// ---------------------------------------------------------------------------
export function hochgestuft(itemId) {
  const item = ITEMS[itemId]
  if (!item || item.rar == null || item.rar >= MAX_RARITAET) return null
  return variantId(item.basisId, item.stufen + 1)
}

export function herabgestuft(itemId) {
  const item = ITEMS[itemId]
  // Gewöhnlich ist die unterste Stufe
  if (!item || item.rar == null || item.rar <= 0) return null
  return variantId(item.basisId, item.stufen - 1)
}

export const SLOTS = [
  'helm',
  'kette',
  'umhang',
  'brust',
  'waffe',
  'ring',
  'hose',
  'schuhe',
]

export const SLOT_LABELS = {
  helm: 'HELM',
  kette: 'KETTE',
  umhang: 'UMHANG',
  brust: 'BRUST',
  waffe: 'WAFFE',
  ring: 'RING',
  hose: 'HOSE',
  schuhe: 'SCHUHE',
}

// Effekte als Liste, Vorteile zuerst
export function effektListe(item) {
  if (!item?.effects) return []
  return Object.entries(item.effects)
    .map(([key, wert]) => ({
      key,
      wert,
      vorteil: istVorteil(key, wert),
      label: EFFECT_LABEL[key] ?? key,
      text: `${wert > 0 ? '+' : '−'}${Math.abs(wert)}% ${EFFECT_LABEL[key] ?? key}`,
    }))
    .sort((a, b) => Number(b.vorteil) - Number(a.vorteil) || b.wert - a.wert)
}

export function effektText(item) {
  return effektListe(item)
    .map((e) => e.text)
    .join(' · ')
}

export function raritaet(item) {
  return item?.rar != null ? RARITAETEN[item.rar] : null
}
