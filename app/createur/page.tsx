'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function CreateurPage() {
  const [etape, setEtape] = useState<'serie' | 'chapitre' | 'pages'>('serie')
  const [titre, setTitre] = useState('')
  const [description, setDescription] = useState('')
  const [genre, setGenre] = useState('')
  const [cover, setCover] = useState<File | null>(null)
  const [serieId, setSerieId] = useState('')
  const [titreChapitre, setTitreChapitre] = useState('')
  const [chapitreId, setChapitreId] = useState('')
  const [pages, setPages] = useState<FileList | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const creerSerie = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setMessage('Tu dois être connecté !'); setLoading(false); return }
    let couverture = ''
    if (cover) {
      const { data, error } = await supabase.storage.from('covers').upload(`${user.id}/${Date.now()}-${cover.name}`, cover)
      if (error) { setMessage('Erreur upload couverture'); setLoading(false); return }
      const { data: urlData } = supabase.storage.from('covers').getPublicUrl(data.path)
      couverture = urlData.publicUrl
    }
    const { data, error } = await supabase.from('series').insert({ createur_id: user.id, titre, description, genre, couverture }).select().single()
    if (error) { setMessage('Erreur: ' + error.message); setLoading(false); return }
    setSerieId(data.id)
    setMessage('✅ BD créée ! Maintenant ajoute un chapitre.')
    setEtape('chapitre')
    setLoading(false)
  }

  const creerChapitre = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('chapitres').insert({ serie_id: serieId, titre: titreChapitre, numero: 1 }).select().single()
    if (error) { setMessage('Erreur: ' + error.message); setLoading(false); return }
    setChapitreId(data.id)
    setMessage('✅ Chapitre créé ! Maintenant uploade tes pages.')
    setEtape('pages')
    setLoading(false)
  }

  const uploaderPages = async () => {
    if (!pages || pages.length === 0) { setMessage('Sélectionne des images !'); return }
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setMessage('Tu dois être connecté !'); setLoading(false); return }
    const filesArray = Array.from(pages).sort((a, b) => a.name.localeCompare(b.name))
    let succes = 0
    for (let i = 0; i < filesArray.length; i++) {
      const file = filesArray[i]
      const { data, error } = await supabase.storage.from('pages').upload(`${chapitreId}/${String(i+1).padStart(3,'0')}-${file.name}`, file)
      if (error) continue
      const { data: urlData } = supabase.storage.from('pages').getPublicUrl(data.path)
      await supabase.from('pages').insert({ chapitre_id: chapitreId, numero: i+1, image_url: urlData.publicUrl })
      succes++
    }
    setMessage(`✅ ${succes} pages uploadées avec succès ! Ta BD est publiée !`)
    setLoading(false)
  }

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0a',color:'white',padding:'40px 20px'}}>
      <h1 style={{textAlign:'center',marginBottom:'8px'}}>🎨 Espace <span style={{color:'#ff6b9d'}}>Créateur</span></h1>
      <p style={{textAlign:'center',color:'#888',marginBottom:'40px'}}>Publie ta bande dessinée sur INK NIKSON</p>

      <div style={{display:'flex',justifyContent:'center',gap:'8px',marginBottom:'40px'}}>
        {['serie','chapitre','pages'].map((e, i) => (
          <div key={e} style={{padding:'8px 16px',borderRadius:'20px',background:etape===e?'#ff6b9d':'#1a1a2e',color:'white',fontSize:'14px'}}>
            {i+1}. {e==='serie'?'Créer la BD':e==='chapitre'?'Ajouter un chapitre':'Uploader les pages'}
          </div>
        ))}
      </div>

      <div style={{maxWidth:'600px',margin:'0 auto',background:'#1a1a2e',padding:'32px',borderRadius:'16px'}}>
        {etape === 'serie' && (
          <>
            <h2 style={{marginBottom:'24px'}}>📚 Infos de ta BD</h2>
            <input value={titre} onChange={e => setTitre(e.target.value)} placeholder="Titre de ta BD *" style={{width:'100%',padding:'12px',marginBottom:'16px',borderRadius:'8px',border:'1px solid #333',background:'#0d0d1a',color:'white',boxSizing:'border-box'}} />
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description de l'histoire..." rows={4} style={{width:'100%',padding:'12px',marginBottom:'16px',borderRadius:'8px',border:'1px solid #333',background:'#0d0d1a',color:'white',boxSizing:'border-box',resize:'vertical'}} />
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
            <button onClick={creerSerie} disabled={loading || !titre} style={{width:'100%',padding:'14px',background:'linear-gradient(135deg,#ff6b9d,#ff8c42)',border:'none',borderRadius:'8px',color:'white',fontWeight:'bold',cursor:'pointer',fontSize:'16px'}}>
              {loading ? 'Création...' : '➡️ Étape suivante'}
            </button>
          </>
        )}

        {etape === 'chapitre' && (
          <>
            <h2 style={{marginBottom:'24px'}}>📖 Ajouter un chapitre</h2>
            <input value={titreChapitre} onChange={e => setTitreChapitre(e.target.value)} placeholder="Titre du chapitre (ex: Chapitre 1 - Les débuts)" style={{width:'100%',padding:'12px',marginBottom:'24px',borderRadius:'8px',border:'1px solid #333',background:'#0d0d1a',color:'white',boxSizing:'border-box'}} />
            <button onClick={creerChapitre} disabled={loading || !titreChapitre} style={{width:'100%',padding:'14px',background:'linear-gradient(135deg,#ff6b9d,#ff8c42)',border:'none',borderRadius:'8px',color:'white',fontWeight:'bold',cursor:'pointer',fontSize:'16px'}}>
              {loading ? 'Création...' : '➡️ Étape suivante'}
            </button>
          </>
        )}

        {etape === 'pages' && (
          <>
            <h2 style={{marginBottom:'8px'}}>🖼️ Uploader tes pages</h2>
            <p style={{color:'#888',marginBottom:'24px',fontSize:'14px'}}>Sélectionne toutes tes images en même temps. Le site les rangera automatiquement dans l'ordre alphabétique de leur nom.</p>
            <input type="file" accept="image/*" multiple onChange={e => setPages(e.target.files)} style={{width:'100%',padding:'12px',marginBottom:'8px',borderRadius:'8px',border:'1px solid #333',background:'#0d0d1a',color:'white',boxSizing:'border-box'}} />
            {pages && <p style={{color:'#ff6b9d',marginBottom:'16px',fontSize:'14px'}}>✅ {pages.length} image(s) sélectionnée(s)</p>}
            <button onClick={uploaderPages} disabled={loading || !pages} style={{width:'100%',padding:'14px',background:'linear-gradient(135deg,#ff6b9d,#ff8c42)',border:'none',borderRadius:'8px',color:'white',fontWeight:'bold',cursor:'pointer',fontSize:'16px'}}>
              {loading ? `Upload en cours...` : '🚀 Publier ma BD !'}
            </button>
          </>
        )}

        {message && <p style={{marginTop:'16px',textAlign:'center',color:'#ff6b9d'}}>{message}</p>}
      </div>
    </div>
  )
}
