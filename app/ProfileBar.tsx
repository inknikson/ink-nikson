 
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function ProfileBar() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  if (!user) return null

  return (
    <div style={{position:'fixed',top:'10px',right:'10px',zIndex:9999,background:'#1a1a2e',padding:'10px 16px',borderRadius:'12px',color:'white',display:'flex',gap:'12px',alignItems:'center'}}>
      <span>👤 {user.email}</span>
      <button onClick={handleLogout} style={{background:'#ff6b9d',border:'none',borderRadius:'8px',color:'white',padding:'6px 12px',cursor:'pointer'}}>Déconnexion</button>
    </div>
  )
}