-- Band Management Migration
-- Adds onboarding flow and band invitations

-- ===========================================
-- UPDATE PROFILES
-- ===========================================

-- Add current_band_id to track active band
alter table public.profiles 
  add column current_band_id uuid references public.bands(id) on delete set null;

-- Add onboarding_completed flag
alter table public.profiles 
  add column onboarding_completed boolean default false not null;

-- Index for current_band_id
create index idx_profiles_current_band_id on public.profiles(current_band_id);

-- ===========================================
-- BAND INVITATIONS
-- ===========================================
create table public.band_invitations (
  id uuid default gen_random_uuid() primary key,
  band_id uuid references public.bands(id) on delete cascade not null,
  code text unique not null,
  created_by uuid references public.profiles(id) on delete set null,
  expires_at timestamptz,
  max_uses integer,
  uses integer default 0 not null,
  is_active boolean default true not null,
  created_at timestamptz default now() not null
);

-- RLS for band_invitations
alter table public.band_invitations enable row level security;

-- Anyone can view active invitations by code (for joining)
create policy "Anyone can view invitation by code"
  on public.band_invitations for select
  using (is_active = true and (expires_at is null or expires_at > now()));

-- Band admins can manage invitations
create policy "Band admins can manage invitations"
  on public.band_invitations for all
  using (
    exists (
      select 1 from public.band_members
      where band_members.band_id = band_invitations.band_id
      and band_members.user_id = auth.uid()
      and band_members.role = 'admin'
    )
  );

-- Index for invitation code lookup
create index idx_band_invitations_code on public.band_invitations(code);
create index idx_band_invitations_band_id on public.band_invitations(band_id);

-- ===========================================
-- FUNCTION: Generate unique invitation code
-- ===========================================
create or replace function public.generate_invitation_code()
returns text as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i integer;
begin
  for i in 1..8 loop
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  end loop;
  return result;
end;
$$ language plpgsql;

-- ===========================================
-- FUNCTION: Create band with admin member
-- ===========================================
create or replace function public.create_band_with_admin(
  p_name text,
  p_slug text,
  p_description text default null,
  p_genre text default null
)
returns uuid as $$
declare
  v_band_id uuid;
  v_user_id uuid;
begin
  v_user_id := auth.uid();
  
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Create the band
  insert into public.bands (name, slug, description, genre, created_by)
  values (p_name, p_slug, p_description, p_genre, v_user_id)
  returning id into v_band_id;

  -- Add creator as admin
  insert into public.band_members (band_id, user_id, role)
  values (v_band_id, v_user_id, 'admin');

  -- Set as current band and mark onboarding complete
  update public.profiles
  set current_band_id = v_band_id,
      onboarding_completed = true
  where id = v_user_id;

  return v_band_id;
end;
$$ language plpgsql security definer;

-- ===========================================
-- FUNCTION: Join band with invitation code
-- ===========================================
create or replace function public.join_band_with_code(
  p_code text
)
returns uuid as $$
declare
  v_invitation record;
  v_user_id uuid;
begin
  v_user_id := auth.uid();
  
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Find valid invitation
  select * into v_invitation
  from public.band_invitations
  where code = upper(p_code)
    and is_active = true
    and (expires_at is null or expires_at > now())
    and (max_uses is null or uses < max_uses);

  if v_invitation is null then
    raise exception 'Invalid or expired invitation code';
  end if;

  -- Check if already a member
  if exists (
    select 1 from public.band_members
    where band_id = v_invitation.band_id
    and user_id = v_user_id
  ) then
    raise exception 'Already a member of this band';
  end if;

  -- Add user as viewer
  insert into public.band_members (band_id, user_id, role)
  values (v_invitation.band_id, v_user_id, 'viewer');

  -- Increment invitation uses
  update public.band_invitations
  set uses = uses + 1
  where id = v_invitation.id;

  -- Set as current band and mark onboarding complete
  update public.profiles
  set current_band_id = v_invitation.band_id,
      onboarding_completed = true
  where id = v_user_id;

  return v_invitation.band_id;
end;
$$ language plpgsql security definer;

-- ===========================================
-- FUNCTION: Get user's bands
-- ===========================================
create or replace function public.get_user_bands()
returns table (
  id uuid,
  name text,
  slug text,
  logo_url text,
  role band_role,
  is_current boolean
) as $$
begin
  return query
  select 
    b.id,
    b.name,
    b.slug,
    b.logo_url,
    bm.role,
    (p.current_band_id = b.id) as is_current
  from public.bands b
  inner join public.band_members bm on bm.band_id = b.id
  inner join public.profiles p on p.id = bm.user_id
  where bm.user_id = auth.uid()
  order by bm.joined_at desc;
end;
$$ language plpgsql security definer;

-- ===========================================
-- FUNCTION: Switch current band
-- ===========================================
create or replace function public.switch_current_band(p_band_id uuid)
returns void as $$
begin
  -- Verify user is member of the band
  if not exists (
    select 1 from public.band_members
    where band_id = p_band_id
    and user_id = auth.uid()
  ) then
    raise exception 'Not a member of this band';
  end if;

  update public.profiles
  set current_band_id = p_band_id
  where id = auth.uid();
end;
$$ language plpgsql security definer;

-- ===========================================
-- FUNCTION: Generate slug from name
-- ===========================================
create or replace function public.generate_band_slug(p_name text)
returns text as $$
declare
  v_slug text;
  v_count integer := 0;
  v_final_slug text;
begin
  -- Convert to lowercase, replace spaces with hyphens, remove special chars
  v_slug := lower(regexp_replace(p_name, '[^a-zA-Z0-9\s]', '', 'g'));
  v_slug := regexp_replace(v_slug, '\s+', '-', 'g');
  v_slug := trim(both '-' from v_slug);
  
  v_final_slug := v_slug;
  
  -- Check for uniqueness and add suffix if needed
  while exists (select 1 from public.bands where slug = v_final_slug) loop
    v_count := v_count + 1;
    v_final_slug := v_slug || '-' || v_count;
  end loop;
  
  return v_final_slug;
end;
$$ language plpgsql;
