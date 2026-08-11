import { RANKS } from './ranks.js'

export const TITLES = {
  neuling: {
    id: 'neuling',
    name: 'Neuling',
    beschreibung: 'Jeder fängt klein an',
    check: null, // von Anfang an freigeschaltet
  },
  bestaendig: {
    id: 'bestaendig',
    name: 'Der Beständige',
    beschreibung: '7-Tage-Serie erreicht',
    check: (s) => Math.max(s.streak, s.lifetime.bestStreak) >= 7,
  },
  unbeugsam: {
    id: 'unbeugsam',
    name: 'Der Unbeugsame',
    beschreibung: '30-Tage-Serie erreicht',
    check: (s) => Math.max(s.streak, s.lifetime.bestStreak) >= 30,
  },
  eisenfaust: {
    id: 'eisenfaust',
    name: 'Eisenfaust',
    beschreibung: '1000 Liegestütze insgesamt',
    check: (s) => s.lifetime.liegestuetze >= 1000,
  },
  bezwinger: {
    id: 'bezwinger',
    name: 'Dungeon-Bezwinger',
    beschreibung: 'Ersten Dungeon abgeschlossen',
    check: (s) => s.lifetime.dungeons >= 1,
  },
  nachtbezwinger: {
    id: 'nachtbezwinger',
    name: 'Bezwinger der Nacht',
    beschreibung: 'Den Nachtherrn auf dem Hohlen Thron besiegt',
    check: (s) => s.thronBezwungen === true,
  },
  aufsteiger: {
    id: 'aufsteiger',
    name: 'Aufsteiger',
    beschreibung: 'Rang C erreicht',
    check: (s) => RANKS.indexOf(s.rank) >= RANKS.indexOf('C'),
  },
}
