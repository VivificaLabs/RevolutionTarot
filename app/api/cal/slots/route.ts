// app/api/cal/slots/route.ts
// GET /api/cal/slots?eventTypeId=123&data=2025-06-14
//
// Migrado de Cal.eu API v1 → v2
// Docs: https://cal.eu/docs/api-reference/v2/slots/get-available-slots

import { NextRequest, NextResponse } from 'next/server'

const CAL_TOKEN = process.env.CAL_API_KEY!
const CAL_BASE  = process.env.CAL_API_BASE_URL ?? 'https://api.cal.eu'

function logInfo(step: string, data: unknown) {
  console.log(`[CAL_SLOTS] ${new Date().toISOString()} | ${step}`,
    typeof data === 'string' ? data : JSON.stringify(data, null, 2))
}

function logError(step: string, error: unknown) {
  console.error(`[CAL_SLOTS_ERROR] ${new Date().toISOString()} | ${step}`,
    error instanceof Error
      ? { message: error.message, stack: error.stack }
      : JSON.stringify(error, null, 2))
}

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    logInfo('REQUEST_START', { url: req.url })
    
    const { searchParams } = new URL(req.url)
    const eventTypeId = searchParams.get('eventTypeId')
    const data        = searchParams.get('data') // YYYY-MM-DD

    logInfo('REQUEST_PARAMS', { eventTypeId, data })

    if (!eventTypeId || !data) {
      logInfo('VALIDATION_FAILED', { eventTypeId, data })
      return NextResponse.json({ error: 'Parâmetros inválidos.' }, { status: 400 })
    }

    const startTime = `${data}T00:00:00.000Z`
    const endDate   = new Date(data)
    endDate.setDate(endDate.getDate() + 1)
    const endTime   = endDate.toISOString().split('T')[0] + 'T00:00:00.000Z'

    logInfo('TIME_RANGE_CALCULATED', { startTime, endTime })

    // v2: GET /v2/slots com query params
    const url = new URL(`${CAL_BASE}/v2/slots`)
    url.searchParams.set('eventTypeId', eventTypeId)
    url.searchParams.set('start', startTime)
    url.searchParams.set('end', endTime)
    url.searchParams.set('timeZone', 'Europe/Lisbon')

    logInfo('CALEU_REQUEST_URL', url.toString())

    const res  = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${CAL_TOKEN}`,
        'cal-api-version': '2024-09-04',
      },
    })

    logInfo('CALEU_RESPONSE_STATUS', { status: res.status, statusText: res.statusText })

    const json = await res.json()

    logInfo('CALEU_RESPONSE_BODY', json)

    if (!res.ok) {
      logError('CALEU_API_ERROR', { status: res.status, response: json })
      return NextResponse.json(
        { error: json.error?.message ?? json.message ?? 'Erro no Cal.eu' },
        { status: res.status }
      )
    }

    // v2 resposta: { status: "success", data: { "YYYY-MM-DD": [{ start: "..." }] } }
    const slots: string[] = (json.data?.[data] ?? []).map(
      (s: { start: string }) => s.start
    )

    logInfo('SLOTS_EXTRACTED', { count: slots.length, slots: slots.slice(0, 5) })

    // Busca bookings existentes para filtrar períodos já ocupados.
    // Regra de negócio: um booking em qualquer slot do período bloqueia o período inteiro.
    const bookingsUrl = new URL(`${CAL_BASE}/v2/bookings`)
    bookingsUrl.searchParams.set('eventTypeId', eventTypeId)
    bookingsUrl.searchParams.set('afterStart', startTime)
    bookingsUrl.searchParams.set('beforeEnd', endTime)
    bookingsUrl.searchParams.set('status', 'upcoming')

    const bookingsRes = await fetch(bookingsUrl.toString(), {
      headers: {
        Authorization: `Bearer ${CAL_TOKEN}`,
        'cal-api-version': '2024-08-13',
      },
    })

    const horaLisboa = (iso: string): number =>
      parseInt(new Intl.DateTimeFormat('en-US', {
        timeZone: 'Europe/Lisbon', hour: 'numeric', hour12: false,
      }).format(new Date(iso)))

    const PERIODOS = [
      { de: 6,  ate: 12 },
      { de: 12, ate: 18 },
      { de: 18, ate: 24 },
    ]

    let slotsFinais = slots

    if (bookingsRes.ok) {
      const bookingsJson = await bookingsRes.json()
      const bookings: { start: string }[] = bookingsJson.data ?? []

      logInfo('BOOKINGS_FETCHED', { count: bookings.length })

      if (bookings.length > 0) {
        const periodosOcupados = PERIODOS.filter(p =>
          bookings.some(b => {
            const h = horaLisboa(b.start)
            return h >= p.de && h < p.ate
          })
        )

        if (periodosOcupados.length > 0) {
          slotsFinais = slots.filter(s => {
            const h = horaLisboa(s)
            return !periodosOcupados.some(p => h >= p.de && h < p.ate)
          })

          logInfo('SLOTS_AFTER_BOOKING_FILTER', {
            removidos: slots.length - slotsFinais.length,
            restantes: slotsFinais.length,
            periodosOcupados,
          })
        }
      }
    } else {
      logInfo('BOOKINGS_FETCH_SKIPPED', { status: bookingsRes.status })
    }

    return NextResponse.json({ slots: slotsFinais })
  } catch (error) {
    logError('REQUEST_FATAL_ERROR', error)
    return NextResponse.json({ 
      error: 'Erro ao buscar slots',
      detail: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

