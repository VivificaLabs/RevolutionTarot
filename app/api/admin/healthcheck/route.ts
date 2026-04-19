// app/api/admin/healthcheck/route.ts
//
// GET /api/admin/healthcheck
// Autenticação via cookie httpOnly — sem tokens em headers ou query params.
// O client não precisa saber nem passar nenhum segredo.

import { NextRequest, NextResponse } from 'next/server'
import {
  adminAutenticado,
  rateLimitOk,
  getIp,
  logAuditoria,
  headersSeguranca,
  VALIDACOES_ENV,
} from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

// ── Tipos ─────────────────────────────────────────────────────────────────────

type Status = 'ok' | 'erro' | 'aviso'

interface CheckResult {
  nome:     string
  status:   Status
  detalhe:  string
  latencia?: number
}

// ── Helper: medir latência ────────────────────────────────────────────────────

async function medir<T>(fn: () => Promise<T>): Promise<{ resultado: T; ms: number }> {
  const t = Date.now()
  const resultado = await fn()
  return { resultado, ms: Date.now() - t }
}

// ── Checks ────────────────────────────────────────────────────────────────────

function checkEnvs(): CheckResult[] {
  return VALIDACOES_ENV.map(({ nome, validar }) => {
    const val = process.env[nome]

    if (!val) {
      return { nome: `ENV · ${nome}`, status: 'erro' as Status, detalhe: 'Não definida' }
    }

    const { ok, motivo } = validar(val)
    return {
      nome:    `ENV · ${nome}`,
      status:  ok ? 'ok' : 'aviso' as Status,
      // Nunca mostra o valor — só o resultado da validação
      detalhe: ok ? `Definida · ${motivo}` : `Definida mas inválida: ${motivo}`,
    }
  })
}

async function checkStripe(): Promise<CheckResult[]> {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return [{ nome: 'Stripe · Conectividade', status: 'erro', detalhe: 'Chave não definida' }]

  try {
    const { resultado, ms } = await medir(async () => {
      const res = await fetch('https://api.stripe.com/v1/balance', {
        headers: { Authorization: `Bearer ${key}` },
      })
      return { ok: res.ok, data: await res.json() }
    })

    if (!resultado.ok) {
      return [{ nome: 'Stripe · Conectividade', status: 'erro', detalhe: resultado.data?.error?.message ?? 'Erro desconhecido' }]
    }

    // Informa modo sem mostrar prefixo da chave
    const modoLive = key.startsWith('sk_live_')
    return [
      {
        nome:     'Stripe · Conectividade',
        status:   'ok',
        detalhe:  `Conectado · ${modoLive ? '🔴 modo LIVE — pagamentos reais' : '🟡 modo TEST — pagamentos simulados'}`,
        latencia: ms,
      },
    ]
  } catch (e) {
    return [{ nome: 'Stripe · Conectividade', status: 'erro', detalhe: `Erro de rede: ${String(e)}` }]
  }
}

// Substituição parcial do app/api/admin/healthcheck/route.ts
// Apenas as funções checkCalCom foram atualizadas para v2.
// O resto do ficheiro permanece igual.
//
// Migrado de Cal.eu API v1 → v2
// v1 base: https://api.cal.eu/v1      (descomissionada)
// v2 base: https://api.cal.eu/v2      (atual)
async function checkCalCom(): Promise<CheckResult[]> {
  const token = process.env.CAL_API_KEY
  if (!token) return [{ nome: 'Cal.eu · Conectividade', status: 'erro', detalhe: 'Chave não definida' }]

  const resultados: CheckResult[] = []

  // ── Conectividade: GET /v2/me ─────────────────────────────────────────────
  try {
    const { resultado, ms } = await medir(async () => {
      const res = await fetch('https://api.cal.eu/v2/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return { ok: res.ok, status: res.status, data: await res.json() }
    })

    if (!resultado.ok) {
      resultados.push({
        nome:    'Cal.eu · Conectividade',
        status:  'erro',
        detalhe: resultado.data?.error?.message ?? resultado.data?.message ?? `HTTP ${resultado.status}`,
      })
    } else {
      resultados.push({
        nome:     'Cal.eu · Conectividade',
        status:   'ok',
        detalhe:  'Conectado',
        latencia: ms,
      })
    }
  } catch (e) {
    resultados.push({ nome: 'Cal.eu · Conectividade', status: 'erro', detalhe: `Erro de rede: ${String(e)}` })
    return resultados
  }

  // ── Event Types: GET /v2/event-types ─────────────────────────────────────
  try {
    const { resultado } = await medir(async () => {
      const res = await fetch('https://api.cal.eu/v2/event-types', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return res.json()
    })

    // v2 resposta: { status: "success", data: [ ...eventTypes ] }
    const tipos = resultado.data ?? []
    resultados.push({
      nome:    'Cal.eu · Event Types',
      status:  tipos.length > 0 ? 'ok' : 'aviso',
      detalhe: tipos.length > 0
        ? `${tipos.length} event type(s) configurado(s)`
        : 'Nenhum event type criado — cria em cal.eu/event-types',
    })
  } catch {
    resultados.push({ nome: 'Cal.eu · Event Types', status: 'aviso', detalhe: 'Não foi possível verificar' })
  }

  return resultados
}

async function checkSupabase(): Promise<CheckResult[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    return [{ nome: 'Supabase · Conexão', status: 'erro', detalhe: 'URL ou chave não definidas' }]
  }

  const resultados: CheckResult[] = []

  // Conexão base
  try {
    const { resultado, ms } = await medir(async () => {
      const res = await fetch(`${url}/rest/v1/`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
      })
      return { ok: res.ok, status: res.status }
    })

    resultados.push({
      nome:     'Supabase · Conexão',
      status:   resultado.ok ? 'ok' : 'erro',
      detalhe:  resultado.ok ? 'Projeto acessível' : `HTTP ${resultado.status}`,
      latencia: ms,
    })

    if (!resultado.ok) return resultados
  } catch (e) {
    resultados.push({ nome: 'Supabase · Conexão', status: 'erro', detalhe: String(e) })
    return resultados
  }

  // Tabelas — só confirma existência, sem contar registos
  for (const tabela of ['cupons', 'agendamentos', 'clientes']) {
    try {
      const { resultado } = await medir(async () => {
        const res = await fetch(
          `${url}/rest/v1/${tabela}?select=id&limit=1`,
          { headers: { apikey: key, Authorization: `Bearer ${key}` } }
        )
        return { ok: res.ok, status: res.status }
      })

      resultados.push({
        nome:    `Supabase · tabela ${tabela}`,
        status:  resultado.ok ? 'ok' : 'erro',
        detalhe: resultado.ok
          ? 'Tabela acessível'
          : resultado.status === 404
            ? 'Tabela não encontrada — executa o schema.sql'
            : `HTTP ${resultado.status}`,
      })
    } catch (e) {
      resultados.push({ nome: `Supabase · tabela ${tabela}`, status: 'erro', detalhe: String(e) })
    }
  }

  return resultados
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const ip = getIp(req)

  // Rate limit
  if (!rateLimitOk(ip)) {
    logAuditoria('HEALTHCHECK_RATE_LIMITED', ip)
    return NextResponse.json(
      { erro: 'Demasiadas tentativas.' },
      { status: 429, headers: headersSeguranca() }
    )
  }

  // Autenticação via cookie — o client não passa nenhum segredo
  const autenticado = await adminAutenticado()
  if (!autenticado) {
    logAuditoria('HEALTHCHECK_NAO_AUTORIZADO', ip)
    return NextResponse.json(
      { erro: 'Não autorizado.' },
      { status: 401, headers: headersSeguranca() }
    )
  }

  logAuditoria('HEALTHCHECK_OK', ip)

  const [envChecks, stripeChecks, calChecks, supabaseChecks] = await Promise.all([
    Promise.resolve(checkEnvs()),
    checkStripe(),
    checkCalCom(),
    checkSupabase(),
  ])

  const todos = [...envChecks, ...stripeChecks, ...calChecks, ...supabaseChecks]

  const resumo = {
    total: todos.length,
    ok:    todos.filter(c => c.status === 'ok').length,
    aviso: todos.filter(c => c.status === 'aviso').length,
    erro:  todos.filter(c => c.status === 'erro').length,
  }

  return NextResponse.json(
    { timestamp: new Date().toISOString(), resumo, checks: todos },
    { headers: headersSeguranca() }
  )
}

// Rejeita outros métodos
export async function POST() {
  return NextResponse.json({ erro: 'Método não permitido.' }, { status: 405, headers: headersSeguranca() })
}
