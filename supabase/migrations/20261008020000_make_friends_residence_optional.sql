-- 거주지를 선택 항목으로 변경 (기존 check 제약은 NULL을 허용하므로 그대로 유지)
alter table public.friends
  alter column residence drop not null;
