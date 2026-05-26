
export default function Hero() {
  return (
    <section id="home" style={{
      minHeight: 'calc(100vh - 64px)',
      paddingTop: 'clamp(40px, 8vw, 100px)',
      paddingBottom: 'clamp(40px, 8vw, 80px)',
      paddingLeft: 'clamp(16px, 4vw, 48px)',
      paddingRight: 'clamp(16px, 4vw, 48px)',
      marginTop: 64,
      display: 'grid',
      gridTemplateColumns: 'clamp(1fr, 100%, 1.1fr 0.9fr)',
      gap: 'clamp(32px, 8vw, 64px)',
      alignItems: 'center',
      maxWidth: 1300,
      margin: '64px auto 0',
      position: 'relative',
    }} className="md:grid-cols-[1.1fr_0.9fr]">

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

      {/* Scan line animada */}
      <div style={{
        position: 'absolute',
        left: 0, right: 0,
        height: 1,
        background: 'linear-gradient(90deg, transparent, var(--cyan), transparent)',
        opacity: 0.35,
        animation: 'scanline 7s linear infinite',
        pointerEvents: 'none',
        zIndex: 2,
      }} />

      {/* Coluna esquerda */}
      <div style={{ animation: 'fadeUp 0.8s ease both', position: 'relative', zIndex: 1 }}>

        {/* Eyebrow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{ width: 32, height: 1, background: 'var(--cyan)' }} />
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.56rem', fontWeight: 700,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'var(--cyan)',
          }}>
            Revolution Tarot · Status: ONLINE
          </span>
        </div>

        {/* Citação */}
        <div style={{ borderLeft: '2px solid var(--neon)', paddingLeft: 20, marginBottom: 40 }}>
          <blockquote style={{
            fontFamily: 'var(--font-body)',
            fontStyle: 'italic',
            fontSize: 'clamp(1rem, 2vw, 1.3rem)',
            fontWeight: 400,
            lineHeight: 1.7,
            color: 'var(--ink)',
            marginBottom: 8,
          }}>
            &quot;Você não veio aqui para fazer a escolha. Você já a fez. Você está aqui para tentar entender por que a fez.&quot;
          </blockquote>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.56rem', fontWeight: 700,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'var(--muted)',
          }}>
            {`Oráculo, Matrix Reloaded`}
          </span>
        </div>

        {/* H1 com glitch */}
        <h1 className="glitch-title" style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.4rem, 4vw, 3rem)',
          fontWeight: 400,
          lineHeight: 1.3,
          marginBottom: 24,
          color: 'var(--ink)',
        }}>
          Tarot pra quem
          <span style={{
            display: 'block',
            color: 'var(--cyan)',
          }}>
            já sabe.
          </span>
        </h1>

        {/* Subtítulo */}
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.9rem',
          lineHeight: 1.85,
          color: 'var(--muted)',
          maxWidth: 460,
          marginBottom: 44,
        }}>
          Sem enrolação. Sem promessa mágica, mas com muita magia. Uma leitura{' '}
          <em style={{ color: 'var(--ink)', fontStyle: 'normal' }}>direta e acolhedora</em>{' '}
          — pra você entender o que já sente, mas ainda não conseguiu nomear.
        </p>

        {/* Botões */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <a href="#agendar" style={{
            background: 'var(--magenta)',
            color: '#fff',
            padding: '14px 30px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.62rem',
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
            fontFamily: 'var(--font-mono)',
            fontSize: '0.62rem',
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
              { size: 280, color: 'rgba(0,245,212,0.15)',   duration: '20s', dir: 'normal'  },
              { size: 200, color: 'rgba(176,38,255,0.18)',  duration: '12s', dir: 'reverse' },
              { size: 130, color: 'rgba(255,45,120,0.25)',  duration: '8s',  dir: 'normal'  },
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

            {/* Foto com efeito glitch ocasional */}
            <div style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              width: 'clamp(160px, 40vw, 240px)',
              height: 'clamp(240px, 60vw, 360px)',
              border: '1px solid rgba(176,38,255,0.35)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <img
                src="/images/photo.jpg"
                alt="Foto da tarotoga"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  display: 'block',
                }}
              />
            </div>

            {/* Cantos decorativos */}
            {[
              { pos: { top: 12, left: 12 },    text: 'REV//\nTAR'    },
              { pos: { top: 12, right: 12 },   text: 'V.2\n025'      },
              { pos: { bottom: 12, left: 12 }, text: '∞ sys\nonline' },
              { pos: { bottom: 12, right: 12 },text: '38°\n∆∇'       },
            ].map(({ pos, text }, i) => (
              <div key={i} style={{
                position: 'absolute', ...pos,
                fontSize: '0.48rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--faint)',
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
            { text: '// dev + tarologa',      style: { top: 40,    left: -10  }, anim: 'float1 4s ease-in-out infinite',        color: 'var(--cyan)',    border: 'rgba(0,245,212,0.4)',   bg: 'rgba(0,245,212,0.05)',   font: 'var(--font-mono)',  italic: false },
            { text: '100+ tiragens',           style: { bottom: 80, right: -16 }, anim: 'float2 5s ease-in-out infinite',        color: 'var(--magenta)', border: 'rgba(255,45,120,0.4)',  bg: 'rgba(255,45,120,0.05)', font: 'var(--font-mono)',  italic: false },
            { text: 'sem bullshit gratiluz',   style: { bottom: 30, left: 4   }, anim: 'float1 5s 1s ease-in-out infinite',     color: 'var(--accent)',  border: 'rgba(78,204,163,0.35)', bg: 'rgba(78,204,163,0.05)', font: 'var(--font-body)',  italic: true  },
          ].map(({ text, style, anim, color, border, bg, font, italic }, i) => (
            <div key={i} style={{
              position: 'absolute', ...style,
              fontFamily: font,
              fontStyle: italic ? 'italic' : 'normal',
              fontSize: italic ? '0.75rem' : '0.56rem',
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
