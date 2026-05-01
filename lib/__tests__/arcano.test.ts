/**
 * lib/__tests__/arcano.test.ts
 * Testes unitários para cálculo do Arcano do Ano
 *
 * Rodar: npm test lib/__tests__/arcano.test.ts
 */

import { calcularArcanoDoAno, ARCANOS } from '@/lib/arcano'

// ── ARCANOS ───────────────────────────────────────────────────────────────────

describe('ARCANOS', () => {
  it('tem exatamente 22 arcanos (0-21)', () => {
    expect(ARCANOS).toHaveLength(22)
  })

  it('os números vão de 0 a 21 sem lacunas', () => {
    const numeros = ARCANOS.map(a => a.numero).sort((a, b) => a - b)
    numeros.forEach((n, i) => expect(n).toBe(i))
  })

  it('cada arcano tem numero, nome, emoji e palavra', () => {
    ARCANOS.forEach(a => {
      expect(typeof a.numero).toBe('number')
      expect(a.nome).toBeTruthy()
      expect(a.emoji).toBeTruthy()
      expect(a.palavra).toBeTruthy()
    })
  })

  it('nomes e palavras são únicos', () => {
    const nomes = ARCANOS.map(a => a.nome)
    expect(new Set(nomes).size).toBe(nomes.length)

    const palavras = ARCANOS.map(a => a.palavra)
    expect(new Set(palavras).size).toBe(palavras.length)
  })

  it('O Louco é o arcano de número 0', () => {
    expect(ARCANOS[0].nome).toBe('O Louco')
    expect(ARCANOS[0].numero).toBe(0)
  })

  it('O Mundo é o arcano de número 21', () => {
    expect(ARCANOS[21].nome).toBe('O Mundo')
    expect(ARCANOS[21].numero).toBe(21)
  })
})

// ── calcularArcanoDoAno ───────────────────────────────────────────────────────

describe('calcularArcanoDoAno', () => {
  it('retorna um arcano válido do array ARCANOS', () => {
    const resultado = calcularArcanoDoAno(1, 1, 2025)
    expect(ARCANOS).toContainEqual(resultado)
  })

  it('resultado tem numero entre 0 e 21', () => {
    const resultado = calcularArcanoDoAno(15, 6, 2026)
    expect(resultado.numero).toBeGreaterThanOrEqual(0)
    expect(resultado.numero).toBeLessThanOrEqual(21)
  })

  it('dia=1, mes=1, ano=2025 → "A Força" (arcano 11)', () => {
    // somaAno(2025) = 2+0+2+5 = 9
    // soma = 1+1+9 = 11  → 11 % 22 = 11 → A Força
    const resultado = calcularArcanoDoAno(1, 1, 2025)
    expect(resultado.numero).toBe(11)
    expect(resultado.nome).toBe('A Força')
  })

  it('dia=15, mes=6, ano=2026 → "O Imperador" (arcano 4)', () => {
    // somaAno(2026) = 2+0+2+6 = 10
    // soma = 15+6+10 = 31 > 22 → 3+1 = 4 → O Imperador
    const resultado = calcularArcanoDoAno(15, 6, 2026)
    expect(resultado.numero).toBe(4)
    expect(resultado.nome).toBe('O Imperador')
  })

  it('dia=30, mes=12, ano=2026 → "O Carro" (arcano 7)', () => {
    // somaAno(2026) = 10, soma = 30+12+10 = 52 > 22 → 5+2 = 7 → O Carro
    const resultado = calcularArcanoDoAno(30, 12, 2026)
    expect(resultado.numero).toBe(7)
    expect(resultado.nome).toBe('O Carro')
  })

  it('resultado é determinístico para os mesmos inputs', () => {
    const a = calcularArcanoDoAno(10, 5, 2024)
    const b = calcularArcanoDoAno(10, 5, 2024)
    expect(a).toEqual(b)
  })

  it('resultados diferentes para anos diferentes', () => {
    const a = calcularArcanoDoAno(1, 1, 2024)
    const b = calcularArcanoDoAno(1, 1, 2025)
    // somaAno 2024=8, 2025=9 — somas diferentes → arcanos diferentes
    expect(a.numero).not.toBe(b.numero)
  })

  it('usa o ano atual quando não informado', () => {
    const anoAtual = new Date().getFullYear()
    const comAnoExplicito = calcularArcanoDoAno(1, 1, anoAtual)
    const semAno = calcularArcanoDoAno(1, 1)
    expect(semAno).toEqual(comAnoExplicito)
  })

  it('funciona para todas as combinações de dia/mês válidas', () => {
    const diasPorMes = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    diasPorMes.forEach((maxDia, mesIdx) => {
      const mes = mesIdx + 1
      ;[1, Math.floor(maxDia / 2), maxDia].forEach(dia => {
        const resultado = calcularArcanoDoAno(dia, mes, 2025)
        expect(resultado).toBeDefined()
        expect(resultado.numero).toBeGreaterThanOrEqual(0)
        expect(resultado.numero).toBeLessThanOrEqual(21)
      })
    })
  })

  it('redução funciona para somas grandes (ex: 31+12+ano grande)', () => {
    // Pior caso: 31+12+9999 — soma alta, mas deve reduzir corretamente
    const resultado = calcularArcanoDoAno(31, 12, 9999)
    expect(resultado.numero).toBeGreaterThanOrEqual(0)
    expect(resultado.numero).toBeLessThanOrEqual(21)
  })
})
