'use client'

import { useState } from 'react'
import { SITE_URL } from '@/lib/contato'

const NAV_LINKS = [
  { label: 'Como funciona',  href: '#como-funciona'  },
  { label: 'Livro do Mês',   href: '#livro-do-mes'   },
  { label: 'Agenda',         href: '#agenda'         },
  { label: 'Próximos meses', href: '#proximos-meses' },
]

export default function RevoleiturasNavbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <nav className="rl-nav">
      <a href="#topo" className="rl-nav-title" onClick={closeMenu}>Revoleituras</a>

      <ul className="rl-nav-links">
        {NAV_LINKS.map(({ label, href }) => (
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
            {NAV_LINKS.map(({ label, href }) => (
              <li key={href}><a href={href} onClick={closeMenu}>{label}</a></li>
            ))}
          </ul>
          <a href={SITE_URL} className="rl-nav-back-mobile">← Voltar ao Revolution Tarot</a>
        </div>
      )}
    </nav>
  )
}
