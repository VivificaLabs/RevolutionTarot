import SectionLabel from '../ui/SectionLabel'

const TAGS = ['Leitura sem frescura', 'Sem julgamentos', 'Foco no entendimento', 'Gratiluz aqui não tem vez', 'Adaptado ao seu contexto']

const LIST_ITEMS = [
  'Entrega por áudios e fotos, pra você consumir no seu tempo',
  'Abordagem prática e acolhedora, sem papo enigmático',
  'Ficou com dúvidas depois da leitura? Tô aqui pra responder',
  'Zero julgamentos, a moralidade fica lá pro outro lado',
  'Leituras somente para maiores de 18 anos',
  'Saúde, morte ou gravidez? Diagnóstico não rola por aqui'
]

export default function Sobre() {
  return (
    <section id="tarologa">
      <div style={{ maxWidth: 1300, margin: '0 auto', padding: 'clamp(60px, 8vw, 96px) clamp(16px, 4vw, 48px)' }}>
        <SectionLabel text="A Taróloga" num="// 01" />

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 'clamp(40px, 8vw, 80px)',
          alignItems: 'start',
          marginTop: 0,
        }} className="md:grid-cols-2">
          {/* Esquerda */}
          <div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(0.8rem, 2vw, 1.4rem)',
              fontWeight: 400,
              lineHeight: 1.5,
              marginBottom: 28,
              color: 'var(--ink)',
            }}>
              Taróloga de<br />exatas.{' '}
              <em style={{ fontStyle: 'normal', color: 'var(--neon)' }}>Sem<br />contradição.</em>
            </h2>

            <p style={{ fontSize: '0.78rem', lineHeight: 1.9, color: 'var(--muted)', marginBottom: 16 }}>
              Programadora de dia. Taróloga quando as cartas chamam.
            </p>
            <p style={{ fontSize: '0.78rem', lineHeight: 1.9, color: 'var(--muted)', marginBottom: 16 }}>
              Se você acha que tarot é só “sentir”, <strong style={{ color: 'var(--ink)', fontWeight: 400 }}>já começou errado.</strong> E se acha que dá pra viver só na lógica, também.
            </p>
            <p style={{ fontSize: '0.78rem', lineHeight: 1.9, color: 'var(--muted)', marginBottom: 16 }}>Eu uno os dois: intuição com estrutura, emoção com direção e leitura que você realmente consegue aplicar — <strong style={{ color: 'var(--ink)', fontWeight: 400 }}>não só refletir e esquecer depois.</strong></p>
            <p style={{ fontSize: '0.78rem', lineHeight: 1.9, color: 'var(--muted)', marginBottom: 16 }}>Se você questiona tudo, mas mesmo assim se sente meio travada, talvez o problema não seja falta de resposta — é falta de direcionamento.</p>
            <p style={{ fontSize: '0.78rem', lineHeight: 1.9, color: 'var(--muted)', marginBottom: 16 }}><strong style={{ color: 'var(--ink)', fontWeight: 400 }}>E é isso que a gente resolve aqui.</strong></p>

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
              fontFamily: 'var(--font-body)',
              fontStyle: 'italic',
              fontSize: '1rem',
              fontWeight: 400,
              lineHeight: 1.7,
              color: 'var(--ink)',
              marginBottom: 12,
            }}>
              &quot;Eu só posso lhe mostrar a porta. Você é quem tem que atravessá-la.&quot;
            </p>

            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.56rem', fontWeight: 700,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'var(--muted)',
              display: 'block',
              marginBottom: 28,
            }}>
              {`// Morpheus, Matrix`}
            </span>

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
