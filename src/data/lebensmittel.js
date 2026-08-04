// ---------------------------------------------------------------------------
// Lebensmittel für das Eiweiß-Tracking
//
// protein: Gramm Eiweiß je 100 g des Lebensmittels im angegebenen Zustand.
//   Die Werte sind Durchschnittswerte in der Größenordnung des
//   Bundeslebensmittelschlüssels; Marke und Zubereitung verschieben sie um
//   ein bis zwei Gramm. Für die Bedarfsdeckung reicht diese Genauigkeit.
// portionName / portionGramm: eine haushaltsübliche Portion, damit man
//   nicht wiegen muss.
//
// Bewusst nicht enthalten: Kalorien, Fett, Kohlenhydrate und jede Einteilung
// in gute oder schlechte Lebensmittel. Hier zählt nur das Eiweiß.
// ---------------------------------------------------------------------------

export const KATEGORIEN = {
  fleisch: 'Fleisch',
  fisch: 'Fisch',
  milch_ei: 'Milch & Ei',
  huelsenfruechte: 'Hülsenfrüchte & Soja',
  getreide: 'Getreide',
  nuesse: 'Nüsse & Kerne',
  pulver: 'Pulver & Riegel',
  gemuese: 'Gemüse',
}

export const LEBENSMITTEL = [
  // ---------------- Fleisch ----------------
  { id: 'haehnchenbrust', name: 'Hähnchenbrust', kategorie: 'fleisch', protein: 23, portionName: 'Filet', portionGramm: 150 },
  { id: 'putenbrust', name: 'Putenbrust', kategorie: 'fleisch', protein: 24, portionName: 'Filet', portionGramm: 150 },
  { id: 'rinderhack', name: 'Rinderhack, mager', kategorie: 'fleisch', protein: 21, portionName: 'Portion', portionGramm: 125 },
  { id: 'schweinefilet', name: 'Schweinefilet', kategorie: 'fleisch', protein: 22, portionName: 'Portion', portionGramm: 150 },
  { id: 'putenaufschnitt', name: 'Putenaufschnitt', kategorie: 'fleisch', protein: 20, portionName: 'Scheibe', portionGramm: 15 },

  // ---------------- Fisch ----------------
  { id: 'lachs', name: 'Lachs', kategorie: 'fisch', protein: 20, portionName: 'Filet', portionGramm: 125 },
  { id: 'thunfisch', name: 'Thunfisch, im eigenen Saft', kategorie: 'fisch', protein: 24, portionName: 'Dose (abgetropft)', portionGramm: 110 },
  { id: 'kabeljau', name: 'Kabeljau', kategorie: 'fisch', protein: 18, portionName: 'Filet', portionGramm: 150 },
  { id: 'garnelen', name: 'Garnelen', kategorie: 'fisch', protein: 20, portionName: 'Portion', portionGramm: 100 },
  { id: 'hering', name: 'Hering', kategorie: 'fisch', protein: 18, portionName: 'Filet', portionGramm: 100 },

  // ---------------- Milch & Ei ----------------
  { id: 'magerquark', name: 'Magerquark', kategorie: 'milch_ei', protein: 12, portionName: 'Becher', portionGramm: 250 },
  { id: 'skyr', name: 'Skyr', kategorie: 'milch_ei', protein: 11, portionName: 'Becher', portionGramm: 150 },
  { id: 'huettenkaese', name: 'Hüttenkäse', kategorie: 'milch_ei', protein: 13, portionName: 'Becher', portionGramm: 200 },
  { id: 'griech_joghurt', name: 'Griechischer Joghurt', kategorie: 'milch_ei', protein: 9, portionName: 'Becher', portionGramm: 150 },
  { id: 'ei', name: 'Hühnerei', kategorie: 'milch_ei', protein: 13, portionName: 'Ei (Gr. M)', portionGramm: 58 },
  { id: 'milch', name: 'Milch, 1,5 %', kategorie: 'milch_ei', protein: 3.4, portionName: 'Glas', portionGramm: 200 },
  { id: 'gouda', name: 'Gouda', kategorie: 'milch_ei', protein: 25, portionName: 'Scheibe', portionGramm: 30 },
  { id: 'mozzarella', name: 'Mozzarella', kategorie: 'milch_ei', protein: 18, portionName: 'Kugel', portionGramm: 125 },
  { id: 'harzer', name: 'Harzer Käse', kategorie: 'milch_ei', protein: 30, portionName: 'Rolle', portionGramm: 125 },
  { id: 'parmesan', name: 'Parmesan', kategorie: 'milch_ei', protein: 35, portionName: 'Esslöffel gerieben', portionGramm: 10 },

  // ---------------- Hülsenfrüchte & Soja ----------------
  { id: 'linsen_gekocht', name: 'Linsen, gekocht', kategorie: 'huelsenfruechte', protein: 9, portionName: 'Portion', portionGramm: 200 },
  { id: 'kichererbsen', name: 'Kichererbsen, gekocht', kategorie: 'huelsenfruechte', protein: 9, portionName: 'Portion', portionGramm: 200 },
  { id: 'kidneybohnen', name: 'Kidneybohnen, gekocht', kategorie: 'huelsenfruechte', protein: 8, portionName: 'Portion', portionGramm: 200 },
  { id: 'tofu', name: 'Tofu, natur', kategorie: 'huelsenfruechte', protein: 12, portionName: 'Block', portionGramm: 200 },
  { id: 'tempeh', name: 'Tempeh', kategorie: 'huelsenfruechte', protein: 19, portionName: 'Portion', portionGramm: 100 },
  { id: 'sojaschnetzel', name: 'Sojaschnetzel, trocken', kategorie: 'huelsenfruechte', protein: 50, portionName: 'Portion (trocken)', portionGramm: 30 },
  { id: 'edamame', name: 'Edamame', kategorie: 'huelsenfruechte', protein: 11, portionName: 'Portion', portionGramm: 100 },
  { id: 'erbsen', name: 'Erbsen', kategorie: 'huelsenfruechte', protein: 5, portionName: 'Portion', portionGramm: 150 },

  // ---------------- Getreide ----------------
  { id: 'haferflocken', name: 'Haferflocken', kategorie: 'getreide', protein: 13, portionName: 'Portion', portionGramm: 60 },
  { id: 'vollkornbrot', name: 'Vollkornbrot', kategorie: 'getreide', protein: 8, portionName: 'Scheibe', portionGramm: 50 },
  { id: 'vollkornnudeln', name: 'Vollkornnudeln, gekocht', kategorie: 'getreide', protein: 6, portionName: 'Portion', portionGramm: 200 },
  { id: 'reis_gekocht', name: 'Reis, gekocht', kategorie: 'getreide', protein: 2.7, portionName: 'Portion', portionGramm: 200 },
  { id: 'quinoa', name: 'Quinoa, gekocht', kategorie: 'getreide', protein: 4.4, portionName: 'Portion', portionGramm: 180 },
  { id: 'dinkelbrot', name: 'Dinkelbrot', kategorie: 'getreide', protein: 7, portionName: 'Scheibe', portionGramm: 50 },

  // ---------------- Nüsse & Kerne ----------------
  { id: 'erdnussmus', name: 'Erdnussmus', kategorie: 'nuesse', protein: 25, portionName: 'Esslöffel', portionGramm: 20 },
  { id: 'mandeln', name: 'Mandeln', kategorie: 'nuesse', protein: 21, portionName: 'Handvoll', portionGramm: 30 },
  { id: 'walnuesse', name: 'Walnüsse', kategorie: 'nuesse', protein: 15, portionName: 'Handvoll', portionGramm: 30 },
  { id: 'kuerbiskerne', name: 'Kürbiskerne', kategorie: 'nuesse', protein: 24, portionName: 'Handvoll', portionGramm: 30 },
  { id: 'leinsamen', name: 'Leinsamen, geschrotet', kategorie: 'nuesse', protein: 18, portionName: 'Esslöffel', portionGramm: 15 },

  // ---------------- Pulver & Riegel ----------------
  { id: 'whey', name: 'Whey-Proteinpulver', kategorie: 'pulver', protein: 78, portionName: 'Messlöffel', portionGramm: 30 },
  { id: 'sojaprotein', name: 'Sojaprotein-Pulver', kategorie: 'pulver', protein: 80, portionName: 'Messlöffel', portionGramm: 30 },
  { id: 'proteinriegel', name: 'Proteinriegel', kategorie: 'pulver', protein: 30, portionName: 'Riegel', portionGramm: 60 },
  { id: 'magermilchpulver', name: 'Magermilchpulver', kategorie: 'pulver', protein: 35, portionName: 'Esslöffel', portionGramm: 15 },

  // ---------------- Gemüse ----------------
  { id: 'brokkoli', name: 'Brokkoli', kategorie: 'gemuese', protein: 3.8, portionName: 'Portion', portionGramm: 200 },
  { id: 'spinat', name: 'Spinat', kategorie: 'gemuese', protein: 2.9, portionName: 'Portion', portionGramm: 200 },
  { id: 'champignons', name: 'Champignons', kategorie: 'gemuese', protein: 3, portionName: 'Portion', portionGramm: 150 },
  { id: 'rosenkohl', name: 'Rosenkohl', kategorie: 'gemuese', protein: 4.5, portionName: 'Portion', portionGramm: 200 },
]

// Gramm Eiweiß je Kilogramm Körpergewicht und Tag
export const PROTEIN_JE_KG = 1.6

export function proteinBedarf(gewicht) {
  if (!gewicht || gewicht <= 0) return 0
  return Math.round(gewicht * PROTEIN_JE_KG)
}

/** Eiweiß einer Menge in Gramm */
export function proteinFuer(lebensmittel, gramm) {
  if (!lebensmittel) return 0
  return Math.round((lebensmittel.protein * (gramm || 0)) / 100)
}

export function findeLebensmittel(id) {
  return LEBENSMITTEL.find((l) => l.id === id) ?? null
}

export const HINWEIS_TEXT =
  'Wer Kraft aufbaut, fährt mit etwa 1,6 Gramm Eiweiß je Kilogramm Körpergewicht am Tag gut. Mehr davon bringt für den Muskelaufbau nichts Zusätzliches – oberhalb dieser Menge ließ sich in den Studien kein weiterer Zuwachs mehr zeigen. Wichtiger als die genaue Zahl ist, dass überhaupt regelmäßig Eiweiß dabei ist und sich die Menge grob über den Tag verteilt. Die Werte hier sind Durchschnittswerte; je nach Marke und Zubereitung weichen sie um ein bis zwei Gramm ab.'

export const BELEG =
  'Morton et al. (2018), British Journal of Sports Medicine 52(6):376–384 – Systematische Übersicht mit Metaanalyse über 49 Studien: Eiweißzufuhr steigert Kraft und Muskelmasse beim Krafttraining, ein zusätzlicher Nutzen oberhalb von etwa 1,6 g/kg Körpergewicht am Tag ließ sich nicht nachweisen.'
