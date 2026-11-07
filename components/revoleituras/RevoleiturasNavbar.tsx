'use client'

import { useState } from 'react'
import { SITE_URL } from '@/lib/contato'

const NAV_LINKS = [
  { label: 'Como Funciona', href: '#como-funciona' },
  { label: 'Agenda',        href: '#agenda'        },
  { label: 'Livro do Mês',  href: '#livro-do-mes'  },
  { label: 'Em Breve',      href: '#em-breve'      },
  { label: 'Acervo',        href: '#acervo'        },
  { label: 'FAQ e regras',  href: '#faq-regras'    },
]

export default function RevoleiturasNavbar({ ocultos }: { ocultos: string[] }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const links = NAV_LINKS.filter(({ href }) => !ocultos.includes(href))

  const closeMenu = () => setMenuOpen(false)

  return (
    <nav className="rl-nav">
      <a href="#topo" className="rl-nav-title" onClick={closeMenu}>Revoleituras</a>

      <ul className="rl-nav-links">
        {links.map(({ label, href }) => (
          <li key={href}><a href={href}>{label}</a></li>
        ))}
      </ul>

      <a href={SITE_URL} className="rl-nav-back">← Voltar ao Revolution Tarot</a>

      <button
        type="button"
        className="rl-nav-toggle"
        aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(open => !open)}
      >
        {menuOpen ? '✕' : '☰'}
      </button>

      {menuOpen && (
        <div className="rl-nav-mobile">
          <ul>
            {links.map(({ label, href }) => (
              <li key={href}><a href={href} onClick={closeMenu}>{label}</a></li>
            ))}
          </ul>
          <a href={SITE_URL} className="rl-nav-back-mobile">← Voltar ao Revolution Tarot</a>
        </div>
      )}
    </nav>
  )
}
