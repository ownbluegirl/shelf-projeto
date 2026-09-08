create extension if not exists pgcrypto;

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) > 0),
  author text not null check (char_length(trim(author)) > 0),
  status text not null check (status in ('quero_ler', 'lendo', 'lido')),
  genre text,
  start_date date,
  end_date date,
  rating integer check (rating is null or rating between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date is null or start_date is null or end_date >= start_date)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists books_set_updated_at on public.books;

create trigger books_set_updated_at
before update on public.books
for each row
execute function public.set_updated_at();
