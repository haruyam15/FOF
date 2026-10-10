# FOF (친구의 친구를 소개합니다)

소개팅 서비스. 관리자가 "친구들"(소개팅 당사자)을 등록하고 매칭한다. 모바일 전용.
스택: Next.js 16(App Router) · TypeScript · Tailwind v4 · shadcn/ui(base-nova) · Supabase · pnpm.

## 작업 시작 전
1. [docs/PROGRESS.md](docs/PROGRESS.md) — 현재 상태, 결정 사항, 함정, **다음 계획** (먼저 읽는다)
2. 필요할 때만 읽는다: [docs/ROADMAP.md](docs/ROADMAP.md)(계획), [docs/CONVENTIONS.md](docs/CONVENTIONS.md)(코드 규칙), [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md)(UI 작업 시), [docs/DATA_MODEL.md](docs/DATA_MODEL.md)(DB 작업 시)
3. Next.js 코드를 쓰기 전 `node_modules/next/dist/docs/`의 관련 문서 확인 ([AGENTS.md](AGENTS.md))

## 꼭 지킬 것
- `nvm use`(Node 24). pnpm 사용.
- `globals.css` 수정 후 반영 안 되면 dev 서버 종료 → `rm -rf .next` → `pnpm dev`.
- `next dev`가 켜져 있을 때 `pnpm build` 금지. 검증은 `npx tsc --noEmit`, `npx eslint .`.
- Supabase는 서버(Server Action/서버 컴포넌트)에서만 접근. `SUPABASE_SECRET_KEY`는 클라이언트에 노출 금지.
- 디자인 값은 `globals.css` 토큰으로만. 모바일 규칙(터치 44px, 입력 16px) 준수.
- 커밋은 큰 단위로, 이력 정리는 먼저 제안. push는 요청받았을 때만. 확인하지 못한 것은 솔직히 밝힌다.
