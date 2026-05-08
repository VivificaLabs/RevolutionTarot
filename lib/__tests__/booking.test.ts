/**
 * lib/__tests__/booking.test.ts
 * Testes unitários para helpers e constantes de booking
 *
 * Rodar: npm test lib/__tests__/booking.test.ts
 */

import {
  precoComUrgencia,
  converterPreco,
  formatarPreco,
  metodosPorMoeda,
  formatarHorarioResumo,
  TIRAGENS,
  FUSOS,
  COTACOES,
  SIMBOLOS,
  IDIOMAS,
  HORARIOS_AO_VIVO_LISBOA,
  PERIODOS_URGENCIA,
  type Moeda,
} from '@/lib/booking'

// ── precoComUrgencia ──────────────────────────────────────────────────────────

describe('precoComUrgencia', () => {
  it('aplica 50% de acréscimo', () => {
    expect(precoComUrgencia(100)).toBe(150)
    expect(precoComUrgencia(60)).toBe(90)
    expect(precoComUrgencia(600)).toBe(900)
  })

  it('funciona com preço zero', () => {
    expect(precoComUrgencia(0)).toBe(0)
  })

  it('é consistente com os preços reais das tiragens', () => {
    TIRAGENS.forEach(t => {
      const urgente = precoComUrgencia(t.precoBRL)
      expect(urgente).toBeGreaterThan(t.precoBRL)
      expect(urgente).toBe(t.precoBRL * 1.5)
    })
  })
})

// ── converterPreco ────────────────────────────────────────────────────────────

describe('converterPreco', () => {
  it('BRL mantém o valor original', () => {
    expect(converterPreco(100, 'BRL')).toBe(100)
  })

  it('USD aplica cotação 0.18', () => {
    expect(converterPreco(100, 'USD')).toBeCloseTo(18, 5)
  })

  it('EUR aplica cotação 0.17', () => {
    expect(converterPreco(100, 'EUR')).toBeCloseTo(17, 5)
  })

  it('USD é sempre menor que BRL para valores positivos', () => {
    expect(converterPreco(150, 'USD')).toBeLessThan(150)
  })

  it('EUR é sempre menor que BRL para valores positivos', () => {
    expect(converterPreco(150, 'EUR')).toBeLessThan(150)
  })

  it('resultado zero para preço zero em qualquer moeda', () => {
    (['BRL', 'USD', 'EUR'] as Moeda[]).forEach(m => {
      expect(converterPreco(0, m)).toBe(0)
    })
  })

  it('usa exatamente as cotações do COTACOES', () => {
    expect(converterPreco(1, 'USD')).toBe(COTACOES['USD'])
    expect(converterPreco(1, 'EUR')).toBe(COTACOES['EUR'])
  })
})

// ── formatarPreco ─────────────────────────────────────────────────────────────

describe('formatarPreco', () => {
  it('BRL usa símbolo R$', () => {
    expect(formatarPreco(100, 'BRL')).toContain('R$')
  })

  it('USD usa símbolo US$', () => {
    expect(formatarPreco(100, 'USD')).toContain('US$')
  })

  it('EUR usa símbolo €', () => {
    expect(formatarPreco(100, 'EUR')).toContain('€')
  })

  it('usa os símbolos do SIMBOLOS', () => {
    (['BRL', 'USD', 'EUR'] as Moeda[]).forEach(m => {
      expect(formatarPreco(100, m)).toContain(SIMBOLOS[m])
    })
  })

  it('não inclui casas decimais para valores inteiros', () => {
    const brl = formatarPreco(150, 'BRL')
    expect(brl).not.toContain(',00')
    expect(brl).not.toContain('.00')
  })

  it('arredonda para inteiro', () => {
    // 100 * 0.18 = 18 — sem decimais
    const usd = formatarPreco(18, 'USD')
    expect(usd).toContain('18')
  })
})

// ── metodosPorMoeda ───────────────────────────────────────────────────────────

describe('metodosPorMoeda', () => {
  it('BRL inclui Pix e Cartão', () => {
    const m = metodosPorMoeda('BRL')
    expect(m).toContain('pix')
    expect(m).toContain('cartao')
    expect(m).not.toContain('revolut')
  })

  it('EUR inclui Revolut e Cartão', () => {
    const m = metodosPorMoeda('EUR')
    expect(m).toContain('revolut')
    expect(m).toContain('cartao')
    expect(m).not.toContain('pix')
  })

  it('USD inclui apenas Cartão', () => {
    const m = metodosPorMoeda('USD')
    expect(m).toContain('cartao')
    expect(m).not.toContain('pix')
    expect(m).not.toContain('revolut')
  })

  it('retorna array não vazio para todas as moedas suportadas', () => {
    (['BRL', 'USD', 'EUR'] as Moeda[]).forEach(m => {
      expect(metodosPorMoeda(m).length).toBeGreaterThan(0)
    })
  })
})

// ── TIRAGENS ──────────────────────────────────────────────────────────────────

describe('TIRAGENS', () => {
  it('tem pelo menos 5 tiragens reais (a de teste aparece só com env ligada)', () => {
    const reais = TIRAGENS.filter(t => t.id !== 'teste-stripe')
    expect(reais).toHaveLength(5)
  })

  it('cada tiragem tem id, nome, subtitulo, precoBRL e aoVivo', () => {
    TIRAGENS.forEach(t => {
      expect(t.id).toBeTruthy()
      expect(t.nome).toBeTruthy()
      expect(t.subtitulo).toBeTruthy()
      expect(t.precoBRL).toBeGreaterThan(0)
      expect(typeof t.aoVivo).toBe('boolean')
    })
  })

  it('todos os ids são únicos', () => {
    const ids = TIRAGENS.map(t => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('apenas Ao Vivásso tem aoVivo=true', () => {
    const aoVivo = TIRAGENS.filter(t => t.aoVivo)
    expect(aoVivo).toHaveLength(1)
    expect(aoVivo[0].id).toBe('ao-vivasoo')
  })

  it('preços são positivos e razoáveis (entre R$1 e R$10.000)', () => {
    TIRAGENS.forEach(t => {
      expect(t.precoBRL).toBeGreaterThan(0)
      expect(t.precoBRL).toBeLessThan(10000)
    })
  })
})

// ── FUSOS ─────────────────────────────────────────────────────────────────────

describe('FUSOS', () => {
  it('inclui Lisboa', () => {
    expect(FUSOS.find(f => f.tz === 'Europe/Lisbon')).toBeDefined()
  })

  it('Lisboa tem offsetLisboa=0', () => {
    const lisboa = FUSOS.find(f => f.tz === 'Europe/Lisbon')
    expect(lisboa?.offsetLisboa).toBe(0)
  })

  it('todas as entradas têm os campos obrigatórios', () => {
    FUSOS.forEach(f => {
      expect(f.cidade).toBeTruthy()
      expect(f.label).toBeTruthy()
      expect(f.tz).toBeTruthy()
      expect(typeof f.offsetLisboa).toBe('number')
    })
  })

  it('offsets estão no intervalo razoável [-12, +14]', () => {
    FUSOS.forEach(f => {
      expect(f.offsetLisboa).toBeGreaterThanOrEqual(-12)
      expect(f.offsetLisboa).toBeLessThanOrEqual(14)
    })
  })

  it('todas as timezones são strings IANA válidas (não vazias)', () => {
    FUSOS.forEach(f => {
      expect(f.tz.length).toBeGreaterThan(0)
      expect(f.tz).toContain('/')
    })
  })
})

// ── HORARIOS_AO_VIVO_LISBOA ───────────────────────────────────────────────────

describe('HORARIOS_AO_VIVO_LISBOA', () => {
  it('tem pelo menos um horário', () => {
    expect(HORARIOS_AO_VIVO_LISBOA.length).toBeGreaterThan(0)
  })

  it('todos os horários estão entre 0 e 23', () => {
    HORARIOS_AO_VIVO_LISBOA.forEach(h => {
      expect(h).toBeGreaterThanOrEqual(0)
      expect(h).toBeLessThanOrEqual(23)
    })
  })

  it('horários são inteiros', () => {
    HORARIOS_AO_VIVO_LISBOA.forEach(h => {
      expect(Number.isInteger(h)).toBe(true)
    })
  })
})

// ── PERIODOS_URGENCIA ─────────────────────────────────────────────────────────

describe('PERIODOS_URGENCIA', () => {
  it('tem 3 períodos (Manhã, Tarde, Noite)', () => {
    expect(PERIODOS_URGENCIA).toHaveLength(3)
    const labels = PERIODOS_URGENCIA.map(p => p.label)
    expect(labels).toContain('Manhã')
    expect(labels).toContain('Tarde')
    expect(labels).toContain('Noite')
  })

  it('horas de Lisboa estão entre 0 e 23', () => {
    PERIODOS_URGENCIA.forEach(p => {
      expect(p.horaLisboa).toBeGreaterThanOrEqual(0)
      expect(p.horaLisboa).toBeLessThanOrEqual(23)
    })
  })

  it('os períodos estão em ordem cronológica', () => {
    const horas = PERIODOS_URGENCIA.map(p => p.horaLisboa)
    for (let i = 1; i < horas.length; i++) {
      expect(horas[i]).toBeGreaterThan(horas[i - 1])
    }
  })
})

// ── IDIOMAS ───────────────────────────────────────────────────────────────────

describe('IDIOMAS', () => {
  it('inclui Português, Espanhol e Inglês', () => {
    const values = IDIOMAS.map(i => i.value)
    expect(values).toContain('pt')
    expect(values).toContain('es')
    expect(values).toContain('en')
  })

  it('cada idioma tem value e label não vazios', () => {
    IDIOMAS.forEach(i => {
      expect(i.value).toBeTruthy()
      expect(i.label).toBeTruthy()
    })
  })
})

// ── formatarHorarioResumo ─────────────────────────────────────────────────────

const AO_VIVO_ID = 'ao-vivasoo'
const PADRAO_ID  = 'tarot-express'

describe('formatarHorarioResumo', () => {
  // ── sem data ────────────────────────────────────────────────────────────────

  it('retorna string vazia quando step2.data está ausente', () => {
    expect(formatarHorarioResumo({ tiragemId: PADRAO_ID }, {})).toBe('')
    expect(formatarHorarioResumo({ tiragemId: AO_VIVO_ID }, { hora: 14 })).toBe('')
  })

  // ── tiragem regular (não ao vivo) ───────────────────────────────────────────

  it('retorna string vazia para tiragem regular sem período definido', () => {
    expect(formatarHorarioResumo(
      { tiragemId: PADRAO_ID },
      { data: '2026-06-15' },
    )).toBe('')
  })

  it.each([
    ['Manhã'],
    ['Tarde'],
    ['Noite'],
  ])('retorna "· %s" quando período é "%s"', periodo => {
    expect(formatarHorarioResumo(
      { tiragemId: PADRAO_ID },
      { data: '2026-06-15', periodo },
    )).toBe(`· ${periodo}`)
  })

  it('ignora step2.hora para tiragem regular (usa apenas período)', () => {
    // Mesmo com hora definida, tiragem não ao vivo usa período
    expect(formatarHorarioResumo(
      { tiragemId: PADRAO_ID },
      { data: '2026-06-15', hora: 14, periodo: 'Tarde' },
    )).toBe('· Tarde')
  })

  // ── ao vivo — fuso Lisboa ───────────────────────────────────────────────────

  it('ao vivo em Lisboa mostra apenas hora Lisboa', () => {
    expect(formatarHorarioResumo(
      { tiragemId: AO_VIVO_ID },
      { data: '2026-06-15', hora: 14, fusoTz: 'Europe/Lisbon' },
    )).toBe('· 14h Lisboa')
  })

  it('ao vivo em Lisboa usa fallback quando fusoTz não está definido', () => {
    expect(formatarHorarioResumo(
      { tiragemId: AO_VIVO_ID },
      { data: '2026-06-15', hora: 10 },
    )).toBe('· 10h Lisboa')
  })

  it('ao vivo formata hora com zero à esquerda', () => {
    expect(formatarHorarioResumo(
      { tiragemId: AO_VIVO_ID },
      { data: '2026-06-15', hora: 9, fusoTz: 'Europe/Lisbon' },
    )).toBe('· 09h Lisboa')
  })

  it('retorna string vazia para ao vivo sem hora definida ainda', () => {
    // Usuário ainda não escolheu o horário
    expect(formatarHorarioResumo(
      { tiragemId: AO_VIVO_ID },
      { data: '2026-06-15' },
    )).toBe('')
  })

  // ── ao vivo — fusos com offset ──────────────────────────────────────────────

  it('ao vivo em São Paulo (offset -3): 14h Lisboa → 11h São Paulo', () => {
    expect(formatarHorarioResumo(
      { tiragemId: AO_VIVO_ID },
      { data: '2026-06-15', hora: 14, fusoTz: 'America/Sao_Paulo' },
    )).toBe('· 14h Lisboa · 11h São Paulo')
  })

  it('ao vivo em Los Angeles (offset -8): 14h Lisboa → 06h Los Angeles', () => {
    expect(formatarHorarioResumo(
      { tiragemId: AO_VIVO_ID },
      { data: '2026-06-15', hora: 14, fusoTz: 'America/Los_Angeles' },
    )).toBe('· 14h Lisboa · 06h Los Angeles')
  })

  it('ao vivo em Paris (offset +1): 14h Lisboa → 15h Paris', () => {
    expect(formatarHorarioResumo(
      { tiragemId: AO_VIVO_ID },
      { data: '2026-06-15', hora: 14, fusoTz: 'Europe/Paris' },
    )).toBe('· 14h Lisboa · 15h Paris')
  })

  it('ao vivo trata wrap de meia-noite: 01h Lisboa com offset -3 → 22h São Paulo', () => {
    expect(formatarHorarioResumo(
      { tiragemId: AO_VIVO_ID },
      { data: '2026-06-15', hora: 1, fusoTz: 'America/Sao_Paulo' },
    )).toBe('· 01h Lisboa · 22h São Paulo')
  })

  it('ao vivo trata wrap para frente: 23h Lisboa com offset +1 → 00h Paris', () => {
    expect(formatarHorarioResumo(
      { tiragemId: AO_VIVO_ID },
      { data: '2026-06-15', hora: 23, fusoTz: 'Europe/Paris' },
    )).toBe('· 23h Lisboa · 00h Paris')
  })

  // ── tiragem desconhecida ─────────────────────────────────────────────────────

  it('retorna string vazia para tiragemId desconhecido (com período também vazio)', () => {
    expect(formatarHorarioResumo(
      { tiragemId: 'inexistente' },
      { data: '2026-06-15' },
    )).toBe('')
  })

  it('usa período quando tiragemId é desconhecido mas período está definido', () => {
    expect(formatarHorarioResumo(
      { tiragemId: 'inexistente' },
      { data: '2026-06-15', periodo: 'Manhã' },
    )).toBe('· Manhã')
  })
})
