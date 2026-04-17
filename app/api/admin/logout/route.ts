// app/api/admin/logout/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { headersSeguranca, COOKIE_NAME, logAuditoria, getIp } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  logAuditoria('LOGOUT', getIp(req))

  const res = NextResponse.json({ ok: true }, { headers: headersSeguranca() })
  res.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure:   true,
    sameSite: 'strict',
    maxAge:   0,       // expira imediatamente
    path:     '/',
  })
  return res
}
