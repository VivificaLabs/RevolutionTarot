// app/api/agendamentos/update-cal/route.ts
// PATCH /api/agendamentos/update-cal
// 
// Atualiza os IDs do Cal.eu (calBookingId e calBookingUid) em um agendamento existente
// Útil para recuperação após falha na criação do evento no Cal.eu

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function logInfo(step: string, data: unknown) {
  console.log(`[UPDATE_CAL] ${new Date().toISOString()} | ${step}`,
    typeof data === 'string' ? data : JSON.stringify(data, null, 2))
}

function logError(step: string, error: unknown) {
  console.error(`[UPDATE_CAL_ERROR] ${new Date().toISOString()} | ${step}`,
    error instanceof Error
      ? { message: error.message, stack: error.stack }
      : JSON.stringify(error, null, 2))
}

export async function PATCH(req: NextRequest) {
  try {
    logInfo('REQUEST_START', { method: req.method })
    
    const { agendamentoId, calBookingId, calBookingUid } = await req.json()
    
    logInfo('REQUEST_BODY_PARSED', { agendamentoId, calBookingId, calBookingUid })

    if (!agendamentoId || !calBookingId || !calBookingUid) {
      logInfo('VALIDATION_FAILED', { agendamentoId, calBookingId, calBookingUid })
      return NextResponse.json({ 
        error: 'agendamentoId, calBookingId e calBookingUid são obrigatórios' 
      }, { status: 400 })
    }

    // Atualiza o agendamento com os IDs do Cal.eu
    logInfo('AGENDAMENTO_UPDATE_START', { agendamentoId })

    const { error: erroUpdate } = await supabase
      .from('agendamentos')
      .update({
        cal_booking_id: calBookingId,
        cal_booking_uid: calBookingUid,
      })
      .eq('id', agendamentoId)

    if (erroUpdate) {
      logError('AGENDAMENTO_UPDATE_FAILED', erroUpdate)
      return NextResponse.json({ 
        error: `Erro ao atualizar agendamento: ${erroUpdate.message}` 
      }, { status: 500 })
    }

    logInfo('AGENDAMENTO_UPDATE_SUCCESS', { agendamentoId, calBookingId, calBookingUid })
    return NextResponse.json({ success: true, agendamentoId })
  } catch (error) {
    logError('REQUEST_FATAL_ERROR', error)
    return NextResponse.json({ 
      error: 'Erro ao atualizar Cal.eu IDs',
      detail: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
