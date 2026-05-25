/**
 * __tests__/integration/refund.test.ts
 * Testes do endpoint POST /api/refund (estorno Stripe)
 *
 * Rodar: npm test __tests__/integration/refund.test.ts
 */

let mockRefundsCreate: jest.Mock

jest.mock('stripe', () =>
  jest.fn(() => ({
    refunds: {
      create: (...args: unknown[]) => mockRefundsCreate(...args),
    },
  }))
)

import { POST } from '@/app/api/refund/route'
import { NextRequest } from 'next/server'

function makeRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/refund', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('POST /api/refund', () => {
  beforeEach(() => {
    mockRefundsCreate = jest.fn().mockResolvedValue({
      id: 're_test_abc123',
      status: 'succeeded',
    })
  })

  it('retorna refundId e status com paymentIntentId válido', async () => {
    const res = await POST(makeRequest({ paymentIntentId: 'pi_test_123' }))
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.refundId).toBe('re_test_abc123')
    expect(data.status).toBe('succeeded')
  })

  it('chama stripe.refunds.create com o paymentIntentId correto', async () => {
    await POST(makeRequest({ paymentIntentId: 'pi_test_456' }))

    expect(mockRefundsCreate).toHaveBeenCalledWith(
      expect.objectContaining({ payment_intent: 'pi_test_456' })
    )
  })

  it('retorna 400 quando paymentIntentId está ausente', async () => {
    const res = await POST(makeRequest({}))
    expect(res.status).toBe(400)
    expect(mockRefundsCreate).not.toHaveBeenCalled()
  })

  it('retorna 400 quando paymentIntentId não é string', async () => {
    const res = await POST(makeRequest({ paymentIntentId: 12345 }))
    expect(res.status).toBe(400)
    expect(mockRefundsCreate).not.toHaveBeenCalled()
  })

  it('retorna 500 quando Stripe lança erro', async () => {
    mockRefundsCreate.mockRejectedValue(new Error('Charge already refunded'))
    const res = await POST(makeRequest({ paymentIntentId: 'pi_test_789' }))
    const data = await res.json()

    expect(res.status).toBe(500)
    expect(data.error).toContain('Charge already refunded')
  })

  it('não chama Stripe quando paymentIntentId está ausente', async () => {
    await POST(makeRequest({ outro: 'campo' }))
    expect(mockRefundsCreate).not.toHaveBeenCalled()
  })
})
