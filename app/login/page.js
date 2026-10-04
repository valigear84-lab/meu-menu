'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
export default function Login() {
  const router = useRouter(); const [e, setE] = useState(''), [p, setP] = useState(''), [msg, setMsg] = useState('')
  const go = async cria => {
    const { error } = cria ? await supabase.auth.signUp({ email: e, password: p }) : await supabase.auth.signInWithPassword({ email: e, password: p })
    if (error) return setMsg(error.message)
    if (cria) setMsg('Conta criada. Se o Supabase pedir, confirme o e-mail e depois entre.'); else router.push('/painel')
  }
  return <div className="w" style={{ maxWidth: 420 }}><h1>Meu Menu</h1>
    <div className="r"><input style={{ width: '100%' }} placeholder="E-mail" value={e} onChange={x => setE(x.target.value)} /></div>
    <div className="r"><input style={{ width: '100%' }} type="password" placeholder="Senha (mín. 6)" value={p} onChange={x => setP(x.target.value)} /></div>
    <div className="r"><button className="p" onClick={() => go(false)}>Entrar</button><button onClick={() => go(true)}>Criar conta</button></div><p className="m">{msg}</p></div>
}
