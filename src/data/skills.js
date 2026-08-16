// ---------------------------------------------------------------------------
// Skill-Upgrades – dauerhafte Verbesserungen im Kampf
//
// Sie fallen selten aus Boss-Kämpfen und wirken sofort. Es gibt keine
// Währung und keinen Baum: was fällt, ist verdient und bleibt. Jede Linie
// endet bei SKILL_MAX, damit sich der Kampf nicht ins Beliebige verschiebt.
//
// Zwei der drei Linien nutzen dieselben Effektschlüssel wie die Ausrüstung
// und fließen in dieselbe Summe – so wirken sie überall dort, wo auch die
// Item-Effekte greifen, ohne dass der Kampf sie gesondert kennen muss.
// ---------------------------------------------------------------------------

export const SKILL_MAX = 3

export const SKILLS = {
  block: {
    id: 'block',
    name: 'Blocken',
    beschreibung: 'Blockchance je Stufe +5 Prozentpunkte',
    effekt: 'block',
    pro: 5,
    einheit: 'Prozentpunkte Blockchance',
  },
  heilung: {
    id: 'heilung',
    name: 'Heilen',
    // Der Heilungsvorrat wird je Kampf gesetzt – dort schlägt die Stufe auf
    beschreibung: 'Eine zusätzliche Heilung je Kampf und Stufe',
    effekt: null, // wird beim Kampfstart auf die Heilungen addiert
    pro: 1,
    einheit: 'Heilung je Kampf',
  },
  erholung: {
    id: 'erholung',
    name: 'Erholung',
    beschreibung: 'Belastung je Aktion um 10 Prozent gesenkt, je Stufe',
    effekt: 'load',
    pro: -10,
    einheit: 'Prozent Belastung',
  },
}

export const SKILL_LISTE = Object.values(SKILLS)

export const LEERE_SKILLS = { block: 0, heilung: 0, erholung: 0 }

/** Erreichte Stufe einer Linie, nie über der Obergrenze */
export function skillStufe(skills, id) {
  return Math.max(0, Math.min(SKILL_MAX, skills?.[id] ?? 0))
}

/** Linien, die noch nicht ausgereizt sind – daraus zieht die Beute */
export function offeneSkills(skills) {
  return SKILL_LISTE.filter((s) => skillStufe(skills, s.id) < SKILL_MAX)
}

export function alleSkillsVoll(skills) {
  return offeneSkills(skills).length === 0
}

/**
 * Effekte der Skills in derselben Schreibweise wie die Item-Effekte.
 * Heilen taucht hier nicht auf, weil es keine Prozentgröße ist, sondern
 * die Zahl der Heilungen zu Kampfbeginn erhöht.
 */
export function skillEffekte(skills) {
  const summe = {}
  for (const skill of SKILL_LISTE) {
    if (!skill.effekt) continue
    const stufe = skillStufe(skills, skill.id)
    if (stufe === 0) continue
    summe[skill.effekt] = (summe[skill.effekt] ?? 0) + skill.pro * stufe
  }
  return summe
}

/** Zusätzliche Heilungen je Dungeon */
export function extraHeilungen(skills) {
  return skillStufe(skills, 'heilung') * SKILLS.heilung.pro
}

/** Angezeigter Gesamtwert einer Linie, z. B. „+10 Prozentpunkte Blockchance" */
export function skillWert(skills, id) {
  const skill = SKILLS[id]
  if (!skill) return 0
  return skill.pro * skillStufe(skills, id)
}
