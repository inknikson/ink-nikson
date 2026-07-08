import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20' as any,
})

export async function POST(req: Request) {
  try {
    const { priceId, amount, bdTitle } = await req.json()
    
    let session

    if (priceId) {
      session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ink-nikson.vercel.app'}/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ink-nikson.vercel.app'}`,
      })
    } else {
      session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'eur',
            product_data: { name: bdTitle || 'Bande Dessinée INK NIKSON' },
            unit_amount: Math.round((amount || 3.99) * 100),
          },
          quantity: 1,
        }],
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ink-nikson.vercel.app'}/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ink-nikson.vercel.app'}`,
      })
    }

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Stripe error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}