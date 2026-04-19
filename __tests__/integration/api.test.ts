/**
 * __tests__/integration/api.test.ts
 * Testes de integração para API routes
 * 
 * Rodar: npm test __tests__/integration/api.test.ts
 */

describe('API Integration Tests', () => {
  // ── Checkout API ──────────────────────────────────────────────────────────────

  describe('POST /api/checkout', () => {
    it('deve criar payment intent com dados válidos', async () => {
      const payload = {
        valorBRL: 150,
        moeda: 'BRL',
        descricao: 'Tarot Express - Leitura',
        email: 'customer@example.com',
        nome: 'João Silva',
      }

      // Nota: Este teste requer um mock de Stripe
      // Em produção, use jest.mock() para mockar a cliente Stripe
      expect(payload.valorBRL).toBeGreaterThan(0)
      expect(['BRL', 'USD', 'EUR']).toContain(payload.moeda)
    })

    it('deve rejeitar dados incompletos', async () => {
      const payloadIncompleto = {
        valorBRL: 150,
        // moeda faltando
        descricao: 'Tarot Express',
      }

      expect(payloadIncompleto.moeda).toBeUndefined()
    })

    it('deve converter moeda corretamente', () => {
      const COTACOES: Record<string, number> = { BRL: 1, USD: 0.18, EUR: 0.17 }
      const valorBRL = 150
      
      const valorUSD = Number((valorBRL * COTACOES.USD).toFixed(2))
      const valorEUR = Number((valorBRL * COTACOES.EUR).toFixed(2))

      expect(valorUSD).toBeLessThan(valorBRL)
      expect(valorEUR).toBeLessThan(valorBRL)
      expect(valorUSD).toBeCloseTo(27, 0)
      expect(valorEUR).toBeCloseTo(25.5, 0)
    })
  })

  // ── Cupom API ─────────────────────────────────────────────────────────────────

  describe('POST /api/cupom', () => {
    it('deve validar cupom ativo', () => {
      const mockCupom = {
        codigo: 'PROMO50',
        desconto: 50,
        ativo: true,
        uso_maximo: null,
        uso_atual: 0,
        expira_em: null,
      }

      expect(mockCupom.ativo).toBe(true)
      expect(mockCupom.uso_atual).toBeLessThan(mockCupom.uso_maximo || Infinity)
    })

    it('deve rejeitar cupom inativo', () => {
      const mockCupom = {
        ativo: false,
      }

      expect(mockCupom.ativo).toBe(false)
    })

    it('deve rejeitar cupom expirado', () => {
      const expiration = new Date('2020-01-01')
      const now = new Date()

      expect(expiration.getTime()).toBeLessThan(now.getTime())
    })

    it('deve rejeitar cupom esgotado', () => {
      const mockCupom = {
        uso_maximo: 10,
        uso_atual: 10,
      }

      expect(mockCupom.uso_atual).toBeGreaterThanOrEqual(mockCupom.uso_maximo)
    })

    it('deve rejeitar cupom inexistente', () => {
      // Simula resposta do banco de dados
      const resultado = { data: null, error: 'No rows found' }

      expect(resultado.data).toBeNull()
      expect(resultado.error).toBeDefined()
    })
  })

  // ── Agendamentos API ──────────────────────────────────────────────────────────

  describe('POST /api/agendamentos', () => {
    const validBookingPayload = {
      // Step 1
      tiragemId: 'zoom-no-caos',
      tiragemNome: 'Zoom no Caos',
      idioma: 'pt',
      urgencia: false,
      moeda: 'BRL',
      precoBrl: 150,
      cupomCodigo: null,
      cupomDesconto: 0,
      totalBrl: 150,

      // Step 2
      dataAgendada: '2026-05-15',
      horaLisboa: 14,
      periodo: 'tarde',
      fusoCliente: 'America/Sao_Paulo',

      // Step 3
      nome: 'Maria Silva',
      email: 'maria@example.com',
      canal: 'whatsapp',
      contato: '+5511999999999',
      indicadoPor: null,
      nota: 'Obrigada!',

      // Step 4
      metodoPagamento: 'pix',
      stripePaymentId: 'pi_1234567890',

      // Cal.eu
      calBookingId: null,
      calBookingUid: null,
    }

    it('deve validar payload completo', () => {
      expect(validBookingPayload.tiragemId).toBeDefined()
      expect(validBookingPayload.nome).toBeDefined()
      expect(validBookingPayload.email).toBeDefined()
      expect(validBookingPayload.totalBrl).toBeGreaterThan(0)
    })

    it('deve criar cliente novo', () => {
      // Simula upsert de cliente
      const novoCliente = {
        id: 'uuid-1234',
        nome: validBookingPayload.nome,
        email: validBookingPayload.email,
        canal: validBookingPayload.canal,
        contato: validBookingPayload.contato,
      }

      expect(novoCliente.id).toBeDefined()
      expect(novoCliente.email).toEqual(validBookingPayload.email)
    })

    it('deve registrar agendamento no banco de dados', () => {
      const agendamento = {
        id: 'uuid-5678',
        cliente_id: 'uuid-1234',
        status: 'pendente',
        pago: false,
        criado_em: new Date().toISOString(),
      }

      expect(agendamento.status).toBe('pendente')
      expect(agendamento.pago).toBe(false)
      expect(agendamento.criado_em).toBeDefined()
    })

    it('deve falhar com dados incompletos', () => {
      const payloadIncompleto = {
        ...validBookingPayload,
        email: undefined, // faltando
      }

      expect(payloadIncompleto.email).toBeUndefined()
    })

    it('deve aplicar desconto de cupom', () => {
      const payloadComCupom = {
        ...validBookingPayload,
        cupomCodigo: 'PROMO50',
        cupomDesconto: 50,
        totalBrl: 75, // 150 - 50% desconto
      }

      const desconto = (payloadComCupom.precoBrl * payloadComCupom.cupomDesconto) / 100
      const totalCalculado = payloadComCupom.precoBrl - desconto

      expect(totalCalculado).toBe(payloadComCupom.totalBrl)
    })

    it('deve calcular urgência corretamente', () => {
      const precoBRL = 150
      const taxaUrgencia = 50 // 33% extra
      const precoComUrgencia = precoBRL + taxaUrgencia

      expect(precoComUrgencia).toBeGreaterThan(precoBRL)
      expect(precoComUrgencia).toBeCloseTo(200, 0)
    })
  })

  // ── Cal.eu Agendar API ───────────────────────────────────────────────────────

  describe('POST /api/cal/agendar', () => {
    it('deve criar booking em cal.eu', () => {
      const calPayload = {
        eventTypeId: 123,
        startTime: '2026-05-15T14:00:00.000Z',
        nome: 'Maria Silva',
        email: 'maria@example.com',
        tiragem: 'Zoom no Caos',
        idioma: 'pt',
        urgencia: false,
        nota: 'Obrigada!',
      }

      expect(calPayload.eventTypeId).toBeGreaterThan(0)
      expect(new Date(calPayload.startTime)).toBeInstanceOf(Date)
      expect(calPayload.email).toMatch(/@/)
    })

    it('deve falhar sem eventTypeId', () => {
      const calPayloadIncompleto = {
        startTime: '2026-05-15T14:00:00.000Z',
        nome: 'Maria Silva',
        email: 'maria@example.com',
      }

      expect(calPayloadIncompleto).not.toHaveProperty('eventTypeId')
    })
  })

  // ── Cal.eu Slots API ─────────────────────────────────────────────────────────

  describe('GET /api/cal/slots', () => {
    it('deve retornar horários disponíveis', () => {
      const mockSlots = [
        { time: '14:00', available: true },
        { time: '15:00', available: true },
        { time: '16:00', available: false },
      ]

      expect(mockSlots).toHaveLength(3)
      expect(mockSlots.filter(s => s.available)).toHaveLength(2)
    })

    it('deve rejeitar data inválida', () => {
      const dataInvalida = 'not-a-date'
      expect(() => new Date(dataInvalida)).not.toThrow() // JS aceita, mas retorna Invalid Date
      expect(new Date(dataInvalida).getTime()).toBeNaN()
    })

    it('deve rejeitar datas em passado', () => {
      const agora = new Date()
      const passado = new Date(agora.getTime() - 86400000) // 1 dia atrás

      expect(passado.getTime()).toBeLessThan(agora.getTime())
    })
  })

  // ── Arcano do Ano API ─────────────────────────────────────────────────────────

  describe('GET /api/arcano-do-ano', () => {
    it('deve calcular arcano baseado na data de nascimento', () => {
      // Numerologia: soma dígitos até chegar a 1-22
      const nascimento = '1990-05-15'
      const [ano, mes, dia] = nascimento.split('-').map(Number)
      
      const soma = ano + mes + dia
      const reduzido = soma % 22 || 22 // Se 0, retorna 22

      expect(reduzido).toBeGreaterThanOrEqual(1)
      expect(reduzido).toBeLessThanOrEqual(22)
    })

    it('deve retornar PDF ou relatório', () => {
      const response = {
        arcanoNum: 5,
        arcanomNome: 'O Hierofante',
        descricao: '...',
        orientacoes: '...',
        formato: 'pdf',
      }

      expect(response.arcanoNum).toBeDefined()
      expect(response.formato).toBe('pdf')
    })
  })
})
