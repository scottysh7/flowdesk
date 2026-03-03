-- ============================================
-- FlowDesk — Schéma Supabase
-- À coller dans l'éditeur SQL de Supabase
-- ============================================

-- TABLE: projects
create table public.projects (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  color       text not null default '#7c6af7',
  created_at  timestamptz default now()
);

-- TABLE: tasks
create table public.tasks (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  done        boolean not null default false,
  priority    text not null default 'none' check (priority in ('none','low','medium','high')),
  project_id  uuid references public.projects(id) on delete set null,
  parent_id   uuid references public.tasks(id) on delete cascade,
  created_at  timestamptz default now()
);

-- INDEX pour les performances
create index tasks_project_id_idx on public.tasks(project_id);
create index tasks_parent_id_idx on public.tasks(parent_id);
create index tasks_done_idx on public.tasks(done);

-- RLS (Row Level Security) — désactivé pour usage perso
-- Si tu veux sécuriser plus tard avec auth, active RLS et ajoute des policies
alter table public.projects disable row level security;
alter table public.tasks disable row level security;

-- DONNÉES DE TEST (optionnel, supprime si tu veux partir de zéro)
insert into public.projects (name, color) values
  ('Personnel', '#7c6af7'),
  ('Travail', '#f7a26a');
