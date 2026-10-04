'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import Menu from '../../components/Menu'
export default function Publico() {
  const { slug } = useParams(); const [s, setS] = useState({ load: true })
  useEffect(() => { (async () => {
    const { data: r } = await supabase.from('restaurants').select('*').eq('slug', slug).maybeSingle()
    const { data: cats } = r ? await supabase.from('categories').select('id,name,items(id,name,description,price,hidden)').eq('restaurant_id', r.id).order('pos') : { data: [] }
    setS({ r, cats })
  })() }, [slug])
  return <div className="w">{s.load ? <p className="m">Carregando…</p> : <Menu r={s.r} cats={s.cats} />}</div>
}
