-- friends 테이블
create table public.friends (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 1 and 30),
  gender      text not null check (gender in ('male', 'female')),
  height_cm   smallint not null check (height_cm between 100 and 230),
  birth_year  smallint not null check (birth_year between 1950 and 2100),
  religion    text,
  job         text not null check (char_length(job) between 1 and 50),
  residence   text not null check (char_length(residence) between 1 and 50),
  ideal_type  text check (char_length(ideal_type) <= 500),
  image_path  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index friends_gender_birth_year_idx on public.friends (gender, birth_year);
create index friends_created_at_idx on public.friends (created_at desc);

-- RLS 활성화, 정책은 만들지 않는다 (MVP: service_role을 쓰는 서버에서만 접근)
alter table public.friends enable row level security;

-- 이미지 버킷 (비공개)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('friend-images', 'friend-images', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
