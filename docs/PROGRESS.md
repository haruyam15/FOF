# 진행 기록 (Progress Log)

> 새 대화를 시작할 때 이 문서와 [ROADMAP](ROADMAP.md)을 먼저 읽고 이어서 작업한다.
> 마지막 갱신: 2026-10-08 / 기준 커밋: `1f73fd3` (origin/main)

## 1. 현재 상태 한눈에
- **Phase 1(MVP) 기능 구현 완료**: 친구 등록, 친구 목록, 성별 필터. GitHub `main`에 push됨.
- **아직 안 한 것**: 배포(Vercel), 모바일 실기기 점검, 페이지네이션, Phase 2 전부(로그인/관리자/삭제).
- 저장소: https://github.com/haruyam15/FOF.git (브랜치는 `main` 하나)
- Supabase 프로젝트 생성·연결 완료. 마이그레이션 3건(`20261008000000`, `…010000`, `…020000`) 모두 적용됨(거주지 NULL 허용 확인, 사용자 확인).

## 2. 구현된 기능
| 기능 | 위치 | 비고 |
|---|---|---|
| 친구 등록 | `/friends/new`, `features/friends/actions.ts` | Server Action, zod 서버 검증, 에러 시 입력값 복원 |
| 친구 목록 | `/friends` | 카드 목록, 최신 등록순, 총 인원수, 빈 상태 문구 |
| 성별 필터 | `features/friends/components/friend-filter.tsx` | 전체/남성/여성 링크 칩, URL `?gender=` |
| 사진 업로드 | `components/image-picker.tsx`, `lib/compress-image.ts` | 브라우저에서 1600px JPEG로 자동 압축, 비공개 버킷에 저장, 목록은 1시간짜리 signed URL |
| 기본 아바타 | `public/fallback-avatar.png` | 사진 없는 친구 카드에 표시 |
| 공통 UI | `components/common/form-field.tsx`, `page-title.tsx` | FormField(필수 `*`/선택 표시/에러), sticky 제목 |

### 등록 항목 (현재)
필수: 이름, 성별(male/female), 출생연도, 키(cm), 직업  
선택: 사진, 거주지, 종교(무교/기독교/천주교/불교/기타), 성격(500자), 이상형(500자)  
- 성인(만 19세) 제한: 출생연도 ≤ 올해 − 19 (연 나이 기준, 서버 검증만)
- 출생연도 1950년 이상, 키 100~230

## 3. 주요 결정 사항 (이유 포함)
| 결정 | 이유 |
|---|---|
| 브라우저는 Supabase를 직접 호출하지 않고 Server Action/서버 컴포넌트에서만 접근 | MVP에는 로그인이 없어 RLS 정책을 짤 수 없음. RLS는 켜고 정책은 만들지 않아 anon 접근 전부 차단, 서버가 `SUPABASE_SECRET_KEY`로만 접근 |
| 나이는 출생연도(`birth_year`)로 저장 | 해가 바뀌어도 값이 변하지 않음 |
| 폼 검증은 서버(zod)만, `react-hook-form` 미사용 | 폼 1개, 서버 검증이 필수라 이중 관리 불필요. 폼에 `noValidate`를 달아 서버 에러(빨간 테두리+문구)를 한 번에 표시 |
| `cacheComponents` 끔 | 전부 동적 데이터라 이점이 없고, Activity로 폼 상태가 남는 문제·`new Date()` 제약만 생김. 캐싱이 필요해지면 다시 검토 |
| 이미지는 클라이언트에서 압축 | 폰 사진(3~12MB)이 Server Action 본문 한도(6MB)를 넘어 요청 자체가 거부되던 문제 해결 |
| 출생연도 필터 **보류** | 사용자 요청. 쿼리(`gte/lte birth_year`)·UI는 git 이력에서 복구 가능 |
| 모바일 전용 서비스 | 컬럼 폭 `max-w-md`, 터치 44px, 입력 글자 16px, `md:` 이상 스타일 금지 ([CONVENTIONS](CONVENTIONS.md) 4-1) |
| 색 체계: `primary` 진한 초록 `#4F7A3A`(주요 버튼), `brand` 연두 `#9EC188`(로고, 선택 상태, 포커스) | 로고와 버튼이 같은 색이면 구분이 안 되고 연두는 흰 배경에서 대비가 약함 |
| 디자인 값은 `globals.css` 토큰으로만 정의 | 예: `--drop-shadow-sticky` → `drop-shadow-sticky`. 임의 값(`shadow-[...]`) 금지. [DESIGN_SYSTEM](DESIGN_SYSTEM.md) 참고 |
| 2단계 항목 추가/삭제는 `field_definitions` + `extra jsonb` 방향 | MVP는 고정 컬럼. 필터에 쓰는 이름/성별/출생연도는 `is_system`으로 삭제 불가 ([DATA_MODEL](DATA_MODEL.md) 4장) |

## 4. 실제 폴더 구조
```
app/
  (main)/layout.tsx            헤더(로고+메뉴), max-w-md 컬럼
  (main)/friends/page.tsx      목록 (Suspense + 서버 조회)
  (main)/friends/new/page.tsx  등록
  globals.css                  색/그림자 토큰, full-bleed 유틸리티
components/
  ui/                          shadcn (base-nova 스타일, Base UI 기반)
  common/                      FormField, PageTitle
features/friends/
  actions.ts queries.ts schema.ts fields.ts types.ts
  components/                  friend-form, friend-card, friend-filter, image-picker
lib/                           supabase/server.ts, compress-image.ts, utils.ts
supabase/migrations/           SQL 3건 (대시보드가 아닌 파일로 관리)
docs/                          PRD, DATA_MODEL, ARCHITECTURE, CONVENTIONS, DESIGN_SYSTEM, ROADMAP, PROGRESS
```

## 5. 환경/작업 시 주의 (겪었던 함정)
- **Node 24 필요**: `nvm use`(`.nvmrc`). Node 20에서는 supabase-js가 WebSocket 오류로 죽는다.
- **패키지 매니저는 pnpm**.
- **`globals.css`를 고쳐도 dev 서버에 반영되지 않는 경우가 반복됨** → dev 서버 종료 → `rm -rf .next` → `pnpm dev`.
- **`next dev`가 켜진 상태에서 `pnpm build`를 돌리지 않는다** (`.next`를 공유해 dev가 꼬임). 검증은 `npx tsc --noEmit`, `npx eslint .`로.
- **이 Next.js(16.4)는 학습 데이터와 다르다**: 코드를 쓰기 전 `node_modules/next/dist/docs/` 해당 문서를 확인 ([AGENTS.md](../AGENTS.md)).
- shadcn `base-nova` 스타일은 Base UI 기반이라 Radix 예제와 API가 다르다 (`Button`에 `nativeButton={false} render={<Link/>}` 등).
- `.env.local` 키: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `SUPABASE_JWKS_URL`. MVP에서 쓰는 건 URL, SECRET_KEY뿐 (나머지는 2단계 로그인에서 사용).
- 실제 지인 정보가 DB에 들어 있을 수 있으므로 로그/스크린샷/이슈에 남기지 않는다.

## 6. 알려진 한계 / 미확인
- 목록은 전체 조회라 **1,000명 초과 시 Supabase 기본 한도로 일부가 조용히 잘림** → 페이지네이션 필요.
- 사진 URL은 있는데 파일 로드가 실패하면(만료/삭제) 기본 아바타로 대체되지 않고 빈 칸.
- 등록 폼에서 한 번 고른 사진을 등록 전에 완전히 취소하는 방법이 없음(변경만 가능).
- 서버 에러로 폼이 다시 그려지면 선택한 사진이 비워짐 (브라우저 제약).
- 친구 삭제 시 Storage 사진도 함께 지워야 함 (행만 지우면 파일이 남음).
- 다크 모드 그림자가 거의 보이지 않음 (다크 모드 미설계).
- 기본 아바타/ImagePicker 선택-변경 동작, 모바일 실기기 레이아웃은 사용자가 직접 확인 중이었음 (자동 검증은 렌더 HTML/CSS 수준까지만 함).
- 접근 제어: **MVP는 배포 URL을 비공개로 두는 것에 의존**(로그인 없음). 링크를 아는 사람은 접속 가능.

## 7. 다음 계획 (우선순위 순)
### A. MVP 마무리
1. 목록 **페이지네이션** (페이지 번호 방식, 20명 단위, `?page=`, `.range()` + `count: "exact"`, 이미지 링크는 해당 페이지분만 발급)
2. 모바일 실기기 점검 (iPhone Safari 입력 확대, safe area, sticky 제목)
3. **Vercel 배포** + 환경변수 설정, URL 비공개 유지 (preview URL 노출 주의)

### B. Phase 2 — 권한/관리자
1. 로그인 수단 결정(카카오 vs 구글; 구현은 구글이 쉬움) → Supabase Auth 연동 (`PUBLISHABLE_KEY`, `JWKS_URL` 사용)
2. `admins` 테이블(`user_id` PK → `auth.users`), 관리자 2명 **수동 INSERT**
3. RLS 정책 전환(관리자만 friends CRUD), 서버 접근을 `secret key`에서 사용자 세션 기반으로
4. **친구 삭제**: 행 + Storage 사진 함께 삭제, 확인 다이얼로그
5. **관리자 페이지**: 등록 항목 추가/삭제/필수 변경 → `field_definitions` 테이블 + `friends.extra jsonb`로 전환, 폼/목록을 필드 정의 기반으로 렌더링 (`features/friends/fields.ts`가 전환 지점)

### C. 백로그
출생연도 필터 복구, 친구 정보 수정, 정렬/검색, 키·직업·거주지 필터, 매칭 이력, 썸네일 생성, 이미지 로드 실패 fallback, ImagePicker 취소, 다크 모드, 디자인 토큰 확장(둥근 모서리/글자 크기/간격)

## 8. 작업 방식 (사용자 선호)
- 응답/주석은 한국어. 코드 식별자는 영어.
- 커밋은 **큰 작업 단위**로 묶는다(디자인은 하나로). 이력 정리처럼 되돌리기 어려운 작업은 **먼저 제안하고 승인받은 뒤** 진행. push는 요청받았을 때만.
- 테스트는 사용자가 직접 한다. 확인하지 못한 것은 "확인하지 못했다"고 명시한다.
- 커밋 메시지 끝에 `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>` 추가.
