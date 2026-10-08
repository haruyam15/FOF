# 디자인 시스템

디자인 값은 `app/globals.css`의 토큰으로만 정의하고, 컴포넌트에서는 토큰 이름으로 쓴다.
임의 값(`shadow-[...]`, `bg-[#...]` 등)은 쓰지 않는다. 필요한 값이 없으면 토큰부터 추가한다.

## 색상
| 토큰 | 값 | 용도 | 클래스 |
|---|---|---|---|
| `--primary` | `#4F7A3A` | 주요 버튼 등 행동 유도 | `bg-primary`, `text-primary-foreground` |
| `--brand` | `#9EC188` | 로고 색. 선택 상태, 포커스 등 부드러운 포인트 | `bg-brand/20`, `border-brand` |
| `--destructive` | shadcn 기본 | 에러, 필수 별표 | `text-destructive`, `border-destructive` |

## 그림자
`@theme`의 `--drop-shadow-*` 로 정의하며 `drop-shadow-<이름>` 으로 쓴다.

| 이름 | 값 | 용도 |
|---|---|---|
| `drop-shadow-sticky` | `0 2px 16px rgb(17 17 17 / 0.06)` (X0 Y2 Blur16 Spread0, #111111 6%) | 상단에 고정(sticky)된 영역 아래 그림자 |

## 레이아웃 유틸리티
| 클래스 | 설명 |
|---|---|
| `full-bleed` | 가운데 컬럼 안의 요소가 배경/그림자는 화면 전체 폭으로 펼쳐지고, 내용은 컬럼 폭에 맞춰짐 (sticky 제목 등). 루트 `body`의 `overflow-x-clip`과 함께 사용 |

## 추가 규칙
- 토큰을 바꾸면 모든 사용처에 반영된다. 용도가 다르면 토큰을 새로 만든다(예: `drop-shadow-card`).
- `globals.css`를 수정한 뒤 dev 서버에 반영되지 않으면 `rm -rf .next` 후 `pnpm dev`를 다시 실행한다.
