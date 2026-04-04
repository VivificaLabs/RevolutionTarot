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
    titulo: 'Cirúrgica.',
    texto: 'Eu sou super cética, mas a leitura dela foi cirúrgica. Ela disse uma coisa que eu nunca tinha falado pra ninguém — e acertou em cheio. Saí da sessão com mais clareza do que esperava.',
    emoji: '👩‍💼',
    nome: 'Ana P. · Analista de dados',
  },
  {
    titulo: 'Finalmente uma tarologa direta.',
    texto: 'Finalmente uma tarologa que não fica em cima do muro. Ela olhou as cartas e disse: "isso aqui é sobre o trabalho, né?" Era exatamente isso. Sem rodeio, sem linguagem vaga.',
    emoji: '💻',
    nome: 'Renata M. · Engenheira',
  },
  {
    titulo: 'Saí com um plano de ação.',
    texto: 'Cheguei cética, saí com um plano de ação. Não esperava isso de uma tiragem de tarot — mas faz todo sentido com a abordagem dela. É diferente de tudo que já vi.',
    emoji: '📊',
    nome: 'Carol T. · Product Manager',
  },
  {
    titulo: 'Sem linguagem hermética.',
    texto: 'Direto ao ponto, sem aquela linguagem hermética que afasta quem não é do meio. Ela traduz as cartas de um jeito que qualquer pessoa analítica consegue absorver.',
    emoji: '🖥️',
    nome: 'Fernanda K. · Dev front-end',
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