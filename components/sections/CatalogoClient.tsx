'use client'

import { useState } from 'react'

// ── Tipos ────────────────────────────────────────────────────────────────────

type Moeda = 'BRL' | 'USD' | 'EUR'

interface Consulta {
  num: string
  nome: string
  subtitulo: string
  descCurta: string
  descLonga: string
  exemplos: string[]
  precoBRL: number
  orcamento?: boolean
}

// ── Dados ────────────────────────────────────────────────────────────────────

const CONSULTAS: Consulta[] = [
  {
    num: '// 001',
    nome: 'Zoom no Caos',
    subtitulo: 'Tiragem por área',
    descCurta: 'Escolhe uma parte da sua vida que tá precisando de atenção e deixa as cartas entregarem o exposed.',
    descLonga: 'Sabe quando a vida, num geral, tá boa, mas tem uma partezinha específica incomodando? A gente vai abrir o baralho pensando nela. Pode ser sua espiritualidade, relacionamentos, financeiro, profissional, decisões... ou até mesmo autoconhecimento num geral. Você me conta o que tá acontecendo e eu vejo o que está sendo sinalizado. O foco é específico, mas o impacto é profundo.',
    exemplos: [
      'Como está meu profissional no momento? O que tá travando minha promoção? Ou é melhor eu voltar a olhar pro mercado de trabalho?',
      'Tô solteire e doida pra arranjar um namorade. O que as cartas dizem sobre a minha vida amorosa? Como eu atraio um relacionamento saudável pra mim?',
      'Ando meio perdida financeiramente... parece que o dinheiro nunca fica. Quais hábitos tóxicos que eu tô mantendo e preciso deixar pra lá? O que eu preciso mudar pra melhorar minha relação com dinheiro?',
    ],
    precoBRL: 150,
  },
  {
    num: '// 002',
    nome: 'Tarot Express',
    subtitulo: 'Tiragem objetiva',
    descCurta: 'Quando a pergunta é simples, mas a resposta... nem sempre. Uma tiragem mais compacta, mas com profundidade.',
    descLonga: 'Você tem uma situação específica na cabeça e não quer análise longa — quer saber o que as cartas têm a dizer sobre aquilo agora. Papo retíssimo, focado no que é urgente. Ideal pra quem precisa de uma resposta direta para uma questão que precisa ser resolvida logo.',
    exemplos: [
      'Surgiu uma proposta de compra de apartamento incrível. Devo fechar o negócio?',
      'Recebi um ultimato: preciso decidir se vou pra um intercâmbio ou não. E aí?',
      'O meu crush supremo me chamou pra sair. O que eu posso esperar desse date?',
    ],
    precoBRL: 60,
  },
  {
    num: '// 003',
    nome: 'Spoilers Controlados',
    subtitulo: 'Tiragem periódica para 3 meses',
    descCurta: 'O futuro chega rapidinho, então é bom estar preparada. Uma leitura com tendências e alertas para os próximos 90 dias.',
    descLonga: 'A ideia dessa tiragem é saber quais são as energias, os temas e os pontos de atenção que vão estar presentes nos próximos meses, assim você consegue se preparar, aproveitar as oportunidades e se blindar de perrengues. É uma leitura mais estratégica, pra quem quer ter um norte pra seguir, mas sem depender de tiragem toda semana.',
    exemplos: [
      'Tenho planos para uma viagem nos próximos meses. Qual seria o mais propício pra isso?',
      'Que tipos de obstáculos posso esperar para os próximos meses do ano?',
      'Quais energias vão estar mais fortes na minha vida nos próximos dias? Quais conselhos o Tarot tem pra lidar com elas?',
    ],
    precoBRL: 120,
  },
  {
    num: '// 004',
    nome: 'Diagnóstico Místico',
    subtitulo: 'Tiragem geral',
    descCurta: 'Pra quem tá perdida no personagem. Vasculhamos as principais áreas da sua vida pra entender o que tá te travando.',
    descLonga: 'É a tiragem pra quem quer algo mais amplo, uma olhada mais abrangente na vida toda: racional, emocional, criativo, material, espiritual e um conselho final. O objetivo é entender o que pode estar bloqueado e o que está radiando mais forte atualmente, e como lidar com cada uma dessas situações. É o tipo de leitura que olha no fundo da sua alma e diz: "vamos conversar?".',
    exemplos: [
      'Sinto que tem coisas muito boas acontecendo, mas custando muito alto. O que pode ser?',
      'Queria um panorama geral da minha vida no momento, para entender onde posso investir porque está fluindo, e onde preciso prestar atenção porque tá travando.',
      'Nunca fiz uma leitura longa e quero experimentar esse formato. Assim posso entender melhor como funciona o processo e depois escolher algo mais específico conforme a necessidade.',
    ],
    precoBRL: 180,
  },
  {
    num: '// 005',
    nome: 'Ao vivásso',
    subtitulo: 'Videochamada - 50 minutos',
    descCurta: '50 minutos de trocação franca de perguntas e respostas. Livre mesmo: pode ser várias perguntas objetivas, uma área só... o que você preferir!',
    descLonga: 'A leitura acontece em tempo real, na videochamada. Você pode fazer perguntas, pedir que eu aprofunde em alguma carta, trazer contexto à medida que a leitura avança. É o formato mais dinâmico — e o que mais parece um papo de amiga que também lê cartas.',
    exemplos: [
      'Quero poder perguntar e interagir durante a leitura, não só depois.',
      'Tenho várias áreas da vida que quero checar ao mesmo tempo.',
      'Prefiro sentir a energia da leitura acontecendo ao vivo.',
    ],
    precoBRL: 600,
  },
  {
    num: '// 006',
    nome: 'Orçamento Personalizado',
    subtitulo: 'sob consulta',
    descCurta: 'Não achou o que precisava? Me conta o que você quer e a gente monta uma leitura sob medida.',
    descLonga: 'Às vezes o que você precisa não cabe num formato fixo. Talvez seja uma leitura pra duas pessoas, uma combinação de tiragens, um tema muito específico ou um ritual de fechamento de ciclo. Me conta o que você tem em mente e eu te digo quanto, como e quando.',
    exemplos: [
      'Quero fazer uma leitura conjunta com uma amiga sobre a nossa sociedade.',
      'Preciso de duas tiragens diferentes, mas que se complementam.',
      'Quero algo que não vi listado — uma leitura temática bem específica.',
    ],
    precoBRL: 0,
    orcamento: true,
  },
]

// ── Cotações (fixas por enquanto, depois virão de API) ───────────────────────

const COTACOES: Record<Moeda, number> = {
  BRL: 1,
  USD: 0.18,
  EUR: 0.17,
}

const SIMBOLOS: Record<Moeda, string> = {
  BRL: 'R$',
  USD: 'US$',
  EUR: '€',
}

// ── Componente principal ─────────────────────────────────────────────────────

export default function CatalogoClient() {
  const [moeda, setMoeda] = useState<Moeda>('BRL')
  const [modalAberto, setModalAberto] = useState<Consulta | null>(null)

  function formatarPreco(precoBRL: number): string {
    if (precoBRL === 0) return 'sob consulta'
    const valor = precoBRL * COTACOES[moeda]
    return `${SIMBOLOS[moeda]} ${valor.toLocaleString(moeda === 'BRL' ? 'pt-BR' : 'en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  }

  return (
    <>
      {/* Seletor de moeda global */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 40,
        marginTop: 8,
      }}>
        <span style={{ fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)' }}>
          moeda
        </span>
        {(['BRL', 'USD', 'EUR'] as Moeda[]).map(m => (
          <button
            key={m}
            onClick={() => setMoeda(m)}
            style={{
              background: moeda === m ? 'var(--cyan)' : 'transparent',
              color: moeda === m ? 'var(--bg)' : 'var(--muted)',
              border: `1px solid ${moeda === m ? 'var(--cyan)' : 'rgba(0,245,212,0.2)'}`,
              padding: '4px 12px',
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.62rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {SIMBOLOS[m]} {m}
          </button>
        ))}
      </div>

      {/* Grid de cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 1,
        background: 'var(--border)',
        border: '1px solid var(--border)',
      }}>
        {CONSULTAS.map(consulta => (
          <Card
            key={consulta.num}
            consulta={consulta}
            preco={formatarPreco(consulta.precoBRL)}
            onSaibaMais={() => setModalAberto(consulta)}
          />
        ))}
      </div>

      {/* Modal */}
      {modalAberto && (
        <Modal consulta={modalAberto} moeda={moeda} preco={formatarPreco(modalAberto.precoBRL)} onFechar={() => setModalAberto(null)} />
      )}
    </>
  )
}

// ── Card ─────────────────────────────────────────────────────────────────────

function Card({
  consulta,
  preco,
  onSaibaMais,
}: {
  consulta: Consulta
  preco: string
  onSaibaMais: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'rgba(255,45,120,0.04)' : 'var(--bg)',
        padding: '36px 28px',
        position: 'relative',
        cursor: 'default',
        transition: 'background 0.25s',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <span style={{
        fontSize: '0.58rem', fontWeight: 700,
        letterSpacing: '0.18em', color: 'var(--cyan)',
        marginBottom: 16, display: 'block',
      }}>
        {consulta.num}
      </span>

      <div style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: '1.7rem', fontStyle: 'italic',
        fontWeight: 300, color: 'var(--ink)',
        marginBottom: 6, lineHeight: 1.15,
      }}>
        {consulta.nome}
      </div>

      <span style={{
        fontSize: '0.6rem',
        fontWeight: 700,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: 'var(--muted)',
        display: 'block',
        marginBottom: 16,
      }}>
        {consulta.subtitulo}
      </span>

      <p style={{
        fontSize: '0.72rem', color: 'var(--muted)',
        lineHeight: 1.7, marginBottom: 24, flexGrow: 1,
      }}>
        {consulta.descCurta}
      </p>

      {/* Preço + seletor inline */}
      <div style={{ marginBottom: 20 }}>
        <div style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: consulta.orcamento ? '0.75rem' : '1rem',
          fontWeight: 700,
          color: consulta.orcamento ? 'var(--muted)' : 'var(--gold)',
          letterSpacing: consulta.orcamento ? '0.08em' : 0,
        }}>
          {preco}
        </div>
      </div>

      {/* Saiba mais */}
      <button
        onClick={onSaibaMais}
        style={{
          background: 'transparent',
          border: '1px solid rgba(0,245,212,0.25)',
          color: 'var(--cyan)',
          fontFamily: "'Space Mono', monospace",
          fontSize: '0.6rem',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          padding: '7px 0',
          cursor: 'pointer',
          width: '100%',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(0,245,212,0.06)'
          e.currentTarget.style.borderColor = 'var(--cyan)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.borderColor = 'rgba(0,245,212,0.25)'
        }}
      >
        saiba mais →
      </button>
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────

function Modal({
  consulta,
  preco,
  onFechar,
}: {
  consulta: Consulta
  moeda: Moeda
  preco: string
  onFechar: () => void
}) {
  return (
    <>
      {/* Overlay */}
      <div
        onClick={onFechar}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(15,0,14,0.85)',
          backdropFilter: 'blur(6px)',
          zIndex: 900,
          animation: 'fadeUp 0.2s ease both',
        }}
      />

      {/* Painel */}
      <div style={{
        position: 'fixed' as const,
        top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 901,
        pointerEvents: 'none',
      }}>
      <div style={{
        position: 'relative' as const,
        width: '90%', maxWidth: 640,
        maxHeight: '85vh',
        overflowY: 'auto',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        animation: 'fadeUp 0.25s ease both',
        padding: '48px 44px',
        pointerEvents: 'all',
      }}>
        {/* Linha de topo */}
        <div style={{
          position: 'absolute', top: 0, left: 24, right: 24,
          height: 2,
          background: 'linear-gradient(90deg, transparent, var(--cyan), transparent)',
        }} />

        {/* Fechar */}
        <button
          onClick={onFechar}
          style={{
            position: 'absolute', top: 20, right: 24,
            background: 'transparent',
            border: 'none',
            color: 'var(--muted)',
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.7rem',
            cursor: 'pointer',
            letterSpacing: '0.1em',
          }}
        >
          [ fechar ✕ ]
        </button>

        {/* Num */}
        <span style={{
          fontSize: '0.6rem', fontWeight: 700,
          letterSpacing: '0.2em', color: 'var(--cyan)',
          display: 'block', marginBottom: 10,
        }}>
          {consulta.num}
        </span>

        {/* Título */}
        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(2rem, 4vw, 2.8rem)',
          fontStyle: 'italic', fontWeight: 300,
          color: 'var(--ink)', lineHeight: 1.1,
          marginBottom: 8,
        }}>
          {consulta.nome}
        </h2>

        {/* Subtítulo */}
        <span style={{
          fontSize: '0.62rem',
          fontWeight: 700,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'var(--muted)',
          display: 'block',
          marginBottom: 20,
        }}>
          {consulta.subtitulo}
        </span>

        {/* Preço */}
        {!consulta.orcamento && (
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '1.1rem', fontWeight: 700,
            color: 'var(--gold)', marginBottom: 28,
          }}>
            {preco}
          </div>
        )}

        {/* Divisor */}
        <div style={{ height: 1, background: 'var(--border)', marginBottom: 28 }} />

        {/* Descrição longa */}
        <p style={{
          fontSize: '0.85rem', color: 'var(--muted)',
          lineHeight: 1.85, marginBottom: 36,
        }}>
          {consulta.descLonga}
        </p>

        {/* Exemplos */}
        <div style={{ marginBottom: 40 }}>
          <span style={{
            fontSize: '0.6rem', fontWeight: 700,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'var(--cyan)', display: 'block', marginBottom: 16,
          }}>
            {`// quando faz sentido`}
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {consulta.exemplos.map((ex, i) => (
              <div key={i} style={{
                display: 'flex', gap: 12, alignItems: 'flex-start',
                fontSize: '0.8rem', color: 'var(--ink)',
                lineHeight: 1.6,
                background: 'rgba(0,245,212,0.03)',
                border: '1px solid rgba(0,245,212,0.08)',
                padding: '12px 14px',
              }}>
                <span style={{ color: 'var(--magenta)', flexShrink: 0, fontWeight: 700 }}>→</span>
                {ex}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <a
          href={consulta.orcamento ? 'http://wa.me/351939189631' : '#agendar'}
          onClick={onFechar}
          style={{
            display: 'block',
            background: 'var(--magenta)',
            color: '#fff',
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            padding: '16px',
            textAlign: 'center',
            clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
            transition: 'all 0.2s',
          }}
        >
          {consulta.orcamento ? '[ entrar em contato ]' : '[ quero agendar ]'}
        </a>
      </div>
      </div>
    </>
  )
}