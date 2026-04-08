// app/api/agendamentos/route.ts
// POST /api/agendamentos
// Cria ou atualiza cliente + regista agendamento no Supabase
// Chamado pelo wizard após confirmação de pagamento

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const {
    // Step 1
    tiragemId, tiragemNome, idioma, urgencia, moeda,
    precoBrl, cupomCodigo, cupomDesconto, totalBrl,
    // Step 2
    dataAgendada, horaLisboa, periodo, fusoCliente,
    // Step 3
    nome, email, canal, contato, indicadoPor, nota,
    // Step 4
    metodoPagamento, stripePaymentId,
    // Cal.com (preenchido após criar o booking)
    calBookingId, calBookingUid,
  } = body

  // ── 1. Upsert cliente ────────────────────────────────────────
  const { data: clienteExistente } = await supabase
    .from('clientes')
    .select('id')
    .eq('email', email)
    .single()

  let clienteId: string | null = clienteExistente?.id ?? null

  if (!clienteId) {
    const { data: novoCliente, error: erroCliente } = await supabase
      .from('clientes')
      .insert({ nome, email, canal, contato })
      .select('id')
      .single()

    if (erroCliente)
      return NextResponse.json({ error: 'Erro ao criar cliente.' }, { status: 500 })

    clienteId = novoCliente.id
  } else {
    // Atualiza nome e contato se já existe
    await supabase
      .from('clientes')
      .update({ nome, canal, contato })
      .eq('id', clienteId)
  }

  // ── 2. Cria agendamento ──────────────────────────────────────
  const { data: agendamento, error: erroAg } = await supabase
    .from('agendamentos')
    .insert({
      cliente_id:       clienteId,
      nome_cliente:     nome,
      email_cliente:    email,
      canal_cliente:    canal,
      contato_cliente:  contato,
      tiragem_id:       tiragemId,
      tiragem_nome:     tiragemNome,
      idioma,
      urgencia:         urgencia ?? false,
      data_agendada:    dataAgendada,
      hora_lisboa:      horaLisboa ?? null,
      periodo:          periodo ?? null,
      fuso_cliente:     fusoCliente ?? 'Europe/Lisbon',
      moeda,
      preco_brl:        precoBrl,
      cupom_codigo:     cupomCodigo || null,
      cupom_desconto:   cupomDesconto ?? 0,
      total_brl:        totalBrl,
      metodo_pagamento: metodoPagamento,
      stripe_payment_id: stripePaymentId ?? null,
      pago:             metodoPagamento === 'cartao' ? true : false,
      cal_booking_id:   calBookingId ?? null,
      cal_booking_uid:  calBookingUid ?? null,
      indicado_por:     indicadoPor || null,
      nota:             nota || null,
      status:           'pendente',
    })
    .select('id')
    .single()

  if (erroAg)
    return NextResponse.json({ error: 'Erro ao registar agendamento.' }, { status: 500 })

  // ── 3. Incrementa uso do cupom (se aplicado) ─────────────────
  if (cupomCodigo) {
    await supabase.rpc('incrementar_uso_cupom', { p_codigo: cupomCodigo })
  }

  return NextResponse.json({ agendamentoId: agendamento.id })
}
