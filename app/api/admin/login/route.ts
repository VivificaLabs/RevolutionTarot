// app/api/admin/login/route.ts
//
// POST /api/admin/login
// body: { token: string }
//
// Valida o token e grava um cookie httpOnly.
// O token NUNCA mais precisa de sair do servidor após isto.

import { NextRequest, NextResponse } from 'next/server'
import {
  tokenSeguroIgual,
  rateLimitOk,
  getIp,
  logAuditoria,
  headersSeguranca,
  COOKIE_NAME,
  COOKIE_MAX_AGE,
} from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const ip = getIp(req)

  // Rate limit — 10 tentativas por minuto por IP
  if (!rateLimitOk(ip)) {
    logAuditoria('LOGIN_RATE_LIMITED', ip)
    return NextResponse.json(
      { erro: 'Demasiadas tentativas. Aguarda um momento.' },
      { status: 429, headers: headersSeguranca() }
    )
  }

  const body = await req.json().catch(() => ({}))
  const tokenRecebido  = typeof body.token === 'string' ? body.token : ''
  const adminToken     = process.env.ADMIN_TOKEN ?? ''

  if (!adminToken) {
    logAuditoria('LOGIN_ENV_MISSING', ip)
    return NextResponse.json(
      { erro: 'Configuração inválida no servidor.' },
      { status: 500, headers: headersSeguranca() }
    )
  }

  if (!tokenSeguroIgual(tokenRecebido, adminToken)) {
    logAuditoria('LOGIN_FALHOU', ip)
    // Mesma mensagem para token errado e token vazio — não dar dicas
    return NextResponse.json(
      { erro: 'Token inválido.' },
      { status: 401, headers: headersSeguranca() }
    )
  }

  logAuditoria('LOGIN_OK', ip)

  // Grava cookie httpOnly — o token não sai mais para o cliente
  const res = NextResponse.json({ ok: true }, { headers: headersSeguranca() })
  res.cookies.set(COOKIE_NAME, adminToken, {
    httpOnly: true,      // JavaScript do browser não pode ler
    secure:   true,      // Só em HTTPS (Vercel usa sempre HTTPS)
    sameSite: 'strict',  // Não enviado em requests cross-site
    maxAge:   COOKIE_MAX_AGE,
    path:     '/',       // Enviado para todas as requisições (protegido por sameSite strict)
  })

  return res
}

// Rejeita explicitamente outros métodos
export async function GET() {
  return NextResponse.json({ erro: 'Método não permitido.' }, { status: 405 })
}
