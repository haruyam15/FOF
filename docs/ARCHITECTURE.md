# 아키텍처

## 기술 스택
| 영역 | 선택 |
|---|---|
| 프레임워크 | Next.js (App Router) + React + TypeScript |
| 스타일 | Tailwind CSS v4 + shadcn/ui |
| DB / Storage / Auth | Supabase |
| 검증 | zod (Server Action에서 서버 검증) |
| 런타임 | Node.js 24 LTS (`.nvmrc`, supabase-js는 22+ 필요) |
| 패키지 매니저 | pnpm |
| 배포 | Vercel (예정) |

> 이 저장소의 Next.js는 학습 데이터와 다른 버전이다. 코드를 쓰기 전 `node_modules/next/dist/docs/`의 해당 가이드를 확인한다. ([AGENTS.md](../AGENTS.md))

## 데이터 흐름 (MVP)
```
브라우저 ──(Server Action / RSC)──▶ Next.js 서버 ──(service role)──▶ Supabase
```
- 클라이언트에서 Supabase를 직접 호출하지 않는다. (MVP는 로그인이 없고 RLS 정책이 없으므로)
- 2단계에서 Supabase Auth 도입 후, RLS 정책 + 사용자 세션 기반 접근으로 전환한다.
- `SUPABASE_SECRET_KEY`는 서버 전용. 절대 `NEXT_PUBLIC_` 접두사를 붙이지 않는다.

## 폴더 구조
실제 구조는 [PROGRESS.md](PROGRESS.md#4-실제-폴더-구조) 참고. 기능 단위(`features/`)로 묶고, 라우트(`app/`)는 얇게 유지한다. 기본은 Server Component, 상호작용이 필요한 곳만 `"use client"`.

## 환경변수
`.env.example` 참고. 실제 값은 `.env.local`에만 두고 커밋하지 않는다.

## 목록 필터 구현 방침
- 필터 상태 = URL searchParams. 서버에서 파싱 → zod 검증 → Supabase 쿼리
- 쿼리: `eq('gender', g)`, `gte('birth_year', from)`, `lte('birth_year', to)`
- 잘못된 값은 무시하고 기본값으로 처리

## Next.js 설정 메모
- `cacheComponents`는 끄고 사용한다. 이 서비스는 모든 데이터가 요청 시점에 조회되는 동적 데이터라 캐싱 이점이 적고, 켜면 페이지 이동 시 폼 상태가 남는 문제(Activity)와 렌더링 제약(`new Date()` 등)이 생긴다. 캐싱이 필요해지면 그때 다시 검토한다.
- 이미지 업로드를 위해 `experimental.serverActions.bodySizeLimit`을 6MB로 설정했다. (기본 1MB)
