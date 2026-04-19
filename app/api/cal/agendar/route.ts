// app/api/cal/agendar/route.ts
// POST /api/cal/agendar
//
// Migrado de Cal.eu API v1 → v2
// Docs: https://cal.eu/docs/api-reference/v2/bookings/create-a-booking

import { NextRequest, NextResponse } from 'next/server'

const CAL_TOKEN = process.env.CAL_API_KEY!
const CAL_BASE  = process.env.CAL_API_BASE_URL ?? 'https://api.cal.eu'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
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

  if (!eventTypeId || !startTime || !nome || !email)
    return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 })

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

  const res  = await fetch(`${CAL_BASE}/v2/bookings`, {
    method: 'POST',
    headers: {
      Authorization:    `Bearer ${CAL_TOKEN}`,
      'Content-Type':   'application/json',
      'cal-api-version': '2024-08-13',
    },
    body: JSON.stringify(body),
  })
  const json = await res.json()

  if (!res.ok)
    return NextResponse.json(
      { error: json.error?.message ?? json.message ?? 'Erro no Cal.eu.' },
      { status: res.status }
    )

  // v2 resposta: { status: "success", data: { uid: "...", id: 123, ... } }
  return NextResponse.json({
    bookingId:  json.data?.id,
    bookingUid: json.data?.uid,
  })
}
