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
