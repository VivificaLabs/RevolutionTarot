import SectionLabel from '../ui/SectionLabel'

const TAGS = ['Leitura direta', 'Sem julgamento', 'Foco em clareza', 'Tarot + lógica', 'Entrega prática']

const LIST_ITEMS = [
  'Tiragens por escrito ou videochamada',
  'Sem enrolação, direto ao ponto',
  'Abordagem prática e acolhedora',
  'Palavrão incluso, drama não',
  'Programadora & tarologa — sem contradição',
]

export default function Sobre() {
  return (
    <section id="tarologa">
      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '96px 48px' }}>
        <SectionLabel text="A Tarologa" num="// 01" />

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 80,
          alignItems: 'start',
          marginTop: 0,
        }}>
          {/* Esquerda */}
          <div>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(2.2rem, 3.5vw, 3.5rem)',
              fontWeight: 300,
              lineHeight: 1.1,
              marginBottom: 28,
              color: 'var(--ink)',
            }}>
              Tarologa de<br />exatas.{' '}
              <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Sem<br />contradição.</em>
            </h2>

            <p style={{ fontSize: '0.78rem', lineHeight: 1.9, color: 'var(--muted)', marginBottom: 16 }}>
              Sou programadora de dia e tarologa quando as cartas chamam. Cresci com lógica, código e planilha — e aprendi que{' '}
              <strong style={{ color: 'var(--ink)', fontWeight: 400 }}>autoconhecimento também tem estrutura.</strong>
            </p>
            <p style={{ fontSize: '0.78rem', lineHeight: 1.9, color: 'var(--muted)', marginBottom: 16 }}>
              Minhas leituras não têm papo vago nem energia genérica. Eu olho pra o que tá ali, digo o que vejo e te ajudo a entender o que você já sente mas ainda não colocou em palavras.
            </p>
            <p style={{ fontSize: '0.78rem', lineHeight: 1.9, color: 'var(--muted)' }}>
              Se você é do tipo que questiona tudo e mesmo assim sente que algo tá travado —{' '}
              <strong style={{ color: 'var(--ink)', fontWeight: 400 }}>você tá no lugar certo.</strong>
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 28 }}>
              {TAGS.map(tag => (
                <span key={tag} style={{
                  fontSize: '0.58rem', fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  padding: '5px 12px',
                  border: '1px solid var(--border2)',
                  color: 'var(--muted)',
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Direita — card com citação */}
          <div style={{
            border: '1px solid var(--border)',
            padding: 36,
            position: 'relative',
            background: 'rgba(0,0,0,0.2)',
          }}>
            {/* Linha de topo decorativa */}
            <div style={{
              position: 'absolute',
              top: -1, left: 20, right: 20,
              height: 2,
              background: 'linear-gradient(90deg, transparent, var(--cyan), transparent)',
            }} />

            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic',
              fontSize: '1.3rem',
              fontWeight: 300,
              lineHeight: 1.55,
              color: 'var(--ink)',
              marginBottom: 28,
            }}>
              &quot;Não precisa acreditar em magia. Precisa estar disposta a olhar pra si mesma.&quot;
            </p>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {LIST_ITEMS.map(item => (
                <li key={item} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  fontSize: '0.72rem', color: 'var(--muted)', lineHeight: 1.5,
                }}>
                  <span style={{ color: 'var(--cyan)', flexShrink: 0, fontWeight: 700, marginTop: 1 }}>&gt;</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
