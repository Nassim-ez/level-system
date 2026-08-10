# SYSTEM – Roadmap

Offener Stand und die Regeln, die bei jeder weiteren Arbeit gelten.
Letzte Aktualisierung: 10.08.2026

---

## Wo das Projekt steht

Spielbar sind E-, D- und C-Rang mit je drei Dungeons zu fünf Türen, dazu
der Tages-Dungeon, das Item- und Set-System bis C-Rang, die
Übungsdatenbank mit Variantenleiter, fünf Trainingssysteme, der
Mobility-Ablauf, das Eiweiß-Tracking und die Sicherung des Spielstands als
Datei.

Der Spielstand liegt ausschließlich im `localStorage` unter `system_save`.
Jede Schemaänderung braucht eine Migration in `migriereSpielstand`
(`src/context/GameContext.jsx`) – bestehende Stände dürfen nie brechen.

---

## DUNGEON

- **Dungeons für B, A und S.** Je drei Dungeons mit fünf Türen nach dem
  Muster des E-Rangs (`src/data/dungeons.js`). Eigene Gegnernamen passend
  zum Thema des Dungeons, HP und Schaden über den Rangfaktor skaliert
  (`RANG_FAKTOR` in `src/data/combat.js`). Keine Wiederverwendung
  bestehender Gegner.
  **Gebaut sind D und C:** Glutschacht, Salzdom, Rostkessel (D) sowie
  Klammgrat, Tiefwasserstollen, Dornbruch (C). Die Türen tragen Basiswerte
  auf E-Niveau, `skaliereTueren(rank, tueren)` rechnet sie auf den Rang
  hoch – für B bis S denselben Weg nehmen. `HOEHERE_DUNGEONS` ist
  weiterhin nur eine Vorschauliste und nennt jetzt B, A und S.
- **Event-Dungeons.** Zeitlich begrenzt verfügbar, eigener Gegner, eigene
  Beute.
- **Monats-Boss.** Einmal im Monat, deutlich stärker als ein normaler
  Boss, hochwertige Beute.
- **Verwendung für die Dungeon-Schlüssel.** Der Schlüssel wird nach sieben
  Tagen Tages-Dungeon in Folge vergeben (`GameContext.jsx`), öffnet aber
  bisher nichts.
- **Neue Beutearten:** Skill-Upgrades und XP-Boosts ergänzen.

## ITEMS

- **Items für B, A und S** nach dem Muster der bestehenden Datei
  (`src/data/items.js`), jeweils drei pro Slot mit Buff und Debuff.
  Der Katalog deckt derzeit die Basis-Raritäten 0 bis 2 ab (E, D, C) mit
  24 Items, also drei je Slot. Höhere Raritäten entstehen bisher nur durch
  Aufwerten beim Schmied, nicht als eigene Stücke.

## GRAFIK

- **Gegner-Artworks als Bilder** statt der SVG-Silhouetten in
  `src/components/FightSprites.jsx`. Das Layout der Kampfansicht ist dafür
  vorbereitet.
- **Charakterbild** für das Paperdoll-Feld in der Ausrüstung
  (`src/pages/Charakter.jsx`, Platzhalter „CHARAKTERBILD").
- **Item-Bilder** für die Slot-Kacheln und die Item-Liste; dort stehen
  bisher die Slot-Symbole aus `src/components/SlotIcons.jsx`.

## TECHNIK

- **Supabase-Anbindung mit Anmeldung**, damit der Spielstand nicht nur
  lokal liegt. Wird erst gebraucht, wenn die App veröffentlicht werden
  soll. Bis dahin trägt der Export und Import über die Gefahrenzone.
- **Lokale Benachrichtigungen über Capacitor**, falls Erinnerungen
  gewünscht sind. Als reine PWA nicht zuverlässig möglich.

## OFFENE FRAGEN

- Was passiert nach Rang S, wenn es keine Ränge mehr gibt?
- Wie geht es weiter, wenn alle Dungeons geklärt sind?

---

## Geltende Regeln

Diese Entscheidungen sind gefallen und sollen bei künftiger Arbeit nicht
stillschweigend gekippt werden.

### Farben

Für Bedienelemente, Zustände und Warnungen gilt ausschließlich:

- **Blau** (`--glow`, `--xp`) für eigene Aktionen und Fortschritt
- **Rot** (`--danger`) für Gegner, Gefahr und Schaden
- **Amber** (`--warn`) für Warnungen und Ankündigungen

Kein Grün. Die frühere Variable `--ok` wurde ersatzlos entfernt.

**Ausgenommen sind die Kennsysteme:** Raritätsfarben (sechs Stufen,
inklusive Violett), Materialfarben und die Farbgebung einzelner
Gegnertypen. Farbe erfüllt dort eine andere Aufgabe – sie kennzeichnet
Inhalte, statt Bedienung zu signalisieren. Ohne diese Ausnahme wären sechs
Raritätsstufen nicht mehr unterscheidbar.

### Kampfansicht

Die Kampfansicht muss ohne Scrollen auf einen Bildschirm passen (100dvh).
Geprüft wird auf 320, 375 und 430 Pixel Breite. Neue Elemente dürfen diese
Höhe nicht sprengen.

### Belastungssystem

Das Belastungssystem im Dungeon ist bewusst so gebaut: Jede Aktion kostet
Belastung, ab 100 halbiert sich der Schaden, ab 200 viertelt er sich. Das
soll zum Haushalten zwingen, nicht zum Dauerdrücken. Werte nicht
verschärfen und die Stufen nicht entfernen.

### Eiweiß-Tracking ohne Strafen

Das Eiweiß-Tracking hat bewusst **keine** Sanktionen:

- kein XP-Abzug bei Nichterreichen
- keine Warnung, keine Mahnung, kein Log-Eintrag
- kein Verlust der Tagesserie
- die Quest zählt **nicht** zur Pflicht für die Tagesserie
- der eigene Serienzähler ist reine Anzeige, ohne Bonus und ohne Meldung
  beim Abreißen

Wer nichts einträgt, soll davon nichts merken. Ebenso gilt: keine
Kalorien, keine weiteren Nährwerte, keine Einteilung von Lebensmitteln in
gut und schlecht, keine Gewichtsziele und keine Verlaufskurve. Das
Körpergewicht dient allein der Bedarfsrechnung.

### Inhaltlicher Anspruch

Trainings- und Ernährungsinhalte sind fachlich belegt oder als
Erfahrungswert gekennzeichnet – nachzulesen in `src/data/uebungen.js` und
`src/data/lebensmittel.js`. Steht dort „Erfahrungswert", wird das genauso
angezeigt und nicht beschönigt.
