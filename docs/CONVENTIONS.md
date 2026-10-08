# 개발 컨벤션 (최소 규칙)

"지키기 쉬운 것만" 정한다. 필요해지면 추가한다.

## 1. 브랜치 전략
- `main`: 항상 배포 가능한 상태. 직접 push 지양, PR로 병합
- 작업 브랜치: `{type}/{간단한-설명}` — 예) `feat/friend-register`, `fix/filter-year`
- 병합은 **Squash merge**, 병합 후 브랜치 삭제

## 2. 커밋 메시지 (Conventional Commits)
```
<type>: <제목>      # 제목은 한글 가능, 마침표 없음
```
| type | 용도 |
|---|---|
| feat | 기능 추가 |
| fix | 버그 수정 |
| docs | 문서 |
| style | 포맷팅 (동작 변화 없음) |
| refactor | 리팩터링 |
| chore | 설정/의존성/빌드 |
| db | 마이그레이션 |

예) `feat: 친구 등록 폼 추가`, `db: friends 테이블 생성`

## 3. 네이밍
| 대상 | 규칙 | 예 |
|---|---|---|
| 파일/폴더 | kebab-case | `friend-card.tsx` |
| React 컴포넌트 | PascalCase | `FriendCard` |
| 변수/함수 | camelCase | `getFriends` |
| 타입/인터페이스 | PascalCase | `Friend` |
| 상수 | UPPER_SNAKE_CASE | `MAX_IMAGE_SIZE` |
| DB 테이블/컬럼 | snake_case, 테이블은 복수형 | `friends`, `birth_year` |
| 환경변수 | UPPER_SNAKE_CASE | `SUPABASE_URL` |

- 코드 식별자는 영어, UI 문구·주석은 한국어
- 도메인 용어: 소개팅 당사자 = `friend` (`user`와 혼용 금지. `user`는 로그인 계정/관리자)

## 4. 코드 스타일
- TypeScript `strict`, `any` 금지 (불가피하면 사유 주석)
- ESLint 경고 0 상태로 커밋 (`pnpm lint`)
- 컴포넌트는 named export, `page.tsx`/`layout.tsx`만 default export
- import 경로는 `@/` 별칭 사용
- 서버/클라이언트 경계: 기본 Server Component, 필요한 곳만 `"use client"`
- 데이터 변경은 Server Action, 입력은 **서버에서 zod로 반드시 재검증**
- 스타일은 Tailwind 유틸리티 + shadcn/ui. 임의 CSS 파일 추가 금지
- 한 파일이 200줄을 넘으면 분리를 고려

## 4-1. 모바일 전용 규칙
- 모든 UI는 모바일(360~430px)을 기준으로 만든다. 데스크톱 전용 스타일(`md:`, `lg:` 등)은 추가하지 않는다.
- 터치 가능한 요소(버튼, 링크, 입력창, 라디오/체크박스 행)는 높이 44px(`h-11`) 이상
- 입력창 글자는 16px 이상(`text-base`). `text-sm`을 입력 요소에 쓰지 않는다 (iOS 자동 확대)
- 메인 컬럼 폭은 `max-w-md`, 상하단은 safe area(`env(safe-area-inset-*)`)를 고려
- 숫자 입력은 `inputMode="numeric"` 등 모바일 키보드를 지정

## 5. 보안/시크릿
- `.env.local` 커밋 금지. 새 변수는 `.env.example`에 키만 추가
- `SUPABASE_SECRET_KEY`(service_role 권한)는 서버 코드에서만 사용, 클라이언트 번들 노출 금지
- 친구들의 개인정보(이름·사진 등)를 로그·스크린샷·이슈에 남기지 않는다. 테스트는 더미 데이터 사용

## 6. DB 변경
- 스키마 변경은 `supabase/migrations/`에 SQL 파일로 남긴다 (대시보드에서 직접 수정 금지)
- 파일명: `YYYYMMDDHHMMSS_설명.sql`
- 테이블 생성 시 RLS 활성화를 기본으로 한다

## 7. PR 규칙
- 제목은 커밋 컨벤션과 동일
- 본문: 변경 요약 / 테스트 방법 / (UI 변경 시) 스크린샷
- 병합 전 `pnpm lint`, `pnpm build` 통과 확인
