import { createClient } from '@/lib/supabase/server'

export default async function TestPage() {
  const supabase = createClient()
  const { count, error } = await supabase
    .from('artworks')
    .select('*', { count: 'exact', head: true })

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Database Test</h1>
      {error ? (
        <p style={{ color: 'red' }}>Error: {error.message}</p>
      ) : (
        <p style={{ color: 'green' }}>✅ Connected! Artworks count: {count}</p>
      )}
    </div>
  )
}
