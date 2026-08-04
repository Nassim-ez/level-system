import { UEBUNGEN, KATEGORIE_NAMEN } from './uebungen.js'
import { RANKS } from './ranks.js'
import { systemOder, tagesplan, tagestyp } from './trainingssysteme.js'

// Jede Trainings-Quest zeigt auf eine Übung der Datenbank. Wie sie heißt,
// entscheidet die Variante – die hängt am Rang oder an der eigenen Wahl.
// Welche Quests an einem Tag anstehen, bestimmt das Trainingssystem.
export const QUEST_XP = 60
// Eiweißbedarf gedeckt – eine Zugabe, kein Pflichtteil
export const PROTEIN_XP = 50

// Kategorie → Attribut, auf das die Übung einzahlt
export const KATEGORIE_STAT = {
  kraft: 'STR',
  core: 'VIT',
  ausdauer: 'VIT',
  tempo: 'AGI',
  mobility: 'AGI',
}

// Anzeigetext der Einheiten
export const EINHEIT_LABEL = { wdh: 'Wdh.', sek: 'Sek', min: 'Min.' }

// Sekundenziele laufen in Viertelminuten – der Knopf und die Rundung
export const SEKUNDEN_SCHRITT = 15
// Richtwert für die Umrechnung alter Wiederholungsziele
export const SEKUNDEN_JE_WDH = 2
// Startwert, wenn gar kein Vergleich möglich ist
export const SEKUNDEN_START = 60

/** Rundet Sekunden auf den nächsten sinnvollen Schritt, mindestens einen */
export function rundeSekunden(wert) {
  return Math.max(
    SEKUNDEN_SCHRITT,
    Math.round(wert / SEKUNDEN_SCHRITT) * SEKUNDEN_SCHRITT,
  )
}

function baueQuests() {
  const quests = {}
  for (const uebung of UEBUNGEN) {
    const einheit = uebung.einheit ?? 'wdh'
    quests[uebung.id] = {
      id: uebung.id,
      uebungId: uebung.id,
      kategorie: uebung.kategorie,
      einheit,
      unit: EINHEIT_LABEL[einheit] ?? 'Wdh.',
      stat: KATEGORIE_STAT[uebung.kategorie] ?? 'STR',
      xp: QUEST_XP,
    }
  }
  // Dehnen ist keine einzelne Übung, sondern der Ablauf durch alle
  // Mobility-Übungen
  quests.dehnen = {
    id: 'dehnen',
    ablauf: 'mobility',
    name: 'Mobility-Ablauf',
    kategorie: 'mobility',
    einheit: 'min',
    unit: 'Min.',
    stat: 'AGI',
    xp: QUEST_XP,
  }
  return quests
}

export const QUESTS = baueQuests()

// ---------------------------------------------------------------------------
// Varianten: welche Stufe der Leiter gilt gerade?
// ---------------------------------------------------------------------------

export function einheitVon(questId) {
  return QUESTS[questId]?.einheit ?? 'wdh'
}

export function uebungZuQuest(questId) {
  const uebungId = QUESTS[questId]?.uebungId
  return uebungId ? UEBUNGEN.find((u) => u.id === uebungId) : null
}

// ---------------------------------------------------------------------------
// Abläufe: eine Quest führt durch mehrere Übungen statt durch eine einzige
// ---------------------------------------------------------------------------

export const MOBILITY_ABLAUF = UEBUNGEN.filter((u) => u.kategorie === 'mobility')

export function ablaufZuQuest(questId) {
  return QUESTS[questId]?.ablauf === 'mobility' ? MOBILITY_ABLAUF : null
}

/**
 * Verteilt die Minuten gleichmäßig auf die Übungen. Der Rest wandert auf
 * die vorderen Schritte, damit die Summe genau aufgeht.
 */
export function verteileMinuten(gesamt, anzahl) {
  if (anzahl <= 0) return []
  const minuten = Math.max(anzahl, Math.round(gesamt || 0))
  const basis = Math.floor(minuten / anzahl)
  const rest = minuten - basis * anzahl
  return Array.from({ length: anzahl }, (_, i) => basis + (i < rest ? 1 : 0))
}

/** Ist diese Variante beim gegebenen Rang schon freigeschaltet? */
export function varianteOffen(variante, rank) {
  return RANKS.indexOf(variante.rang) <= RANKS.indexOf(rank)
}

/**
 * Automatischer Vorschlag: die schwerste Variante, deren Rang der Jäger
 * bereits erreicht hat. Die Leitern beginnen sämtlich bei E, es bleibt
 * also immer mindestens die erste übrig.
 */
export function vorgeschlagenerIndex(uebung, rank) {
  if (!uebung?.varianten?.length) return 0
  let treffer = 0
  uebung.varianten.forEach((v, i) => {
    if (varianteOffen(v, rank)) treffer = i
  })
  return treffer
}

/**
 * Tatsächlich geltende Variante. Eine eigene Wahl schlägt den Vorschlag,
 * gilt aber nur bis zum nächsten Rangwechsel – danach greift wieder die
 * Automatik.
 */
export function aktuelleVariante(questId, state) {
  const uebung = uebungZuQuest(questId)
  if (!uebung) return null
  const wahl = state?.varianten?.[questId]
  const index =
    wahl && wahl.rank === state.rank && uebung.varianten[wahl.index]
      ? wahl.index
      : vorgeschlagenerIndex(uebung, state?.rank ?? 'E')
  return { ...uebung.varianten[index], index, uebung }
}

// Der Tagesplan kommt aus dem Trainingssystem, siehe tagesplan().
// Bonus-Quests gibt es keine mehr – die Systeme bringen ihre eigenen
// Übungspaare mit, ein zusätzlicher Anhang würde sie nur verwässern.

// Startwerte der Tagesziele aus den Onboarding-Maximalwerten
export const TARGET_FACTOR = 1.5 // Muskelübungen: etwas über dem Maximum
export const RANK_UP_FACTOR = 1.15 // Steigerung pro Rang-Aufstieg

// Startziel, wenn eine Übung noch gar nicht gelingt
export const EINSTIEG_ZIEL = 5

export function targetsFromMaxima(maxima) {
  const ziel = (wert) =>
    wert > 0 ? Math.max(1, Math.ceil(wert * TARGET_FACTOR)) : EINSTIEG_ZIEL
  return {
    liegestuetze: ziel(maxima.liegestuetze),
    kniebeugen: ziel(maxima.kniebeugen),
    crunches: ziel(maxima.crunches),
    klimmzuege: ziel(maxima.klimmzuege),
    dehnen: Math.max(1, Math.round(maxima.dehnen || 0)),
  }
}

/**
 * Startvarianten aus der Einstufung. Wer eine Übung noch gar nicht schafft,
 * beginnt auf der untersten Sprosse – bei Klimmzügen also beim schrägen
 * Rudern statt an der Stange. Das ersetzt die frühere Sonderregel für
 * Negativ-Klimmzüge.
 */
export function startVarianten(maxima, rank, questIds = Object.keys(QUESTS)) {
  const wahl = {}
  for (const questId of questIds) {
    const uebung = uebungZuQuest(questId)
    if (!uebung) continue
    if ((maxima?.[questId] ?? 0) > 0) continue
    // Nur wenn der Vorschlag überhaupt höher läge, lohnt der Eintrag
    if (vorgeschlagenerIndex(uebung, rank) > 0) {
      wahl[questId] = { index: 0, rank }
    }
  }
  return wahl
}

export function raiseTargets(targets) {
  const raised = {}
  for (const [key, value] of Object.entries(targets)) {
    const angehoben = value * RANK_UP_FACTOR
    // Sekundenziele bleiben auf dem Viertelminuten-Raster. Ohne die
    // Untergrenze würde das Runden kleine Ziele auf der Stelle treten
    // lassen: 45 × 1,15 sind 51,75 und damit gerundet wieder 45.
    raised[key] =
      einheitVon(key) === 'sek'
        ? Math.max(rundeSekunden(angehoben), value + SEKUNDEN_SCHRITT)
        : Math.ceil(angehoben)
  }
  return raised
}

// Liefert die anzuzeigende Quest: Name aus der Variante, Ziel aus den
// persönlichen Tageszielen
export function resolveQuest(id, state) {
  const quest = QUESTS[id]
  if (!quest) return null
  const ablauf = ablaufZuQuest(id)
  if (ablauf) {
    return {
      ...quest,
      ablaufUebungen: ablauf,
      hinweis: ablauf.map((u) => u.name).join(' · '),
      ziel: state.baseTargets?.[id] ?? 0,
    }
  }
  const variante = aktuelleVariante(id, state)
  return {
    ...quest,
    name: variante?.name ?? quest.id,
    hinweis: variante?.tipp,
    variante,
    ziel: state.baseTargets?.[id] ?? 0,
  }
}

/**
 * Vergleicht die geltenden Varianten vor und nach einem Rangwechsel.
 * Liefert je Quest den Wechsel, damit die App ihn zeigen und das
 * Tagesziel anpassen kann.
 */
export function variantenWechsel(vorher, nachher, questIds = Object.keys(QUESTS)) {
  const wechsel = []
  for (const questId of questIds) {
    const alt = aktuelleVariante(questId, vorher)
    const neu = aktuelleVariante(questId, nachher)
    if (!alt || !neu || alt.index === neu.index) continue
    wechsel.push({
      questId,
      uebungName: neu.uebung.name,
      alt: alt.name,
      neu: neu.name,
      tipp: neu.tipp,
      stufe: neu.stufe,
    })
  }
  return wechsel
}

// Anteil, auf den das Tagesziel bei einer schwereren Variante fällt
export const STUFENWECHSEL_ANTEIL = 0.6

// Überschrift des Tages: Systemname plus Schwerpunkt der anstehenden Übungen
export function tagesLabel(systemId, dayType) {
  if (dayType === 'REST') return 'RUHETAG · REGENERATION'
  const system = systemOder(systemId)
  const kategorien = [
    ...new Set(
      tagesplan(systemId, dayType)
        .map((id) => QUESTS[id]?.kategorie)
        .filter(Boolean),
    ),
  ]
  const namen = kategorien.map((k) => KATEGORIE_NAMEN[k] ?? k).join(' & ')
  return `TAG ${dayType} · ${namen.toUpperCase() || system.name.toUpperCase()}`
}

export const TABLETS_XP = 20
export const POOL_XP = 30
export const STEP_XP_PER_1000 = 10
export const STEP_XP_MAX = 60

export function getDayType(systemId, date = new Date()) {
  return tagestyp(systemId, date)
}

export function stepXpMax(dayType) {
  return dayType === 'REST' ? STEP_XP_MAX / 2 : STEP_XP_MAX
}

// Tabletten sind in jedem System Pflicht, dazu die Übungen des Tages
export function requiredQuestIds(systemId, dayType) {
  return [...tagesplan(systemId, dayType), 'tabletten']
}

/**
 * Schätzt Tagesziele für Übungen, die es im alten System nicht gab.
 * Grundlage sind die vorhandenen Ziele derselben Kategorie, umgerechnet
 * über das Verhältnis der Grundschwierigkeiten – eine schwerere Übung
 * bekommt entsprechend weniger Wiederholungen.
 */
export function ergaenzeZiele(baseTargets, questIds) {
  const ziele = { ...baseTargets }
  // Maßstab ist immer der mitgebrachte Bestand. Würden geschätzte Werte
  // selbst wieder als Grundlage dienen, schaukelt sich der Fehler auf.
  const bestand = Object.entries(baseTargets ?? {})
    .map(([id, wert]) => ({
      id,
      wert,
      uebung: uebungZuQuest(id),
      einheit: einheitVon(id),
    }))
    .filter((e) => e.wert > 0 && e.uebung)

  const schaetze = (uebung, einheit, referenz) => {
    if (referenz.length === 0) {
      return einheit === 'sek' ? SEKUNDEN_START : EINSTIEG_ZIEL
    }
    const schnitt = referenz.reduce((s, e) => s + e.wert, 0) / referenz.length
    const stufenSchnitt =
      referenz.reduce((s, e) => s + (e.uebung.stufe || 2), 0) / referenz.length
    // Schwerere Übung, weniger Wiederholungen – und umgekehrt
    const wert = (schnitt * stufenSchnitt) / (uebung.stufe || 1)
    return einheit === 'sek' ? rundeSekunden(wert) : Math.max(1, Math.round(wert))
  }

  for (const questId of questIds) {
    if (ziele[questId] > 0) continue
    const uebung = uebungZuQuest(questId)
    const einheit = einheitVon(questId)
    if (!uebung) {
      ziele[questId] = EINSTIEG_ZIEL
      continue
    }
    // Sekunden- und Wiederholungsziele sind nicht vergleichbar und dürfen
    // sich beim Schätzen nicht vermischen
    const passende = bestand.filter((e) => e.einheit === einheit)
    const gleicheArt = passende.filter((e) => e.uebung.kategorie === uebung.kategorie)
    const referenz = gleicheArt.length > 0 ? gleicheArt : passende
    // Ohne Vergleichswert in derselben Einheit: aus Wiederholungen umrechnen
    if (referenz.length === 0 && einheit === 'sek') {
      const ausWdh = bestand.filter((e) => e.einheit === 'wdh')
      if (ausWdh.length > 0) {
        const schnitt = ausWdh.reduce((s, e) => s + e.wert, 0) / ausWdh.length
        const stufenSchnitt =
          ausWdh.reduce((s, e) => s + (e.uebung.stufe || 2), 0) / ausWdh.length
        ziele[questId] = rundeSekunden(
          ((schnitt * stufenSchnitt) / (uebung.stufe || 1)) * SEKUNDEN_JE_WDH,
        )
        continue
      }
    }
    ziele[questId] = schaetze(uebung, einheit, referenz)
  }
  return ziele
}

/**
 * Rechnet Wiederholungsziele einer Übung, die jetzt auf Zeit läuft, in
 * Sekunden um. Zwei Sekunden je Wiederholung, dann auf volle Viertelminuten.
 */
export function inSekunden(wiederholungen) {
  return rundeSekunden((wiederholungen || 0) * SEKUNDEN_JE_WDH)
}

// Referenzwerte für die Rang-Einstufung: Schwellen je Stufe 0–3
const SCORE_THRESHOLDS = {
  liegestuetze: [10, 25, 50],
  kniebeugen: [15, 35, 60],
  crunches: [15, 30, 50],
  klimmzuege: [1, 5, 10],
  dehnen: [5, 10, 20],
}

// Summe der relativen Leistung über alle Übungen → Rang E–B
export function rankFromMaxima(maxima) {
  let sum = 0
  for (const [key, stufen] of Object.entries(SCORE_THRESHOLDS)) {
    const value = maxima[key] || 0
    sum += stufen.filter((schwelle) => value >= schwelle).length
  }
  // auf die 0–9-Skala normieren (5 Übungen × 3 Punkte = 15)
  const score = Math.round((sum / 15) * 9)
  if (score <= 2) return 'E'
  if (score <= 5) return 'D'
  if (score <= 7) return 'C'
  return 'B'
}

export function todayKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
