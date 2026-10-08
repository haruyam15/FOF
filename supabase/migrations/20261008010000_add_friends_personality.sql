-- 성격 (선택)
alter table public.friends
  add column personality text check (char_length(personality) <= 500);
