// Die Klasse ergibt sich aus dem gewählten Trainingssystem und wird nur
// noch angezeigt. Den XP-Aufschlag trägt das System, nicht die Klasse.
export const CLASSES = {
  krieger: {
    id: 'krieger',
    name: 'Krieger',
    beschreibung: 'Sucht das Gewicht, nicht die Wiederholung.',
  },
  assassine: {
    id: 'assassine',
    name: 'Assassine',
    beschreibung: 'Beherrscht den eigenen Körper in jeder Lage.',
  },
  monarch: {
    id: 'monarch',
    name: 'Monarch',
    beschreibung: 'Nimmt sich von jedem Weg das Beste.',
  },
  heiler: {
    id: 'heiler',
    name: 'Heiler',
    beschreibung: 'Hält beweglich, was andere steif werden lassen.',
  },
  laeufer: {
    id: 'laeufer',
    name: 'Läufer',
    beschreibung: 'Hört erst auf, wenn die Luft ausgeht.',
  },
  // Ausgelaufene Klassen der früheren Wahl – bleiben für alte Spielstände
  tank: {
    id: 'tank',
    name: 'Tank',
    beschreibung: 'Steht, wo andere weichen.',
    veraltet: true,
  },
  gelehrter: {
    id: 'gelehrter',
    name: 'Gelehrter',
    beschreibung: 'Plant, bevor er zuschlägt.',
    veraltet: true,
  },
}
