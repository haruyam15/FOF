# FOF — 친구의 친구를 소개합니다

아예 모르는 사람이 아니라 **친구의 친구**를 소개해 주는 소개팅 서비스입니다.
서비스에 등록된 소개팅 당사자를 "친구들"이라 부르며, 관리자가 등록된 친구들을 직접 매칭해 줍니다.

## 로드맵 요약
| 단계 | 내용 |
|---|---|
| **MVP** | 친구 등록, 친구 목록 조회 (성별 필터) |
| **2단계** | 간편 로그인(카카오/구글), 관리자 페이지(등록 항목 관리, 친구 삭제) |

## 기술 스택
Next.js (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Supabase · pnpm

## 시작하기
```bash
pnpm install
cp .env.example .env.local   # Supabase 값 채우기
pnpm dev                     # http://localhost:3000
```

| 스크립트 | 설명 |
|---|---|
| `pnpm dev` | 개발 서버 |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm lint` | ESLint |

## 문서
| 문서 | 내용 |
|---|---|
| [PRD](docs/PRD.md) | 서비스 개요, 요구사항, 미결 사항 |
| [데이터 모델](docs/DATA_MODEL.md) | Supabase 스키마, Storage, 2단계 확장 |
| [아키텍처](docs/ARCHITECTURE.md) | 스택, 폴더 구조, 데이터 흐름 |
| [개발 컨벤션](docs/CONVENTIONS.md) | 브랜치, 커밋, 네이밍, 코드 스타일 |
| [디자인 시스템](docs/DESIGN_SYSTEM.md) | 색상, 그림자 등 디자인 토큰 |
| [로드맵](docs/ROADMAP.md) | 단계별 체크리스트 |

## 주의
등록되는 정보는 개인정보입니다. 실제 데이터를 저장소·로그·스크린샷에 남기지 마세요.
