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
</div>
<script>
setTimeout(function(){
  document.getElementById('intro-logo').style.opacity='1';
  document.getElementById('intro-logo').style.transform='scale(1)';
},100);
setTimeout(function(){
  var s=document.getElementById('intro-screen');
  s.style.transition='opacity 0.6s ease';
  s.style.opacity='0';
  setTimeout(function(){s.style.display='none';},600);
},2500);
</script>`

const finalHtml = html.replace('<meta http-equiv="Content-Security-Policy"', '<!-- CSP disabled --><meta name="csp-disabled"')
  .replace('<body>', '<body>' + introAnimation)
  .replace('</body>', script + '</body>')
  
  return <div dangerouslySetInnerHTML={{ __html: finalHtml }} />
}
