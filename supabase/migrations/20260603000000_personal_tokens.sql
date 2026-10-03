create table if not exists public.personal_tokens (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name varchar(50) not null,
  token_hash text not null,
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz
);

create unique index if not exists personal_tokens_token_hash_idx on public.personal_tokens(token_hash);

alter table public.personal_tokens enable row level security;

create policy "Owners can view their own tokens"
  on public.personal_tokens for select
  to authenticated
  using (auth.uid() = owner_id);

create policy "Owners can insert their own tokens"
  on public.personal_tokens for insert
  to authenticated
  with check (auth.uid() = owner_id);

create policy "Owners can update their own tokens"
  on public.personal_tokens for update
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create or replace function public.guard_personal_token_update()
returns trigger as $$
begin
  if new.id is distinct from old.id
     or new.owner_id is distinct from old.owner_id
     or new.name is distinct from old.name
     or new.token_hash is distinct from old.token_hash
     or new.created_at is distinct from old.created_at
  then
    raise exception 'only last_used_at and revoked_at can be updated';
  end if;
  return new;
end;
$$ language plpgsql set search_path = '';

drop trigger if exists personal_tokens_guard_update on public.personal_tokens;
create trigger personal_tokens_guard_update
  before update on public.personal_tokens
  for each row execute function public.guard_personal_token_update();

create or replace function public.verify_personal_token(p_hash text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_token record;
begin
  select id, owner_id, revoked_at
  into v_token
  from public.personal_tokens
  where token_hash = p_hash;

  if v_token is null or v_token.revoked_at is not null then
    return null;
  end if;

  update public.personal_tokens
  set last_used_at = now()
  where id = v_token.id;

  return v_token.owner_id;
end;
$$;

revoke all on function public.verify_personal_token(text) from public;
grant execute on function public.verify_personal_token(text) to anon, authenticated;
