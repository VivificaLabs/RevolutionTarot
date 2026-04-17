'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

// ── Tipos ─────────────────────────────────────────────────────────────────────

type Status = 'ok' | 'erro' | 'aviso'

interface CheckResult {
  nome:     string
  status:   Status
  detalhe:  string
  latencia?: number
}

interface HealthResponse {
  timestamp: string
  resumo:    { total: number; ok: number; aviso: number; erro: number }
  checks:    CheckResult[]
}

// ── Helpers visuais ───────────────────────────────────────────────────────────

const COR: Record<Status, string> = {
  ok:    '#7dd4a8',
  aviso: '#e8c97a',
  erro:  '#ff2d78',
}

const ICONE: Record<Status, string> = {
  ok:    '✓',
  aviso: '⚠',
  erro:  '✗',
}

const BG_BORDER: Record<Status, { bg: string; border: string }> = {
  ok:    { bg: 'rgba(125,212,168,0.04)', border: 'rgba(125,212,168,0.2)' },
  aviso: { bg: 'rgba(232,201,122,0.05)', border: 'rgba(232,201,122,0.2)' },
  erro:  { bg: 'rgba(255,45,120,0.05)',  border: 'rgba(255,45,120,0.25)' },
}

function agrupar(checks: CheckResult[]): Record<string, CheckResult[]> {
  const grupos: Record<string, CheckResult[]> = {}
  for (const c of checks) {
    const cat = c.nome.startsWith('ENV')
      ? 'Variáveis de ambiente'
      : c.nome.split(' · ')[0]
    if (!grupos[cat]) grupos[cat] = []
    grupos[cat].push(c)
  }
  return grupos
}

function statusGrupo(checks: CheckResult[]): Status {
  if (checks.some(c => c.status === 'erro'))  return 'erro'
  if (checks.some(c => c.status === 'aviso')) return 'aviso'
  return 'ok'
}

// ── Componente ────────────────────────────────────────────────────────────────

export default function HealthcheckClient() {
  const router = useRouter()
  const [dados, setDados]     = useState<HealthResponse | null>(null)
  const [rodando, setRodando] = useState(false)
  const [erro, setErro]       = useState('')
  const [abertos, setAbertos] = useState<Record<string, boolean>>({})

  const rodar = useCallback(async () => {
    setRodando(true)
    setErro('')
    setDados(null)

    try {
      // Sem headers de token — a autenticação é feita via cookie httpOnly
      const res = await fetch('/api/admin/healthcheck')

      if (res.status === 401) {
        // Sessão expirou — redireciona para login
        router.push('/admin/login')
        return
      }

      if (res.status === 429) {
        setErro('Demasiadas tentativas. Aguarda um momento.')
        return
      }

      const json: HealthResponse = await res.json()
      setDados(json)

      // Abre automaticamente grupos com erro ou aviso
      const novosAbertos: Record<string, boolean> = {}
      for (const [nome, checks] of Object.entries(agrupar(json.checks))) {
        novosAbertos[nome] = statusGrupo(checks) !== 'ok'
      }
      setAbertos(novosAbertos)
    } catch (e) {
      setErro(`Erro de rede: ${String(e)}`)
    } finally {
      setRodando(false)
    }
  }, [router])

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  const grupos  = dados ? agrupar(dados.checks) : {}
  const tudo_ok = dados?.resumo.erro === 0 && dados?.resumo.aviso === 0
  const ts      = dados
    ? new Date(dados.timestamp).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'medium' })
    : null

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      padding: '56px 48px',
      fontFamily: "'Space Mono', monospace",
    }}>
      <div style={{ maxWidth: 780, margin: '0 auto' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 24, height: 1, background: 'var(--cyan)' }} />
              <span style={{ fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--cyan)' }}>
                Admin · Healthcheck
              </span>
            </div>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
              fontWeight: 300,
              fontStyle: 'italic',
              color: 'var(--ink)',
              lineHeight: 1.2,
            }}>
              Estado dos serviços
            </h1>
          </div>

          <button
            onClick={logout}
            style={{
              background: 'transparent',
              color: 'var(--muted)',
              border: '1px solid var(--border)',
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.6rem',
              letterSpacing: '0.1em',
              padding: '7px 14px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--magenta)'; e.currentTarget.style.borderColor = 'var(--magenta)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}
          >
            [ sair ]
          </button>
        </div>

        {/* ── Botão verificar ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <button
            onClick={rodar}
            disabled={rodando}
            style={{
              background: rodando ? 'rgba(0,245,212,0.3)' : 'var(--cyan)',
              color: 'var(--bg)',
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              border: 'none',
              padding: '12px 28px',
              cursor: rodando ? 'wait' : 'pointer',
              clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
              transition: 'background 0.2s',
            }}
          >
            {rodando ? '[ a verificar... ]' : '[ verificar tudo ]'}
          </button>

          {ts && (
            <span style={{ fontSize: '0.6rem', color: 'var(--muted)' }}>
              última verificação: {ts}
            </span>
          )}
        </div>

        {/* ── Erro ── */}
        {erro && (
          <div style={{
            background: 'rgba(255,45,120,0.06)',
            border: '1px solid rgba(255,45,120,0.3)',
            padding: '12px 16px',
            marginBottom: 24,
            fontSize: '0.72rem',
            color: 'var(--magenta)',
          }}>
            ✗ {erro}
          </div>
        )}

        {/* ── Resumo ── */}
        {dados && (
          <div style={{
            background: tudo_ok ? 'rgba(125,212,168,0.06)' : 'rgba(255,45,120,0.06)',
            border: `1px solid ${tudo_ok ? 'rgba(125,212,168,0.25)' : 'rgba(255,45,120,0.25)'}`,
            padding: '14px 18px',
            marginBottom: 28,
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            flexWrap: 'wrap',
          }}>
            <span style={{ color: tudo_ok ? '#7dd4a8' : 'var(--magenta)', fontWeight: 700, fontSize: '0.76rem' }}>
              {tudo_ok ? '✓ Tudo operacional' : `✗ ${dados.resumo.erro} erro(s)`}
            </span>
            <div style={{ display: 'flex', gap: 18, fontSize: '0.65rem' }}>
              <span style={{ color: '#7dd4a8' }}>✓ {dados.resumo.ok} ok</span>
              {dados.resumo.aviso > 0 && <span style={{ color: '#e8c97a' }}>⚠ {dados.resumo.aviso} avisos</span>}
              {dados.resumo.erro  > 0 && <span style={{ color: '#ff2d78' }}>✗ {dados.resumo.erro} erros</span>}
            </div>
          </div>
        )}

        {/* ── Grupos colapsáveis ── */}
        {Object.entries(grupos).map(([categoria, checks]) => {
          const st     = statusGrupo(checks)
          const aberto = abertos[categoria] ?? false
          const { bg, border } = BG_BORDER[st]

          return (
            <div key={categoria} style={{ marginBottom: 3 }}>
              <button
                onClick={() => setAbertos(a => ({ ...a, [categoria]: !a[categoria] }))}
                style={{
                  width: '100%',
                  background: bg,
                  border: `1px solid ${border}`,
                  borderBottom: aberto ? 'none' : `1px solid ${border}`,
                  padding: '13px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: "'Space Mono', monospace",
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: COR[st], fontWeight: 700 }}>{ICONE[st]}</span>
                  <span style={{ color: 'var(--ink)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em' }}>
                    {categoria}
                  </span>
                  <span style={{ color: 'var(--muted)', fontSize: '0.6rem' }}>
                    {checks.filter(c => c.status === 'ok').length}/{checks.length}
                  </span>
                </div>
                <span style={{ color: 'var(--muted)', fontSize: '0.65rem' }}>{aberto ? '▲' : '▼'}</span>
              </button>

              {aberto && (
                <div style={{ border: `1px solid ${border}`, borderTop: 'none' }}>
                  {checks.map((c, i) => (
                    <div key={i} style={{
                      padding: '11px 16px 11px 38px',
                      borderBottom: i < checks.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      display: 'grid',
                      gridTemplateColumns: '14px 1fr auto',
                      gap: '0 12px',
                      alignItems: 'start',
                      background: 'rgba(0,0,0,0.12)',
                    }}>
                      <span style={{ color: COR[c.status], fontSize: '0.68rem', fontWeight: 700, paddingTop: 2 }}>
                        {ICONE[c.status]}
                      </span>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--ink)', marginBottom: 3 }}>
                          {c.nome.replace(/^(ENV · |Stripe · |Cal\.com · |Supabase · )/, '')}
                        </div>
                        <div style={{ fontSize: '0.63rem', color: 'var(--muted)', lineHeight: 1.5 }}>
                          {c.detalhe}
                        </div>
                      </div>
                      {c.latencia !== undefined && (
                        <span style={{
                          fontSize: '0.56rem',
                          color: c.latencia < 500 ? 'var(--muted)' : c.latencia < 1500 ? '#e8c97a' : '#ff2d78',
                          whiteSpace: 'nowrap',
                          paddingTop: 3,
                        }}>
                          {c.latencia}ms
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        <div style={{ marginTop: 48, fontSize: '0.55rem', color: 'rgba(168,144,144,0.3)', textAlign: 'center' }}>
          Revolution Tarot · Admin · Sessão expira em 2h
        </div>
      </div>
    </div>
  )
}
