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

// Resposta de slots (primeira chamada fetch)
function slotsResponse(date: string, starts: string[]) {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      status: 'success',
      data: { [date]: starts.map(s => ({ start: s })) },
    }),
  } as Response
}

// Resposta de bookings (segunda chamada fetch)
function bookingsResponse(bookings: { start: string }[]) {
  return {
    ok: true,
    status: 200,
    json: async () => ({ status: 'success', data: bookings }),
  } as Response
}

// Sem bookings existentes (padrão da maioria dos testes)
const semBookings = bookingsResponse([])

// Resposta de erro da Cal.eu
function calResponseErro(status: number, message: string) {
  return {
    ok: false,
    status,
    json: async () => ({ error: { message } }),
  } as Response
}

// ── Setup ─────────────────────────────────────────────────────────────────────

describe('GET /api/cal/slots', () => {
  let mockFetch: jest.SpyInstance

  beforeEach(() => {
    // Por padrão: slots com manhã e tarde disponíveis, nenhum booking existente
    mockFetch = jest.spyOn(global, 'fetch')
      .mockResolvedValueOnce(slotsResponse('2026-01-15', [
        '2026-01-15T09:00:00.000Z',
        '2026-01-15T14:00:00.000Z',
      ]))
      .mockResolvedValueOnce(semBookings)
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
    mockFetch.mockReset()
      .mockResolvedValueOnce(slotsResponse('2026-01-15', []))
      .mockResolvedValueOnce(semBookings)

    const res = await GET(makeRequest({ eventTypeId: '1', data: '2026-01-15' }))
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.slots).toEqual([])
  })

  it('retorna array vazio quando Cal.eu não retorna a data solicitada', async () => {
    mockFetch.mockReset()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ status: 'success', data: {} }),
      } as Response)
      .mockResolvedValueOnce(semBookings)

    const res = await GET(makeRequest({ eventTypeId: '1', data: '2026-01-15' }))
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.slots).toEqual([])
  })

  // ── Chamada à Cal.eu — slots ──────────────────────────────────────────────

  it('chama Cal.eu com o eventTypeId correto na URL de slots', async () => {
    await GET(makeRequest({ eventTypeId: '42', data: '2026-01-15' }))

    const slotsUrl = mockFetch.mock.calls[0][0] as string
    expect(slotsUrl).toContain('eventTypeId=42')
  })

  it('chama Cal.eu com o fuso Europe/Lisbon na URL de slots', async () => {
    await GET(makeRequest({ eventTypeId: '1', data: '2026-01-15' }))

    const slotsUrl = mockFetch.mock.calls[0][0] as string
    expect(slotsUrl).toContain('timeZone=Europe%2FLisbon')
  })

  it('inclui o header de autorização', async () => {
    await GET(makeRequest({ eventTypeId: '1', data: '2026-01-15' }))

    const options = mockFetch.mock.calls[0][1] as RequestInit
    expect((options.headers as Record<string, string>)['Authorization']).toMatch(/^Bearer /)
  })

  it('inclui o header cal-api-version', async () => {
    await GET(makeRequest({ eventTypeId: '1', data: '2026-01-15' }))

    const options = mockFetch.mock.calls[0][1] as RequestInit
    expect((options.headers as Record<string, string>)['cal-api-version']).toBeTruthy()
  })

  // ── Chamada à Cal.eu — bookings ───────────────────────────────────────────

  it('faz segunda chamada para buscar bookings existentes', async () => {
    await GET(makeRequest({ eventTypeId: '1', data: '2026-01-15' }))
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it('busca bookings sem filtrar por eventTypeId (todos os tipos de evento)', async () => {
    await GET(makeRequest({ eventTypeId: '42', data: '2026-01-15' }))

    const bookingsUrl = mockFetch.mock.calls[1][0] as string
    expect(bookingsUrl).not.toContain('eventTypeId')
  })

  it('busca apenas bookings com status upcoming', async () => {
    await GET(makeRequest({ eventTypeId: '1', data: '2026-01-15' }))

    const bookingsUrl = mockFetch.mock.calls[1][0] as string
    expect(bookingsUrl).toContain('status=upcoming')
  })

  // ── Filtro de períodos ocupados ───────────────────────────────────────────

  it('remove slots da manhã quando já existe booking de manhã', async () => {
    // Slots disponíveis: manhã (09h) e tarde (14h)
    // Booking existente: 08h (manhã) → bloqueia todo slot de manhã
    mockFetch.mockReset()
      .mockResolvedValueOnce(slotsResponse('2026-01-15', [
        '2026-01-15T09:00:00.000Z',  // 09h Lisboa (manhã)
        '2026-01-15T09:30:00.000Z',  // 09:30h Lisboa (manhã)
        '2026-01-15T14:00:00.000Z',  // 14h Lisboa (tarde)
      ]))
      .mockResolvedValueOnce(bookingsResponse([
        { start: '2026-01-15T08:00:00.000Z' },  // 08h Lisboa (manhã) — já ocupado
      ]))

    const res = await GET(makeRequest({ eventTypeId: '1', data: '2026-01-15' }))
    const data = await res.json()

    expect(data.slots).not.toContain('2026-01-15T09:00:00.000Z')
    expect(data.slots).not.toContain('2026-01-15T09:30:00.000Z')
    expect(data.slots).toContain('2026-01-15T14:00:00.000Z')
  })

  it('remove slots da tarde quando já existe booking de tarde', async () => {
    mockFetch.mockReset()
      .mockResolvedValueOnce(slotsResponse('2026-01-15', [
        '2026-01-15T09:00:00.000Z',  // manhã
        '2026-01-15T14:00:00.000Z',  // tarde
        '2026-01-15T14:30:00.000Z',  // tarde
      ]))
      .mockResolvedValueOnce(bookingsResponse([
        { start: '2026-01-15T13:00:00.000Z' },  // 14h Lisboa (tarde) — já ocupado
      ]))

    const res = await GET(makeRequest({ eventTypeId: '1', data: '2026-01-15' }))
    const data = await res.json()

    expect(data.slots).toContain('2026-01-15T09:00:00.000Z')
    expect(data.slots).not.toContain('2026-01-15T14:00:00.000Z')
    expect(data.slots).not.toContain('2026-01-15T14:30:00.000Z')
  })

  it('remove slots da noite quando já existe booking de noite', async () => {
    mockFetch.mockReset()
      .mockResolvedValueOnce(slotsResponse('2026-01-15', [
        '2026-01-15T09:00:00.000Z',  // manhã
        '2026-01-15T19:00:00.000Z',  // noite
        '2026-01-15T19:30:00.000Z',  // noite
      ]))
      .mockResolvedValueOnce(bookingsResponse([
        { start: '2026-01-15T18:00:00.000Z' },  // 19h Lisboa (noite) — já ocupado
      ]))

    const res = await GET(makeRequest({ eventTypeId: '1', data: '2026-01-15' }))
    const data = await res.json()

    expect(data.slots).toContain('2026-01-15T09:00:00.000Z')
    expect(data.slots).not.toContain('2026-01-15T19:00:00.000Z')
    expect(data.slots).not.toContain('2026-01-15T19:30:00.000Z')
  })

  it('retorna array vazio quando todos os períodos têm booking', async () => {
    mockFetch.mockReset()
      .mockResolvedValueOnce(slotsResponse('2026-01-15', [
        '2026-01-15T09:00:00.000Z',  // manhã
        '2026-01-15T14:00:00.000Z',  // tarde
        '2026-01-15T19:00:00.000Z',  // noite
      ]))
      .mockResolvedValueOnce(bookingsResponse([
        { start: '2026-01-15T08:00:00.000Z' },  // manhã
        { start: '2026-01-15T13:00:00.000Z' },  // tarde
        { start: '2026-01-15T18:00:00.000Z' },  // noite
      ]))

    const res = await GET(makeRequest({ eventTypeId: '1', data: '2026-01-15' }))
    const data = await res.json()

    expect(data.slots).toEqual([])
  })

  it('bloqueia período mesmo quando o booking é de um event type diferente', async () => {
    // Cliente 1 reservou tiragem-padrão (eventTypeId=249816) de manhã.
    // Cliente 2 tenta reservar ao-vivo (eventTypeId=249793) no mesmo dia de manhã.
    // A consulta de slots é para eventTypeId=249793, mas o booking é de 249816.
    // O período da manhã deve ser bloqueado para ambos.
    mockFetch.mockReset()
      .mockResolvedValueOnce(slotsResponse('2026-01-15', [
        '2026-01-15T09:00:00.000Z',  // manhã (ao vivo disponível segundo Cal.eu)
        '2026-01-15T14:00:00.000Z',  // tarde
      ]))
      .mockResolvedValueOnce(bookingsResponse([
        { start: '2026-01-15T08:00:00.000Z' },  // booking de tiragem-padrão — event type diferente
      ]))

    const res = await GET(makeRequest({ eventTypeId: '249793', data: '2026-01-15' }))
    const data = await res.json()

    // Manhã deve ser bloqueada mesmo o booking sendo de outro event type
    expect(data.slots).not.toContain('2026-01-15T09:00:00.000Z')
    expect(data.slots).toContain('2026-01-15T14:00:00.000Z')
  })

  it('reproduz o bug real: 08:00 bookado, 08:30 deve ser filtrado', async () => {
    // Caso real reportado: booking às 07:00 UTC (08:00 Lisboa WEST)
    // Cal.eu ainda mostra 08:30 como disponível — deve ser filtrado
    mockFetch.mockReset()
      .mockResolvedValueOnce(slotsResponse('2026-05-14', [
        '2026-05-14T07:00:00.000+01:00',  // 08h Lisboa
        '2026-05-14T07:30:00.000+01:00',  // 08:30h Lisboa
        '2026-05-14T12:00:00.000+01:00',  // 13h Lisboa (tarde)
      ]))
      .mockResolvedValueOnce(bookingsResponse([
        { start: '2026-05-14T07:00:00.000Z' },  // booking às 08h Lisboa
      ]))

    const res = await GET(makeRequest({ eventTypeId: '1', data: '2026-05-14' }))
    const data = await res.json()

    // 08:00 e 08:30 são manhã — ambos devem ser filtrados
    expect(data.slots).not.toContain('2026-05-14T07:00:00.000+01:00')
    expect(data.slots).not.toContain('2026-05-14T07:30:00.000+01:00')
    // Tarde deve permanecer disponível
    expect(data.slots).toContain('2026-05-14T12:00:00.000+01:00')
  })

  it('mantém todos os slots quando não há bookings', async () => {
    mockFetch.mockReset()
      .mockResolvedValueOnce(slotsResponse('2026-01-15', [
        '2026-01-15T09:00:00.000Z',
        '2026-01-15T14:00:00.000Z',
        '2026-01-15T19:00:00.000Z',
      ]))
      .mockResolvedValueOnce(semBookings)

    const res = await GET(makeRequest({ eventTypeId: '1', data: '2026-01-15' }))
    const data = await res.json()

    expect(data.slots).toHaveLength(3)
  })

  it('bloqueia hora de ao vivo (18h) quando há booking de noite de outra tiragem', async () => {
    // Cal.eu retorna slots de ao vivo para 10h, 14h e 18h Lisboa
    // Booking de tiragem-padrão existe às 18h (noite)
    // Consulta é para eventTypeId de ao-vivo → noite deve ser filtrada
    mockFetch.mockReset()
      .mockResolvedValueOnce(slotsResponse('2026-05-23', [
        '2026-05-23T09:00:00.000Z',  // 10h Lisboa (manhã) — WEST: UTC+1
        '2026-05-23T13:00:00.000Z',  // 14h Lisboa (tarde)
        '2026-05-23T17:00:00.000Z',  // 18h Lisboa (noite)
        '2026-05-23T17:30:00.000Z',  // 18:30h Lisboa (noite)
      ]))
      .mockResolvedValueOnce(bookingsResponse([
        { start: '2026-05-23T18:00:00.000Z' },  // booking de tiragem-padrão às 19h Lisboa (noite)
      ]))

    const res = await GET(makeRequest({ eventTypeId: '249793', data: '2026-05-23' }))
    const data = await res.json()

    // Manhã e Tarde disponíveis
    expect(data.slots).toContain('2026-05-23T09:00:00.000Z')
    expect(data.slots).toContain('2026-05-23T13:00:00.000Z')
    // Noite bloqueada — ao vivo das 18h não deve aparecer
    expect(data.slots).not.toContain('2026-05-23T17:00:00.000Z')
    expect(data.slots).not.toContain('2026-05-23T17:30:00.000Z')
  })

  it('retorna todos os slots sem filtrar quando a chamada de bookings falha', async () => {
    mockFetch.mockReset()
      .mockResolvedValueOnce(slotsResponse('2026-01-15', [
        '2026-01-15T09:00:00.000Z',
        '2026-01-15T14:00:00.000Z',
      ]))
      .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) } as Response)

    const res = await GET(makeRequest({ eventTypeId: '1', data: '2026-01-15' }))
    const data = await res.json()

    // Sem filtro por booking quando a API de bookings falha
    expect(res.status).toBe(200)
    expect(data.slots).toHaveLength(2)
  })

  // ── Erros da Cal.eu (slots) ───────────────────────────────────────────────

  it('propaga status 401 quando o token é inválido', async () => {
    mockFetch.mockReset()
      .mockResolvedValueOnce(calResponseErro(401, 'Unauthorized'))

    const res = await GET(makeRequest({ eventTypeId: '1', data: '2026-01-15' }))
    expect(res.status).toBe(401)
  })

  it('propaga status 404 quando o eventTypeId não existe', async () => {
    mockFetch.mockReset()
      .mockResolvedValueOnce(calResponseErro(404, 'Event type not found'))

    const res = await GET(makeRequest({ eventTypeId: '9999', data: '2026-01-15' }))
    const data = await res.json()

    expect(res.status).toBe(404)
    expect(data.error).toContain('Event type not found')
  })

  it('retorna 500 quando fetch lança exceção', async () => {
    mockFetch.mockReset()
      .mockRejectedValueOnce(new Error('Network failure'))

    const res = await GET(makeRequest({ eventTypeId: '1', data: '2026-01-15' }))
    expect(res.status).toBe(500)
  })

  // ── Formato dos slots retornados ──────────────────────────────────────────

  it('slots retornados são strings parsáveis pelo Date', async () => {
    const res = await GET(makeRequest({ eventTypeId: '1', data: '2026-01-15' }))
    const { slots } = await res.json()

    slots.forEach((s: string) => {
      expect(() => new Date(s)).not.toThrow()
      expect(isNaN(new Date(s).getTime())).toBe(false)
    })
  })
})
