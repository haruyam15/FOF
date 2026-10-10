# 진행 기록 (Progress Log)

> 새 대화를 시작할 때 이 문서와 [ROADMAP](ROADMAP.md)을 먼저 읽고 이어서 작업한다.
> 마지막 갱신: 2026-10-10 / 기준 커밋: `54097e3` (origin/main)

## 1. 현재 상태 한눈에
- **Phase 1(MVP) 기능 + 임시 로그인 + 프로필 공유 + PWA 구현 완료**, GitHub `main`에 push됨. (기준 커밋 `54097e3`)
- **배포는 아직**: Vercel 프로젝트 연결·환경변수 설정은 사용자가 진행(저장소에 `.vercel` 없음). 배포 후 폰 실기기 점검(공유 시트, 홈 화면 추가) 필요.
- **아직 안 한 것**: Vercel 배포 확인, 모바일 실기기 점검, Phase 2 전부(Supabase Auth 로그인/admins/RLS/삭제/관리자 페이지).
- 저장소: https://github.com/haruyam15/FOF.git (브랜치는 `main` 하나)
- Supabase 마이그레이션 4건(`20261008000000`, `…010000`, `…020000`, `…030000`) 적용됨(사용자 확인). **`20261010000000_friends_multiple_images.sql`(사진 3장, `image_path` 삭제)은 작성만 했고 미적용** — 적용 후 동작 확인 필요.
- **성능 기준: 친구 최대 100명** ([CONVENTIONS](CONVENTIONS.md) 8장).

## 2. 구현된 기능
| 기능 | 위치 | 비고 |
|---|---|---|
| 친구 등록 | `/friends/new`, `features/friends/actions.ts` | Server Action, zod 서버 검증, 에러 시 입력값 복원 |
| 친구 목록 | `/friends` | 카드 목록, 최신 등록순, 총 인원수, 빈 상태 문구 |
| 성별 필터 | `friend-filter.tsx`, `friend-list.tsx` | 전체/남성/여성 버튼. **전체 목록을 한 번 받아 클라이언트에서 필터**(서버 왕복 없음), URL `?gender=`는 `replaceState`로만 갱신 |
| 목록 캐시 | `features/friends/queries.ts` | `unstable_cache`(30분, 태그 `friends`) + 등록 시 `updateTag`. 서명 URL(2시간)이 캐시 동안 고정돼 브라우저/이미지 최적화 캐시 적중 |
| 임시 로그인 | `proxy.ts`, `features/auth/`, `lib/auth/`, `app/login/` | 공용 비밀번호(`ADMIN_PASSWORD`) → 서명된 httpOnly 쿠키(30일). `/login`, `/s/*` 외 전부 로그인 필요. 서버 액션·목록 조회에서도 재검사 |
| 프로필 공유 | `features/shares/`, `app/s/[token]/` | 공유 버튼 → 링크 발급(친구당 유효 링크 재사용, 7일) → `navigator.share`(미지원 시 복사). 메시지: "친구의 친구를 소개합니다.\n링크". 링크 화면은 헤더·이동 없음, noindex, 미리보기는 고정 문구 |
| 상세 보기 | `friend-detail-modal.tsx`, `friend-profile.tsx` | 카드(사진 포함) 클릭 → 꽉 찬 화면, `FriendProfile`은 공유 화면과 같은 컴포넌트. 열 때 `pushState`, 닫기는 `history.back()`/뒤로가기 |
| PWA | `app/manifest.ts`, `public/icon-*.png`, `app/apple-icon.png` | 홈 화면 추가용. 아이콘은 흰 배경+여백(원본 `app/icon.png`는 투명·여백 없음). 서비스 워커 없음(오프라인 미지원) |
| 사진 업로드 (최대 3장) | `features/friends/components/image-picker.tsx`, `lib/compress-image.ts` | 브라우저에서 장마다 1600px JPEG로 압축, 고른 순서대로 비공개 버킷에 저장(`friends.image_paths`). 첫 번째가 목록 대표 이미지, 상세·공유 화면은 `image-carousel.tsx`(scroll-snap)로 넘겨 봄 |
| 친구 수정·삭제 | `app/(main)/friends/[id]/edit`, `actions.ts`(`updateFriend`, `deleteFriend`), `friend-detail-modal.tsx` | 상세 화면 상단의 수정/삭제 버튼. 수정은 등록 폼 재사용(`FriendForm friend=…`), 기존 사진은 `keepImage`(경로)로 유지·삭제, 새 사진은 뒤에 추가. 삭제는 `confirm` 후 행+Storage 사진 삭제(공유 링크는 cascade) |
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
| 사진 여러 장은 `image_paths text[]` 컬럼, 대표 변경/순서 변경 없음(고른 순서 그대로) | 100명 규모에 별도 테이블은 과함. 배포 전이라 기존 `image_path`는 같은 마이그레이션에서 옮기고 삭제 |
| 이미지는 클라이언트에서 압축 | 폰 사진(3~12MB)이 Server Action 본문 한도(6MB)를 넘어 요청 자체가 거부되던 문제 해결 |
| 출생연도 필터 **보류** | 사용자 요청. 쿼리(`gte/lte birth_year`)·UI는 git 이력에서 복구 가능 |
| 모바일 전용 서비스 | 컬럼 폭 `max-w-md`, 터치 44px, 입력 글자 16px, `md:` 이상 스타일 금지 ([CONVENTIONS](CONVENTIONS.md) 4-1) |
| 색 체계: `primary` 진한 초록 `#4F7A3A`(주요 버튼), `brand` 연두 `#9EC188`(로고, 선택 상태, 포커스) | 로고와 버튼이 같은 색이면 구분이 안 되고 연두는 흰 배경에서 대비가 약함 |
| 디자인 값은 `globals.css` 토큰으로만 정의 | 예: `--drop-shadow-sticky` → `drop-shadow-sticky`. 임의 값(`shadow-[...]`) 금지. [DESIGN_SYSTEM](DESIGN_SYSTEM.md) 참고 |
| 2단계 항목 추가/삭제는 `field_definitions` + `extra jsonb` 방향 | MVP는 고정 컬럼. 필터에 쓰는 이름/성별/출생연도는 `is_system`으로 삭제 불가 ([DATA_MODEL](DATA_MODEL.md) 4장) |
| 목록은 전체 fetch + 클라이언트 필터, 무한스크롤/페이지네이션 안 함 | 최대 100명 기준. 필터를 서버로 하면 매번 왕복(DB+서명 URL)이 생겨 모바일에서 느렸음(필터 클릭 지연의 원인). 100명 초과 조짐 시 서버 필터 + 커서 페이지네이션 도입 |
| 서명 URL 안정화(캐시) + `next/image` 최적화 | URL이 요청마다 바뀌면 브라우저·최적화 캐시가 무력화됨. `unoptimized` 제거, `next.config.ts`에 Supabase 도메인 허용 |
| 공유 링크는 랜덤 토큰(32바이트) + 만료 + 취소 컬럼 | URL 조작으로 다른 프로필 접근 불가(토큰 하나가 친구 1명만 가리킴). 토큰은 평문 저장(서버 service_role만 접근) |
| 공유 링크가 생기면서 배포 URL이 노출되므로 **임시 비밀번호 로그인을 먼저 도입** | 기존 "URL 비공개" 가정이 깨짐. 공유받은 사람이 `/friends`를 직접 쳐도 로그인 화면으로 감 |
| 로그인 세션은 자체 HMAC 쿠키(Web Crypto) | proxy(Edge 호환)에서 검증해야 함. Phase 2에서 Supabase Auth로 교체 예정 |
| 공유 메시지는 `text` 하나에 줄바꿈+링크를 넣음 (`url` 필드 미사용) | 앱마다 text/url을 합치는 방식이 달라 줄바꿈이 보장되지 않음. 이름은 메시지·미리보기에 넣지 않음 |
| PWA는 서비스 워커 없이 manifest만 | 설치에 필수 아님, 개인정보 화면이 기기에 캐시되는 것을 피함 |

## 4. 실제 폴더 구조
```
app/
  (main)/layout.tsx            헤더(로고+메뉴+로그아웃), max-w-md 컬럼
  (main)/friends/page.tsx      목록 (Suspense + 서버 조회 → FriendList)
  (main)/friends/new/page.tsx  등록
  login/                       로그인 화면(page + login-form)
  s/layout.tsx, s/[token]/     공유 링크 화면(헤더 없음, not-found 포함)
  manifest.ts, apple-icon.png  PWA
  globals.css                  색/그림자 토큰, full-bleed 유틸리티
proxy.ts                       로그인 게이트 (Next 16: middleware → proxy)
components/
  ui/                          shadcn (base-nova, Base UI 기반)
  common/                      FormField, PageTitle
features/
  auth/actions.ts              login, logout
  friends/                     actions queries schema fields types
    components/                friend-form, friend-card, friend-filter, friend-list,
                               friend-profile, friend-detail-modal, image-picker
  shares/                      actions(링크 발급) queries(토큰→친구) components/share-button
lib/                           auth/(token.ts, session.ts), supabase/server.ts, compress-image.ts, utils.ts
supabase/migrations/           SQL 4건 (대시보드가 아닌 파일로 관리)
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
- **환경변수**(`.env.local`, Vercel에도 동일하게): `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `ADMIN_PASSWORD`(로컬 개발값 `2026`), `AUTH_SECRET`(배포용은 새 랜덤값 권장). `ADMIN_PASSWORD`/`AUTH_SECRET`이 없으면 전부 로그인 화면으로 가고 로그인도 실패한다. `NEXT_PUBLIC_SITE_URL`(선택)은 공유 링크 기준 주소.
- **`navigator.share`/클립보드는 HTTPS에서만** 동작. 로컬 `http://192.168…`에서는 공유가 실패할 수 있고, 맥 크롬은 공유 시트가 없어 복사로 동작.
- 카드의 클릭 영역은 카드 위에 깐 투명 버튼(`absolute inset-0`)이고, **DOM 순서상 내용 뒤에 둬야** 한다(사진 래퍼가 `relative`라 앞에 두면 클릭을 가로챔). 공유 버튼은 `z-10`.
- `git mv`는 untracked 파일에 못 쓴다(그냥 `mv`). macOS `sed -i`는 `-i ''` 필요 — 파일 수정은 Edit 도구나 python 사용.
- Node 24가 아닌 셸(20)에서 스크립트를 돌리면 환경이 다를 수 있음. 아이콘 재생성은 sharp(`node_modules/.pnpm/sharp@…`) 사용했음.

## 6. 알려진 한계 / 미확인
- 목록은 전체 조회라 **1,000명 초과 시 Supabase 기본 한도로 일부가 조용히 잘림** → 페이지네이션 필요.
- 사진 URL은 있는데 파일 로드가 실패하면(만료/삭제) 기본 아바타로 대체되지 않고 빈 칸.
- 등록 폼에서 사진을 장별로 삭제할 수 있지만, 이미 고른 사진의 순서를 바꾸려면 삭제 후 다시 골라야 함. 수정 화면에서도 사진 순서 변경은 불가(삭제 후 추가).
- Server Action 본문 한도를 16MB로 올림(3장 × 최대 5MB). 압축본 실제 크기는 미확인.
- 서버 에러로 폼이 다시 그려지면 선택한 사진이 비워짐 (브라우저 제약).
- 수정·삭제 기능은 타입체크·린트만 통과, 실제 동작은 미확인(사용자 확인 필요). 삭제 시 Storage 정리가 실패하면 파일이 고아로 남을 수 있음.
- 다크 모드 그림자가 거의 보이지 않음 (다크 모드 미설계).
- 기본 아바타/ImagePicker 선택-변경 동작, 모바일 실기기 레이아웃은 사용자가 직접 확인 중이었음 (자동 검증은 렌더 HTML/CSS 수준까지만 함).
- 접근 제어: **공용 비밀번호 하나**(4자리 숫자 `2026`)로 보호 중. 실패 시 1초 지연만 있고 시도 횟수 제한은 없음 → 배포용은 더 긴 비밀번호로 바꾸고, Phase 2에서 Supabase Auth로 교체.
- 공유 링크 **취소(revoke) UI 없음**(DB에 `revoked_at`만 있음). 링크는 7일 후 만료, 발급 이력 목록 없음.
- 카카오톡 공유는 OS 공유 시트(`navigator.share`) 방식. **iOS Safari는 버튼을 누른 직후가 아니면 공유를 거부(`NotAllowedError`)할 수 있음**(서버에서 링크를 만든 뒤 호출하므로 위험) — 실기기 확인 전. 문제 시 링크 선발급 후 즉시 공유하거나 실패 시 복사로 폴백.
- 상세 보기는 별도 URL이 없음(새로고침하면 목록으로).
- 위 "알려진 한계" 중 '목록은 전체 조회라 1,000명 초과 시…'는 100명 기준 설계라 당분간 무시(1,000명 근처에서 재검토).
- 이번 변경(공유/상세/로그인/PWA)의 화면·터치 동작은 자동 검증하지 못함(타입체크·린트·`curl`로 접근 제어만 확인). 사용자 실기기 확인 필요.

## 7. 다음 계획 (우선순위 순)
### A. 배포·점검 (지금 여기)
1. **Vercel 배포**: 저장소 연결, 환경변수 4개(`SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `ADMIN_PASSWORD`(긴 값 권장), `AUTH_SECRET`(새 랜덤값)), Node 24.x 확인. 배포 주소가 정해지면 `NEXT_PUBLIC_SITE_URL` 검토.
2. **모바일 실기기 점검(HTTPS)**: 로그인, 목록 필터 속도, 카드 클릭→상세→뒤로가기, 공유 시트(카카오톡 노출, 줄바꿈 형식), 공유 링크 화면, 홈 화면 추가(iOS Safari / Android Chrome), safe area, 입력 확대.
3. iOS에서 공유가 `NotAllowedError`면 위 폴백 적용.
4. 관리자 안내문: 앱 설치 방법(iOS Safari "홈 화면에 추가" / Android Chrome "앱 설치", 카카오톡 인앱 브라우저에서는 설치 불가) — 대화에서 문안 작성함, 배포 주소 넣어 전달.

### B. Phase 2 — 권한/관리자
1. 로그인 수단 결정(카카오 vs 구글) → Supabase Auth 연동(`PUBLISHABLE_KEY`, `JWKS_URL`), **임시 비밀번호 로그인 대체**(`lib/auth`, `proxy.ts`, `features/auth` 교체 지점)
2. `admins` 테이블(`user_id` PK → `auth.users`), 관리자 2명 **수동 INSERT**
3. RLS 정책 전환(관리자만 friends CRUD), 서버 접근을 `secret key`에서 사용자 세션 기반으로. 공유 화면(`/s/*`)은 토큰 검증 후 서버 조회라 별도 고려
4. ~~친구 삭제~~ → 구현됨(관리자 권한 분리만 Phase 2에서)
5. **관리자 페이지**: 등록 항목 추가/삭제/필수 변경 → `field_definitions` + `friends.extra jsonb` 전환 (`features/friends/fields.ts`가 전환 지점). 상세/공유 화면(`friend-profile.tsx`)도 필드 정의 기반으로

### C. 백로그
공유 링크 취소/이력 UI, 상세 보기 별도 URL(인터셉팅 라우트), 출생연도 필터 복구, 정렬/검색, 키·직업·거주지 필터, 매칭 이력, 썸네일 생성, 이미지 로드 실패 fallback, ImagePicker 취소, 다크 모드, 디자인 토큰 확장, 100명 초과 시 서버 필터+커서 페이지네이션, 카카오 SDK 카드형 공유(앱 키·도메인 등록 필요), 앱 스토어 출시가 필요하면 Capacitor 래핑(서버 URL 로드 방식)

## 8. 작업 방식 (사용자 선호)
- 응답/주석은 한국어. 코드 식별자는 영어.
- 커밋은 **큰 작업 단위**로 묶는다(디자인은 하나로). 이력 정리처럼 되돌리기 어려운 작업은 **먼저 제안하고 승인받은 뒤** 진행. push는 요청받았을 때만.
- 테스트는 사용자가 직접 한다. 확인하지 못한 것은 "확인하지 못했다"고 명시한다.
- 커밋 메시지 끝에 `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>` 추가.
