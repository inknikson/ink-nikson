import fs from 'fs'
import path from 'path'

export default function Home() {
  const html = fs.readFileSync(
    path.join(process.cwd(), 'public', 'ink-nikson.html'),
    'utf-8'
  )
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  const script = `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
window.supabaseClient = null;
document.addEventListener('DOMContentLoaded', function(){
  window.supabaseClient = window.supabase.createClient('${supabaseUrl}', '${supabaseKey}');
});
</script>`

  const introAnimation = `
<div id="intro-screen" style="position:fixed;top:0;left:0;width:100%;height:100%;background:#0a0a0a;z-index:99999;display:flex;align-items:center;justify-content:center;flex-direction:column">
  <div id="intro-logo" style="font-family:'Fraunces',serif;font-size:3.5rem;font-weight:900;letter-spacing:-0.02em;opacity:0;transform:scale(0.8);transition:all 0.6s cubic-bezier(0.16,1,0.3,1)">
    <span style="color:white">INK </span><span style="background:linear-gradient(135deg,#7C3AED,#EC4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">NIKSON</span>
  </div>
  <div id="intro-line" style="width:0px;height:3px;background:linear-gradient(90deg,#7C3AED,#EC4899);margin-top:1.5rem;border-radius:2px;transition:width 1.8s cubic-bezier(0.16,1,0.3,1)"></div>
</div>
<script>
setTimeout(function(){
  document.getElementById('intro-logo').style.opacity='1';
  document.getElementById('intro-logo').style.transform='scale(1)';
  document.getElementById('intro-line').style.width='200px';
},100);
setTimeout(function(){
  var s=document.getElementById('intro-screen');
  s.style.transition='opacity 0.6s ease';
  s.style.opacity='0';
  setTimeout(function(){s.style.display='none';},600);
},2500);
</script>`

  const createurScript = `
<script>
function soumettreNouvelleBD(){
  if(!window.supabaseClient){ showToast('Connexion requise !'); return; }
  var titreEl = document.querySelector('#modal-upload input[type="text"]');
  var genreEl = document.querySelector('#modal-upload select');
  var coverInput = document.getElementById('cover-input');
  var prixEl = document.getElementById('bd-prix');
  if(!titreEl || !titreEl.value){ showToast('Ajoute un titre !'); return; }
  showToast('Publication en cours...');
  window.supabaseClient.auth.getUser().then(function({data}){
    if(!data.user){ showToast('Tu dois être connecté !'); return; }
    var userId = data.user.id;
    var coverFile = coverInput ? coverInput.files[0] : null;
    var uploadCover = function(cb){
      if(!coverFile){ cb(''); return; }
      window.supabaseClient.storage.from('covers').upl
    oad(userId+'/'+Date.now()+'-'+coverFile.name, coverFile).then(function({data:d,error:e}){
        if(e){ cb(''); return; }
        cb(window.supabaseClient.storage.from('covers').getPublicUrl(d.path).data.publicUrl);
      });
    };
    uploadCover(function(coverUrl){
      window.supabaseClient.from('series').insert({
        createur_id: userId,
        titre: titreEl.value,
        genre: genreEl ? genreEl.value : '',
        couverture: coverUrl,
        prix: parseFloat(prixEl ? prixEl.value : '3.99'),
        statut: 'en_cours'
      }).select().single().then(function({data:serie, error:err}){
        if(err){ showToast('Erreur: '+err.message); return; }
        var bdInput2 = document.getElementById('bd-input');
        var files = bdInput2 ? bdInput2.files : null;
        if(!files || files.length===0){
          closeModal('modal-upload');
          showToast('BD créée avec succès !');
          return;
        }
        window.supabaseClient.from('chapitres').insert({serie_id:serie.id,titre:'Chapitre 1',numero:1}).select().single().then(function({data:chap}){
          var arr = Array.from(files).sort(function(a,b){return a.name.localeCompare(b.name);});
          var done = 0;
          arr.forEach(function(file,i){
            window.supabaseClient.storage.from('pages').upload(userId+'/'+serie.id+'/'+String(i+1).padStart(3,'0')+'-'+file.name, file).then(function({data:fd}){
              var url = window.supabaseClient.storage.from('pages').getPublicUrl(fd.path).data.publicUrl;
              window.supabaseClient.from('pages').insert({chapitre_id:chap.id,numero:i+1,image_url:url}).then(function(){
                done++;
                if(done===arr.length){ closeModal('modal-upload'); showToast(done+' pages uploadées !'); }
              });
            });
          });
        });
      });
    });
  });
}
</script>`

  const stripeScript = `
<script>
var STRIPE_PLANS = {
  'NIKSON Découverte': 'price_1TfGYSLU9y8ShXiWt1PbcF29',
  'NIKSON Lecteur': 'price_1TfGZaLU9y8ShXiW1IkyDWCa',
  'NIKSON Passionné': 'price_1TfGaPLU9y8ShXiWFaEdFD2y'
};
var selectedPlan = 'NIKSON Lecteur';
window.addEventListener('load', function(){
  setTimeout(function(){
    var origSelect = window.selectSubPlan;
    window.selectSubPlan = function(el, plan, price){
      selectedPlan = plan;
      if(origSelect) origSelect(el, plan, price);
    };
    var origConfirm = window.confirmPayment;
    window.confirmPayment = function(type){
      if(type === 'buy'){
        var prix = window.currentBDPrix || 3.99;
        var titre = window.currentBDTitre || 'Bande Dessinée';
        showToast('Redirection vers le paiement...');
        fetch('/api/checkout', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({amount: prix, bdTitle: titre})
        }).then(function(r){ return r.json(); }).then(function(data){
          if(data.url) window.location.href = data.url;
        });
      } else if(type === 'sub'){
        var priceId = STRIPE_PLANS[selectedPlan];
        if(!priceId){ showToast('Plan non trouvé !'); return; }
        showToast('Redirection vers le paiement...');
        fetch('/api/checkout', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({priceId: priceId})
        }).then(function(r){ return r.json(); }).then(function(data){
          if(data.url) window.location.href = data.url;
        });
      } else {
        if(origConfirm) origConfirm(type);
      }
    };
  }, 1000);
});
</script>`


<script>
function chargerVraisBD(){
  if(!window.supabaseClient){ setTimeout(chargerVraisBD, 500); return; }
  window.supabaseClient.from('series').select('*').then(function({data}){
    if(!data || data.length===0) return;
    
    var grilleAbo = document.querySelector('[class*="bd-grid"]');
    var grilleBoutique = document.querySelector('#page-boutique [class*="bd-grid"], #page-shop [class*="bd-grid"]');
    
    data.forEach(function(serie){
      var cover = serie.couverture ? 
        '<img src="'+serie.couverture+'" style="width:100%;height:100%;object-fit:cover;position:absolute;top:0;left:0">' : 
        '<div class="cov-geo"></div>';
      
      // Carte pour abonnements (sans prix)
      if(grilleAbo){
        var cardAbo = document.createElement('div');
        cardAbo.className = 'bd-card';
        cardAbo.innerHTML = '<div class="bd-cover cov-a" style="position:relative">'+cover+'<div class="free-pill">Inclus</div><div class="cov-label"><div class="cov-ep">'+serie.genre+'</div><div class="cov-title">'+serie.titre+'</div></div><div class="bd-overlay"><div class="bd-read-btn">Lire</div></div></div><div class="bd-footer"><div class="bd-genre">'+(serie.genre||'BD')+'</div><div class="bd-name">'+serie.titre+'</div></div>';
        cardAbo.onclick = function(){ ouvrirVraieBD(serie.id, serie.titre); };
        grilleAbo.appendChild(cardAbo);
      }
      
      // Carte pour boutique (avec prix)
      if(grilleBoutique){
        var cardBoutique = document.createElement('div');
        cardBoutique.className = 'bd-card';
        cardBoutique.innerHTML = '<div class="bd-cover cov-a" style="position:relative">'+cover+'<div class="cov-label"><div class="cov-ep">'+serie.genre+'</div><div class="cov-title">'+serie.titre+'</div></div><div class="bd-overlay"><div class="bd-read-btn">Acheter</div></div></div><div class="bd-footer"><div class="bd-genre">'+(serie.prix||'3.99')+'€</div><div class="bd-name">'+serie.titre+'</div></div>';
        cardBoutique.onclick = function(){ 
          window.currentBDPrix = serie.prix || 3.99;
          window.currentBDTitre = serie.titre;
          openModal('modal-buy'); 
        };
        grilleBoutique.appendChild(cardBoutique);
      }
    });
  });
}

function ouvrirVraieBD(serieId, titre){
  window.supabaseClient.from('chapitres').select('*').eq('serie_id', serieId).order('numero').then(function({data}){
    if(!data || data.length===0){ showToast('Aucun chapitre disponible !'); return; }
    ouvrirChapitreBD(data[0].id, titre);
  });
}

function ouvrirChapitreBD(chapId, titre){
  window.supabaseClient.from('pages').select('*').eq('chapitre_id', chapId).order('numero').then(function({data}){
    if(!data || data.length===0){ showToast('Aucune page disponible !'); return; }
    var pages = document.querySelector('.reader-pages');
    if(!pages) return;
    pages.innerHTML = '';
    data.forEach(function(page){
      var img = document.createElement('img');
      img.src = page.image_url;
      img.style.cssText = 'width:100%;max-width:800px;display:block;margin:0 auto 4px';
      pages.appendChild(img);
    });
    showPage('reader');
  });
}

document.addEventListener('DOMContentLoaded', function(){
  setTimeout(chargerVraisBD, 1500);
});
</script>`

  const finalHtml = html
    .replace('<meta http-equiv="Content-Security-Policy"', '<!-- CSP disabled --><meta name="csp-disabled"')
    .replace('<body>', '<body>' + introAnimation + createurScript + stripeScript + catalogueScript + adminScript)
    .replace('</body>', script + '</body>')
  
  return <div dangerouslySetInnerHTML={{ __html: finalHtml }} />
}