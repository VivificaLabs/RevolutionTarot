'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const NAV_LINKS = [
  { label: 'Catálogo',    href: '#catalogo'    },
  { label: 'O que dizem', href: '#depoimentos' },
  { label: 'Agende já',   href: '#agendar'     },
  { label: 'A Tarologa',  href: '#tarologa'    },
  { label: 'FAQ',         href: '#faq'         },
  { label: 'Blog',        href: '#blog'        },
  { label: 'Produtos',    href: '#produtos'    },
]

function IconWhatsApp() {
  return (
    <svg viewBox="0 0 24 24" style={{ width: 13, height: 13, fill: 'currentColor' }}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" style={{ width: 13, height: 13, fill: 'currentColor' }}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  )
}

function IconTikTok() {
  return (
    <svg viewBox="0 0 24 24" style={{ width: 13, height: 13, fill: 'currentColor' }}>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.17 8.17 0 004.78 1.52V6.78a4.85 4.85 0 01-1.01-.09z" />
    </svg>
  )
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      zIndex: 200,
      padding: 'clamp(12px, 2vw, 24px) clamp(16px, 4vw, 40px)',
      height: 'auto',
      minHeight: 64,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: 'rgba(36,3,33,0.92)',
      backdropFilter: 'blur(20px)',
      borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      transition: 'border-color 0.3s',
    }}>

      {/* Logo */}
      <Link href="/" style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 'clamp(0.9rem, 2.5vw, 1.15rem)',
        fontStyle: 'italic',
        fontWeight: 600,
        color: 'var(--ink)',
        textDecoration: 'none',
        letterSpacing: '0.04em',
        whiteSpace: 'nowrap',
      }}>
        Revolution Tarot
        <span style={{ fontSize: '0.6rem', color: 'var(--cyan)', marginLeft: 6, verticalAlign: 'super', fontStyle: 'normal' }}>⊕</span>
      </Link>

      {/* Links centrais — Escondido em mobile */}
      <ul style={{ 
        gap: 28, 
        listStyle: 'none', 
        alignItems: 'center' 
      }} className="hidden md:flex">
        {NAV_LINKS.map(({ label, href }) => (
          <li key={href}>
            <a href={href} style={{
              fontSize: '0.62rem',
              fontWeight: 400,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--cyan)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>

      {/* Social + CTA — Escondido em mobile */}
      <div className="hidden md:flex">
        <div style={{ display: 'flex', gap: 8, marginRight: 14 }}>
          {[
            { label: 'WhatsApp', icon: <IconWhatsApp />, href: 'http://wa.me/351939189631' },
            { label: 'Instagram', icon: <IconInstagram />, href: 'https://instagram.com/revolution.tarot' },
            { label: 'TikTok', icon: <IconTikTok />, href: 'https://tiktok.com/@revolution.tarot' },
          ].map(({ label, icon, href }) => (
            <a key={label} href={href} aria-label={label} target="_blank" rel="noopener noreferrer" style={{
              width: 28, height: 28,
              border: '1px solid rgba(0,245,212,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--muted)',
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--cyan)'; e.currentTarget.style.color = 'var(--cyan)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,245,212,0.2)'; e.currentTarget.style.color = 'var(--muted)' }}
            >
              {icon}
            </a>
          ))}
        </div>

        <a href="#agendar" style={{
          background: 'transparent',
          color: 'var(--cyan)',
          padding: '7px 16px',
          fontFamily: "'Space Mono', monospace",
          fontSize: '0.62rem',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          textDecoration: 'none',
          border: '1px solid var(--cyan)',
          transition: 'all 0.2s',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--cyan)'; e.currentTarget.style.color = 'var(--bg)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--cyan)' }}
        >
          [ agendar ]
        </a>
      </div>

      {/* Botão Hamburger — Visível apenas em mobile */}
      <button 
        onClick={() => setMenuOpen(!menuOpen)}
        style={{
          display: menuOpen ? 'none' : 'flex',
          flexDirection: 'column',
          gap: 5,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          zIndex: 201,
        }}
        className="md:hidden"
      >
        <div style={{ width: 24, height: 2, background: 'var(--cyan)', transition: 'all 0.3s' }} />
        <div style={{ width: 20, height: 2, background: 'var(--cyan)', transition: 'all 0.3s' }} />
        <div style={{ width: 24, height: 2, background: 'var(--cyan)', transition: 'all 0.3s' }} />
      </button>

      {/* Menu Mobile — Overlay */}
      {menuOpen && (
        <div style={{
          position: 'fixed',
          top: 64,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(36,3,33,0.96)',
          backdropFilter: 'blur(20px)',
          zIndex: 199,
          padding: '32px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 64px)',
        }}>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {NAV_LINKS.map(({ label, href }) => (
              <li key={href}>
                <a 
                  href={href} 
                  onClick={closeMenu}
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--ink)',
                    textDecoration: 'none',
                    display: 'block',
                    paddingBottom: 8,
                    borderBottom: '1px solid rgba(0,245,212,0.15)',
                  }}>
                  {label}
                </a>
              </li>
            ))}
          </ul>

          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(0,245,212,0.2)' }}>
            <a href="#agendar" onClick={closeMenu} style={{
              background: 'var(--cyan)',
              color: 'var(--bg)',
              padding: '12px 20px',
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              display: 'inline-block',
              transition: 'all 0.2s',
            }}>
              Agende Sua Leitura
            </a>
          </div>

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(0,245,212,0.2)' }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[
                { label: 'WhatsApp', icon: <IconWhatsApp />, href: 'http://wa.me/351939189631' },
                { label: 'Instagram', icon: <IconInstagram />, href: 'https://instagram.com/revolution.tarot' },
                { label: 'TikTok', icon: <IconTikTok />, href: 'https://tiktok.com/@revolution.tarot' },
              ].map(({ label, icon, href }) => (
                <a key={label} href={href} aria-label={label} target="_blank" rel="noopener noreferrer" style={{
                  width: 32, height: 32,
                  border: '1px solid var(--cyan)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--cyan)',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  backgroundColor: 'rgba(0,245,212,0.05)',
                }}>
                  {icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Botão Fechar — Visível quando menu está aberto */}
      {menuOpen && (
        <button 
          onClick={() => setMenuOpen(false)}
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            width: 32,
            height: 32,
            background: 'rgba(0,245,212,0.1)',
            border: '1px solid var(--cyan)',
            color: 'var(--cyan)',
            fontSize: '1.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 202,
            transition: 'all 0.2s',
          }}
          className="md:hidden"
        >
          ✕
        </button>
      )}
    </nav>
  )
}
