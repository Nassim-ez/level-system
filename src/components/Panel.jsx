function Panel({ title, accent, glow, children }) {
  return (
    <section
      className="rounded-[18px] border p-4"
      style={{
        background: 'var(--panel)',
        borderColor: accent ?? 'var(--line)',
        boxShadow: `0 0 18px ${
          glow ?? (accent ? 'rgba(143,224,255,.22)' : 'rgba(63,182,255,.10)')
        }`,
      }}
    >
      {title && (
        <div className="mb-3 flex items-center gap-2">
          <span
            className="shrink-0"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: '10px',
              letterSpacing: '3px',
              color: accent ?? 'var(--glow)',
              textShadow: accent ? '0 0 8px rgba(143,224,255,.8)' : 'none',
            }}
          >
            ◆ {title}
          </span>
          <span
            className="h-px flex-1"
            style={{
              background: `linear-gradient(90deg, ${accent ?? 'var(--line)'}, transparent)`,
            }}
          />
        </div>
      )}
      {children}
    </section>
  )
}

export default Panel
