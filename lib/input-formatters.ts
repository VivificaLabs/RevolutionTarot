// lib/input-formatters.ts
// Funções de formatação/sanitização para campos de input controlado

export function formatarWhatsApp(valor: string): string {
  return valor.replace(/\D/g, '')
}

export function formatarNumeroCartao(valor: string): string {
  const digits = valor.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(.{4})/g, '$1 ').trim()
}

export function formatarValidadeCartao(valor: string): string {
  const digits = valor.replace(/\D/g, '').slice(0, 4)
  return digits.length > 2 ? digits.slice(0, 2) + '/' + digits.slice(2) : digits
}

export function formatarCVV(valor: string): string {
  return valor.replace(/\D/g, '')
}
