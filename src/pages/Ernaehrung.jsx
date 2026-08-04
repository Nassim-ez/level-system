import { useState } from 'react'
import Panel from '../components/Panel.jsx'
import { useGame } from '../context/GameContext.jsx'
import {
  LEBENSMITTEL,
  KATEGORIEN,
  HINWEIS_TEXT,
  BELEG,
  proteinBedarf,
  proteinFuer,
  findeLebensmittel,
} from '../data/lebensmittel.js'

const orbitron = { fontFamily: "'Orbitron', sans-serif" }

/* --------------------------------------------------------------------- */
/* Gewichtsabfrage – einmalig, ohne Bewertung der Zahl                     */
/* --------------------------------------------------------------------- */
function GewichtFrage({ start, onSpeichern, onAbbruch }) {
  const [wert, setWert] = useState(start ? String(start) : '')
  const zahl = Number(wert.replace(',', '.'))
  const gueltig = Number.isFinite(zahl) && zahl > 0

  return (
    <div className="flex flex-col gap-4">
      <Panel title="KÖRPERGEWICHT">
        <p style={{ fontSize: '13.5px', lineHeight: 1.6 }}>
          Für den Eiweißbedarf braucht das System dein Körpergewicht. Es dient
          ausschließlich dieser Rechnung – kein Ziel, kein Verlauf, keine
          Bewertung.
        </p>
        <div className="mt-4 flex items-center gap-2">
          <input
            type="number"
            inputMode="decimal"
            value={wert}
            onChange={(e) => setWert(e.target.value)}
            placeholder="z. B. 78"
            className="min-w-0 flex-1 px-3 py-2"
            style={{
              background: '#0e1826',
              border: '1px solid var(--line)',
              borderRadius: 10,
              color: 'var(--text)',
              fontSize: '16px',
            }}
          />
          <span style={{ ...orbitron, fontSize: '13px', color: 'var(--dim)' }}>KG</span>
        </div>

        <button
          type="button"
          disabled={!gueltig}
          onClick={() => onSpeichern(zahl)}
          className="mt-4 w-full bg-transparent px-4 py-2.5 disabled:opacity-40"
          style={{
            ...orbitron,
            fontSize: '11px',
            letterSpacing: '2px',
            color: 'var(--glow)',
            border: '1px solid var(--glow)',
            borderRadius: 10,
          }}
        >
          SPEICHERN
        </button>
        {onAbbruch && (
          <button
            type="button"
            onClick={onAbbruch}
            className="mt-2 w-full bg-transparent px-4 py-2"
            style={{
              ...orbitron,
              fontSize: '10px',
              letterSpacing: '2px',
              color: 'var(--dim)',
              border: '1px solid var(--line)',
              borderRadius: 10,
            }}
          >
            ZURÜCK
          </button>
        )}
      </Panel>
    </div>
  )
}

/* --------------------------------------------------------------------- */
/* Mengeneingabe: Portionen antippen oder Gramm eingeben                   */
/* --------------------------------------------------------------------- */
function MengenEingabe({ lebensmittel, onHinzufuegen, onZurueck }) {
  const [portionen, setPortionen] = useState(1)
  const [gramm, setGramm] = useState('')
  const [modus, setModus] = useState('portion')

  const menge =
    modus === 'gramm'
      ? Math.max(0, Number(gramm.replace(',', '.')) || 0)
      : Math.round(portionen * lebensmittel.portionGramm)
  const protein = proteinFuer(lebensmittel, menge)

  return (
    <Panel title="MENGE">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[17px] font-semibold">{lebensmittel.name}</p>
          <p style={{ fontSize: '11.5px', color: 'var(--dim)' }}>
            {lebensmittel.protein} g Eiweiß je 100 g · 1 {lebensmittel.portionName} ={' '}
            {lebensmittel.portionGramm} g
          </p>
        </div>
        <button
          type="button"
          onClick={onZurueck}
          className="shrink-0 bg-transparent px-3 py-1.5"
          style={{
            ...orbitron,
            fontSize: 9,
            letterSpacing: '2px',
            color: 'var(--dim)',
            border: '1px solid var(--line)',
            borderRadius: 8,
          }}
        >
          ZURÜCK
        </button>
      </div>

      {/* Umschalter */}
      <div className="mt-3 flex gap-1.5">
        {[
          { id: 'portion', text: 'PORTIONEN' },
          { id: 'gramm', text: 'GRAMM' },
        ].map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setModus(m.id)}
            className="flex-1 bg-transparent px-2 py-1.5"
            style={{
              ...orbitron,
              fontSize: 9,
              letterSpacing: '1px',
              color: modus === m.id ? 'var(--glow)' : 'var(--dim)',
              border: `1px solid ${modus === m.id ? 'var(--glow)' : 'var(--line)'}`,
              background: modus === m.id ? 'rgba(63,182,255,.08)' : 'transparent',
              borderRadius: 8,
            }}
          >
            {m.text}
          </button>
        ))}
      </div>

      {modus === 'portion' ? (
        <div className="mt-3 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setPortionen((p) => Math.max(0.5, p - 0.5))}
            className="grid shrink-0 place-items-center bg-transparent"
            style={{
              width: 42,
              height: 42,
              ...orbitron,
              fontSize: 18,
              color: 'var(--glow)',
              border: '1px solid var(--glow)',
              borderRadius: 10,
            }}
          >
            −
          </button>
          <div className="min-w-0 text-center">
            <p style={{ ...orbitron, fontSize: '20px', color: 'var(--xp)' }}>
              {String(portionen).replace('.', ',')}
            </p>
            <p className="truncate" style={{ fontSize: '11px', color: 'var(--dim)' }}>
              {lebensmittel.portionName}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPortionen((p) => p + 0.5)}
            className="grid shrink-0 place-items-center bg-transparent"
            style={{
              width: 42,
              height: 42,
              ...orbitron,
              fontSize: 18,
              color: 'var(--glow)',
              border: '1px solid var(--glow)',
              borderRadius: 10,
            }}
          >
            +
          </button>
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            value={gramm}
            onChange={(e) => setGramm(e.target.value)}
            placeholder="Gramm"
            className="min-w-0 flex-1 px-3 py-2"
            style={{
              background: '#0e1826',
              border: '1px solid var(--line)',
              borderRadius: 10,
              color: 'var(--text)',
              fontSize: '16px',
            }}
          />
          <span style={{ ...orbitron, fontSize: '12px', color: 'var(--dim)' }}>G</span>
        </div>
      )}

      <p className="mt-3 text-center" style={{ fontSize: '14px' }}>
        {menge} g ergeben{' '}
        <b style={{ ...orbitron, fontSize: '17px', color: 'var(--xp)' }}>
          {protein} g
        </b>{' '}
        Eiweiß
      </p>

      <button
        type="button"
        disabled={menge <= 0}
        onClick={() => onHinzufuegen(menge, protein)}
        className="mt-3 w-full bg-transparent px-4 py-2.5 disabled:opacity-40"
        style={{
          ...orbitron,
          fontSize: '11px',
          letterSpacing: '2px',
          color: 'var(--glow)',
          border: '1px solid var(--glow)',
          borderRadius: 10,
        }}
      >
        EINTRAGEN
      </button>
    </Panel>
  )
}

/* --------------------------------------------------------------------- */
/* Suche mit Kategorie-Filter                                              */
/* --------------------------------------------------------------------- */
function Suche({ onWaehlen, onZurueck }) {
  const [text, setText] = useState('')
  const [kategorie, setKategorie] = useState('alle')

  const treffer = LEBENSMITTEL.filter((l) => {
    if (kategorie !== 'alle' && l.kategorie !== kategorie) return false
    if (!text.trim()) return true
    return l.name.toLowerCase().includes(text.trim().toLowerCase())
  })

  return (
    <Panel title="LEBENSMITTEL">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Suchen …"
          className="min-w-0 flex-1 px-3 py-2"
          style={{
            background: '#0e1826',
            border: '1px solid var(--line)',
            borderRadius: 10,
            color: 'var(--text)',
            fontSize: '15px',
          }}
        />
        <button
          type="button"
          onClick={onZurueck}
          className="shrink-0 bg-transparent px-3 py-2"
          style={{
            ...orbitron,
            fontSize: 9,
            letterSpacing: '2px',
            color: 'var(--dim)',
            border: '1px solid var(--line)',
            borderRadius: 8,
          }}
        >
          ZURÜCK
        </button>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {[{ id: 'alle', name: 'Alle' }, ...Object.entries(KATEGORIEN).map(([id, name]) => ({ id, name }))].map(
          (k) => {
            const aktiv = kategorie === k.id
            return (
              <button
                key={k.id}
                type="button"
                onClick={() => setKategorie(k.id)}
                className="bg-transparent px-2 py-1"
                style={{
                  ...orbitron,
                  fontSize: 8,
                  letterSpacing: '1px',
                  color: aktiv ? 'var(--glow)' : 'var(--dim)',
                  border: `1px solid ${aktiv ? 'var(--glow)' : 'var(--line)'}`,
                  background: aktiv ? 'rgba(63,182,255,.08)' : 'transparent',
                  borderRadius: 7,
                }}
              >
                {k.name.toUpperCase()}
              </button>
            )
          },
        )}
      </div>

      <div className="mt-3 flex flex-col gap-1.5">
        {treffer.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => onWaehlen(l.id)}
            className="flex w-full items-center justify-between gap-3 border p-2 text-left"
            style={{ borderColor: 'var(--line)', borderRadius: 10, background: 'transparent' }}
          >
            <span className="min-w-0 truncate text-[14px]">{l.name}</span>
            <span
              className="shrink-0"
              style={{ ...orbitron, fontSize: 10, color: 'var(--xp)' }}
            >
              {l.protein} g
            </span>
          </button>
        ))}
        {treffer.length === 0 && (
          <p style={{ fontSize: '12.5px', color: 'var(--dim)' }}>
            Nichts gefunden. Andere Schreibweise oder Kategorie versuchen.
          </p>
        )}
      </div>
    </Panel>
  )
}

/* --------------------------------------------------------------------- */
function Ernaehrung({ onZurueck }) {
  const { state, dispatch } = useGame()
  const [ansicht, setAnsicht] = useState(state.gewicht ? 'liste' : 'gewicht')
  const [gewaehlt, setGewaehlt] = useState(null)

  const eintraege = state.ernaehrung?.eintraege ?? []
  const summe = eintraege.reduce((s, e) => s + (e.protein ?? 0), 0)
  const bedarf = proteinBedarf(state.gewicht)
  const anteil = bedarf > 0 ? Math.min(100, (summe / bedarf) * 100) : 0

  // Was heute schon öfter eingetragen wurde, steht oben; aufgefüllt wird
  // mit den geläufigsten Eiweißquellen. Die Liste ist kurz genug, um sie
  // bei jedem Rendern neu zu bilden.
  const haeufig = (() => {
    const zaehler = {}
    for (const e of eintraege) {
      zaehler[e.lebensmittelId] = (zaehler[e.lebensmittelId] ?? 0) + 1
    }
    const sortiert = Object.entries(zaehler)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => findeLebensmittel(id))
      .filter(Boolean)
    const auffueller = ['magerquark', 'haehnchenbrust', 'ei', 'whey', 'skyr']
      .map(findeLebensmittel)
      .filter((l) => l && !sortiert.some((s) => s.id === l.id))
    return [...sortiert, ...auffueller].slice(0, 5)
  })()

  if (ansicht === 'gewicht') {
    return (
      <GewichtFrage
        start={state.gewicht}
        onSpeichern={(kg) => {
          dispatch({ type: 'SET_GEWICHT', gewicht: kg })
          setAnsicht('liste')
        }}
        onAbbruch={state.gewicht ? () => setAnsicht('liste') : onZurueck}
      />
    )
  }

  if (gewaehlt) {
    const lebensmittel = findeLebensmittel(gewaehlt)
    return (
      <div className="flex flex-col gap-4">
        <MengenEingabe
          lebensmittel={lebensmittel}
          onZurueck={() => setGewaehlt(null)}
          onHinzufuegen={(menge, protein) => {
            dispatch({
              type: 'ERNAEHRUNG_ADD',
              lebensmittelId: lebensmittel.id,
              menge,
              protein,
            })
            setGewaehlt(null)
            setAnsicht('liste')
          }}
        />
      </div>
    )
  }

  if (ansicht === 'suche') {
    return (
      <div className="flex flex-col gap-4">
        <Suche onWaehlen={setGewaehlt} onZurueck={() => setAnsicht('liste')} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <Panel title="EIWEISS HEUTE">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p style={{ ...orbitron, fontSize: '22px', color: 'var(--xp)' }}>
              {summe} / {bedarf} g
            </p>
            <p style={{ fontSize: '12px', color: 'var(--dim)' }}>
              Eiweiß · {state.gewicht} kg × 1,6 g
            </p>
          </div>
          <button
            type="button"
            onClick={onZurueck}
            className="shrink-0 bg-transparent px-3 py-1.5"
            style={{
              ...orbitron,
              fontSize: 9,
              letterSpacing: '2px',
              color: 'var(--dim)',
              border: '1px solid var(--line)',
              borderRadius: 8,
            }}
          >
            ZURÜCK
          </button>
        </div>

        <div
          className="mt-2 h-[8px] w-full overflow-hidden rounded-full"
          style={{ background: '#0f1a2e' }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${anteil}%`,
              background: 'var(--xp)',
              transition: 'width .3s',
            }}
          />
        </div>

        {(state.ernaehrung?.streak ?? 0) > 0 && (
          <p className="mt-2" style={{ fontSize: '12px', color: 'var(--dim)' }}>
            Gedeckte Tage in Folge:{' '}
            <span style={{ color: 'var(--xp)' }}>{state.ernaehrung.streak}</span>
          </p>
        )}

        <button
          type="button"
          onClick={() => setAnsicht('suche')}
          className="mt-3 w-full bg-transparent px-4 py-2.5"
          style={{
            ...orbitron,
            fontSize: '11px',
            letterSpacing: '2px',
            color: 'var(--glow)',
            border: '1px solid var(--glow)',
            borderRadius: 10,
          }}
        >
          LEBENSMITTEL HINZUFÜGEN
        </button>
      </Panel>

      {haeufig.length > 0 && (
        <Panel title="SCHNELLWAHL">
          <div className="flex flex-wrap gap-1.5">
            {haeufig.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setGewaehlt(l.id)}
                className="bg-transparent px-2.5 py-1.5"
                style={{
                  fontSize: '12px',
                  color: 'var(--text)',
                  border: '1px solid var(--line)',
                  borderRadius: 9,
                }}
              >
                {l.name}
              </button>
            ))}
          </div>
        </Panel>
      )}

      <Panel title="HEUTE EINGETRAGEN">
        {eintraege.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--dim)' }}>
            Noch nichts eingetragen.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {eintraege.map((e, i) => {
              const l = findeLebensmittel(e.lebensmittelId)
              return (
                <div
                  key={`${e.lebensmittelId}-${i}`}
                  className="flex items-center justify-between gap-3 border p-2"
                  style={{ borderColor: 'var(--line)', borderRadius: 11 }}
                >
                  <div className="min-w-0">
                    <p className="truncate text-[14px]">{l?.name ?? e.lebensmittelId}</p>
                    <p style={{ fontSize: '11px', color: 'var(--dim)' }}>{e.menge} g</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span style={{ ...orbitron, fontSize: 12, color: 'var(--xp)' }}>
                      {e.protein} g
                    </span>
                    <button
                      type="button"
                      onClick={() => dispatch({ type: 'ERNAEHRUNG_REMOVE', index: i })}
                      title="Eintrag entfernen"
                      className="grid place-items-center bg-transparent"
                      style={{
                        width: 26,
                        height: 26,
                        color: 'var(--dim)',
                        border: '1px solid var(--line)',
                        borderRadius: 8,
                        fontSize: 13,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Panel>

      <Panel title="HINTERGRUND">
        <p style={{ fontSize: '13.5px', lineHeight: 1.6 }}>{HINWEIS_TEXT}</p>
        <p className="mt-3" style={{ fontSize: '11px', lineHeight: 1.5, color: 'var(--dim)' }}>
          {BELEG}
        </p>
      </Panel>
    </div>
  )
}

export default Ernaehrung
