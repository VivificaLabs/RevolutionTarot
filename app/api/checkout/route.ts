// app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
})

const COTACOES: Record<string, number> = { BRL: 1, USD: 0.18, EUR: 0.17 }
const MOEDA_STRIPE: Record<string, string> = { BRL: 'brl', USD: 'usd', EUR: 'eur' }

export async function POST(req: NextRequest) {
  const { valorBRL, moeda, descricao, email, nome } = await req.json()

  if (!valorBRL || !moeda || !descricao)
    return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 })

  const valorNaMoeda = Math.round(valorBRL * COTACOES[moeda] * 100)

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: valorNaMoeda,
      currency: MOEDA_STRIPE[moeda],
      description: descricao,
      receipt_email: email || undefined,
      metadata: { nome: nome || '', moeda },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro ao processar pagamento'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
