export const GENDERS = [
  { id: 'm', label: 'MÄNNLICH' },
  { id: 'w', label: 'WEIBLICH' },
]

// Dynamische Anrede: weiblich → "Jägerin", sonst "Jäger"
export function anrede(gender) {
  return gender === 'w' ? 'Jägerin' : 'Jäger'
}

// Altstände mit dem früheren "d" werden als "m" behandelt
export function normalizeGender(gender) {
  return gender === 'w' ? 'w' : gender == null ? null : 'm'
}
