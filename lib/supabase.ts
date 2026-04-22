// lib/supabase.ts
// Cliente Supabase para uso EXCLUSIVO nas API routes (server-side)
// Usa a service_role key — nunca importar em componentes cliente

import { createClient } from '@supabase/supabase-js'

// Lazy singleton — inicializado apenas na primeira chamada (não no build)
let _client: ReturnType<typeof createClient> | null = null

function getClient() {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) {
      throw new Error('Variáveis NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY não definidas.')
    }
    _client = createClient(url, key, { auth: { persistSession: false } })
  }
  return _client
}

export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    return (getClient() as Record<string | symbol, unknown>)[prop]
  },
})

// ── Tipos espelho das tabelas ─────────────────────────────────

export interface DbCliente {
  id:            string
  nome:          string
  email:         string
  canal:         'whatsapp' | 'telegram'
  contato:       string
  criado_em:     string
  atualizado_em: string
}

export interface DbCupom {
  id:         string
  codigo:     string
  desconto:   number
  ativo:      boolean
  uso_maximo: number | null
  uso_atual:  number
  expira_em:  string | null
  criado_em:  string
}

export interface DbAgendamento {
  id:                string
  cliente_id:        string | null
  nome_cliente:      string
  email_cliente:     string
  canal_cliente:     'whatsapp' | 'telegram'
  contato_cliente:   string
  tiragem_id:        string
  tiragem_nome:      string
  idioma:            'pt' | 'es' | 'en'
  urgencia:          boolean
  data_agendada:     string
  hora_lisboa:       number | null
  periodo:           string | null
  fuso_cliente:      string
  moeda:             'BRL' | 'USD' | 'EUR'
  preco_brl:         number
  cupom_codigo:      string | null
  cupom_desconto:    number
  total_brl:         number
  metodo_pagamento:  'pix' | 'revolut' | 'cartao' | null
  stripe_payment_id: string | null
  pago:              boolean
  cal_booking_id:    number | null
  cal_booking_uid:   string | null
  indicado_por:      string | null
  nota:              string | null
  status:            'pendente' | 'confirmado' | 'cancelado' | 'concluido'
  criado_em:         string
  atualizado_em:     string
}
