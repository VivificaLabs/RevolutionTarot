'use client'

import { useState, useEffect, useCallback } from 'react'
import SectionLabel from '../ui/SectionLabel'

// ── Dados ─────────────────────────────────────────────────────────────────────

interface Depoimento {
  titulo: string
  texto: string
  emoji: string
  nome: string
}

const DEPOIMENTOS: Depoimento[] = [
  {
    titulo: 'Cuidado e carinho.',
    texto: 'A Oli fez uma leitura pra mim durante um momento delicado e sinto que me ajudou a ver as coisas com muito mais clareza. Explicou com muito cuidado e carinho, fiquei encantada. Não tenho como recomendar mais!',
    emoji: '🫧',
    nome: 'Carol S. · Programadora',
  },
  {
    titulo: 'Me ajudando a tomar a decisão.',
    texto: 'Suas cartas me ajudaram a tomar a decisão que eu precisava. Você disse para eu fazer mais o que eu achava certo e pensar menos e fazer mais, e aí as dúvidas que eu tinha parece que foram esclarecidas. Obrigada!',
    emoji: '🚗',
    nome: 'Consulente · 2025',
  },
  {
    titulo: 'Explicações completinhas e fáceis de entender.',
    texto: 'Eu amo que seus áudios são sempre com explicações completinhas e fáceis de entender. As tiragens trimestrais tem me ajudado bastante mentalmente, meio que me preparando pra não surtar (ou surtar entendendo o surto).',
    emoji: '🧠',
    nome: 'Daniela M. · 2025',
  },
  {
    titulo: 'Aplicabilidade das cartas é incrível.',
    texto: 'Você sabe que sou um descrente nato, mas gosto muito de ouvir o que você fala porque a aplicabilidade que as cartas trazem é incrível, mas o que você fala transpassa o que consigo explicar. Obrigada pela leitura mais uma vez.',
    emoji: '🖥️',
    nome: 'Jean C. · Desenvolvedor de Software',
  },
  {
    titulo: 'La magia estuvo presente desde el primer momento.',
    texto: 'La magia estuvo presente desde el primer momento de la lectura, estoy impresionada. Me sentí muy contenta por el análisis y por la explicación tan acertada: ¡es que todo tenía que ver con mi vida y se entrelazaba de una manera increíble! Empática y asertivamente me hiciste ver aspectos interesantes de mi presente que aún no eran muy claros, ¡muchas gracias!',
    emoji: '👑',
    nome: 'Consulente · 2025',
  },
  {
    titulo: 'Me levaram às minhas melhores decisões de 2025.',
    texto: 'Todas as tiragens que eu fiz com você, TODAS desse ano, me levaram às minhas melhores decisões de 2025. E não foi só os rolês de "ai, vai dar certo", mas foram os conselhos de COMO também, da postura que eu tinha que ter em determinadas situações. Sério, você é impecável.',
    emoji: '💰',
    nome: 'Consulente · 2026',
  },
]

const INTERVALO_MS = 4000

// ── Componente principal ──────────────────────────────────────────────────────

export default function Depoimentos() {
  const [ativo, setAtivo] = useState(0)
  const [animando, setAnimando] = useState(false)

  const trocar = useCallback((index: number) => {
    if (index === ativo) return
    setAnimando(true)
    setTimeout(() => {
      setAtivo(index)
      setAnimando(false)
    }, 220)
  }, [ativo])

  // Carrossel automático
  useEffect(() => {
    const timer = setInterval(() => {
      setAtivo(prev => {
        const next = (prev + 1) % DEPOIMENTOS.length
        setAnimando(true)
        setTimeout(() => setAnimando(false), 220)
        return next
      })
    }, INTERVALO_MS)
    return () => clearInterval(timer)
  }, [])

  const d = DEPOIMENTOS[ativo]

  return (
    <section id="depoimentos">
      <div style={{ maxWidth: 1300, margin: '0 auto', padding: 'clamp(60px, 8vw, 96px) clamp(16px, 4vw, 48px)' }}>
        <SectionLabel text="O que dizem" num="// 03" />

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 'clamp(40px, 8vw, 64px)',
          alignItems: 'start',
          marginTop: 40,
        }} className="md:grid-cols-[1.2fr_0.8fr]">

          {/* ── Destaque ─────────────────────────────────────── */}
          <div style={{
            opacity: animando ? 0 : 1,
            transform: animando ? 'translateY(8px)' : 'translateY(0)',
            transition: 'opacity 0.22s ease, transform 0.22s ease',
          }}>

            {/* Frase título */}
            <p style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--cyan)',
              marginBottom: 16,
            }}>
              {d.titulo}
            </p>

            {/* Texto completo */}
            <div style={{ position: 'relative', marginBottom: 32 }}>
              <span style={{
                position: 'absolute',
                top: -20, left: -20,
                fontSize: '5rem',
                color: 'rgba(0,245,212,0.1)',
                fontFamily: "'Cormorant Garamond', serif",
                lineHeight: 1,
                pointerEvents: 'none',
                userSelect: 'none',
              }}>
                &quot;
              </span>
              <p style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'clamp(1.3rem, 2.2vw, 1.8rem)',
                fontStyle: 'italic',
                fontWeight: 300,
                lineHeight: 1.5,
                color: 'var(--ink)',
              }}>
                {d.texto}
              </p>
            </div>

            {/* Emoji + nome */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40,
                border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem',
                flexShrink: 0,
              }}>
                {d.emoji}
              </div>
              <span style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '0.62rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                color: 'var(--muted)',
              }}>
                {d.nome}
              </span>
            </div>

            {/* Indicadores de progresso */}
            <div style={{ display: 'flex', gap: 6, marginTop: 32 }}>
              {DEPOIMENTOS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => trocar(i)}
                  aria-label={`Ver depoimento ${i + 1}`}
                  style={{
                    height: 2,
                    width: i === ativo ? 28 : 12,
                    background: i === ativo ? 'var(--cyan)' : 'rgba(0,245,212,0.2)',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
            </div>
          </div>

          {/* ── Mini cards ───────────────────────────────────── */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            background: 'var(--border)',
            maxHeight: 350,
            overflowY: 'auto',
          }}>
            {DEPOIMENTOS.map(({ titulo, nome }, i) => (
              <MiniCard
                key={i}
                titulo={titulo}
                nome={nome}
                ativo={i === ativo}
                onClick={() => trocar(i)}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}

// ── Mini card ─────────────────────────────────────────────────────────────────

function MiniCard({
  titulo,
  nome,
  ativo,
  onClick,
}: {
  titulo: string
  nome: string
  ativo: boolean
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: ativo
          ? 'rgba(0,245,212,0.06)'
          : hovered ? 'rgba(0,245,212,0.03)' : 'var(--bg)',
        borderLeft: ativo
          ? '2px solid var(--cyan)'
          : '2px solid transparent',
        padding: '18px 20px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      <p style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: '1rem',
        fontStyle: 'italic',
        color: ativo ? 'var(--ink)' : 'var(--muted)',
        lineHeight: 1.4,
        marginBottom: 8,
        transition: 'color 0.2s',
      }}>
        {titulo}
      </p>
      <div style={{
        fontSize: '0.58rem',
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: ativo ? 'var(--cyan)' : 'rgba(0,245,212,0.4)',
        transition: 'color 0.2s',
      }}>
        {nome}
      </div>
    </div>
  )
}