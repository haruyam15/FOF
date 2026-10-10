# 진행 기록

> 새 대화 시작 시 이 문서만 먼저 읽는다. 상세는 필요할 때 [ROADMAP](ROADMAP.md) · [DATA_MODEL](DATA_MODEL.md) · [CONVENTIONS](CONVENTIONS.md) · [DESIGN_SYSTEM](DESIGN_SYSTEM.md).
> 갱신: 2026-10-10. 규모 기준: 친구 최대 100명.

## 1. 상태
- 구현됨: 친구 등록/목록(성별 필터)/상세/**수정·삭제**/사진 최대 3장, 임시 비밀번호 로그인, 프로필 공유 링크, PWA(manifest만).
- 마이그레이션 5건 모두 DB 적용됨. **사진 3장·수정·삭제 실제 동작은 사용자 확인 전.**
- 미완: Vercel 배포, 모바일 실기기 점검(공유 시트, 홈 화면 추가), Phase 2 전부.
- 저장소: github.com/haruyam15/FOF (`main` 하나). 환경변수: `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `ADMIN_PASSWORD`, `AUTH_SECRET`(+선택 `NEXT_PUBLIC_SITE_URL`). Vercel에도 동일하게.

## 2. 구조 (핵심만)
- `app/(main)/friends/` 목록·`new`·`[id]/edit`, `app/login`, `app/s/[token]`(공유 화면), `proxy.ts`(로그인 게이트)
- `features/friends/` actions(create/update/delete) · queries(`getFriends` 캐시 30분 태그 `friends`, `getFriendById`) · schema(zod) · fields(상수) · images · components
- `features/shares/`(링크 발급·조회), `features/auth/`, `lib/auth/`(HMAC 쿠키), `lib/supabase/server.ts`
- 목록 데이터를 바꾸면 `updateTag(FRIENDS_CACHE_TAG)`.

## 3. 결정 (이유 한 줄)
- Supabase는 서버에서만, RLS 켜고 정책 없음(anon 차단), secret key로 접근 — 로그인 전이라 정책 불가.
- 나이는 `birth_year` 저장. 폼 검증은 서버 zod만(`noValidate`).
- 사진: `image_paths text[]`, 브라우저에서 1600px JPEG 압축, 비공개 버킷, 첫 장이 대표. 순서 변경 없음(삭제 후 추가). 수정 시 유지할 기존 사진은 `keepImage`(경로)로 전달.
- 목록은 전체 fetch + 클라이언트 필터(서버 왕복 지연 때문). 100명 초과 시 서버 필터+커서 페이지네이션.
- 서명 URL을 캐시해 안정화(URL 2시간 > 캐시 30분) → 브라우저/이미지 캐시 적중.
- 공유 링크: 랜덤 토큰 32바이트, 7일 만료, `revoked_at`. 열 때마다 DB에서 읽어 수정 내용이 즉시 반영됨. 친구 삭제 시 cascade.
- 공유 메시지는 `text` 하나(줄바꿈+링크), `url` 필드 미사용. 문구: "친구의 친구를 소개합니다."
- 공유 URL 노출 때문에 임시 비밀번호 로그인 먼저 도입(Phase 2에서 Supabase Auth로 교체).
- 모바일 전용: `max-w-md`, 터치 44px, 입력 16px, `md:` 금지. 디자인 값은 `globals.css` 토큰만.
- `cacheComponents` 끔. 출생연도 필터 보류(git 이력에서 복구 가능). PWA 서비스 워커 없음.

## 4. 함정
- Node 24(`nvm use`), pnpm. Next.js 16은 학습 데이터와 다름 → `node_modules/next/dist/docs/` 확인.
- `globals.css` 반영 안 되면 dev 종료 → `rm -rf .next` → `pnpm dev`. dev 켜진 채 `pnpm build` 금지(검증은 `npx tsc --noEmit`, `npx eslint .`).
- shadcn `base-nova`는 Base UI 기반(Radix 예제와 다름).
- 카드 클릭 영역은 내용 **뒤**에 둔 `absolute inset-0` 버튼, 공유 버튼은 `z-10`.
- `navigator.share`·클립보드는 HTTPS 필요. iOS는 `NotAllowedError` 가능(미확인) → 링크 선발급 또는 복사 폴백.
- macOS `sed -i ''`. `git mv`는 untracked에 불가.
- 실제 지인 정보가 DB에 있으므로 로그·스크린샷에 남기지 않는다.

## 5. 알려진 한계
- 접근 제어는 공용 비밀번호 하나, 시도 횟수 제한 없음.
- 서버 검증 에러로 폼이 다시 그려지면 새로 고른 사진이 비워짐.
- 사진 로드 실패 시 fallback 없음. 상세 보기는 별도 URL 없음. 공유 링크 취소 UI 없음.
- 삭제 시 Storage 정리가 실패하면 파일이 남을 수 있음.
- 다크 모드 미설계. Server Action 본문 한도 16MB(3장 기준), 압축본 실제 크기 미확인.

## 6. 다음 계획
1. **배포·점검**: Vercel 연결(Node 24, 환경변수, 긴 `ADMIN_PASSWORD`, 새 `AUTH_SECRET`) → 실기기(로그인, 필터, 상세, 공유, 홈 화면 추가, 수정·삭제).
2. **Phase 2**: 로그인 수단 결정(카카오/구글) → Supabase Auth로 교체, `admins` 테이블, RLS 전환, 관리자 페이지(`field_definitions` + `extra jsonb`, 전환 지점 `features/friends/fields.ts`).
3. **백로그**: 공유 링크 취소/이력, 상세 별도 URL, 출생연도 필터, 정렬/검색, 매칭 이력, 썸네일, 이미지 fallback, 다크 모드, 카카오 SDK 카드 공유, Capacitor 래핑.

## 7. 작업 방식
- 한국어. 커밋은 큰 작업 단위, 이력 정리는 먼저 제안, push는 요청 시. 테스트는 사용자가 직접, 확인 못 한 것은 명시.
- 커밋 끝: `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`
