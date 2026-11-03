import type { Metadata, Viewport } from 'next'
import RevoleiturasNavbar from '@/components/revoleituras/RevoleiturasNavbar'
import { REVOLEITURAS_URL } from '@/lib/contato'
import './revoleituras.css'

const TITLE = 'Revoleituras | Revolution Tarot'
const DESCRIPTION = 'Revoleituras, do Revolution Tarot.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: REVOLEITURAS_URL },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: REVOLEITURAS_URL,
    siteName: 'Revolution Tarot',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/images/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/images/og-image.png'],
  },
  // Página ainda com Lorem Ipsum: liberar a indexação quando o conteúdo real entrar
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: '#1f0308',
}

const LOREM = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
const LOREM_LONG = `${LOREM} Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`
const LOREM_SHORT = 'Dolor sit amet consectetur'

const BENEFICIOS = [
  'Um tema por mês, várias opções de livros',
  'Sugestões de obras audiovisuais para complementar os estudos',
  'Comunidade no WhatsApp para discussão',
  'Leitura e propagação do clube → gera desconto nas tiragens de Tarot',
]

// Glifo fa-check (Font Awesome Free, CC BY 4.0)
function IconCheck() {
  return (
    <svg viewBox="0 0 448 512" aria-hidden="true" className="rl-check">
      <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" />
    </svg>
  )
}

function SectionHeading({ num, title }: { num: string; title: string }) {
  return (
    <header className="rl-section-heading">
      <span className="rl-section-num">{`// ${num}`}</span>
      <h2>{title}</h2>
      <p className="rl-subtitle">{LOREM_SHORT}</p>
    </header>
  )
}

export default function RevoleiturasPage() {
  return (
    <div className="revoleituras" id="topo">
      <RevoleiturasNavbar />

      <main>
        <section className="rl-hero">
          <p className="rl-subtitle rl-hero-kicker">Clube do Livro</p>
          <h1 className="glitch-title">Revoleituras</h1>
          <p className="rl-hero-tagline">Chega de catarse política de 4 em 4 anos. A revolução começa agora.</p>

          <div className="rl-hero-columns">
            <div className="rl-hero-text">
              <p>E se a gente usar o poder da internet pra se organizar, ler juntos e discutir ideias progressistas? Enviesados pra esquerda, obviamente. ☭</p>
              <p>Todo mês teremos um tema central e sugestões de livros para lermos em conjunto e discutirmos ideias, pontos de vista e aprendermos juntos sobre aspectos políticos que talvez não sejam nossa zona de conforto, mas que sem dúvida precisam ser conhecidos para que não haja mais desespero nas próximas eleições.</p>
              <p className="rl-hero-signature">Organizado por Olivia Mattiazzo, programadora, taróloga, mestranda em Matemática e ansiosa por fazer a diferença.</p>
            </div>

            <aside className="rl-hero-box">
              <figure className="rl-quote">
                <blockquote>Uma ideia torna-se uma força material quando ganha as massas organizadas.</blockquote>
                <figcaption>{`// a partir de Karl Marx`}</figcaption>
              </figure>

              <ul className="rl-checklist">
                {BENEFICIOS.map(item => (
                  <li key={item}>
                    <IconCheck />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </section>

        <section id="como-funciona">
          <SectionHeading num="01" title="Como funciona" />
          <div className="rl-grid">
            {['01', '02', '03'].map(step => (
              <article key={step} className="rl-card">
                <span className="rl-section-num">{step}</span>
                <h3>Lorem ipsum</h3>
                <p>{LOREM}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="livro-do-mes">
          <SectionHeading num="02" title="Livro do Mês" />
          <div className="rl-book">
            <div className="rl-cover" aria-hidden="true">[ capa ]</div>
            <div>
              <h3>Lorem ipsum dolor</h3>
              <p>{LOREM_LONG}</p>
              <p>{LOREM}</p>
            </div>
          </div>
        </section>

        <section id="agenda">
          <SectionHeading num="03" title="Agenda" />
          <ul className="rl-agenda">
            {[1, 2, 3, 4].map(row => (
              <li key={row}>
                <span className="rl-agenda-date">00/00</span>
                <h3>Lorem ipsum</h3>
                <p>{LOREM_SHORT}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="proximos-meses">
          <SectionHeading num="04" title="Próximos meses" />
          <div className="rl-grid">
            {[1, 2, 3].map(month => (
              <article key={month} className="rl-card">
                <div className="rl-cover" aria-hidden="true">[ capa ]</div>
                <h3>Lorem ipsum</h3>
                <p>{LOREM}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
