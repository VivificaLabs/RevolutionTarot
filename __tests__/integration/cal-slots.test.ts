/**
 * __tests__/integration/cal-slots.test.ts
 * Testes do endpoint GET /api/cal/slots (proxy para Cal.eu)
 *
 * Rodar: npm test __tests__/integration/cal-slots.test.ts
 */

import { GET } from '@/app/api/cal/slots/route'
import { NextRequest } from 'next/server'

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeRequest(params: Record<string, string> = {}): NextRequest {
  const url = new URL('http://localhost:3000/api/cal/slots')
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  return new NextRequest(url.toString())
}

// Resposta Cal.eu v2 com slots para uma data
function calResponse(date: string, slots: { start: string }[]) {
  return {
    ok: true,
    status: 200,
    json: async () => ({ status: 'success', data: { [date]: slots } }),
  } as Response
}

// Resposta Cal.eu v2 sem slots (dia completamente ocupado)
function calResponseVazia(date: string) {
  return {
    ok: true,
    status: 200,
    json: async () => ({ status: 'success', data: { [date]: [] } }),
  } as Response
}

// Resposta de erro da Cal.eu
function calResponseErro(status: number, message: string) {
  return {
    ok: false,
    status,
    json: async () => ({ error: { message } }),
  } as Response
}

// ── Testes ────────────────────────────────────────────────────────────────────

describe('GET /api/cal/slots', () => {
  let mockFetch: jest.SpyInstance

  beforeEach(() => {
    mockFetch = jest.spyOn(global, 'fetch').mockResolvedValue(
      calResponse('2026-01-15', [
        { start: '2026-01-15T09:00:00.000Z' },
        { start: '2026-01-15T14:00:00.000Z' },
      ])
    )
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  // ── Validação de parâmetros ───────────────────────────────────────────────

  it('retorna 400 quando eventTypeId está ausente', async () => {
    const res = await GET(makeRequest({ data: '2026-01-15' }))
    expect(res.status).toBe(400)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('retorna 400 quando data está ausente', async () => {
    const res = await GET(makeRequest({ eventTypeId: '123' }))
    expect(res.status).toBe(400)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('retorna 400 quando ambos os parâmetros estão ausentes', async () => {
    const res = await GET(makeRequest())
    expect(res.status).toBe(400)
  })

  // ── Resposta bem-sucedida ─────────────────────────────────────────────────

  it('retorna array de slots com dados válidos', async () => {
    const res = await GET(makeRequest({ eventTypeId: '1', data: '2026-01-15' }))
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(Array.isArray(data.slots)).toBe(true)
    expect(data.slots).toHaveLength(2)
  })

  it('retorna os ISO strings dos slots corretamente', async () => {
    const res = await GET(makeRequest({ eventTypeId: '1', data: '2026-01-15' }))
    const data = await res.json()

    expect(data.slots).toContain('2026-01-15T09:00:00.000Z')
    expect(data.slots).toContain('2026-01-15T14:00:00.000Z')
  })

  it('retorna array vazio quando o dia não tem slots disponíveis', async () => {
    mockFetch.mockResolvedValue(calResponseVazia('2026-01-15'))

    const res = await GET(makeRequest({ eventTypeId: '1', data: '2026-01-15' }))
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.slots).toEqual([])
  })

  it('retorna array vazio quando Cal.eu não retorna a data solicitada', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: 'success', data: {} }),
    } as Response)

    const res = await GET(makeRequest({ eventTypeId: '1', data: '2026-01-15' }))
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.slots).toEqual([])
  })

  // ── Chamada à Cal.eu ──────────────────────────────────────────────────────

  it('chama Cal.eu com o eventTypeId correto na URL', async () => {
    await GET(makeRequest({ eventTypeId: '42', data: '2026-01-15' }))

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const url = mockFetch.mock.calls[0][0] as string
    expect(url).toContain('eventTypeId=42')
  })

  it('chama Cal.eu com o fuso Europe/Lisbon', async () => {
    await GET(makeRequest({ eventTypeId: '1', data: '2026-01-15' }))

    const url = mockFetch.mock.calls[0][0] as string
    expect(url).toContain('timeZone=Europe%2FLisbon')
  })

  it('inclui o header de autorização na chamada à Cal.eu', async () => {
    await GET(makeRequest({ eventTypeId: '1', data: '2026-01-15' }))

    const options = mockFetch.mock.calls[0][1] as RequestInit
    expect((options.headers as Record<string, string>)['Authorization']).toMatch(/^Bearer /)
  })

  it('inclui o header cal-api-version na chamada à Cal.eu', async () => {
    await GET(makeRequest({ eventTypeId: '1', data: '2026-01-15' }))

    const options = mockFetch.mock.calls[0][1] as RequestInit
    expect((options.headers as Record<string, string>)['cal-api-version']).toBeTruthy()
  })

  // ── Erros da Cal.eu ───────────────────────────────────────────────────────

  it('propaga status 401 quando o token é inválido', async () => {
    mockFetch.mockResolvedValue(calResponseErro(401, 'Unauthorized'))

    const res = await GET(makeRequest({ eventTypeId: '1', data: '2026-01-15' }))
    expect(res.status).toBe(401)
  })

  it('propaga status 404 quando o eventTypeId não existe', async () => {
    mockFetch.mockResolvedValue(calResponseErro(404, 'Event type not found'))

    const res = await GET(makeRequest({ eventTypeId: '9999', data: '2026-01-15' }))
    const data = await res.json()

    expect(res.status).toBe(404)
    expect(data.error).toContain('Event type not found')
  })

  it('retorna 500 quando fetch lança exceção', async () => {
    mockFetch.mockRejectedValue(new Error('Network failure'))

    const res = await GET(makeRequest({ eventTypeId: '1', data: '2026-01-15' }))
    expect(res.status).toBe(500)
  })

  // ── Integração com agruparSlotsPorPeriodo ─────────────────────────────────
  // Verifica que os slots retornados pela rota têm o formato esperado pela função

  it('slots retornados são strings ISO parsáveis pelo Date', async () => {
    const res = await GET(makeRequest({ eventTypeId: '1', data: '2026-01-15' }))
    const { slots } = await res.json()

    slots.forEach((s: string) => {
      expect(() => new Date(s)).not.toThrow()
      expect(new Date(s).toISOString()).toBe(s)
    })
  })
})
