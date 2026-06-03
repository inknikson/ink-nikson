 'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function LirePage() {
  const [series, setSeries] = useState<any[]>([])
  const [selectedSerie, setSelectedSerie] = useState<any>(null)
  const [chapitres, setChapitres] = useState<any[]>([])
  const [selectedChapitre, setSelectedChapitre] = useState<any>(null)
  const [pages, setPages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('series').select('*').then(({ data }) => {
      setSeries(data || [])
      setLoading(false)
    })
  }, [])

  const ouvrirSerie = async (serie: any) => {
    setSelectedSerie(serie)
    setSelectedChapitre(null)
    setPages([])
    const { data } = await supabase.from('chapitres').select('*').eq('serie_id', serie.id).order('numero')
    setChapitres(data || [])
  }

  const ouvrirChapitre = async (chapitre: any) => {
    setSelectedChapitre(chapitre)
    const { data } = await supabase.from('pages').select('*').eq('chapitre_id', chapitre.id).order('numero')
    setPages(data || [])
  }

  if (loading) return <div style={{minHeight:'100vh',background:'#0a0a0a',color:'white',display:'flex',alignItems:'center',justifyContent:'center'}}>Chargement...</div>

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0a',color:'white',padding:'20px'}}>
      <h1 style={{textAlign:'center',marginBottom:'32px'}}>📚 Bibliothèque <span style={{color:'#ff6b9d'}}>INK NIKSON</span></h1>

      {!selectedSerie && (
        <div style={{maxWidth:'1200px',margin:'0 auto'}}>
          {series.length === 0 && <p style={{textAlign:'center',color:'#888'}}>Aucune BD disponible pour le moment.</p>}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))',gap:'24px'}}>
            {series.map(serie => (
              <div key={serie.id} onClick={() => ouvrirSerie(serie)} style={{background:'#1a1a2e',borderRadius:'12px',overflow:'hidden',cursor:'pointer',transition:'transform 0.2s'}} onMouseOver={e => (e.currentTarget.style.transform='scale(1.05)')} onMouseOut={e => (e.currentTarget.style.transform='scale(1)')}>
                {serie.couverture && <img src={serie.couverture} alt={serie.titre} style={{width:'100%',height:'280px',objectFit:'cover'}} />}
                {!serie.couverture && <div style={{width:'100%',height:'280px',background:'#333',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'48px'}}>📖</div>}
                <div style={{padding:'12px'}}>
                  <h3 style={{margin:'0 0 4px',fontSize:'16px'}}>{serie.titre}</h3>
                  <span style={{fontSize:'12px',color:'#ff6b9d',background:'#2a1a2e',padding:'2px 8px',borderRadius:'12px'}}>{serie.genre}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedSerie && !selectedChapitre && (
        <div style={{maxWidth:'800px',margin:'0 auto'}}>
          <button onClick={() => setSelectedSerie(null)} style={{background:'transparent',border:'1px solid #333',color:'white',padding:'8px 16px',borderRadius:'8px',cursor:'pointer',marginBottom:'24px'}}>← Retour</button>
          <div style={{display:'flex',gap:'24px',marginBottom:'32px',flexWrap:'wrap'}}>
            {selectedSerie.couverture && <img src={selectedSerie.couverture} alt={selectedSerie.titre} style={{width:'200px',borderRadius:'12px',objectFit:'cover'}} />}
            <div>
              <h2>{selectedSerie.titre}</h2>
              <span style={{fontSize:'12px',color:'#ff6b9d',background:'#2a1a2e',padding:'4px 12px',borderRadius:'12px'}}>{selectedSerie.genre}</span>
              <p style={{color:'#aaa',marginTop:'12px'}}>{selectedSerie.description}</p>
            </div>
          </div>
          <h3 style={{marginBottom:'16px'}}>Chapitres</h3>
          {chapitres.map(chapitre => (
            <div key={chapitre.id} onClick={() => ouvrirChapitre(chapitre)} style={{background:'#1a1a2e',padding:'16px',borderRadius:'8px',marginBottom:'8px',cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span>{chapitre.titre}</span>
              <span style={{color:'#ff6b9d'}}>Lire →</span>
            </div>
          ))}
        </div>
      )}

      {selectedChapitre && (
        <div style={{maxWidth:'800px',margin:'0 auto'}}>
          <button onClick={() => setSelectedChapitre(null)} style={{background:'transparent',border:'1px solid #333',color:'white',padding:'8px 16px',borderRadius:'8px',cursor:'pointer',marginBottom:'24px'}}>← Retour aux chapitres</button>
          <h2 style={{textAlign:'center',marginBottom:'24px'}}>{selectedChapitre.titre}</h2>
          {pages.map(page => (
            <img key={page.id} src={page.image_url} alt={`Page ${page.numero}`} style={{width:'100%',display:'block',marginBottom:'4px'}} />
          ))}
        </div>
      )}
    </div>
  )
}
