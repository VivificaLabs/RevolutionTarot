// app/api/cal/agendar/route.ts
// POST /api/cal/agendar
//
// Migrado de Cal.eu API v1 → v2
// Docs: https://cal.eu/docs/api-reference/v2/bookings/create-a-booking

import { NextRequest, NextResponse } from 'next/server'

const CAL_TOKEN = process.env.CAL_API_KEY!
const CAL_BASE  = process.env.CAL_API_BASE_URL ?? 'https://api.cal.eu'

function logInfo(step: string, data: any) {
  console.log(`[CAL_AGENDAR] ${new Date().toISOString()} | ${step}`, 
    typeof data === 'string' ? data : JSON.stringify(data, null, 2))
}

function logError(step: string, error: any) {
  console.error(`[CAL_AGENDAR_ERROR] ${new Date().toISOString()} | ${step}`, 
    error instanceof Error 
      ? { message: error.message, stack: error.stack } 
      : JSON.stringify(error, null, 2))
}

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    logInfo('REQUEST_START', { url: req.url })
    
    const {
      eventTypeId,  // number
      startTime,    // ISO string — ex: "2025-06-14T10:00:00.000Z"
      nome,
      email,
      idioma,
      tiragem,
      urgencia,
      nota,
      fusoCliente,
    } = await req.json()

    logInfo('REQUEST_BODY_PARSED', { 
      eventTypeId, 
      startTime, 
      nome, 
      email, 
      idioma,
      tiragem,
      urgencia,
      fusoCliente
    })

    // Validação
    if (!eventTypeId || !startTime || !nome || !email) {
      logInfo('VALIDATION_FAILED', { eventTypeId, startTime, nome, email })
      return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 })
    }

    // v2: corpo diferente da v1
    const body = {
      eventTypeId,
      start: startTime,
      attendee: {
        name:     nome,
        email:    email,
        timeZone: fusoCliente ?? 'Europe/Lisbon',
        language: idioma === 'en' ? 'en' : idioma === 'es' ? 'es' : 'pt',
      },
      // Campos adicionais passados como metadata
      metadata: {
        tiragem,
        urgencia: String(urgencia ?? false),
      },
      // Nota vai como bookingFieldsResponses se o event type tiver campo de notas
      // Ou como description para aparecer no evento do calendário
      ...(nota ? { description: nota } : {}),
    }

    logInfo('CALEU_REQUEST_PAYLOAD', body)

    const res  = await fetch(`${CAL_BASE}/v2/bookings`, {
      method: 'POST',
      headers: {
        Authorization:    `Bearer ${CAL_TOKEN}`,
        'Content-Type':   'application/json',
        'cal-api-version': '2024-08-13',
      },
      body: JSON.stringify(body),
    })
    
    logInfo('CALEU_RESPONSE_STATUS', { status: res.status, statusText: res.statusText })
    
    const json = await res.json()

    logInfo('CALEU_RESPONSE_BODY', json)

    if (!res.ok) {
      logError('CALEU_API_ERROR', { status: res.status, response: json })
      return NextResponse.json(
        { error: json.error?.message ?? json.message ?? 'Erro no Cal.eu.' },
        { status: res.status }
      )
    }

    // v2 resposta: { status: "success", data: { uid: "...", id: 123, ... } }
    const bookingId = json.data?.id
    const bookingUid = json.data?.uid

    logInfo('CALEU_BOOKING_SUCCESS', { bookingId, bookingUid, attendeeEmail: email })

    return NextResponse.json({
      bookingId,
      bookingUid,
    })
  } catch (error) {
    logError('REQUEST_FATAL_ERROR', error)
    return NextResponse.json(
      { 
        error: 'Erro ao criar evento no Cal.eu',
        detail: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
