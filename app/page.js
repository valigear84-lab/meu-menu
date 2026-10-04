import Link from 'next/link'
export default function Home() {
  return <div className="w"><h1>Meu Menu</h1><p>Cardápio digital com QR code para o seu restaurante.</p>
    <Link href="/login"><button className="p">Entrar ou criar conta</button></Link></div>
}
