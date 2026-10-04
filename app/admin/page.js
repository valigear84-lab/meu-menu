'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
export default function Admin() {
  const router = useRouter(); const [rs, setRs] = useState(null), [ok, setOk] = useState(false), [note, setNote] = useState({}), [msg, setMsg] = useState('')
  const load = async () => {
    const { data: u } = await supabase.auth.getUser(); if (!u.user) return router.push('/login')
    const { data: a } = await supabase.from('admins').select('user_id').eq('user_id', u.user.id).maybeSingle()
    if (!a) return setRs([])
    setOk(true); const { data } = await supabase.from('restaurants').select('id,name,slug,paid_until').order('name'); setRs(data || [])
  }
  useEffect(() => { load() }, [])
  const call = async (fn, args) => { const { error } = await supabase.rpc(fn, args); setMsg(error ? error.message : 'Feito.'); load() }
  if (!rs) return <div className="w">Carregando…</div>
  if (!ok) return <div className="w"><h2>Acesso negado</h2><p className="m">Esta área é só para administradores.</p></div>
  return <div className="w"><h2>Admin: restaurantes ({rs.length})</h2><p className="m">{msg}</p>
    {rs.map(x => { const on = new Date(x.paid_until) > new Date(); return <div className="card" key={x.id}>
      <b>{x.name}</b> <span className="m">/{x.slug} · {on ? 'Ativo até ' : 'Vencido em '}{new Date(x.paid_until).toLocaleDateString('pt-BR')}</span>
      <div className="r"><input placeholder="Observação (ex.: pagou R$ 49 em dinheiro)" style={{ flex: 1 }} value={note[x.id] || ''} onChange={e => setNote({ ...note, [x.id]: e.target.value })} />
        {[1, 3, 6, 12].map(m => <button className="p" key={m} onClick={() => call('admin_extend', { rid: x.id, months: m, note: note[x.id] || '' })}>+{m} {m > 1 ? 'meses' : 'mês'}</button>)}
        <button onClick={() => call('admin_suspend', { rid: x.id })}>Suspender</button>
        <button onClick={() => router.push(`/painel?rid=${x.id}`)}>Entrar como</button></div></div> })}</div>
}
