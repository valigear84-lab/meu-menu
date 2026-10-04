# Meu Menu

1. Crie um projeto grátis em supabase.com e rode `supabase/schema.sql` no SQL Editor.
2. Copie `.env.example` para `.env.local` e preencha URL e chave anon (Project Settings > API).
3. `npm install` e `npm run dev` (http://localhost:3000).
4. Crie sua conta em /login e depois, no SQL Editor, vire Adm:
   `insert into admins select id from auth.users where email = 'SEU_EMAIL';`
5. Deploy: suba no GitHub, importe na Vercel e coloque as duas variáveis de ambiente. Depois ligue seu domínio.
6. Cardápios ficam em `seudominio.com/nome-do-restaurante`. Ativação de plano em /admin.
