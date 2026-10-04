const lum = h => { const n = parseInt(h.slice(1), 16), f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4) }; return .2126 * f(n >> 16) + .7152 * f((n >> 8) & 255) + .0722 * f(n & 255) }
const txt = h => (lum(h) > .45 ? '#1b1b1b' : '#fff')
const brl = n => Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
export default function Menu({ r, cats }) {
  if (!r || new Date(r.paid_until) < new Date()) return <div style={{ textAlign: 'center', padding: 40 }}><h2>Cardápio indisponível</h2><p className="m">Fale com o restaurante.</p></div>
  const vis = (cats || []).map(c => ({ ...c, items: (c.items || []).filter(i => !i.hidden) })).filter(c => c.items.length)
  const box = { background: r.c2, color: txt(r.c2), maxWidth: 640, margin: '0 auto', borderRadius: 16, overflow: 'hidden' }
  return <div style={box}>
    {r.logo_style === 'banner'
      ? <div style={{ height: 170, background: `${r.c1} ${r.image_url ? `url(${r.image_url})` : ''} center/cover`, display: 'flex', alignItems: 'flex-end' }}><h1 style={{ margin: 0, width: '100%', padding: '34px 16px 12px', color: '#fff', background: 'linear-gradient(transparent,rgba(0,0,0,.65))' }}>{r.name}</h1></div>
      : <div style={{ textAlign: 'center', padding: '26px 16px 14px' }}>{r.image_url ? <img src={r.image_url} alt="" style={{ width: 84, height: 84, borderRadius: '50%', objectFit: 'cover' }} /> : <div style={{ width: 84, height: 84, borderRadius: '50%', background: r.c1, color: txt(r.c1), display: 'grid', placeItems: 'center', fontSize: 34, fontWeight: 800, margin: '0 auto' }}>{r.name[0]}</div>}<h1 style={{ margin: '8px 0 0' }}>{r.name}</h1></div>}
    <nav style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '10px 14px', position: 'sticky', top: 0, background: r.c2 }}>
      {vis.map(c => <a key={c.id} href={`#c-${c.id}`} style={{ background: r.c1, color: txt(r.c1), padding: '6px 14px', borderRadius: 99, whiteSpace: 'nowrap', textDecoration: 'none' }}>{c.name}</a>)}</nav>
    {vis.map(c => <section key={c.id} id={`c-${c.id}`} style={{ padding: 14 }}><h2 style={{ color: r.c1, borderBottom: `2px solid ${r.c1}`, margin: '0 0 6px' }}>{c.name}</h2>
      {c.items.map(i => <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '9px 0' }}><div><b>{i.name}</b>{i.description && <p style={{ margin: 0, opacity: .75, fontSize: 14 }}>{i.description}</p>}</div><b style={{ whiteSpace: 'nowrap' }}>{brl(i.price)}</b></div>)}</section>)}
  </div>
}
