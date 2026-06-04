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

  const finalHtml = html.replace('<meta http-equiv="Content-Security-Policy"', '<!-- CSP disabled --><meta name="csp-disabled"')
  .replace('</body>', script + '</body>')
  
  return <div dangerouslySetInnerHTML={{ __html: finalHtml }} />
}
