// app/api/cupom/route.ts
// POST /api/cupom  body: { codigo: string }
// Valida cupom contra o Supabase — substitui a lista hardcoded

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { codigo } = await req.json()

  if (!codigo || typeof codigo !== 'string')
    return NextResponse.json({ valido: false, desconto: 0 }, { status: 400 })

  const normalizado = codigo.trim().toUpperCase()

  const { data, error } = await supabase
    .from('cupons')
    .select('codigo, desconto, ativo, uso_maximo, uso_atual, expira_em')
    .eq('codigo', normalizado)
    .single()

  if (error || !data)
    return NextResponse.json({ valido: false, desconto: 0 })

  // Verificações
  if (!data.ativo)
    return NextResponse.json({ valido: false, desconto: 0, motivo: 'inativo' })

  if (data.expira_em && new Date(data.expira_em) < new Date())
    return NextResponse.json({ valido: false, desconto: 0, motivo: 'expirado' })

  if (data.uso_maximo !== null && data.uso_atual >= data.uso_maximo)
    return NextResponse.json({ valido: false, desconto: 0, motivo: 'esgotado' })

  return NextResponse.json({ valido: true, desconto: data.desconto })
}
