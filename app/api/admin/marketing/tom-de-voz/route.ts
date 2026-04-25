// app/api/admin/marketing/tom-de-voz/route.ts
// GET /api/admin/marketing/tom-de-voz
// Serve o guia de tom de voz — protegido por cookie de admin

import { readFileSync } from 'fs'
import { join } from 'path'
import { NextResponse } from 'next/server'
import { adminAutenticado, headersSegurancaEmbeddable } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const autenticado = await adminAutenticado()
  if (!autenticado) {
    return NextResponse.json({ erro: 'Não autorizado.' }, { status: 401 })
  }

  const html = readFileSync(
    join(process.cwd(), 'app/api/admin/marketing/guia-tom-de-voz-tarot.html'),
    'utf-8'
  )

  return new NextResponse(html, {
    headers: {
      ...headersSegurancaEmbeddable(),
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
}
