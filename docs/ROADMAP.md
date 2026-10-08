# 로드맵

## Phase 0 — 준비
- [x] Next.js 프로젝트 생성
- [x] 문서 작성 (PRD, 데이터 모델, 아키텍처, 컨벤션)
- [x] GitHub 저장소 연결
- [x] Tailwind + shadcn/ui 초기 설정
- [x] Supabase 프로젝트 생성, 환경변수 설정
- [x] MVP 접근 제어 방식 결정: 배포 URL 비공개 + 서버 경유 접근 (PRD 미결 사항 #1)

## Phase 1 — MVP (기능 구현 완료, 배포/점검 남음. 상세는 [PROGRESS](PROGRESS.md))
- [x] `friends` 테이블 + Storage 버킷 마이그레이션
- [x] 친구 등록 폼 (zod 검증, 이미지 업로드)
- [x] 친구 목록 (카드 UI, empty state)
- [x] 필터: 성별 (URL 쿼리 기반)
- [ ] (보류) 필터: 출생연도 범위
- [ ] 목록 페이지네이션 (1,000명 초과 시 잘림 방지)
- [ ] 모바일 실기기 점검
- [ ] Vercel 배포

## Phase 2 — 권한/관리자
- [ ] 로그인 수단 결정 (카카오 / 구글) 및 Supabase Auth 연동
- [ ] `admins` 테이블, 관리자 2명 수동 등록
- [ ] RLS 정책 전환 (관리자만 접근)
- [ ] 친구 삭제
- [ ] 관리자 페이지: 등록 항목 추가/삭제/필수 변경 (`field_definitions`, `extra jsonb` 전환)

## Backlog
친구 정보 수정, 목록 정렬/검색, 키·직업·거주지 필터, 매칭 이력 기록
