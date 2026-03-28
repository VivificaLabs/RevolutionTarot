import SectionLabel from '../ui/SectionLabel'
import HoverCard from '../ui/HoverCard'

const DEPOIMENTOS_MINI = [
  { texto: '"Finalmente uma tarologa que não fica em cima do muro. Ela disse: \'isso aqui é sobre o trabalho, né?\' Era exatamente isso."', autor: '// Renata M. · Engenheira' },
  { texto: '"Cheguei cética, saí com um plano de ação. Não esperava isso de uma tiragem de tarot."',                                       autor: '// Carol T. · Product Manager' },
  { texto: '"Direto ao ponto, sem aquela linguagem hermética que afasta quem não é do meio."',                                              autor: '// Fernanda K. · Dev front-end' },
]

const miniBase = { background: 'var(--bg)', padding: '18px 20px', transition: 'background 0.2s' }
const miniHover = { background: 'rgba(0,245,212,0.03)' }

export default function Depoimentos() {
  return (
    <section id="depoimentos">
      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '96px 48px' }}>
        <SectionLabel text="O que dizem" num="// 03" />
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 64, alignItems: 'start', marginTop: 40 }}>

          <div>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.5rem, 2.5vw, 2.1rem)',
              fontStyle: 'italic', fontWeight: 300, lineHeight: 1.4, color: 'var(--ink)', marginBottom: 28, position: 'relative',
            }}>
              <span style={{ position: 'absolute', top: -20, left: -20, fontSize: '5rem', color: 'rgba(0,245,212,0.12)', fontFamily: "'Cormorant Garamond', serif", lineHeight: 1, pointerEvents: 'none' }}>&quot;</span>
              Eu sou super cética, mas a leitura dela foi cirúrgica. Ela disse uma coisa que eu nunca tinha falado pra ninguém.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.68rem' }}>
              <div style={{ width: 36, height: 36, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>👩‍💼</div>
              <div>
                <span style={{ color: 'var(--ink)', fontWeight: 700, display: 'block', marginBottom: 2 }}>Ana P.</span>
                <span style={{ color: 'var(--muted)' }}>Analista de dados · São Paulo</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--border)' }}>
            {DEPOIMENTOS_MINI.map(({ texto, autor }) => (
              <HoverCard key={autor} baseStyle={miniBase} hoverStyle={miniHover}>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.95rem', color: 'var(--muted)', lineHeight: 1.65, fontStyle: 'italic', marginBottom: 10 }}>{texto}</p>
                <div style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--cyan)' }}>{autor}</div>
              </HoverCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
