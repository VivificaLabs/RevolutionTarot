// lib/admin-auth.ts
// Utilitários de autenticação para as rotas admin.
// Nunca importar em componentes client.

import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { timingSafeEqual, createHash } from 'crypto'

// ── Constantes ────────────────────────────────────────────────────────────────

export const COOKIE_NAME    = '__rt_admin'
export const COOKIE_MAX_AGE = 60 * 60 * 2   // 2 horas em segundos

// ── Comparação em tempo constante ─────────────────────────────────────────────
// Evita ataques de timing side-channel.
// Usa hash dos dois valores para garantir buffers do mesmo tamanho.

export function tokenSeguroIgual(a: string, b: string): boolean {
  try {
    const ha = createHash('sha256').update(a).digest()
    const hb = createHash('sha256').update(b).digest()
    return timingSafeEqual(ha, hb)
  } catch {
    return false
  }
}

// ── Valida o cookie da sessão admin ───────────────────────────────────────────

export async function adminAutenticado(): Promise<boolean> {
  const jar        = await cookies()
  const cookie     = jar.get(COOKIE_NAME)
  const adminToken = process.env.ADMIN_TOKEN ?? ''

  if (!cookie?.value || !adminToken) return false
  return tokenSeguroIgual(cookie.value, adminToken)
}

// ── Rate limiting simples em memória ──────────────────────────────────────────
// Suficiente para um painel interno com tráfego mínimo.
// Em escala maior, substituir por Redis/Upstash.

interface Janela {
  count:    number
  resetEm:  number
}

const JANELAS = new Map<string, Janela>()
const LIMITE  = 10    // requests
const PERIODO = 60_000 // 1 minuto em ms

export function rateLimitOk(ip: string): boolean {
  const agora = Date.now()
  const janela = JANELAS.get(ip)

  if (!janela || agora > janela.resetEm) {
    JANELAS.set(ip, { count: 1, resetEm: agora + PERIODO })
    return true
  }

  if (janela.count >= LIMITE) return false

  janela.count++
  return true
}

export function getIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}

// ── Logging de auditoria ──────────────────────────────────────────────────────
// Escreve no console estruturado — na Vercel aparece nos Function Logs.
// Nunca loga o token.

export function logAuditoria(evento: string, ip: string, detalhe?: string) {
  const entry = {
    ts:      new Date().toISOString(),
    evento,
    ip,
    detalhe: detalhe ?? '',
  }
  // Em produção, podes enviar para Supabase ou serviço de logs externo
  console.log('[ADMIN AUDIT]', JSON.stringify(entry))
}

// ── Headers de segurança para respostas admin ─────────────────────────────────

export function headersSeguranca(): Record<string, string> {
  return {
    'Cache-Control':  'no-store, no-cache, must-revalidate',
    'Pragma':         'no-cache',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
  }
}

// Igual ao anterior mas sem X-Frame-Options — para rotas servidas dentro de iframes same-origin
export function headersSegurancaEmbeddable(): Record<string, string> {
  return {
    'Cache-Control':  'no-store, no-cache, must-revalidate',
    'Pragma':         'no-cache',
    'X-Content-Type-Options': 'nosniff',
  }
}

// ── Validações de formato das ENVs ────────────────────────────────────────────

interface ValidacaoEnv {
  nome:       string
  obrigatoria: boolean
  validar:    (val: string) => { ok: boolean; motivo: string }
}

export const VALIDACOES_ENV: ValidacaoEnv[] = [
  {
    nome: 'STRIPE_SECRET_KEY',
    obrigatoria: true,
    validar: v => ({
      ok:     v.startsWith('sk_live_') || v.startsWith('sk_test_'),
      motivo: v.startsWith('sk_live_')
        ? 'Formato válido · modo LIVE'
        : v.startsWith('sk_test_')
          ? 'Formato válido · modo TEST'
          : 'Formato inválido — deve começar com sk_live_ ou sk_test_',
    }),
  },
  {
    nome: 'STRIPE_WEBHOOK_SECRET',
    obrigatoria: true,
    validar: v => ({
      ok:     v.startsWith('whsec_'),
      motivo: v.startsWith('whsec_') ? 'Formato válido' : 'Deve começar com whsec_',
    }),
  },
  {
    nome: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    obrigatoria: true,
    validar: v => ({
      ok:     v.startsWith('pk_live_') || v.startsWith('pk_test_'),
      motivo: v.startsWith('pk_') ? 'Formato válido' : 'Deve começar com pk_live_ ou pk_test_',
    }),
  },
  {
    nome: 'CAL_API_KEY',
    obrigatoria: true,
    validar: v => ({
      ok:     v.startsWith('cal_live_') || v.startsWith('cal_test_') || v.length > 20,
      motivo: v.length > 20 ? 'Comprimento válido' : 'Chave demasiado curta',
    }),
  },
  {
    nome: 'NEXT_PUBLIC_SUPABASE_URL',
    obrigatoria: true,
    validar: v => {
      try {
        const url = new URL(v)
        const ok  = url.hostname.endsWith('.supabase.co') && url.protocol === 'https:'
        return { ok, motivo: ok ? 'URL válida' : 'Deve ser https://<id>.supabase.co' }
      } catch {
        return { ok: false, motivo: 'Não é uma URL válida' }
      }
    },
  },
  {
    nome: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    obrigatoria: true,
    validar: v => ({
      ok:     v.startsWith('eyJ') && v.length > 100,
      motivo: v.startsWith('eyJ') ? 'Formato JWT válido' : 'Não parece um JWT — verifica a chave',
    }),
  },
  {
    nome: 'SUPABASE_SERVICE_ROLE_KEY',
    obrigatoria: true,
    validar: v => ({
      ok:     v.startsWith('eyJ') && v.length > 100,
      motivo: v.startsWith('eyJ') ? 'Formato JWT válido' : 'Não parece um JWT — verifica a chave',
    }),
  },
  {
    nome: 'ADMIN_TOKEN',
    obrigatoria: true,
    validar: v => ({
      ok:     v.length >= 32,
      motivo: v.length >= 32
        ? 'Comprimento seguro'
        : `Curto demais (${v.length} chars) — gera com: openssl rand -base64 32`,
    }),
  },
]
