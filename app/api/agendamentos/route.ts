// app/api/agendamentos/route.ts
// POST /api/agendamentos
// Cria ou atualiza cliente + regista agendamento no Supabase
// Chamado pelo wizard após confirmação de pagamento

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function logInfo(step: string, data: unknown) {
  console.log(`[AGENDAMENTOS] ${new Date().toISOString()} | ${step}`,
    typeof data === 'string' ? data : JSON.stringify(data, null, 2))
}

function logError(step: string, error: unknown) {
  console.error(`[AGENDAMENTOS_ERROR] ${new Date().toISOString()} | ${step}`,
    error instanceof Error
      ? { message: error.message, stack: error.stack }
      : JSON.stringify(error, null, 2))
}

export async function POST(req: NextRequest) {
  try {
    logInfo('REQUEST_START', { url: req.url, method: req.method })
    
    const body = await req.json()
    logInfo('REQUEST_BODY_PARSED', { 
      keys: Object.keys(body),
      email: body.email,
      nome: body.nome,
      tiragemNome: body.tiragemNome,
      metodoPagamento: body.metodoPagamento,
    })

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
      // Cal.eu (preenchido após criar o booking)
      calBookingId, calBookingUid,
    } = body

    // Validação básica
    if (!nome?.trim() || !email?.trim()) {
      logInfo('VALIDATION_FAILED', { nome, email })
      return NextResponse.json({ error: 'Nome e email são obrigatórios' }, { status: 400 })
    }

    // ── 1. Upsert cliente ────────────────────────────────────────
    logInfo('CLIENTE_CHECK_START', { email })
    
    const { data: clienteExistente, error: erroSelect } = await supabase
      .from('clientes')
      .select('id')
      .eq('email', email)
      .single()

    if (erroSelect && erroSelect.code !== 'PGRST116') {
      // PGRST116 = no rows found (esperado para novo cliente)
      logError('CLIENTE_SELECT', erroSelect)
      return NextResponse.json({ error: `Erro ao buscar cliente: ${erroSelect.message}` }, { status: 500 })
    }

    logInfo('CLIENTE_CHECK_RESULT', { existe: !!clienteExistente, clienteId: clienteExistente?.id })

    let clienteId: string | null = clienteExistente?.id ?? null

    if (!clienteId) {
      logInfo('CLIENTE_INSERT_START', { nome, email, canal, contato })
      
      const { data: novoCliente, error: erroCliente } = await supabase
        .from('clientes')
        .insert({ nome, email, canal, contato })
        .select('id')
        .single()

      if (erroCliente) {
        logError('CLIENTE_INSERT_FAILED', erroCliente)
        return NextResponse.json({ error: `Erro ao criar cliente: ${erroCliente.message}` }, { status: 500 })
      }

      clienteId = novoCliente.id
      logInfo('CLIENTE_INSERT_SUCCESS', { clienteId })
    } else {
      logInfo('CLIENTE_UPDATE_START', { clienteId, nome, canal, contato })
      
      // Atualiza nome e contato se já existe
      const { error: erroUpdate } = await supabase
        .from('clientes')
        .update({ nome, canal, contato })
        .eq('id', clienteId)

      if (erroUpdate) {
        logError('CLIENTE_UPDATE_FAILED', erroUpdate)
        // Não retornar erro aqui, continuar mesmo que update falhe
      } else {
        logInfo('CLIENTE_UPDATE_SUCCESS', { clienteId })
      }
    }

    // ── 2. Cria agendamento ──────────────────────────────────────
    logInfo('AGENDAMENTO_INSERT_START', { 
      clienteId, 
      tiragemNome, 
      email,
      dataAgendada,
      metodoPagamento,
      totalBrl,
    })

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

    if (erroAg) {
      logError('AGENDAMENTO_INSERT_FAILED', erroAg)
      return NextResponse.json({ error: `Erro ao registar agendamento: ${erroAg.message}` }, { status: 500 })
    }

    logInfo('AGENDAMENTO_INSERT_SUCCESS', { agendamentoId: agendamento.id })

    // ── 3. Incrementa uso do cupom (se aplicado) ─────────────────
    if (cupomCodigo) {
      logInfo('CUPOM_INCREMENT_START', { cupomCodigo })
      
      const { error: erroCupom } = await supabase.rpc('incrementar_uso_cupom', { 
        p_codigo: cupomCodigo 
      })

      if (erroCupom) {
        logError('CUPOM_INCREMENT_FAILED', erroCupom)
        // Não retornar erro, pois agendamento já foi salvo
      } else {
        logInfo('CUPOM_INCREMENT_SUCCESS', { cupomCodigo })
      }
    }

    logInfo('REQUEST_SUCCESS', { agendamentoId: agendamento.id, clienteId })
    return NextResponse.json({ agendamentoId: agendamento.id })
  } catch (error) {
    logError('REQUEST_FATAL_ERROR', error)
    return NextResponse.json({ 
      error: 'Erro ao processar agendamento', 
      detail: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
