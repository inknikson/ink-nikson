 'use client'
import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const plans = [
  { name: 'Découverte', price: '6€/mois', description: 'Accès aux BD gratuites', priceId: 'price_decouverte' },
  { name: 'Lecteur', price: '9€/mois', description: 'Accès à toutes les BD', priceId: 'price_lecteur' },
  { name: 'Passionné', price: '13€/mois', description: 'Accès illimité + avantages', priceId: 'price_passionne' },
]

export default function AbonnementPage() {
  const [loading, setLoading] = useState('')

  const handleSubscribe = async (priceId: string, planName: string) => {
    setLoading(planName)
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId })
    })
    const { url } = await res.json()
    if (url) window.location.href = url
    setLoading('')
  }

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0a',color:'white',padding:'40px 20px'}}>
      <h1 style={{textAlign:'center',marginBottom:'8px'}}>Nos <span style={{background:'linear-gradient(135deg,#7C3AED,#EC4899)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Abonnements</span></h1>
      <p style={{textAlign:'center',color:'#888',marginBottom:'48px'}}>Accède à toutes les BD sur INK NIKSON</p>
      <div style={{display:'flex',gap:'24px',justifyContent:'center',flexWrap:'wrap',maxWidth:'900px',margin:'0 auto'}}>
        {plans.map(plan => (
          <div key={plan.name} style={{background:'#1a1a2e',borderRadius:'16px',padding:'32px',width:'260px',textAlign:'center',border:'1px solid #333'}}>
            <h2 style={{marginBottom:'8px'}}>{plan.name}</h2>
            <div style={{fontSize:'2rem',fontWeight:'bold',background:'linear-gradient(135deg,#7C3AED,#EC4899)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',marginBottom:'8px'}}>{plan.price}</div>
            <p style={{color:'#888',marginBottom:'24px'}}>{plan.description}</p>
            <button onClick={() => handleSubscribe(plan.priceId, plan.name)} disabled={loading === plan.name} style={{width:'100%',padding:'12px',background:'linear-gradient(135deg,#7C3AED,#EC4899)',border:'none',borderRadius:'8px',color:'white',fontWeight:'bold',cursor:'pointer',fontSize:'16px'}}>
              {loading === plan.name ? 'Chargement...' : "S'abonner"}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
