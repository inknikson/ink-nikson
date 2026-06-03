'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleAuth = async () => {
    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage(error.message)
      else setMessage('Vérifie ton email !')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
      else router.push('/')
    }
  }

  return (
    <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh',background:'#0a0a0a'}}>
      <div style={{background:'#1a1a2e',padding:'40px',borderRadius:'16px',width:'360px',color:'white'}}>
        <h2 style={{textAlign:'center',marginBottom:'24px'}}>INK <span style={{color:'#ff6b9d'}}>NIKSON</span></h2>
        <div style={{display:'flex',marginBottom:'24px'}}>
          <button onClick={() => setMode('login')} style={{flex:1,padding:'10px',background:mode==='login'?'#ff6b9d':'transparent',border:'none',color:'white',cursor:'pointer',borderRadius:'8px 0 0 8px'}}>Connexion</button>
          <button onClick={() => setMode('signup')} style={{flex:1,padding:'10px',background:mode==='signup'?'#ff6b9d':'transparent',border:'none',color:'white',cursor:'pointer',borderRadius:'0 8px 8px 0'}}>Inscription</button>
        </div>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{width:'100%',padding:'12px',marginBottom:'12px',borderRadius:'8px',border:'1px solid #333',background:'#0d0d1a',color:'white',boxSizing:'border-box'}} />
        <input type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} style={{width:'100%',padding:'12px',marginBottom:'16px',borderRadius:'8px',border:'1px solid #333',background:'#0d0d1a',color:'white',boxSizing:'border-box'}} />
        <button onClick={handleAuth} style={{width:'100%',padding:'12px',background:'linear-gradient(135deg,#ff6b9d,#ff8c42)',border:'none',borderRadius:'8px',color:'white',fontWeight:'bold',cursor:'pointer',fontSize:'16px'}}>
          {mode === 'login' ? 'SE CONNECTER' : "S'INSCRIRE"}
        </button>
        {message && <p style={{marginTop:'16px',textAlign:'center',color:'#ff6b9d'}}>{message}</p>}
      </div>
    </div>
  )
}
