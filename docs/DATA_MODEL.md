# 데이터 모델 (Supabase / PostgreSQL)

## 1. 테이블: `friends`
| 컬럼 | 타입 | NULL | 설명 |
|---|---|---|---|
| id | uuid (PK, default gen_random_uuid()) | N | |
| name | text | N | 이름 |
| gender | text (`male` \| `female`) | N | 성별 |
| height_cm | smallint | N | 키 |
| birth_year | smallint | N | 출생연도 |
| religion | text | Y | 종교 |
| job | text | N | 직업 |
| residence | text | Y | 거주지 (`20261008020000` 마이그레이션에서 선택으로 변경) |
| personality | text | Y | 성격 (`20261008010000` 마이그레이션에서 추가) |
| ideal_type | text | Y | 이상형 |
| image_path | text | Y | Storage 내 경로 |
| created_at | timestamptz (default now()) | N | |
| updated_at | timestamptz (default now()) | N | |

## 2. 초기 마이그레이션 (초안)
```sql
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

-- RLS: 켜두고 anon/authenticated 정책을 만들지 않는다.
-- MVP에서는 서버(Server Action / Route Handler)에서만 접근한다.
alter table public.friends enable row level security;
```

## 3. Storage
- 버킷: `friend-images` (비공개)
- 경로 규칙: `{friend_id}/{timestamp}.{ext}`
- 조회 시 서버에서 signed URL 발급

## 4. 2단계 확장 고려
2단계에서 관리자가 **등록 항목을 추가/삭제/필수 변경**하려면 컬럼 고정 구조로는 한계가 있다.

**권장 방향 (MVP 이후 마이그레이션)**
- `field_definitions` 테이블: `key`, `label`, `type`, `required`, `order`, `is_system`, `options`
- `friends`에는 핵심 컬럼(name, gender, birth_year 등 필터에 쓰는 것)만 유지하고, 나머지는 `extra jsonb` 컬럼에 저장
- 이름/성별/출생연도는 필터·식별에 필요하므로 `is_system = true`로 삭제 불가 처리

> MVP에서는 YAGNI 원칙에 따라 고정 컬럼으로 구현한다. 단, 폼/목록 UI는 필드 정의를 한곳(`src/features/friends/fields.ts`)에 모아 두어 2단계 전환 비용을 줄인다.

### 2단계 추가 테이블
```sql
create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
-- 관리자는 이 테이블에 수동 INSERT 한다. RLS 정책: admins에 있는 사용자만 friends CRUD 가능
```
