// ---------------------------------------------------------------------------
// Raritäten – sechs Stufen, Index 0..5 (Werte aus haendler-mockup.html)
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

// Welche Gegnerart welches Material hinterlässt
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
// Item-Vorlagen. Jede Rarität wird daraus als eigene Variante erzeugt.
// material = Sorte, die beim Schmelzen anfällt bzw. zum Aufwerten nötig ist.
// ---------------------------------------------------------------------------
const VORLAGEN = {
  ring_schnelligkeit: {
    basisName: 'Ring der Schnelligkeit',
    slot: 'ring',
    material: 'schatten',
    beschreibung: 'Der Ring treibt jede Bewegung an.',
    bonus: { typ: 'stat', stat: 'AGI' },
    werte: [15, 30, 40, 50, 62, 75],
  },
  leichtgewicht_armband: {
    basisName: 'Leichtgewicht-Armband',
    slot: 'kette',
    material: 'schatten',
    beschreibung: 'Extrem leicht – gut für Tempo, schlecht für rohe Kraft.',
    bonus: { typ: 'stat', stat: 'AGI' },
    werte: [10, 20, 30, 40, 52, 65],
    debuff: { typ: 'stat', stat: 'STR', werte: [5, 5, 4, 3, 3, 2] },
  },
  sprintschuhe: {
    basisName: 'Sprint-Schuhe',
    slot: 'schuhe',
    material: 'wolf',
    beschreibung: 'Perfekt für schnelle Bewegungen, wackelig bei schweren Lasten.',
    bonus: { typ: 'stat', stat: 'AGI' },
    werte: [12, 22, 32, 45, 58, 72],
    debuff: { typ: 'stat', stat: 'STR', werte: [4, 4, 3, 2, 2, 1] },
  },
  eisenhandschuhe: {
    basisName: 'Eisenhandschuhe',
    slot: 'waffe',
    material: 'basalt',
    beschreibung: 'Schwere Handschuhe aus Eisen.',
    bonus: { typ: 'xp', stat: 'STR' },
    werte: [5, 9, 14, 20, 27, 35],
  },
  laeuferschuhe: {
    basisName: 'Läuferschuhe',
    slot: 'schuhe',
    material: 'wolf',
    beschreibung: 'Federleicht und schnell.',
    bonus: { typ: 'xp', stat: 'AGI' },
    werte: [6, 10, 15, 22, 30, 38],
  },
  silberkette: {
    basisName: 'Silberkette',
    slot: 'kette',
    material: 'knochen',
    beschreibung: 'Stärkt die Lebenskraft.',
    bonus: { typ: 'xp', stat: 'VIT' },
    werte: [6, 10, 15, 22, 30, 38],
  },
  kapuzenumhang: {
    basisName: 'Kapuzenumhang',
    slot: 'umhang',
    material: 'schatten',
    beschreibung: 'Umhang eines wahren Jägers.',
    bonus: { typ: 'xp' },
    werte: [5, 10, 14, 20, 26, 33],
  },
  monarchenring: {
    basisName: 'Monarchen-Ring',
    slot: 'ring',
    material: 'schatten',
    beschreibung: 'Das Zeichen eines Monarchen.',
    bonus: { typ: 'xp' },
    werte: [7, 12, 18, 25, 32, 40],
  },
  trainingsguertel: {
    basisName: 'Trainingsgürtel',
    slot: 'hose',
    material: 'wolf',
    beschreibung: 'Stabilisiert jede Bewegung.',
    bonus: { typ: 'xp' },
    werte: [4, 8, 12, 18, 24, 30],
  },
  jaegerhelm: {
    basisName: 'Jägerhelm',
    slot: 'helm',
    material: 'knochen',
    beschreibung: 'Schärft die Sinne.',
    bonus: { typ: 'xp' },
    werte: [5, 9, 13, 19, 25, 32],
  },
  frostpanzer: {
    basisName: 'Frostpanzer',
    slot: 'brust',
    material: 'basalt',
    beschreibung: 'Kalt, hart, unzerbrechlich.',
    bonus: { typ: 'xp' },
    werte: [6, 11, 16, 23, 30, 38],
  },
  daemonenklinge: {
    basisName: 'Dämonenklinge',
    slot: 'waffe',
    material: 'schatten',
    beschreibung: 'Flüstert im Dunkeln.',
    bonus: { typ: 'xp' },
    werte: [7, 12, 18, 26, 34, 42],
  },
  monarchenkrone: {
    basisName: 'Monarchenkrone',
    slot: 'helm',
    material: 'knochen',
    beschreibung: 'Die Krone des Herrschers.',
    bonus: { typ: 'xp' },
    werte: [8, 14, 20, 30, 39, 48],
  },
  holzschwert: {
    basisName: 'Holzschwert',
    slot: 'waffe',
    material: 'basalt',
    beschreibung: 'Ein einfaches Übungsschwert für angehende Jäger.',
    bonus: { typ: 'xp', stat: 'STR' },
    werte: [5, 8, 12, 17, 22, 28],
  },
}

// Item-ID einer Variante: "<vorlage>__r<rarität>"
export function variantId(vorlage, rar) {
  return `${vorlage}__r${rar}`
}

function baueItems() {
  const items = {}
  for (const [key, v] of Object.entries(VORLAGEN)) {
    for (let rar = 0; rar <= MAX_RARITAET; rar++) {
      const id = variantId(key, rar)
      items[id] = {
        id,
        vorlage: key,
        basisName: v.basisName,
        name: v.basisName,
        slot: v.slot,
        material: v.material,
        rar,
        beschreibung: v.beschreibung,
        bonus: { ...v.bonus, wert: v.werte[rar] },
        debuff: v.debuff
          ? { typ: v.debuff.typ, stat: v.debuff.stat, wert: v.debuff.werte[rar] }
          : null,
      }
    }
  }
  items.serienschutz = {
    id: 'serienschutz',
    vorlage: 'serienschutz',
    basisName: 'Serienschutz-Stein',
    name: 'Serienschutz-Stein',
    slot: null,
    material: 'basalt',
    rar: null,
    verbrauchbar: true,
    beschreibung:
      'Rettet die Tagesserie bei einem Fehltag. Wird automatisch verbraucht.',
    bonus: null,
    debuff: null,
  }
  return items
}

export const ITEMS = baueItems()

// ---------------------------------------------------------------------------
// Migration alter Spielstände: "__grau" … "__gold" → "__r0" … "__r3"
// ---------------------------------------------------------------------------
const ALTE_STUFEN = { grau: 0, blau: 1, violett: 2, gold: 3 }

export function migriereItemId(id) {
  if (!id || typeof id !== 'string') return id
  if (ITEMS[id]) return id
  const treffer = id.match(/^(.+)__(grau|blau|violett|gold)$/)
  if (treffer) {
    const neu = variantId(treffer[1], ALTE_STUFEN[treffer[2]])
    return ITEMS[neu] ? neu : id
  }
  // Ganz alte IDs ohne Stufe (z. B. "holzschwert")
  const basis = variantId(id, 0)
  return ITEMS[basis] ? basis : id
}

// ---------------------------------------------------------------------------
export function hochgestuft(itemId) {
  const item = ITEMS[itemId]
  if (!item || item.rar == null || item.rar >= MAX_RARITAET) return null
  return variantId(item.vorlage, item.rar + 1)
}

export function herabgestuft(itemId) {
  const item = ITEMS[itemId]
  if (!item || item.rar == null || item.rar <= 0) return null
  return variantId(item.vorlage, item.rar - 1)
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

export function bonusText(item) {
  if (!item?.bonus) return null
  const { typ, stat, wert } = item.bonus
  if (typ === 'xp') return `+${wert}% ${stat ? `${stat}-` : ''}XP`
  return `+${wert} ${stat}`
}

export function debuffText(item) {
  if (!item?.debuff) return null
  const { typ, stat, wert } = item.debuff
  if (typ === 'xp') return `−${wert}% ${stat ? `${stat}-` : ''}XP`
  return `−${wert} ${stat}`
}

export function raritaet(item) {
  return item?.rar != null ? RARITAETEN[item.rar] : null
}
