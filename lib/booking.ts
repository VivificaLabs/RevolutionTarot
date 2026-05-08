// lib/booking.ts
// Tipos, constantes e helpers do wizard de agendamento

// ── Moedas ────────────────────────────────────────────────────────────────────

export type Moeda = 'BRL' | 'USD' | 'EUR'

export const COTACOES: Record<Moeda, number> = {
  BRL: 1,
  USD: 0.18,
  EUR: 0.17,
}

export const SIMBOLOS: Record<Moeda, string> = {
  BRL: 'R$',
  USD: 'US$',
  EUR: '€',
}

// ── Tiragens ──────────────────────────────────────────────────────────────────

export interface Tiragem {
  id: string
  nome: string
  subtitulo: string
  precoBRL: number
  aoVivo: boolean        // se true → use event type "ao-vivasso"
}

const TIRAGEM_TESTE: Tiragem = {
  id: 'teste-stripe',
  nome: '[TESTE] Stripe',
  subtitulo: 'apenas para testes — não aparece em produção',
  precoBRL: 3,  // ~€1 cobrado; mínimo Stripe live é €0,50
  aoVivo: false,
}

export const TIRAGENS: Tiragem[] = [
  ...(process.env.NEXT_PUBLIC_ENABLE_TEST_BOOKING === 'true' ? [TIRAGEM_TESTE] : []),
  {
    id: 'tarot-express',
    nome: 'Tarot Express',
    subtitulo: 'tiragem rápida',
    precoBRL: 60,
    aoVivo: false,
  },
  {
    id: 'zoom-no-caos',
    nome: 'Zoom no Caos',
    subtitulo: 'tiragem por área',
    precoBRL: 150,
    aoVivo: false,
  },
  {
    id: 'spoilers-controlados',
    nome: 'Spoilers Controlados',
    subtitulo: 'tiragem preditiva',
    precoBRL: 120,
    aoVivo: false,
  },
  {
    id: 'diagnostico-mistico',
    nome: 'Diagnóstico Místico',
    subtitulo: 'tiragem geral',
    precoBRL: 180,
    aoVivo: false,
  },
  {
    id: 'ao-vivasoo',
    nome: 'Ao vivásso',
    subtitulo: 'videochamada · 50 min',
    precoBRL: 600,
    aoVivo: true,
  },
]

// ── Idiomas ───────────────────────────────────────────────────────────────────

export type Idioma = 'pt' | 'es' | 'en'

export const IDIOMAS: { value: Idioma; label: string }[] = [
  { value: 'pt', label: 'Português' },
  { value: 'es', label: 'Espanhol' },
  { value: 'en', label: 'Inglês' },
]

// ── Fusos horários ────────────────────────────────────────────────────────────

export interface FusoOpcao {
  cidade: string
  label: string
  tz: string            // IANA timezone
  offsetLisboa: number  // diferença em horas em relação a Lisboa
}

export const FUSOS: FusoOpcao[] = [
  { cidade: 'Lisboa',           label: 'Lisboa (WET/WEST)',        tz: 'Europe/Lisbon',        offsetLisboa: 0  },
  { cidade: 'São Paulo',        label: 'São Paulo (BRT)',           tz: 'America/Sao_Paulo',    offsetLisboa: -3 },
  { cidade: 'Nova York',        label: 'Nova York (ET)',            tz: 'America/New_York',     offsetLisboa: -5 },
  { cidade: 'Los Angeles',      label: 'Los Angeles (PT)',          tz: 'America/Los_Angeles',  offsetLisboa: -8 },
  { cidade: 'Londres',          label: 'Londres (GMT/BST)',         tz: 'Europe/London',        offsetLisboa: 0  },
  { cidade: 'Paris',            label: 'Paris (CET/CEST)',          tz: 'Europe/Paris',         offsetLisboa: 1  },
  { cidade: 'Buenos Aires',     label: 'Buenos Aires (ART)',        tz: 'America/Argentina/Buenos_Aires', offsetLisboa: -3 },
  { cidade: 'Cidade do México', label: 'Cidade do México (CST)',    tz: 'America/Mexico_City',  offsetLisboa: -6 },
  { cidade: 'Toronto',          label: 'Toronto (ET)',              tz: 'America/Toronto',      offsetLisboa: -5 },
]

// ── Horários ao vivo (Lisboa) ─────────────────────────────────────────────────

export const HORARIOS_AO_VIVO_LISBOA = [10, 14, 18] // horas

export const PERIODOS_URGENCIA = [
  { label: 'Manhã',  horaLisboa: 9  },
  { label: 'Tarde',  horaLisboa: 14 },
  { label: 'Noite',  horaLisboa: 20 },
]

// ── Helper de exibição de horário nos resumos ─────────────────────────────────

export function formatarHorarioResumo(
  step1: Partial<DadosStep1>,
  step2: Partial<DadosStep2>,
): string {
  if (!step2.data) return ''
  const tiragem = TIRAGENS.find(t => t.id === step1.tiragemId)

  if (tiragem?.aoVivo && step2.hora != null) {
    const horaLisboa = `${String(step2.hora).padStart(2, '0')}h Lisboa`
    const fuso = FUSOS.find(f => f.tz === (step2.fusoTz ?? 'Europe/Lisbon'))
    if (fuso && fuso.offsetLisboa !== 0) {
      const horaLocal = ((step2.hora + fuso.offsetLisboa) % 24 + 24) % 24
      return `· ${horaLisboa} · ${String(horaLocal).padStart(2, '0')}h ${fuso.cidade}`
    }
    return `· ${horaLisboa}`
  }

  if (step2.periodo) return `· ${step2.periodo}`

  return ''
}

// ── Helpers de preço ──────────────────────────────────────────────────────────

export function precoComUrgencia(precoBRL: number): number {
  return precoBRL * 1.5
}

export function converterPreco(precoBRL: number, moeda: Moeda): number {
  return precoBRL * COTACOES[moeda]
}

export function formatarPreco(valor: number, moeda: Moeda): string {
  return `${SIMBOLOS[moeda]} ${valor.toLocaleString(moeda === 'BRL' ? 'pt-BR' : 'en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`
}

// ── Tipos do formulário ───────────────────────────────────────────────────────

export type Canal = 'whatsapp' | 'telegram'
export type MetodoPagamento = 'pix' | 'revolut' | 'cartao'

// ── Métodos de pagamento por moeda ────────────────────────────────────────────

export function metodosPorMoeda(moeda: Moeda): MetodoPagamento[] {
  switch (moeda) {
    case 'BRL':
      return ['pix', 'cartao']
    case 'EUR':
      return ['revolut', 'cartao']
    case 'USD':
      return ['cartao']
    default:
      return []
  }
}

export interface DadosStep1 {
  tiragemId: string
  idioma: Idioma
  moeda: Moeda
  urgencia: boolean
}

export interface DadosStep2 {
  fusoTz: string
  data: string         // ISO date YYYY-MM-DD
  hora: number | null  // hora Lisboa (null se não for urgente nem ao vivo)
  periodo: string | null // 'Manhã' | 'Tarde' | 'Noite' (urgência não-ao-vivo)
  slotISO: string | null // slot Cal.eu em UTC (tiragens regulares)
}

export interface DadosStep3 {
  nome: string
  canal: Canal
  contatoWhatsapp: string
  contatoWhatsappPais: string
  contatoTelegram: string
  email: string
  cupom: string
  indicacao: boolean
  indicadoPor: string
  nota: string
}

export interface DadosStep4 {
  metodoPagamento: MetodoPagamento
  stripePaymentIntentId?: string
}

export interface DadosWizard {
  step1: Partial<DadosStep1>
  step2: Partial<DadosStep2>
  step3: Partial<DadosStep3>
  step4: Partial<DadosStep4>
}
