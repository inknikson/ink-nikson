'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function CreateurPage() {
  const [titre, setTitre] = useState('')
  const [description, setDescription] = useState('')
  const [genre, setGenre] = useState('')
  const [cover, setCover] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setMessage('Tu dois être connecté !'); setLoading(false); return }
    let couverture = ''
    if (cover) {
      const { data, error } = await supabase.storage.from('covers').upload(`${user.id}/${Date.now()}-${cover.name}`, cover)
      if (error) { setMessage('Erreur upload'); setLoading(false); return }
      const { data: urlData } = supabase.storage.from('covers').getPublicUrl(data.path)
      couverture = urlData.publicUrl
    }
    const { error } = await supabase.from('series').insert({ createur_id: user.id, titre, description, genre, couverture })
    if (error) setMessage('Erreur: ' + error.message)
    else setMessage('BD créée !')
    setLoading(false)
  }

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0a',color:'white',padding:'40px 20px'}}>
      <h1 style={{textAlign:'center'}}>🎨 Espace Créateur</h1>
      <div style={{maxWidth:'600px',margin:'40px auto',background:'#1a1a2e',padding:'32px',borderRadius:'16px'}}>
        <input value={titre} onChange={e => setTitre(e.target.value)} placeholder="Titre de ta BD" style={{width:'100%',padding:'12px',marginBottom:'16px',borderRadius:'8px',border:'1px solid #333',background:'#0d0d1a',color:'white',boxSizing:'border-box'}} />
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description..." rows={4} style={{width:'100%',padding:'12px',marginBottom:'16px',borderRadius:'8px',border:'1px solid #333',background:'#0d0d1a',color:'white',boxSizing:'border-box'}} />
        <select value={genre} onChange={e => setGenre(e.target.value)} style={{width:'100%',padding:'12px',marginBottom:'16px',borderRadius:'8px',border:'1px solid #333',background:'#0d0d1a',color:'white',boxSizing:'border-box'}}>
          <option value="">Genre</option>
          <option value="action">Action</option>
          <option value="fantasy">Fantasy</option>
          <option value="romance">Romance</option>
          <option value="horreur">Horreur</option>
          <option value="comedie">Comédie</option>
          <option value="science-fiction">Science-fiction</option>
        </select>
        <input type="file" accept="image/*" onChange={e => setCover(e.target.files?.[0] || null)} style={{width:'100%',padding:'12px',marginBottom:'24px',borderRadius:'8px',border:'1px solid #333',background:'#0d0d1a',color:'white',boxSizing:'border-box'}} />
        <button onClick={handleSubmit} disabled={loading || !titre} style={{width:'100%',padding:'14px',background:'linear-gradient(135deg,#ff6b9d,#ff8c42)',border:'none',borderRadius:'8px',color:'white',fontWeight:'bold',cursor:'pointer',fontSize:'16px'}}>
          {loading ? 'Publication...' : '🚀 Publier ma BD'}
        </button>
        {message && <p style={{marginTop:'16px',textAlign:'center',color:'#ff6b9d'}}>{message}</p>}
      </div>
    </div>
  )
}