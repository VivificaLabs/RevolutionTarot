export default function Hero() {
  return (
    <section id="home" style={{
      minHeight: '100vh',
      padding: '100px 48px 80px',
      display: 'grid',
      gridTemplateColumns: '1.1fr 0.9fr',
      gap: 64,
      alignItems: 'center',
      maxWidth: 1300,
      margin: '0 auto',
      position: 'relative',
    }}>

      {/* Grid de fundo */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(0,245,212,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,245,212,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
        pointerEvents: 'none',
      }} />

      {/* Coluna esquerda */}
      <div style={{ animation: 'fadeUp 0.8s ease both', position: 'relative', zIndex: 1 }}>

        {/* Eyebrow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{ width: 32, height: 1, background: 'var(--cyan)' }} />
          <span style={{
            fontSize: '0.62rem', fontWeight: 700,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'var(--cyan)',
          }}>
            Revolution Tarot · Sistema ativo
          </span>
        </div>

        {/* Citação */}
        <div style={{ borderLeft: '2px solid var(--gold)', paddingLeft: 20, marginBottom: 40 }}>
          <blockquote style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            fontSize: 'clamp(1.3rem, 2.2vw, 1.8rem)',
            fontWeight: 300,
            lineHeight: 1.45,
            color: 'var(--ink)',
            marginBottom: 8,
          }}>
            &quot;Você não veio aqui para fazer a escolha. Você já a fez. Você está aqui para tentar entender por que a fez.&quot;
          </blockquote>
          <span style={{
            fontSize: '0.6rem', fontWeight: 700,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'var(--muted)',
          }}>
            {/* Oráculo, Matrix */}
          </span>
        </div>

        {/* H1 com efeito glitch via CSS class definida em globals */}
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(3rem, 5.5vw, 5.5rem)',
          fontWeight: 600,
          lineHeight: 0.95,
          letterSpacing: '-0.01em',
          marginBottom: 24,
          color: 'var(--ink)',
        }}>
          Tarot pra quem
          <span style={{
            display: 'block',
            color: 'var(--cyan)',
            fontStyle: 'italic',
            fontWeight: 300,
            position: 'relative',
          }}>
            já sabe.
          </span>
        </h1>

        {/* Subtítulo */}
        <p style={{
          fontSize: '0.82rem',
          lineHeight: 1.85,
          color: 'var(--muted)',
          maxWidth: 460,
          marginBottom: 44,
        }}>
          Sem enrolação. Sem promessa mágica. Uma leitura{' '}
          <em style={{ color: 'var(--ink)', fontStyle: 'normal' }}>direta e acolhedora</em>{' '}
          — pra você entender o que já sente, mas ainda não conseguiu nomear.
        </p>

        {/* Botões */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <a href="#agendar" style={{
            background: 'var(--magenta)',
            color: '#fff',
            padding: '14px 30px',
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            display: 'inline-block',
            clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
            transition: 'all 0.2s',
          }}>
            Quero minha tiragem
          </a>
          <a href="#catalogo" style={{
            background: 'transparent',
            color: 'var(--ink)',
            padding: '14px 26px',
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.7rem',
            fontWeight: 400,
            letterSpacing: '0.08em',
            border: '1px solid var(--border2)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.2s',
          }}>
            Ver consultas →
          </a>
        </div>
      </div>

      {/* Coluna direita — Sigil animado */}
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        animation: 'fadeUp 0.8s 0.15s ease both',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ position: 'relative', width: 380, height: 500 }}>

          {/* Container externo */}
          <div style={{
            position: 'absolute', inset: 0,
            border: '1px solid rgba(0,245,212,0.2)',
            borderRadius: 2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {/* Anéis rotativos */}
            {[
              { size: 280, color: 'rgba(0,245,212,0.15)',   duration: '20s',          dir: 'normal'  },
              { size: 200, color: 'rgba(201,168,76,0.2)',   duration: '12s',          dir: 'reverse' },
              { size: 130, color: 'rgba(255,45,120,0.25)',  duration: '8s',           dir: 'normal'  },
            ].map((ring, i) => (
              <div key={i} style={{
                position: 'absolute',
                width: ring.size, height: ring.size,
                borderRadius: '50%',
                border: `1px solid ${ring.color}`,
                top: '50%', left: '50%',
                animation: `spin ${ring.duration} linear infinite`,
                animationDirection: ring.dir as 'normal' | 'reverse',
              }} />
            ))}

            {/* Carta de tarot */}
            <div style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              width: 160, height: 270,
              background: 'linear-gradient(160deg, #2a0a28 0%, #150113 100%)',
              border: '1px solid rgba(201,168,76,0.35)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                position: 'absolute', inset: 6,
                border: '1px solid rgba(201,168,76,0.1)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 14,
              }}>
                <span style={{ fontSize: '0.65rem', fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, letterSpacing: '0.3em', color: 'rgba(201,168,76,0.6)' }}>II</span>
                <span style={{ fontSize: '2.8rem', animation: 'cardglow 3s ease-in-out infinite' }}>🌙</span>
                <span style={{ fontSize: '0.55rem', fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', letterSpacing: '0.15em', color: 'rgba(201,168,76,0.55)' }}>A Sacerdotisa</span>
              </div>
            </div>

            {/* Cantos decorativos */}
            {[
              { pos: { top: 12, left: 12 },                text: 'REV//\nTAR'    },
              { pos: { top: 12, right: 12 },               text: 'V.2\n025'      },
              { pos: { bottom: 12, left: 12 },             text: '∞ sys\nonline' },
              { pos: { bottom: 12, right: 12 },            text: '38°\n∆∇'       },
            ].map(({ pos, text }, i) => (
              <div key={i} style={{
                position: 'absolute', ...pos,
                fontSize: '0.55rem',
                fontFamily: "'Space Mono', monospace",
                color: 'rgba(0,245,212,0.35)',
                lineHeight: 1,
                whiteSpace: 'pre',
                textAlign: i % 2 !== 0 ? 'right' : 'left',
              }}>
                {text}
              </div>
            ))}
          </div>

          {/* Badges flutuantes */}
          {[
            { text: '// dev + tarologa',        style: { top: 40,   left: -10 }, anim: 'float1 4s ease-in-out infinite',   color: 'var(--cyan)',    border: 'rgba(0,245,212,0.4)',   bg: 'rgba(0,245,212,0.05)'   },
            { text: '200+ tiragens',             style: { bottom: 80,right: -16 }, anim: 'float2 5s ease-in-out infinite', color: 'var(--magenta)', border: 'rgba(255,45,120,0.4)',  bg: 'rgba(255,45,120,0.05)'  },
            { text: 'sem bullshit espiritual',   style: { bottom: 30,left: 4   }, anim: 'float1 5s 1s ease-in-out infinite',color: 'var(--gold)',   border: 'rgba(201,168,76,0.35)', bg: 'rgba(201,168,76,0.05)', font: "'Cormorant Garamond', serif", italic: true },
          ].map(({ text, style, anim, color, border, bg, font, italic }, i) => (
            <div key={i} style={{
              position: 'absolute', ...style,
              fontFamily: font ?? "'Space Mono', monospace",
              fontStyle: italic ? 'italic' : 'normal',
              fontSize: italic ? '0.7rem' : '0.6rem',
              padding: '7px 12px',
              border: `1px solid ${border}`,
              color,
              background: bg,
              backdropFilter: 'blur(8px)',
              animation: anim,
            }}>
              {text}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
