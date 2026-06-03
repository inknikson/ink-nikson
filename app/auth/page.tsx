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
      if (error) { setMessage('Erreur upload image'); setLoading(false); return }
      const { data: urlData } = supabase.storage.from('covers').getPublicUrl(data.path)
      couverture = urlData.publicUrl
    }

    const { error } = await supabase.from('series').insert({ createur_id: user.id, titre, description, genre, couverture })
    if (error) setMessage('Erreur: ' + error.message)
    else setMessage('✅ BD créée avec succès !')
    setLoading(false)
  }

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0a',color:'white',padding:'40px 20px'}}>
      <h1 style={{textAlign:'center',marginBottom:'8px'}}>🎨 Espace <span style={{color:'#ff6b9d'}}>Créateur</span></h1>
      <p style={{textAlign:'center',color:'#888',marginBottom:'40px'}}>Publie ta bande dessinée sur INK NIKSON</p>

      <div style={{maxWidth:'600px',margin:'0 auto',background:'#1a1a2e',padding:'32px',borderRadius:'16px'}}>
        <h2 style={{marginBottom:'24px'}}>Créer une nouvelle BD</h2>

        <label style={{display:'block',marginBottom:'8px',color:'#aaa'}}>Titre *</label>
        <input value={titre} onChange={e => setTitre(e.target.value)} placeholder="Titre de ta BD" style={{width:'100%',padding:'12px',marginBottom:'16px',borderRadius:'8px',border:'1px solid #333',background:'#0d0d1a',color:'white',boxSizing:'border-box'}} />

        <label style={{display:'block',marginBottom:'8px',color:'#aaa'}}>Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Décris ton histoire..." rows={4} style={{width:'100%',padding:'12px',marginBottom:'16px',borderRadius:'8px',border:'1px solid #333',background:'#0d0d1a',color:'white',boxSizing:'border-box',resize:'vertical'}} />

        <label style={{display:'block',marginBottom:'8px',color:'#aaa'}}>Genre</label>
        <select value={genre} onChange={e => setGenre(e.target.value)} style={{width:'100%',padding:'12px',marginBottom:'16px',borderRadius:'8px',border:'1px solid #333',background:'#0d0d1a',color:'white',boxSizing:'border-box'}}>
          <option value="">Choisir un genre</option>
          <option value="action">Action</option>
          <option value="fantasy">Fantasy</option>
          <option value="romance">Romance</option>
          <option value="horreur">Horreur</option>
          <option value="comedie">Comédie</option>
          <option value="science-fiction">Science-fiction</option>
          <option value="drame">Drame</option>
        </select>

        <label style={{display:'block',marginBottom:'8px',color:'#aaa'}}>Image de couverture</label>
        <input type="file" accept="image/*" onChange={e => setCover(e.target.files?.[0] || null)} style={{width:'100%',padding:'12px',marginBottom:'24px',borderRadius:'8px',border:'1px solid #333',background:'#0d0d1a',color:'white',boxSizing:'border-box'}} />

        <button onClick={handleSubmit} disabled={loading || !titre} style={{width:'100%',padding:'14px',background:'linear-gradient(135deg,#ff6b9d,#ff8c42)',border:'none',borderRadius:'8px',color:'white',fontWeight:'bold',cursor:'pointer',fontSize:'16px',opacity: loading || !titre ? 0.6 : 1}}>
          {loading ? 'Publication en cours...' : '🚀 Publier ma BD'}
        </button>

        {message && <p style={{marginTop:'16px',textAlign:'center',color:'#ff6b9d'}}>{message}</p>}
      </div>
    </div>
  )
}
