-- Commercial Context Foundation: tenant-scoped authoritative product catalogue.
-- Conversation observations remain evidence-extracted claims; a catalogue match is
-- a separate, deterministic authoritative context layer.

create type public.catalogue_import_status as enum ('pending', 'completed', 'completed_with_errors', 'failed');

create table public.product_catalogue_import_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  source_filename text not null check (char_length(btrim(source_filename)) between 1 and 255),
  source_checksum text not null check (source_checksum ~ '^[a-f0-9]{64}$'),
  status public.catalogue_import_status not null default 'pending',
  total_row_count integer not null default 0 check (total_row_count >= 0),
  imported_row_count integer not null default 0 check (imported_row_count >= 0),
  invalid_row_count integer not null default 0 check (invalid_row_count >= 0),
  error_summary jsonb not null default '[]'::jsonb,
  created_by_membership_id uuid references public.organization_memberships(id) on delete set null,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (organization_id, source_checksum)
);

create table public.product_catalogue_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  external_sku text not null check (char_length(btrim(external_sku)) between 1 and 120),
  name text not null check (char_length(btrim(name)) between 1 and 255),
  category text not null check (char_length(btrim(category)) between 1 and 120),
  subcategory text,
  brand text,
  model text,
  aliases text[] not null default '{}'::text[],
  specifications jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  valid_from timestamptz,
  valid_to timestamptz,
  source_import_run_id uuid references public.product_catalogue_import_runs(id) on delete restrict,
  source_row_number integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, external_sku),
  unique (organization_id, id),
  check (valid_to is null or valid_from is null or valid_to > valid_from),
  check (jsonb_typeof(specifications) = 'object')
);

create index product_catalogue_items_org_category_idx on public.product_catalogue_items(organization_id, category, is_active);
create index product_catalogue_items_org_name_idx on public.product_catalogue_items(organization_id, lower(name));
create index product_catalogue_import_runs_org_created_idx on public.product_catalogue_import_runs(organization_id, created_at desc);

create trigger product_catalogue_items_set_updated_at before update on public.product_catalogue_items
  for each row execute function private.set_updated_at();

alter table public.product_catalogue_import_runs enable row level security;
alter table public.product_catalogue_items enable row level security;

create policy product_catalogue_import_runs_select_admin on public.product_catalogue_import_runs for select to authenticated
  using ((select private.is_org_admin(organization_id)));
create policy product_catalogue_items_select_member on public.product_catalogue_items for select to authenticated
  using ((select private.is_org_member(organization_id)));

grant select on public.product_catalogue_import_runs, public.product_catalogue_items to authenticated;
grant all on public.product_catalogue_import_runs, public.product_catalogue_items to service_role;

comment on table public.product_catalogue_items is 'Authoritative organization product master. It is distinct from evidence-extracted spoken product claims.';
comment on table public.product_catalogue_import_runs is 'Immutable CSV import provenance and row-validation summary for product master data.';
