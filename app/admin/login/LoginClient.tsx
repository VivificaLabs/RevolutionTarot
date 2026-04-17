'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginClient() {
  const router = useRouter()
  const [token, setToken]       = useState('')
  const [erro, setErro]         = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token }),
      })

      if (res.ok) {
        // Token validado — cookie httpOnly gravado pelo servidor
        // O token não fica em memória nem em URL a partir daqui
        setToken('')
        router.push('/admin/healthcheck')
      } else {
        const data = await res.json()
        setErro(data.erro ?? 'Token inválido.')
      }
    } catch {
      setErro('Erro de rede. Tenta novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Space Mono', monospace",
      padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 380 }}>

        {/* Header */}
        <div style={{ marginBottom: 36, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 20, height: 1, background: 'var(--cyan)' }} />
            <span style={{ fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--cyan)' }}>
              Admin
            </span>
            <div style={{ width: 20, height: 1, background: 'var(--cyan)' }} />
          </div>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '1.8rem',
            fontWeight: 300,
            fontStyle: 'italic',
            color: 'var(--ink)',
            lineHeight: 1.2,
          }}>
            Acesso restrito
          </h1>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: 'block',
              fontSize: '0.6rem',
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--cyan)',
              marginBottom: 8,
            }}>
              Token de acesso
            </label>
            <input
              type="password"
              value={token}
              onChange={e => setToken(e.target.value)}
              autoComplete="off"
              autoFocus
              required
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.3)',
                border: `1px solid ${erro ? 'var(--magenta)' : 'var(--border)'}`,
                color: 'var(--ink)',
                fontFamily: "'Space Mono', monospace",
                fontSize: '0.78rem',
                padding: '12px 14px',
                outline: 'none',
                transition: 'border-color 0.2s',
                caretColor: 'var(--cyan)',
              }}
              onFocus={e => { if (!erro) e.currentTarget.style.borderColor = 'var(--cyan)' }}
              onBlur={e => { if (!erro) e.currentTarget.style.borderColor = 'var(--border)' }}
            />
          </div>

          {erro && (
            <div style={{
              fontSize: '0.68rem',
              color: 'var(--magenta)',
              marginBottom: 16,
              padding: '8px 12px',
              background: 'rgba(255,45,120,0.06)',
              border: '1px solid rgba(255,45,120,0.25)',
            }}>
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !token}
            style={{
              width: '100%',
              background: loading || !token ? 'rgba(0,245,212,0.3)' : 'var(--cyan)',
              color: 'var(--bg)',
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              border: 'none',
              padding: '13px',
              cursor: loading || !token ? 'not-allowed' : 'pointer',
              clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
              transition: 'background 0.2s',
            }}
          >
            {loading ? '[ a verificar... ]' : '[ entrar ]'}
          </button>
        </form>

      </div>
    </div>
  )
}
