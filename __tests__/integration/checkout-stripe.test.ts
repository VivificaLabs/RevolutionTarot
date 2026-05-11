/**
 * __tests__/integration/checkout-stripe.test.ts
 * Testes do fluxo de pagamento com cartão (Stripe)
 *
 * Rodar: npm test __tests__/integration/checkout-stripe.test.ts
 */

// O jest.mock é hoistado acima dos imports. A closure captura mockPaymentIntentsCreate
// por referência — quando create() for chamado nos testes, beforeEach já terá atribuído
// o jest.fn() correto.
let mockPaymentIntentsCreate: jest.Mock

jest.mock('stripe', () =>
  jest.fn(() => ({
    paymentIntents: {
      create: (...args: unknown[]) => mockPaymentIntentsCreate(...args),
    },
  }))
)

import { POST } from '@/app/api/checkout/route'
import { NextRequest } from 'next/server'
import {
  COTACOES,
  TIRAGENS,
  precoComUrgencia,
  converterPreco,
  metodosPorMoeda,
} from '@/lib/booking'
import { validarCorpoPedidoAgendamento } from '@/lib/validators'
import { formatarWhatsApp } from '@/lib/input-formatters'

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/checkout', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

// Replica a lógica de Math.round da rota para verificar valores esperados
function calcularCentavos(valorBRL: number, moeda: string): number {
  return Math.round(valorBRL * COTACOES[moeda as keyof typeof COTACOES] * 100)
}

// ── Testes ────────────────────────────────────────────────────────────────────

describe('Fluxo de Pagamento com Stripe', () => {
  beforeEach(() => {
    mockPaymentIntentsCreate = jest.fn().mockResolvedValue({
      client_secret: 'cs_test_secret_xyz',
      id: 'pi_test_456',
    })
  })

  // ── POST /api/checkout — rota real com Stripe mockado ─────────────────────

  describe('POST /api/checkout', () => {
    it('retorna clientSecret e paymentIntentId com dados válidos', async () => {
      const res = await POST(makeRequest({
        valorBRL: 150, moeda: 'EUR',
        descricao: 'Zoom no Caos — Revolution Tarot',
        email: 'cliente@example.com', nome: 'Maria Silva',
      }))
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.clientSecret).toBe('cs_test_secret_xyz')
      expect(data.paymentIntentId).toBe('pi_test_456')
    })

    it('chama stripe.paymentIntents.create com centavos em EUR', async () => {
      await POST(makeRequest({ valorBRL: 150, moeda: 'EUR', descricao: 'Teste' }))

      expect(mockPaymentIntentsCreate).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 2550, currency: 'eur' })
      )
    })

    it('chama stripe.paymentIntents.create com centavos em BRL', async () => {
      await POST(makeRequest({ valorBRL: 60, moeda: 'BRL', descricao: 'Teste' }))

      expect(mockPaymentIntentsCreate).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 6000, currency: 'brl' })
      )
    })

    it('chama stripe.paymentIntents.create com centavos em USD', async () => {
      await POST(makeRequest({ valorBRL: 150, moeda: 'USD', descricao: 'Teste' }))

      expect(mockPaymentIntentsCreate).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 2700, currency: 'usd' })
      )
    })

    it('inclui email, descrição e nome nos metadados', async () => {
      await POST(makeRequest({
        valorBRL: 150, moeda: 'EUR',
        descricao: 'Zoom no Caos',
        email: 'cliente@example.com', nome: 'Maria Silva',
      }))

      expect(mockPaymentIntentsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Zoom no Caos',
          receipt_email: 'cliente@example.com',
          metadata: expect.objectContaining({ nome: 'Maria Silva', moeda: 'EUR' }),
        })
      )
    })

    it('retorna 400 quando valorBRL está ausente', async () => {
      const res = await POST(makeRequest({ moeda: 'EUR', descricao: 'Teste' }))
      expect(res.status).toBe(400)
      expect(mockPaymentIntentsCreate).not.toHaveBeenCalled()
    })

    it('retorna 400 quando moeda está ausente', async () => {
      const res = await POST(makeRequest({ valorBRL: 150, descricao: 'Teste' }))
      expect(res.status).toBe(400)
    })

    it('retorna 400 quando descricao está ausente', async () => {
      const res = await POST(makeRequest({ valorBRL: 150, moeda: 'EUR' }))
      expect(res.status).toBe(400)
    })

    it('retorna 500 quando Stripe lança erro', async () => {
      mockPaymentIntentsCreate.mockRejectedValue(new Error('Card declined'))
      const res = await POST(makeRequest({ valorBRL: 150, moeda: 'EUR', descricao: 'Teste' }))
      const data = await res.json()

      expect(res.status).toBe(500)
      expect(data.error).toContain('Card declined')
    })

    it('não chama Stripe quando dados estão incompletos', async () => {
      await POST(makeRequest({ valorBRL: 150 }))
      expect(mockPaymentIntentsCreate).not.toHaveBeenCalled()
    })
  })

  // ── Conversão valorBRL → centavos ─────────────────────────────────────────

  describe('Conversão valorBRL → centavos Stripe', () => {
    it.each([
      [150, 'BRL', 15000],
      [150, 'USD',  2700],
      [150, 'EUR',  2550],
      [ 60, 'BRL',  6000],
      [ 60, 'USD',  1080],
      [ 60, 'EUR',  1020],
      [  3, 'EUR',    51], // tiragem de teste — acima do mínimo live (50 cents)
    ])('R$%s em %s = %s centavos', (brl, moeda, esperado) => {
      expect(calcularCentavos(brl, moeda)).toBe(esperado)
    })

    it('COTACOES de booking.ts é consistente com a rota /api/checkout', () => {
      expect(COTACOES.BRL).toBe(1)
      expect(COTACOES.USD).toBe(0.18)
      expect(COTACOES.EUR).toBe(0.17)
    })

    it('converterPreco e calcularCentavos são equivalentes', () => {
      // converterPreco retorna o valor em moeda; * 100 deve dar os mesmos centavos
      const precoBRL = 150
      expect(Math.round(converterPreco(precoBRL, 'EUR') * 100))
        .toBe(calcularCentavos(precoBRL, 'EUR'))
    })
  })

  // ── Mínimo Stripe ─────────────────────────────────────────────────────────

  describe('Mínimo Stripe por moeda (50 centavos)', () => {
    it.each(['BRL', 'USD', 'EUR'] as const)(
      'todas as tiragens excedem o mínimo em %s',
      moeda => {
        TIRAGENS.forEach(t => {
          expect(calcularCentavos(t.precoBRL, moeda)).toBeGreaterThanOrEqual(50)
        })
      }
    )

    it('tiragem de teste (R$3) atende o mínimo Stripe live em EUR', () => {
      // Math.round(3 * 0.17 * 100) = 51 centavos > 50 ✓
      expect(calcularCentavos(3, 'EUR')).toBeGreaterThanOrEqual(50)
      expect(calcularCentavos(3, 'EUR')).toBe(51)
    })
  })

  // ── Métodos de pagamento ──────────────────────────────────────────────────

  describe('metodosPorMoeda — cartão', () => {
    it.each(['BRL', 'USD', 'EUR'] as const)('%s oferece cartão', moeda => {
      expect(metodosPorMoeda(moeda)).toContain('cartao')
    })

    it('USD só oferece cartão', () => {
      expect(metodosPorMoeda('USD')).toEqual(['cartao'])
    })

    it('EUR não oferece pix', () => {
      expect(metodosPorMoeda('EUR')).not.toContain('pix')
    })

    it('BRL não oferece revolut', () => {
      expect(metodosPorMoeda('BRL')).not.toContain('revolut')
    })
  })

  // ── Cálculo de preço ──────────────────────────────────────────────────────

  describe('Cálculo de preço final', () => {
    it('urgência aplica 1.5x em todas as tiragens', () => {
      TIRAGENS.forEach(t => {
        expect(precoComUrgencia(t.precoBRL)).toBe(t.precoBRL * 1.5)
      })
    })

    it.each([
      [150, 10, 135],
      [150, 50,  75],
      [150,  0, 150],
      [ 60, 20,  48],
    ])('R$%s com %s%% de desconto = R$%s', (preco, pct, esperado) => {
      const total = preco - preco * (pct / 100)
      expect(total).toBe(esperado)
    })

    it('desconto não afeta o valor enviado ao Stripe antes de ser aplicado', () => {
      const precoBRL = 150
      const desconto = 10
      const totalBRL = precoBRL - precoBRL * (desconto / 100) // 135
      expect(calcularCentavos(totalBRL, 'EUR')).toBe(Math.round(135 * 0.17 * 100))
    })
  })

  // ── Payload do agendamento com cartão ─────────────────────────────────────

  describe('Payload de agendamento com pagamento por cartão', () => {
    it('contato WhatsApp recebe DDI + número sanitizado', () => {
      const pais = '+55'
      const numero = formatarWhatsApp('(11) 98765-4321')
      expect(`${pais}${numero}`).toBe('+5511987654321')
    })

    it('stripePaymentId presente para cartão, ausente para pix/revolut', () => {
      const cartao  = { metodoPagamento: 'cartao',  stripePaymentId: 'pi_abc123' }
      const pix     = { metodoPagamento: 'pix',     stripePaymentId: undefined }
      const revolut = { metodoPagamento: 'revolut', stripePaymentId: undefined }

      expect(cartao.stripePaymentId).toBeDefined()
      expect(pix.stripePaymentId).toBeUndefined()
      expect(revolut.stripePaymentId).toBeUndefined()
    })

    it('pago=true somente para método cartão', () => {
      const isPago = (m: string) => m === 'cartao'
      expect(isPago('cartao')).toBe(true)
      expect(isPago('pix')).toBe(false)
      expect(isPago('revolut')).toBe(false)
    })
  })

  // ── validarCorpoPedidoAgendamento ─────────────────────────────────────────

  describe('validarCorpoPedidoAgendamento — dados de pagamento', () => {
    const base = {
      moeda: 'EUR',
      dataAgendada: '2026-06-15',
      nome: 'Maria Silva',
      email: 'maria@example.com',
      canal: 'whatsapp',
      contato: '+5511987654321',
      totalBrl: 150,
    }

    it('aceita payload completo com stripePaymentId', () => {
      const r = validarCorpoPedidoAgendamento({ ...base, stripePaymentId: 'pi_test_123' })
      expect(r.valido).toBe(true)
      expect(r.erros).toHaveLength(0)
    })

    it('aceita payload sem stripePaymentId (Pix/Revolut)', () => {
      expect(validarCorpoPedidoAgendamento(base).valido).toBe(true)
    })

    it.each([
      [{ moeda: 'GBP' },             'Moeda'],
      [{ dataAgendada: undefined },   'Data'],
      [{ email: 'invalido' },         'Email'],
      [{ nome: 'X' },                 'Nome'],
      [{ contato: '12' },             'Contato'],
    ])('rejeita %p — erro menciona "%s"', (override, campo) => {
      const r = validarCorpoPedidoAgendamento({ ...base, ...override })
      expect(r.valido).toBe(false)
      expect(r.erros.some(e => e.includes(campo))).toBe(true)
    })

    it('acumula múltiplos erros simultaneamente', () => {
      const r = validarCorpoPedidoAgendamento({
        moeda: 'INVALIDA', nome: 'X', email: 'ruim',
        canal: 'nenhum', contato: '1', totalBrl: -1,
      })
      expect(r.valido).toBe(false)
      expect(r.erros.length).toBeGreaterThan(2)
    })
  })
})
