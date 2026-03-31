const ITEMS = [
  'Revolution Tarot', 'Leitura sem frescura', 'Lógica & Tarot & Energia',
  'Sem promessa mágica', 'Autoconhecimento estruturado', 'Dev & Tarologa', 'Status: ONLINE'
]

export default function Ticker() {
  const track = [...ITEMS, ...ITEMS] // duplicado pra loop contínuo

  return (
    <div style={{
      background: 'var(--surface)',
      borderTop: '1px solid var(--border)',
      borderBottom: '1px solid var(--border)',
      overflow: 'hidden',
      padding: '12px 0',
    }}>
      <div style={{
        display: 'flex',
        animation: 'ticker 28s linear infinite',
        width: 'max-content',
      }}>
        {track.map((item, i) => (
          <span key={i} style={{
            display: 'inline-flex', alignItems: 'center', gap: 20,
            padding: '0 32px',
            fontSize: '0.62rem',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}>
            <span style={{ color: 'var(--cyan)' }}>{item}</span>
            <span style={{ color: 'var(--magenta)' }}>✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}
