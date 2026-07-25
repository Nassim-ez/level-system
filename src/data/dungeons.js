// ---------------------------------------------------------------------------
// Wochenend-Dungeon (bestehendes System, wird von Quests.jsx genutzt)
// ---------------------------------------------------------------------------
export const DUNGEON_XP = 200

export const DUNGEONS = {
  E: { name: 'Eisenhöhle', gegner: 'Steingolem', hp: 300, drop: 'serienschutz' },
  D: { name: 'Nebelwald', gegner: 'Schattenwolf', hp: 500, drop: 'trainingsguertel' },
  C: { name: 'Verlassene Mine', gegner: 'Golemfürst', hp: 800, drop: 'jaegerhelm' },
  B: { name: 'Frostgipfel', gegner: 'Eisriese', hp: 1200, drop: 'frostpanzer' },
  A: { name: 'Dämonenturm', gegner: 'Wächter', hp: 1800, drop: 'daemonenklinge' },
  S: { name: 'Thronsaal', gegner: 'Monarch der Leere', hp: 2500, drop: 'monarchenkrone' },
}

// Schaden pro +5-Klick je Übung (Klimmzüge zählen 5-fach)
export const DUNGEON_EXERCISES = [
  { quest: 'liegestuetze', reps: 5, dmg: 5 },
  { quest: 'kniebeugen', reps: 5, dmg: 5 },
  { quest: 'crunches', reps: 5, dmg: 5 },
  { quest: 'klimmzuege', reps: 5, dmg: 25 },
]

// ---------------------------------------------------------------------------
// Tür-Dungeons (neues System)
// HINWEIS: Die Kampfwerte unten sind vorläufig und am bestehenden E-Rang-
// Balancing orientiert – sie stammen NICHT aus dungeon-mockup.html, da die
// Datei nicht auffindbar war. Alle Werte stehen bewusst nur hier, damit sie
// sich gegen die Mockup-Werte austauschen lassen, ohne die UI anzufassen.
// ---------------------------------------------------------------------------

export const GEFAHRSTUFEN = {
  niedrig: { name: 'Niedrig', color: 'var(--ok)' },
  mittel: { name: 'Mittel', color: 'var(--xp)' },
  hoch: { name: 'Hoch', color: 'var(--danger)' },
}

export const DUNGEON_RUNS = [
  {
    id: 'eisenhoehle',
    rank: 'E',
    name: 'Eisenhöhle',
    boss: 'Basaltkoloss',
    gefahr: 'niedrig',
    beschreibung: 'Enge Stollen voller Steinkreaturen. Ein guter Anfang.',
    tueren: [
      {
        nr: 1,
        name: 'Geröllgang',
        gegnerart: 'Kiesling',
        anzahl: 2,
        hp: 25,
        schaden: 4,
        intervall: 6,
        blockchance: 0.05,
        schwaechen: ['liegestuetze'],
        resistenzen: [],
        angriffsname: 'Steinwurf',
      },
      {
        nr: 2,
        name: 'Tropfsteinkammer',
        gegnerart: 'Kalkwächter',
        anzahl: 3,
        hp: 25,
        schaden: 5,
        intervall: 6,
        blockchance: 0.1,
        schwaechen: ['kniebeugen'],
        resistenzen: ['crunches'],
        angriffsname: 'Kalkschlag',
      },
      {
        nr: 3,
        name: 'Erzader',
        gegnerart: 'Eisenbeißer',
        anzahl: 2,
        hp: 40,
        schaden: 7,
        intervall: 5,
        blockchance: 0.15,
        schwaechen: ['klimmzuege'],
        resistenzen: ['liegestuetze'],
        angriffsname: 'Erzhieb',
      },
      {
        nr: 4,
        name: 'Einsturzhalle',
        gegnerart: 'Geröllgolem',
        anzahl: 4,
        hp: 25,
        schaden: 6,
        intervall: 5,
        blockchance: 0.1,
        schwaechen: ['kniebeugen'],
        resistenzen: [],
        angriffsname: 'Felslawine',
        combo: true,
      },
      {
        nr: 5,
        name: 'Basaltthron',
        gegnerart: 'Basaltkoloss',
        anzahl: 1,
        hp: 150,
        schaden: 12,
        intervall: 4,
        blockchance: 0.2,
        schwaechen: ['klimmzuege'],
        resistenzen: ['crunches', 'liegestuetze'],
        angriffsname: 'Bergsturz',
        combo: true,
        boss: true,
      },
    ],
    drop: 'serienschutz',
  },
  {
    id: 'knochengruft',
    rank: 'E',
    name: 'Knochengruft',
    boss: 'Knochenvogt',
    gefahr: 'mittel',
    beschreibung: 'Alte Grabkammern. Die Toten liegen hier nicht still.',
    tueren: [
      {
        nr: 1,
        name: 'Gebeinflur',
        gegnerart: 'Klapperer',
        anzahl: 3,
        hp: 22,
        schaden: 5,
        intervall: 5,
        blockchance: 0.05,
        schwaechen: ['crunches'],
        resistenzen: [],
        angriffsname: 'Knochenkralle',
        ausweichrate: 0.1,
      },
      {
        nr: 2,
        name: 'Sargkammer',
        gegnerart: 'Grabwächter',
        anzahl: 2,
        hp: 45,
        schaden: 8,
        intervall: 6,
        blockchance: 0.2,
        schwaechen: ['liegestuetze'],
        resistenzen: ['crunches'],
        angriffsname: 'Sargdeckel-Stoß',
      },
      {
        nr: 3,
        name: 'Aschenbecken',
        gegnerart: 'Ascheschemen',
        anzahl: 4,
        hp: 28,
        schaden: 6,
        intervall: 4,
        blockchance: 0,
        schwaechen: ['kniebeugen'],
        resistenzen: ['liegestuetze'],
        angriffsname: 'Aschehauch',
        ausweichrate: 0.25,
      },
      {
        nr: 4,
        name: 'Reliquienhalle',
        gegnerart: 'Knochenritter',
        anzahl: 2,
        hp: 60,
        schaden: 10,
        intervall: 5,
        blockchance: 0.25,
        schwaechen: ['klimmzuege'],
        resistenzen: ['kniebeugen'],
        angriffsname: 'Rippenklinge',
        combo: true,
      },
      {
        nr: 5,
        name: 'Vogtkrypta',
        gegnerart: 'Knochenvogt',
        anzahl: 1,
        hp: 190,
        schaden: 14,
        intervall: 4,
        blockchance: 0.2,
        schwaechen: ['crunches'],
        resistenzen: ['liegestuetze', 'kniebeugen'],
        angriffsname: 'Totenurteil',
        ausweichrate: 0.15,
        combo: true,
        boss: true,
      },
    ],
    drop: 'trainingsguertel',
  },
  {
    id: 'nebelwald',
    rank: 'E',
    name: 'Nebelwald',
    boss: 'Rudelführer',
    gefahr: 'hoch',
    beschreibung: 'Dichter Nebel, schnelle Jäger. Sie greifen im Rudel an.',
    tueren: [
      {
        nr: 1,
        name: 'Nebelpfad',
        gegnerart: 'Schattenwelpe',
        anzahl: 4,
        hp: 22,
        schaden: 5,
        intervall: 4,
        blockchance: 0,
        schwaechen: ['kniebeugen'],
        resistenzen: [],
        angriffsname: 'Schnappbiss',
        ausweichrate: 0.3,
      },
      {
        nr: 2,
        name: 'Wurzelgrund',
        gegnerart: 'Dornranke',
        anzahl: 3,
        hp: 40,
        schaden: 7,
        intervall: 6,
        blockchance: 0.15,
        schwaechen: ['liegestuetze'],
        resistenzen: ['kniebeugen'],
        angriffsname: 'Dornenpeitsche',
      },
      {
        nr: 3,
        name: 'Lichtung der Jäger',
        gegnerart: 'Nebelpirscher',
        anzahl: 3,
        hp: 50,
        schaden: 9,
        intervall: 4,
        blockchance: 0.1,
        schwaechen: ['klimmzuege'],
        resistenzen: ['crunches'],
        angriffsname: 'Hinterhalt',
        ausweichrate: 0.35,
        combo: true,
      },
      {
        nr: 4,
        name: 'Kadaverhöhle',
        gegnerart: 'Alphawolf',
        anzahl: 2,
        hp: 75,
        schaden: 12,
        intervall: 5,
        blockchance: 0.2,
        schwaechen: ['crunches'],
        resistenzen: ['liegestuetze'],
        angriffsname: 'Kehlbiss',
        ausweichrate: 0.2,
        combo: true,
      },
      {
        nr: 5,
        name: 'Herz des Nebels',
        gegnerart: 'Rudelführer',
        anzahl: 1,
        hp: 230,
        schaden: 16,
        intervall: 3,
        blockchance: 0.25,
        schwaechen: ['klimmzuege'],
        resistenzen: ['kniebeugen', 'crunches'],
        angriffsname: 'Rudelruf',
        ausweichrate: 0.25,
        combo: true,
        boss: true,
      },
    ],
    drop: 'laeuferschuhe',
  },
]

export function dungeonsByRank(rank) {
  return DUNGEON_RUNS.filter((d) => d.rank === rank)
}

export function findDungeon(id) {
  return DUNGEON_RUNS.find((d) => d.id === id) ?? null
}

// Gesamt-HP einer Tür (Gegneranzahl × HP)
export function doorHp(tuer) {
  return tuer.anzahl * tuer.hp
}
