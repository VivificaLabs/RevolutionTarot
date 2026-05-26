'use client'

import { useRef } from 'react'
import BookingWizard from './BookingWizard'

export default function CtaFinal() {
  const wizardRef = useRef<HTMLDivElement>(null)

  function scrollParaWizard() {
    wizardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section id="agendar">

      {/* ── Intro / CTA ──────────────────────────────────────── */}
      <div style={{
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center',
        padding: '96px 48px',
        borderTop: '1px solid var(--border)',
      }}>
        {/* Glow de fundo */}
        <div style={{
          position: 'absolute',
          top: -100, left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 600,
          background: 'radial-gradient(circle, rgba(255,45,120,0.08) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />

        {/* Texto fantasma */}
        <div style={{
          position: 'absolute',
          bottom: -20, left: '50%', transform: 'translateX(-50%)',
          fontFamily: 'var(--font-display)',
          fontSize: '10rem',
          fontWeight: 600,
          color: 'rgba(255,255,255,0.02)',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          letterSpacing: '-0.02em',
          userSelect: 'none',
        }}>
          REVOLUTION
        </div>

        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(0.8rem, 2.5vw, 1.6rem)',
          fontWeight: 400,
          lineHeight: 1.5,
          color: 'var(--ink)',
          marginBottom: 16,
          position: 'relative', zIndex: 1,
        }}>
          Tá na hora de entender<br />
          o que você{' '}
          <strong style={{ fontWeight: 600, color: 'var(--magenta)', fontStyle: 'normal' }}>
            já sabe.
          </strong>
        </h2>

        <p style={{
          fontSize: '0.78rem',
          color: 'var(--muted)',
          maxWidth: 460,
          margin: '0 auto 40px',
          lineHeight: 1.85,
          position: 'relative', zIndex: 1,
        }}>
          Agenda uma tiragem. A gente olha junto — sem drama, sem bullshit,
          com as cartas que você precisa ouvir.
        </p>

        <button
          onClick={scrollParaWizard}
          style={{
            background: 'var(--magenta)',
            color: '#fff',
            padding: '17px 44px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            border: 'none',
            cursor: 'pointer',
            display: 'inline-block',
            clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
            transition: 'opacity 0.2s',
            position: 'relative', zIndex: 1,
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          [ quero minha tiragem ]
        </button>
      </div>

      {/* ── Wizard ───────────────────────────────────────────── */}
      <div ref={wizardRef}>
        <BookingWizard />
      </div>

    </section>
  )
}