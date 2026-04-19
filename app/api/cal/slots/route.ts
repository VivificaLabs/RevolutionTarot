// app/api/cal/slots/route.ts
// GET /api/cal/slots?eventTypeId=123&data=2025-06-14
//
// Migrado de Cal.eu API v1 → v2
// Docs: https://cal.eu/docs/api-reference/v2/slots/get-available-slots

import { NextRequest, NextResponse } from 'next/server'

const CAL_TOKEN = process.env.CAL_API_KEY!
const CAL_BASE  = process.env.CAL_API_BASE_URL ?? 'https://api.cal.eu'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const eventTypeId = searchParams.get('eventTypeId')
  const data        = searchParams.get('data') // YYYY-MM-DD

  if (!eventTypeId || !data)
    return NextResponse.json({ error: 'Parâmetros inválidos.' }, { status: 400 })

  const startTime = `${data}T00:00:00.000Z`
  const endDate   = new Date(data)
  endDate.setDate(endDate.getDate() + 1)
  const endTime   = endDate.toISOString().split('T')[0] + 'T00:00:00.000Z'

  // v2: GET /v2/slots com query params
  const url = new URL(`${CAL_BASE}/v2/slots`)
  url.searchParams.set('eventTypeId', eventTypeId)
  url.searchParams.set('startTime', startTime)
  url.searchParams.set('endTime', endTime)
  url.searchParams.set('timeZone', 'Europe/Lisbon')

  const res  = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${CAL_TOKEN}`,
      'cal-api-version': '2024-09-04',
    },
  })
  const json = await res.json()

  if (!res.ok)
    return NextResponse.json(
      { error: json.error?.message ?? json.message ?? 'Erro no Cal.eu' },
      { status: res.status }
    )

  // v2 resposta: { status: "success", data: { slots: { "YYYY-MM-DD": [{ time: "..." }] } } }
  const slots: string[] = (json.data?.slots?.[data] ?? []).map(
    (s: { time: string }) => s.time
  )

  return NextResponse.json({ slots })
}
