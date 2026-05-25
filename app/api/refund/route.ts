// app/api/refund/route.ts
// POST /api/refund — estorna um PaymentIntent já capturado pelo Stripe.
// Chamado automaticamente pelo cliente quando o Cal.com falha após o pagamento.

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
})

export async function POST(req: NextRequest) {
  const { paymentIntentId } = await req.json()

  if (!paymentIntentId || typeof paymentIntentId !== 'string') {
    return NextResponse.json({ error: 'paymentIntentId obrigatório.' }, { status: 400 })
  }

  try {
    const refund = await stripe.refunds.create({ payment_intent: paymentIntentId })
    console.log(`[REFUND] Estorno criado: ${refund.id} para PI ${paymentIntentId}`)
    return NextResponse.json({ refundId: refund.id, status: refund.status })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro ao estornar pagamento'
    console.error(`[REFUND] Falha ao estornar PI ${paymentIntentId}:`, msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
