-- Rode este arquivo inteiro no SQL Editor do Supabase.
create table restaurants(
 id uuid primary key default gen_random_uuid(),
 owner_id uuid unique references auth.users on delete cascade,
 name text not null, slug text unique not null,
 c1 text default '#c0392b', c2 text default '#ffffff',
 logo_style text default 'simples' check (logo_style in ('simples','banner')),
 image_url text, paid_until timestamptz default now(), created_at timestamptz default now());
create table categories(id uuid primary key default gen_random_uuid(),
 restaurant_id uuid references restaurants on delete cascade, name text not null, pos int default 0);
create table items(id uuid primary key default gen_random_uuid(),
 category_id uuid references categories on delete cascade, name text not null,
 description text, price numeric(10,2) not null, hidden boolean default false);
create table admins(user_id uuid primary key references auth.users);
create table payments_log(id bigserial primary key, restaurant_id uuid references restaurants on delete cascade,
 months int, note text, admin_id uuid, created_at timestamptz default now());

create function is_admin() returns boolean language sql stable security definer as
$$ select exists(select 1 from admins where user_id = auth.uid()) $$;

alter table restaurants enable row level security;
alter table categories enable row level security;
alter table items enable row level security;
alter table admins enable row level security;
alter table payments_log enable row level security;

-- Dono nunca altera paid_until: só o Adm, via funções abaixo.
revoke insert, update on restaurants from authenticated, anon;
grant insert(owner_id,name,slug) on restaurants to authenticated;
grant update(name,c1,c2,logo_style,image_url) on restaurants to authenticated;

create policy r_read on restaurants for select using (paid_until > now() or owner_id = auth.uid() or is_admin());
create policy r_ins on restaurants for insert to authenticated with check (owner_id = auth.uid());
create policy r_upd on restaurants for update to authenticated using (owner_id = auth.uid() or is_admin());

create policy c_read on categories for select using (exists(select 1 from restaurants r where r.id = restaurant_id));
create policy c_all on categories for all to authenticated
 using (exists(select 1 from restaurants r where r.id = restaurant_id and (r.owner_id = auth.uid() or is_admin())))
 with check (exists(select 1 from restaurants r where r.id = restaurant_id and (r.owner_id = auth.uid() or is_admin())));
create policy i_read on items for select using (exists(select 1 from categories c where c.id = category_id));
create policy i_all on items for all to authenticated
 using (exists(select 1 from categories c join restaurants r on r.id = c.restaurant_id where c.id = category_id and (r.owner_id = auth.uid() or is_admin())))
 with check (exists(select 1 from categories c join restaurants r on r.id = c.restaurant_id where c.id = category_id and (r.owner_id = auth.uid() or is_admin())));
create policy a_read on admins for select to authenticated using (user_id = auth.uid());
create policy p_read on payments_log for select to authenticated using (is_admin());

create function admin_extend(rid uuid, months int, note text) returns void language plpgsql security definer as $$
begin
 if not is_admin() then raise exception 'sem permissão'; end if;
 update restaurants set paid_until = greatest(now(), paid_until) + make_interval(months => months) where id = rid;
 insert into payments_log(restaurant_id, months, note, admin_id) values (rid, months, note, auth.uid());
end $$;
create function admin_suspend(rid uuid) returns void language plpgsql security definer as $$
begin
 if not is_admin() then raise exception 'sem permissão'; end if;
 update restaurants set paid_until = now() - interval '1 second' where id = rid;
 insert into payments_log(restaurant_id, months, note, admin_id) values (rid, 0, 'suspenso', auth.uid());
end $$;

insert into storage.buckets(id, name, public) values ('logos','logos',true);
create policy logos_up on storage.objects for insert to authenticated
 with check (bucket_id = 'logos' and (storage.foldername(name))[1] = auth.uid()::text);
