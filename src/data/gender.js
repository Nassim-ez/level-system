export const GENDERS = [
  { id: 'm', label: 'MÄNNLICH' },
  { id: 'w', label: 'WEIBLICH' },
  { id: 'd', label: 'NEUTRAL' },
]

// Dynamische Anrede: weiblich → "Jägerin", sonst "Jäger"
export function anrede(gender) {
  return gender === 'w' ? 'Jägerin' : 'Jäger'
}
