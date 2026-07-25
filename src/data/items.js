// ---------------------------------------------------------------------------
// Qualitätsstufen
// ---------------------------------------------------------------------------
export const STUFEN = ['grau', 'blau', 'violett', 'gold']

export const STUFEN_INFO = {
  grau: { name: 'Gewöhnlich', color: '#8fa3ba' },
  blau: { name: 'Selten', color: '#3fb6ff' },
  violett: { name: 'Episch', color: '#b06cff' },
  gold: { name: 'Legendär', color: '#ffc247' },
}

export function naechsteStufe(stufe) {
  return STUFEN[STUFEN.indexOf(stufe) + 1] ?? null
}

export function vorherigeStufe(stufe) {
  return STUFEN[Math.max(0, STUFEN.indexOf(stufe) - 1)]
}

// ---------------------------------------------------------------------------
// Materialien
// ---------------------------------------------------------------------------
export const MATERIALIEN = {
  eisenstaub: { id: 'eisenstaub', name: 'Eisenstaub', color: '#8fa3ba' },
  knochenmehl: { id: 'knochenmehl', name: 'Knochenmehl', color: '#d7ecff' },
  nebelessenz: { id: 'nebelessenz', name: 'Nebelessenz', color: '#b06cff' },
}

// ---------------------------------------------------------------------------
// Item-Vorlagen. Jede Stufe wird daraus als eigene Variante erzeugt,
// alle Varianten teilen sich den basisName.
// ---------------------------------------------------------------------------
const VORLAGEN = {
  ring_schnelligkeit: {
    basisName: 'Ring der Schnelligkeit',
    slot: 'ring',
    beschreibung: 'Der Ring treibt jede Bewegung an.',
    bonus: { typ: 'stat', stat: 'AGI' },
    werte: { grau: 15, blau: 30, violett: 40, gold: 50 },
  },
  leichtgewicht_armband: {
    basisName: 'Leichtgewicht-Armband',
    slot: 'kette',
    beschreibung: 'Extrem leicht – gut für Tempo, schlecht für rohe Kraft.',
    bonus: { typ: 'stat', stat: 'AGI' },
    werte: { grau: 10, blau: 20, violett: 30, gold: 40 },
    debuff: { typ: 'stat', stat: 'STR', werte: { grau: 5, blau: 5, violett: 4, gold: 3 } },
  },
  sprintschuhe: {
    basisName: 'Sprint-Schuhe',
    slot: 'schuhe',
    beschreibung: 'Perfekt für schnelle Bewegungen, wackelig bei schweren Lasten.',
    bonus: { typ: 'stat', stat: 'AGI' },
    werte: { grau: 12, blau: 22, violett: 32, gold: 45 },
    debuff: { typ: 'stat', stat: 'STR', werte: { grau: 4, blau: 4, violett: 3, gold: 2 } },
  },
  eisenhandschuhe: {
    basisName: 'Eisenhandschuhe',
    slot: 'waffe',
    beschreibung: 'Schwere Handschuhe aus Eisen.',
    bonus: { typ: 'xp', stat: 'STR' },
    werte: { grau: 5, blau: 9, violett: 14, gold: 20 },
  },
  laeuferschuhe: {
    basisName: 'Läuferschuhe',
    slot: 'schuhe',
    beschreibung: 'Federleicht und schnell.',
    bonus: { typ: 'xp', stat: 'AGI' },
    werte: { grau: 6, blau: 10, violett: 15, gold: 22 },
  },
  silberkette: {
    basisName: 'Silberkette',
    slot: 'kette',
    beschreibung: 'Stärkt die Lebenskraft.',
    bonus: { typ: 'xp', stat: 'VIT' },
    werte: { grau: 6, blau: 10, violett: 15, gold: 22 },
  },
  kapuzenumhang: {
    basisName: 'Kapuzenumhang',
    slot: 'umhang',
    beschreibung: 'Umhang eines wahren Jägers.',
    bonus: { typ: 'xp' },
    werte: { grau: 5, blau: 10, violett: 14, gold: 20 },
  },
  monarchenring: {
    basisName: 'Monarchen-Ring',
    slot: 'ring',
    beschreibung: 'Das Zeichen eines Monarchen.',
    bonus: { typ: 'xp' },
    werte: { grau: 7, blau: 12, violett: 18, gold: 25 },
  },
  trainingsguertel: {
    basisName: 'Trainingsgürtel',
    slot: 'hose',
    beschreibung: 'Stabilisiert jede Bewegung.',
    bonus: { typ: 'xp' },
    werte: { grau: 4, blau: 8, violett: 12, gold: 18 },
  },
  jaegerhelm: {
    basisName: 'Jägerhelm',
    slot: 'helm',
    beschreibung: 'Schärft die Sinne.',
    bonus: { typ: 'xp' },
    werte: { grau: 5, blau: 9, violett: 13, gold: 19 },
  },
  frostpanzer: {
    basisName: 'Frostpanzer',
    slot: 'brust',
    beschreibung: 'Kalt, hart, unzerbrechlich.',
    bonus: { typ: 'xp' },
    werte: { grau: 6, blau: 11, violett: 16, gold: 23 },
  },
  daemonenklinge: {
    basisName: 'Dämonenklinge',
    slot: 'waffe',
    beschreibung: 'Flüstert im Dunkeln.',
    bonus: { typ: 'xp' },
    werte: { grau: 7, blau: 12, violett: 18, gold: 26 },
  },
  monarchenkrone: {
    basisName: 'Monarchenkrone',
    slot: 'helm',
    beschreibung: 'Die Krone des Herrschers.',
    bonus: { typ: 'xp' },
    werte: { grau: 8, blau: 14, violett: 20, gold: 30 },
  },
  holzschwert: {
    basisName: 'Holzschwert',
    slot: 'waffe',
    beschreibung: 'Ein einfaches Übungsschwert für angehende Jäger.',
    bonus: { typ: 'xp', stat: 'STR' },
    werte: { grau: 5, blau: 8, violett: 12, gold: 17 },
  },
}

// Item-ID einer Variante: "<vorlage>__<stufe>"
export function variantId(vorlage, stufe) {
  return `${vorlage}__${stufe}`
}

function baueItems() {
  const items = {}
  for (const [key, v] of Object.entries(VORLAGEN)) {
    for (const stufe of STUFEN) {
      const id = variantId(key, stufe)
      items[id] = {
        id,
        vorlage: key,
        basisName: v.basisName,
        name: v.basisName,
        slot: v.slot,
        stufe,
        beschreibung: v.beschreibung,
        bonus: { ...v.bonus, wert: v.werte[stufe] },
        debuff: v.debuff
          ? { typ: v.debuff.typ, stat: v.debuff.stat, wert: v.debuff.werte[stufe] }
          : null,
      }
    }
  }
  // Verbrauchsgegenstand ohne Stufen
  items.serienschutz = {
    id: 'serienschutz',
    vorlage: 'serienschutz',
    basisName: 'Serienschutz-Stein',
    name: 'Serienschutz-Stein',
    slot: null,
    stufe: null,
    verbrauchbar: true,
    beschreibung:
      'Rettet die Tagesserie bei einem Fehltag. Wird automatisch verbraucht.',
    bonus: null,
    debuff: null,
  }
  return items
}

export const ITEMS = baueItems()

// Alle Varianten eines Basis-Items
export function variantenVon(vorlage) {
  return STUFEN.map((s) => ITEMS[variantId(vorlage, s)]).filter(Boolean)
}

// Item eine Stufe hoch bzw. runter – gibt die neue Item-ID zurück
export function hochgestuft(itemId) {
  const item = ITEMS[itemId]
  if (!item?.stufe) return null
  const naechste = naechsteStufe(item.stufe)
  return naechste ? variantId(item.vorlage, naechste) : null
}

export function herabgestuft(itemId) {
  const item = ITEMS[itemId]
  if (!item?.stufe) return null
  const vorher = vorherigeStufe(item.stufe)
  return vorher === item.stufe ? null : variantId(item.vorlage, vorher)
}

// ---------------------------------------------------------------------------
// Händler-Kosten – steigen mit der Zielstufe
// ---------------------------------------------------------------------------
export const AUFWERTUNG_KOSTEN = {
  blau: { eisenstaub: 3 },
  violett: { eisenstaub: 6, knochenmehl: 2 },
  gold: { eisenstaub: 10, knochenmehl: 5, nebelessenz: 2 },
}

export function aufwertungKosten(zielStufe) {
  return AUFWERTUNG_KOSTEN[zielStufe] ?? null
}

// Wiederherstellung kostet die Hälfte
export function reparaturKosten(zielStufe) {
  const voll = AUFWERTUNG_KOSTEN[zielStufe]
  if (!voll) return null
  const halb = {}
  for (const [mat, menge] of Object.entries(voll)) {
    halb[mat] = Math.max(1, Math.ceil(menge / 2))
  }
  return halb
}

export function kostenErfuellt(kosten, materials) {
  if (!kosten) return false
  return Object.entries(kosten).every(
    ([mat, menge]) => (materials?.[mat] ?? 0) >= menge,
  )
}

export function fehlendeMaterialien(kosten, materials) {
  if (!kosten) return {}
  const fehlt = {}
  for (const [mat, menge] of Object.entries(kosten)) {
    const da = materials?.[mat] ?? 0
    if (da < menge) fehlt[mat] = menge - da
  }
  return fehlt
}

// ---------------------------------------------------------------------------
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
