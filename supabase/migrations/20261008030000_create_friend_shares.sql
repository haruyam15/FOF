-- 친구 프로필 공유 링크. 링크 하나는 친구 한 명의 프로필만 열 수 있다.
create table public.friend_shares (
  id          uuid primary key default gen_random_uuid(),
  friend_id   uuid not null references public.friends (id) on delete cascade,
  -- 추측 불가능한 랜덤 토큰 (32바이트, base64url). URL에는 friend id 대신 이 값만 노출한다.
  token       text not null unique check (char_length(token) >= 32),
  expires_at  timestamptz not null,
  revoked_at  timestamptz,
  created_at  timestamptz not null default now()
);

create index friend_shares_friend_id_idx on public.friend_shares (friend_id);

-- RLS 활성화, 정책 없음 (service_role을 쓰는 서버에서만 접근)
alter table public.friend_shares enable row level security;
