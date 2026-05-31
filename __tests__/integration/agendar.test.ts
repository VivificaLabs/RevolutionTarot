/**
 * __tests__/integration/agendar.test.ts
 * Testes do endpoint POST /api/cal/agendar (proxy para Cal.eu)
 *
 * Rodar: npm test __tests__/integration/agendar.test.ts
 */

import { POST } from '@/app/api/cal/agendar/route'
import { NextRequest } from 'next/server'

function makeRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/cal/agendar', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

const basePayload = {
  eventTypeId: 249816,
  startTime: '2026-06-15T10:00:00.000Z',
  nome: 'Maria Silva',
  email: 'maria@example.com',
  idioma: 'pt',
  tiragem: 'Zoom no Caos',
  urgencia: false,
  fusoCliente: 'Europe/Lisbon',
}

function calBookingSuccess(id: number, uid: string) {
  return {
    ok: true,
    status: 201,
    json: async () => ({ status: 'success', data: { id, uid } }),
  } as Response
}

function calBookingError(status: number, message: string) {
  return {
    ok: false,
    status,
    json: async () => ({ error: { message } }),
  } as Response
}

describe('POST /api/cal/agendar', () => {
  let mockFetch: jest.SpyInstance

  beforeEach(() => {
    mockFetch = jest.spyOn(global, 'fetch')
      .mockResolvedValueOnce(calBookingSuccess(123, 'uid-abc-456'))
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  // ── Resposta bem-sucedida ─────────────────────────────────────────────────

  it('retorna bookingId e bookingUid com dados válidos', async () => {
    const res = await POST(makeRequest(basePayload))
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.bookingId).toBe(123)
    expect(data.bookingUid).toBe('uid-abc-456')
  })

  // ── Validação de parâmetros ───────────────────────────────────────────────

  it('retorna 400 quando eventTypeId está ausente', async () => {
    const { eventTypeId: _, ...semEventType } = basePayload
    const res = await POST(makeRequest(semEventType))
    expect(res.status).toBe(400)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('retorna 400 quando startTime está ausente', async () => {
    const { startTime: _, ...semStart } = basePayload
    const res = await POST(makeRequest(semStart))
    expect(res.status).toBe(400)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('retorna 400 quando nome está ausente', async () => {
    const { nome: _, ...semNome } = basePayload
    const res = await POST(makeRequest(semNome))
    expect(res.status).toBe(400)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('retorna 400 quando email está ausente', async () => {
    const { email: _, ...semEmail } = basePayload
    const res = await POST(makeRequest(semEmail))
    expect(res.status).toBe(400)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  // ── Tradução de erros do Cal.com ──────────────────────────────────────────

  it('traduz "already has booking" para mensagem em português', async () => {
    mockFetch.mockReset().mockResolvedValueOnce(
      calBookingError(409, 'User either already has booking at this time or is not available')
    )

    const res = await POST(makeRequest(basePayload))
    const data = await res.json()

    expect(res.status).toBe(409)
    expect(data.error).not.toContain('already has booking')
    expect(data.error).toContain('reservado ou indisponível')
  })

  it('traduz "not available" para mensagem em português', async () => {
    mockFetch.mockReset().mockResolvedValueOnce(
      calBookingError(400, 'User is not available at this time')
    )

    const res = await POST(makeRequest(basePayload))
    const data = await res.json()

    expect(data.error).toContain('reservado ou indisponível')
    expect(data.error).not.toContain('not available')
  })

  it('traduz "slot unavailable" para mensagem em português', async () => {
    mockFetch.mockReset().mockResolvedValueOnce(
      calBookingError(400, 'The requested slot is unavailable')
    )

    const res = await POST(makeRequest(basePayload))
    const data = await res.json()

    expect(data.error).toContain('não está mais disponível')
    expect(data.error).not.toContain('unavailable')
  })

  it('traduz "slot not found" para mensagem em português', async () => {
    mockFetch.mockReset().mockResolvedValueOnce(
      calBookingError(404, 'Slot not found')
    )

    const res = await POST(makeRequest(basePayload))
    const data = await res.json()

    expect(data.error).toContain('não está mais disponível')
  })

  it('traduz "event type not found" para mensagem em português', async () => {
    mockFetch.mockReset().mockResolvedValueOnce(
      calBookingError(404, 'Event type not found')
    )

    const res = await POST(makeRequest(basePayload))
    const data = await res.json()

    expect(data.error).toContain('suporte')
    expect(data.error).not.toContain('Event type not found')
  })

  it('retorna mensagem original quando o erro não tem tradução definida', async () => {
    mockFetch.mockReset().mockResolvedValueOnce(
      calBookingError(500, 'Internal server error')
    )

    const res = await POST(makeRequest(basePayload))
    const data = await res.json()

    expect(data.error).toBe('Internal server error')
  })

  it('retorna mensagem genérica quando o erro não tem mensagem', async () => {
    mockFetch.mockReset().mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    } as Response)

    const res = await POST(makeRequest(basePayload))
    const data = await res.json()

    expect(data.error).toBeTruthy()
  })

  // ── Payload enviado ao Cal.com ────────────────────────────────────────────

  it('envia o idioma correto para inglês', async () => {
    await POST(makeRequest({ ...basePayload, idioma: 'en' }))

    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.attendee.language).toBe('en')
  })

  it('envia o idioma correto para espanhol', async () => {
    await POST(makeRequest({ ...basePayload, idioma: 'es' }))

    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.attendee.language).toBe('es')
  })

  it('usa Europe/Lisbon como fuso padrão quando fusoCliente não é informado', async () => {
    const { fusoCliente: _, ...semFuso } = basePayload
    await POST(makeRequest(semFuso))

    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.attendee.timeZone).toBe('Europe/Lisbon')
  })

  it('inclui metadata com tiragem e urgencia', async () => {
    await POST(makeRequest({ ...basePayload, urgencia: true }))

    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.metadata.tiragem).toBe('Zoom no Caos')
    expect(body.metadata.urgencia).toBe('true')
  })
})
