export const ITEMS = {
  holzschwert: {
    id: 'holzschwert',
    name: 'Holzschwert',
    slot: 'waffe',
    bonus: { typ: 'xp', stat: 'STR', wert: 5 },
    beschreibung: 'Ein einfaches Übungsschwert für angehende Jäger.',
  },
  eisenhandschuhe: {
    id: 'eisenhandschuhe',
    name: 'Eisenhandschuhe',
    slot: 'waffe',
    bonus: { typ: 'xp', stat: 'STR', wert: 5 },
    beschreibung: 'Belohnung der Prüfung E → D. Schwere Handschuhe aus Eisen.',
  },
  laeuferschuhe: {
    id: 'laeuferschuhe',
    name: 'Läuferschuhe',
    slot: 'schuhe',
    bonus: { typ: 'xp', stat: 'AGI', wert: 10 },
    beschreibung: 'Belohnung der Prüfung D → C. Federleicht und schnell.',
  },
  silberkette: {
    id: 'silberkette',
    name: 'Silberkette',
    slot: 'kette',
    bonus: { typ: 'xp', stat: 'VIT', wert: 10 },
    beschreibung: 'Belohnung der Prüfung C → B. Stärkt die Lebenskraft.',
  },
  kapuzenumhang: {
    id: 'kapuzenumhang',
    name: 'Kapuzenumhang',
    slot: 'umhang',
    bonus: { typ: 'xp', wert: 10 },
    beschreibung: 'Belohnung der Prüfung B → A. Umhang eines wahren Jägers.',
  },
  monarchenring: {
    id: 'monarchenring',
    name: 'Monarchen-Ring',
    slot: 'ring',
    bonus: { typ: 'xp', wert: 15 },
    beschreibung: 'Belohnung der Prüfung A → S. Das Zeichen eines Monarchen.',
  },
  trainingsguertel: {
    id: 'trainingsguertel',
    name: 'Trainingsgürtel',
    slot: 'hose',
    bonus: { typ: 'xp', wert: 5 },
    beschreibung: 'Drop aus dem Nebelwald. Stabilisiert jede Bewegung.',
  },
  jaegerhelm: {
    id: 'jaegerhelm',
    name: 'Jägerhelm',
    slot: 'helm',
    bonus: { typ: 'xp', wert: 8 },
    beschreibung: 'Drop aus der Verlassenen Mine. Schärft die Sinne.',
  },
  frostpanzer: {
    id: 'frostpanzer',
    name: 'Frostpanzer',
    slot: 'brust',
    bonus: { typ: 'xp', wert: 10 },
    beschreibung: 'Drop vom Frostgipfel. Kalt, hart, unzerbrechlich.',
  },
  daemonenklinge: {
    id: 'daemonenklinge',
    name: 'Dämonenklinge',
    slot: 'waffe',
    bonus: { typ: 'xp', wert: 12 },
    beschreibung: 'Drop aus dem Dämonenturm. Flüstert im Dunkeln.',
  },
  monarchenkrone: {
    id: 'monarchenkrone',
    name: 'Monarchenkrone',
    slot: 'helm',
    bonus: { typ: 'xp', wert: 15 },
    beschreibung: 'Drop aus dem Thronsaal. Die Krone des Herrschers.',
  },
  serienschutz: {
    id: 'serienschutz',
    name: 'Serienschutz-Stein',
    slot: null,
    verbrauchbar: true,
    bonus: null,
    beschreibung:
      'Rettet die Tagesserie bei einem Fehltag. Wird automatisch verbraucht.',
  },
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
