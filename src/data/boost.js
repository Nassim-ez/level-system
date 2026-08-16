// ---------------------------------------------------------------------------
// XP-Boost – doppelte Erfahrung auf Zeit
//
// Der Boost hängt an einem Ablaufzeitpunkt, nicht an einer Restdauer: So
// läuft er auch dann korrekt ab, wenn die App zwischendurch geschlossen war.
// Er lässt sich nicht stapeln; ein zweiter Trank verlängert nicht, sondern
// setzt neu an – deshalb fragt die App vor dem Trinken nach.
// ---------------------------------------------------------------------------

export const BOOST_FAKTOR = 2
export const BOOST_STUNDEN = 24
export const BOOST_DAUER_MS = BOOST_STUNDEN * 60 * 60 * 1000

/** Ablaufzeitpunkt eines jetzt getrunkenen Boosts */
export function boostEnde(jetzt = Date.now()) {
  return jetzt + BOOST_DAUER_MS
}

export function boostAktiv(bis, jetzt = Date.now()) {
  return typeof bis === 'number' && bis > jetzt
}

/** Verbleibende Millisekunden, nie negativ */
export function boostRest(bis, jetzt = Date.now()) {
  return boostAktiv(bis, jetzt) ? bis - jetzt : 0
}

/** Restlaufzeit als „23 h 41 min" bzw. „7 min" in der letzten Stunde */
export function boostRestText(bis, jetzt = Date.now()) {
  const rest = boostRest(bis, jetzt)
  if (rest === 0) return null
  const minuten = Math.ceil(rest / 60000)
  const stunden = Math.floor(minuten / 60)
  const min = minuten % 60
  if (stunden === 0) return `${min} min`
  return `${stunden} h ${String(min).padStart(2, '0')} min`
}

/** Anteil der bereits abgelaufenen Zeit, für die Leiste */
export function boostAnteil(bis, jetzt = Date.now()) {
  return Math.max(0, Math.min(1, boostRest(bis, jetzt) / BOOST_DAUER_MS))
}
