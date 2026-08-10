// SYSTEM – Lebensmittel-Datenbank (Protein)
//
// protein: Gramm Eiweiß je 100 g bzw. je 100 ml
// portion: übliche Portionsgröße in Gramm, damit man nicht wiegen muss
// portionName: wie die Portion heißt ("1 Ei", "1 Scheibe", "1 Becher")
//
// Die Werte sind gerundete Durchschnittswerte handelsüblicher Produkte und
// dienen der Orientierung. Bei verpackten Lebensmitteln steht der genaue Wert
// auf der Nährwerttabelle und geht immer vor.
//
// Grundlage der Bedarfsberechnung:
// Für Muskelaufbau gelten etwa 1,6 g Eiweiß je Kilogramm Körpergewicht pro Tag
// als sinnvoller Richtwert; darüber hinaus ist kein zusätzlicher Nutzen belegt.
// Beleg: Morton et al. (2018), British Journal of Sports Medicine 52(6):376–384 –
// systematische Übersicht mit Metaanalyse über 49 Studien.

export const PROTEIN_PRO_KG = 1.6;

export const KATEGORIEN = {
  fleisch: 'Fleisch und Fisch',
  milch: 'Milchprodukte und Eier',
  pflanzlich: 'Hülsenfrüchte und Pflanzliches',
  getreide: 'Getreide und Beilagen',
  snack: 'Snacks und Sonstiges',
  pulver: 'Pulver und Riegel',
};

export const LEBENSMITTEL = [
  // ---------- FLEISCH UND FISCH ----------
  { id: 'haehnchenbrust', name: 'Hähnchenbrust', kategorie: 'fleisch', protein: 23, portion: 150, portionName: '1 Filet' },
  { id: 'putenbrust', name: 'Putenbrust', kategorie: 'fleisch', protein: 24, portion: 150, portionName: '1 Filet' },
  { id: 'rindfleisch', name: 'Rindfleisch mager', kategorie: 'fleisch', protein: 21, portion: 150, portionName: '1 Portion' },
  { id: 'hackfleisch_gemischt', name: 'Hackfleisch gemischt', kategorie: 'fleisch', protein: 18, portion: 150, portionName: '1 Portion' },
  { id: 'schweineschnitzel', name: 'Schweineschnitzel', kategorie: 'fleisch', protein: 22, portion: 150, portionName: '1 Schnitzel' },
  { id: 'lachs', name: 'Lachs', kategorie: 'fleisch', protein: 20, portion: 150, portionName: '1 Filet' },
  { id: 'thunfisch_dose', name: 'Thunfisch in Wasser', kategorie: 'fleisch', protein: 24, portion: 150, portionName: '1 Dose abgetropft' },
  { id: 'forelle', name: 'Forelle', kategorie: 'fleisch', protein: 20, portion: 150, portionName: '1 Filet' },
  { id: 'garnelen', name: 'Garnelen', kategorie: 'fleisch', protein: 20, portion: 100, portionName: '1 Portion' },
  { id: 'haehnchenschenkel', name: 'Hähnchenschenkel', kategorie: 'fleisch', protein: 19, portion: 120, portionName: '1 Schenkel' },
  { id: 'kochschinken', name: 'Kochschinken', kategorie: 'fleisch', protein: 21, portion: 30, portionName: '1 Scheibe' },
  { id: 'salami', name: 'Salami', kategorie: 'fleisch', protein: 19, portion: 15, portionName: '1 Scheibe' },
  { id: 'doener', name: 'Döner mit Fleisch', kategorie: 'fleisch', protein: 11, portion: 400, portionName: '1 Döner' },

  // ---------- MILCHPRODUKTE UND EIER ----------
  { id: 'magerquark', name: 'Magerquark', kategorie: 'milch', protein: 12, portion: 250, portionName: '1 Becher' },
  { id: 'huettenkaese', name: 'Hüttenkäse', kategorie: 'milch', protein: 13, portion: 200, portionName: '1 Becher' },
  { id: 'skyr', name: 'Skyr', kategorie: 'milch', protein: 11, portion: 150, portionName: '1 Becher' },
  { id: 'griech_joghurt', name: 'Griechischer Joghurt', kategorie: 'milch', protein: 9, portion: 150, portionName: '1 Becher' },
  { id: 'naturjoghurt', name: 'Naturjoghurt', kategorie: 'milch', protein: 4, portion: 150, portionName: '1 Becher' },
  { id: 'ei', name: 'Ei', kategorie: 'milch', protein: 13, portion: 60, portionName: '1 Ei' },
  { id: 'eiweiss', name: 'Eiklar', kategorie: 'milch', protein: 11, portion: 33, portionName: '1 Eiweiß' },
  { id: 'milch', name: 'Milch', kategorie: 'milch', protein: 3.4, portion: 250, portionName: '1 Glas' },
  { id: 'gouda', name: 'Gouda', kategorie: 'milch', protein: 25, portion: 30, portionName: '1 Scheibe' },
  { id: 'harzer', name: 'Harzer Käse', kategorie: 'milch', protein: 30, portion: 125, portionName: '1 Packung' },
  { id: 'mozzarella', name: 'Mozzarella', kategorie: 'milch', protein: 18, portion: 125, portionName: '1 Kugel' },
  { id: 'frischkaese', name: 'Frischkäse', kategorie: 'milch', protein: 6, portion: 30, portionName: '1 Portion' },
  { id: 'parmesan', name: 'Parmesan', kategorie: 'milch', protein: 32, portion: 20, portionName: '2 EL gerieben' },

  // ---------- HÜLSENFRÜCHTE UND PFLANZLICHES ----------
  { id: 'linsen_gekocht', name: 'Linsen gekocht', kategorie: 'pflanzlich', protein: 9, portion: 200, portionName: '1 Portion' },
  { id: 'kichererbsen', name: 'Kichererbsen gekocht', kategorie: 'pflanzlich', protein: 8, portion: 200, portionName: '1 Portion' },
  { id: 'bohnen_kidney', name: 'Kidneybohnen', kategorie: 'pflanzlich', protein: 8, portion: 200, portionName: '1 Portion' },
  { id: 'erbsen', name: 'Erbsen', kategorie: 'pflanzlich', protein: 5, portion: 150, portionName: '1 Portion' },
  { id: 'tofu', name: 'Tofu natur', kategorie: 'pflanzlich', protein: 15, portion: 150, portionName: '1 Portion' },
  { id: 'tempeh', name: 'Tempeh', kategorie: 'pflanzlich', protein: 19, portion: 100, portionName: '1 Portion' },
  { id: 'sojajoghurt', name: 'Sojajoghurt', kategorie: 'pflanzlich', protein: 4, portion: 150, portionName: '1 Becher' },
  { id: 'sojamilch', name: 'Sojadrink', kategorie: 'pflanzlich', protein: 3.3, portion: 250, portionName: '1 Glas' },
  { id: 'erdnussbutter', name: 'Erdnussbutter', kategorie: 'pflanzlich', protein: 25, portion: 20, portionName: '1 EL' },
  { id: 'mandeln', name: 'Mandeln', kategorie: 'pflanzlich', protein: 21, portion: 30, portionName: '1 Handvoll' },
  { id: 'walnuesse', name: 'Walnüsse', kategorie: 'pflanzlich', protein: 15, portion: 30, portionName: '1 Handvoll' },
  { id: 'kuerbiskerne', name: 'Kürbiskerne', kategorie: 'pflanzlich', protein: 30, portion: 25, portionName: '1 Handvoll' },
  { id: 'edamame', name: 'Edamame', kategorie: 'pflanzlich', protein: 11, portion: 100, portionName: '1 Portion' },

  // ---------- GETREIDE UND BEILAGEN ----------
  { id: 'haferflocken', name: 'Haferflocken', kategorie: 'getreide', protein: 13, portion: 60, portionName: '1 Portion' },
  { id: 'vollkornbrot', name: 'Vollkornbrot', kategorie: 'getreide', protein: 8, portion: 50, portionName: '1 Scheibe' },
  { id: 'mischbrot', name: 'Mischbrot', kategorie: 'getreide', protein: 7, portion: 50, portionName: '1 Scheibe' },
  { id: 'broetchen', name: 'Brötchen', kategorie: 'getreide', protein: 8, portion: 60, portionName: '1 Brötchen' },
  { id: 'nudeln_gekocht', name: 'Nudeln gekocht', kategorie: 'getreide', protein: 5, portion: 250, portionName: '1 Portion' },
  { id: 'vollkornnudeln', name: 'Vollkornnudeln gekocht', kategorie: 'getreide', protein: 6, portion: 250, portionName: '1 Portion' },
  { id: 'reis_gekocht', name: 'Reis gekocht', kategorie: 'getreide', protein: 3, portion: 250, portionName: '1 Portion' },
  { id: 'kartoffeln', name: 'Kartoffeln gekocht', kategorie: 'getreide', protein: 2, portion: 250, portionName: '1 Portion' },
  { id: 'couscous', name: 'Couscous gekocht', kategorie: 'getreide', protein: 4, portion: 200, portionName: '1 Portion' },
  { id: 'quinoa', name: 'Quinoa gekocht', kategorie: 'getreide', protein: 4.4, portion: 200, portionName: '1 Portion' },
  { id: 'muesli', name: 'Müsli', kategorie: 'getreide', protein: 10, portion: 60, portionName: '1 Portion' },

  // ---------- SNACKS UND SONSTIGES ----------
  { id: 'banane', name: 'Banane', kategorie: 'snack', protein: 1.1, portion: 120, portionName: '1 Stück' },
  { id: 'apfel', name: 'Apfel', kategorie: 'snack', protein: 0.3, portion: 150, portionName: '1 Stück' },
  { id: 'brokkoli', name: 'Brokkoli', kategorie: 'snack', protein: 3, portion: 200, portionName: '1 Portion' },
  { id: 'spinat', name: 'Spinat', kategorie: 'snack', protein: 3, portion: 200, portionName: '1 Portion' },
  { id: 'mais', name: 'Mais', kategorie: 'snack', protein: 3, portion: 150, portionName: '1 Portion' },
  { id: 'pizza_salami', name: 'Pizza Salami', kategorie: 'snack', protein: 11, portion: 350, portionName: '1 Pizza' },
  { id: 'pommes', name: 'Pommes', kategorie: 'snack', protein: 3.5, portion: 200, portionName: '1 Portion' },
  { id: 'burger', name: 'Hamburger', kategorie: 'snack', protein: 14, portion: 200, portionName: '1 Burger' },

  // ---------- PULVER UND RIEGEL ----------
  { id: 'wheyprotein', name: 'Whey-Proteinpulver', kategorie: 'pulver', protein: 75, portion: 30, portionName: '1 Messlöffel' },
  { id: 'mehrkomponenten', name: 'Mehrkomponenten-Protein', kategorie: 'pulver', protein: 72, portion: 30, portionName: '1 Messlöffel' },
  { id: 'veganes_protein', name: 'Veganes Proteinpulver', kategorie: 'pulver', protein: 70, portion: 30, portionName: '1 Messlöffel' },
  { id: 'proteinriegel', name: 'Proteinriegel', kategorie: 'pulver', protein: 33, portion: 60, portionName: '1 Riegel' },
  { id: 'proteinpudding', name: 'Proteinpudding', kategorie: 'pulver', protein: 8, portion: 200, portionName: '1 Becher' },
  { id: 'proteinshake_fertig', name: 'Fertiger Proteinshake', kategorie: 'pulver', protein: 8, portion: 330, portionName: '1 Flasche' },
];

// Bedarf: Gramm Protein pro Tag, gerundet auf 5
export function proteinBedarf(gewichtKg) {
  if (!gewichtKg || gewichtKg <= 0) return null;
  return Math.round((gewichtKg * PROTEIN_PRO_KG) / 5) * 5;
}

// Protein einer Menge in Gramm
export function proteinVon(lebensmittel, mengeGramm) {
  return Math.round((lebensmittel.protein * mengeGramm) / 100 * 10) / 10;
}

export const HINWEIS_TEXT =
  'Der Richtwert von 1,6 g Eiweiß je Kilogramm Körpergewicht gilt für Menschen, ' +
  'die regelmäßig Krafttraining machen. Deutlich mehr bringt nach derzeitigem ' +
  'Kenntnisstand keinen zusätzlichen Muskelaufbau. Die Werte in der Liste sind ' +
  'Durchschnittswerte zur Orientierung; die Angabe auf der Verpackung ist genauer.';

export const BELEG =
  'Morton et al. (2018), British Journal of Sports Medicine 52(6):376–384 – ' +
  'systematische Übersicht mit Metaanalyse über 49 Studien zum Zusammenhang ' +
  'von Eiweißzufuhr und Muskelaufbau bei Krafttraining.';
