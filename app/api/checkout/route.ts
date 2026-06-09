 import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const { priceId } = await req.json()
  
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/abonnement/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/abonnement`,
  })

  return NextResponse.json({ url: session.url })
}
