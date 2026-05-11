/**
 * lib/__tests__/input-formatters.test.ts
 *
 * Rodar: npm test lib/__tests__/input-formatters.test.ts
 */

import {
  formatarWhatsApp,
  formatarNumeroCartao,
  formatarValidadeCartao,
  formatarCVV,
} from '@/lib/input-formatters'

// ── formatarWhatsApp ──────────────────────────────────────────────────────────

describe('formatarWhatsApp', () => {
  it('preserva string de apenas dígitos', () => {
    expect(formatarWhatsApp('11987654321')).toBe('11987654321')
  })

  it('remove letras', () => {
    expect(formatarWhatsApp('11abc987')).toBe('11987')
  })

  it('remove espaços', () => {
    expect(formatarWhatsApp('11 98765 4321')).toBe('11987654321')
  })

  it('remove hífens e parênteses', () => {
    expect(formatarWhatsApp('(11) 98765-4321')).toBe('11987654321')
  })

  it('remove símbolos especiais', () => {
    expect(formatarWhatsApp('11!@#987')).toBe('11987')
  })

  it('retorna string vazia para entrada vazia', () => {
    expect(formatarWhatsApp('')).toBe('')
  })

  it('retorna string vazia para entrada só de letras', () => {
    expect(formatarWhatsApp('abc')).toBe('')
  })

  it('não remove o sinal de + (tratado pelo select de país separado)', () => {
    // O + do DDI fica no select separado; o campo de número não deve tê-lo,
    // mas se vier, deve ser removido (não é dígito)
    expect(formatarWhatsApp('+5511987654321')).toBe('5511987654321')
  })
})

// ── formatarNumeroCartao ──────────────────────────────────────────────────────

describe('formatarNumeroCartao', () => {
  it('formata 16 dígitos com espaço a cada 4', () => {
    expect(formatarNumeroCartao('4111111111111111')).toBe('4111 1111 1111 1111')
  })

  it('remove letras e formata', () => {
    // '4111abc1111111111' → 14 dígitos → '4111 1111 1111 11'
    expect(formatarNumeroCartao('4111abc1111111111')).toBe('4111 1111 1111 11')
  })

  it('mantém formatação com espaços já presentes na entrada', () => {
    expect(formatarNumeroCartao('4111 1111 1111 1111')).toBe('4111 1111 1111 1111')
  })

  it('limita a 16 dígitos mesmo com entrada maior', () => {
    expect(formatarNumeroCartao('41111111111111119999')).toBe('4111 1111 1111 1111')
  })

  it('formata corretamente com menos de 16 dígitos', () => {
    expect(formatarNumeroCartao('4111')).toBe('4111')
    expect(formatarNumeroCartao('41111111')).toBe('4111 1111')
    expect(formatarNumeroCartao('411111111111')).toBe('4111 1111 1111')
  })

  it('retorna string vazia para entrada vazia', () => {
    expect(formatarNumeroCartao('')).toBe('')
  })

  it('retorna string vazia para entrada só de letras', () => {
    expect(formatarNumeroCartao('abcdef')).toBe('')
  })

  it('não deixa espaço trailing com 16 dígitos exatos', () => {
    const result = formatarNumeroCartao('4111111111111111')
    expect(result.endsWith(' ')).toBe(false)
  })
})

// ── formatarValidadeCartao ────────────────────────────────────────────────────

describe('formatarValidadeCartao', () => {
  it('formata 4 dígitos como MM/AA', () => {
    expect(formatarValidadeCartao('1227')).toBe('12/27')
  })

  it('remove letras e formata', () => {
    expect(formatarValidadeCartao('12ab27')).toBe('12/27')
  })

  it('mantém formatação com barra já presente', () => {
    expect(formatarValidadeCartao('12/27')).toBe('12/27')
  })

  it('não adiciona barra com menos de 3 dígitos', () => {
    expect(formatarValidadeCartao('1')).toBe('1')
    expect(formatarValidadeCartao('12')).toBe('12')
  })

  it('adiciona barra ao digitar o terceiro dígito', () => {
    expect(formatarValidadeCartao('122')).toBe('12/2')
  })

  it('limita a 4 dígitos mesmo com entrada maior', () => {
    expect(formatarValidadeCartao('122799')).toBe('12/27')
  })

  it('retorna string vazia para entrada vazia', () => {
    expect(formatarValidadeCartao('')).toBe('')
  })

  it('retorna string vazia para entrada só de letras', () => {
    expect(formatarValidadeCartao('mmaa')).toBe('')
  })
})

// ── formatarCVV ───────────────────────────────────────────────────────────────

describe('formatarCVV', () => {
  it('preserva string de apenas dígitos', () => {
    expect(formatarCVV('123')).toBe('123')
    expect(formatarCVV('1234')).toBe('1234')
  })

  it('remove letras', () => {
    expect(formatarCVV('12a3')).toBe('123')
  })

  it('remove espaços', () => {
    expect(formatarCVV('1 2 3')).toBe('123')
  })

  it('remove símbolos especiais', () => {
    expect(formatarCVV('1#2$3')).toBe('123')
  })

  it('retorna string vazia para entrada vazia', () => {
    expect(formatarCVV('')).toBe('')
  })

  it('retorna string vazia para entrada só de letras', () => {
    expect(formatarCVV('cvv')).toBe('')
  })
})
