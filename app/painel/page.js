'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { QRCodeCanvas } from 'qrcode.react'
import { supabase } from '../../lib/supabase'
import Menu from '../../components/Menu'
const slugify = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
export default function Painel() {
  const router = useRouter(); const [uid, setUid] = useState(null), [r, setR] = useState(null), [cats, setCats] = useState([]), [ready, setReady] = useState(false), [msg, setMsg] = useState('')
  const load = useCallback(async user => {
    const rid = new URLSearchParams(location.search).get('rid')
    const q = supabase.from('restaurants').select('*')
    const { data } = await (rid ? q.eq('id', rid) : q.eq('owner_id', user)).maybeSingle()
    setR(data)
    if (data) { const { data: c } = await supabase.from('categories').select('id,name,items(id,name,description,price,hidden)').eq('restaurant_id', data.id).order('pos'); setCats(c || []) }
    setReady(true)
  }, [])
  useEffect(() => { supabase.auth.getUser().then(({ data }) => { if (!data.user) return router.push('/login'); setUid(data.user.id); load(data.user.id) }) }, [])
  const run = async p => { const { error } = await p; if (error) setMsg(error.message); else setMsg(''); load(uid) }
  const upd = f => run(supabase.from('restaurants').update(f).eq('id', r.id))
  const criar = e => { e.preventDefault(); const n = new FormData(e.target).get('n').trim(); if (n) run(supabase.from('restaurants').insert({ owner_id: uid, name: n, slug: slugify(n) })) }
  const addCat = e => { e.preventDefault(); const n = new FormData(e.target).get('n').trim(); e.target.reset(); if (n) run(supabase.from('categories').insert({ restaurant_id: r.id, name: n, pos: cats.length })) }
  const addItem = (e, cid) => { e.preventDefault(); const f = new FormData(e.target); e.target.reset(); run(supabase.from('items').insert({ category_id: cid, name: f.get('n'), price: parseFloat(f.get('p')), description: f.get('d') })) }
  const logo = async e => { const file = e.target.files[0]; if (!file) return; const path = `${uid}/${Date.now()}`; const { error } = await supabase.storage.from('logos').upload(path, file); if (error) return setMsg(error.message); upd({ image_url: supabase.storage.from('logos').getPublicUrl(path).data.publicUrl }) }
  const baixar = () => { const a = document.createElement('a'); a.href = document.getElementById('qr').toDataURL('image/png'); a.download = `qr-${r.slug}.png`; a.click() }
  if (!ready) return <div className="w">Carregando…</div>
  if (!r) return <div className="w"><h2>Crie seu restaurante</h2><form className="r" onSubmit={criar}><input name="n" placeholder="Nome do restaurante" /><button className="p">Criar</button></form><p className="m">{msg}</p></div>
  const url = `${location.origin}/${r.slug}`, vencido = new Date(r.paid_until) < new Date()
  return <div className="w"><div className="r"><h2 style={{ margin: 0 }}>{r.name}</h2><button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))}>Sair</button></div>
    {vencido && <div className="card" style={{ borderColor: '#c0392b' }}>Plano vencido: seu cardápio está fora do ar. Fale com o suporte para ativar.</div>}
    <p className="m">{msg}</p>
    <div className="g"><div>
      <div className="card"><h3>Cardápio</h3>
        {cats.map(c => <div className="card" key={c.id}><div className="r"><b>{c.name}</b><button onClick={() => run(supabase.from('categories').delete().eq('id', c.id))}>Excluir categoria</button></div>
          {c.items.map(i => <div className="r" key={i.id}><span style={{ flex: 1, opacity: i.hidden ? .5 : 1 }}>{i.name} (R$ {i.price})</span>
            <button onClick={() => run(supabase.from('items').update({ hidden: !i.hidden }).eq('id', i.id))}>{i.hidden ? 'Mostrar' : 'Ocultar'}</button>
            <button onClick={() => run(supabase.from('items').delete().eq('id', i.id))}>Excluir</button></div>)}
          <form className="r" onSubmit={e => addItem(e, c.id)}><input name="n" placeholder="Item" required /><input name="p" type="number" step="0.01" placeholder="Preço" required /><input name="d" placeholder="Descrição" /><button className="p">Adicionar</button></form></div>)}
        <form className="r" onSubmit={addCat}><input name="n" placeholder="Nova categoria" /><button className="p">Adicionar categoria</button></form></div>
      <div className="card"><h3>Aparência</h3>
        <div className="r"><label>Cor principal <input type="color" value={r.c1} onChange={e => upd({ c1: e.target.value })} /></label><label>Fundo <input type="color" value={r.c2} onChange={e => upd({ c2: e.target.value })} /></label></div>
        <div className="r"><label><input type="radio" checked={r.logo_style === 'simples'} onChange={() => upd({ logo_style: 'simples' })} /> Logo simples</label><label><input type="radio" checked={r.logo_style === 'banner'} onChange={() => upd({ logo_style: 'banner' })} /> Logo banner</label></div>
        <div className="r"><input type="file" accept="image/*" onChange={logo} /></div></div></div>
    <div><div className="card"><h3>QR code</h3><QRCodeCanvas id="qr" value={url} size={220} includeMargin /><p className="m">{url}</p><button className="p" onClick={baixar}>Baixar QR code (PNG)</button></div>
      <div className="card"><h3>Prévia</h3><Menu r={{ ...r, paid_until: '9999-12-31' }} cats={cats} /></div></div></div></div>
}
