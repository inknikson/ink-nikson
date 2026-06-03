import fs from 'fs'
import path from 'path'
import ProfileBar from './ProfileBar'

export default function Home() {
  const html = fs.readFileSync(
    path.join(process.cwd(), 'public', 'ink-nikson.html'),
    'utf-8'
  )
  return (
    <>
      <ProfileBar />
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </>
  )
}
