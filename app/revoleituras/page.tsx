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
          <h1 className="glitch-title">Revoleituras</h1>
          <p className="rl-subtitle">{LOREM_SHORT}</p>
          <p className="rl-hero-text">{LOREM}</p>
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
