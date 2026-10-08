# 로드맵

## Phase 0 — 준비
- [x] Next.js 프로젝트 생성
- [x] 문서 작성 (PRD, 데이터 모델, 아키텍처, 컨벤션)
- [ ] GitHub 저장소 연결
- [ ] Tailwind + shadcn/ui 초기 설정
- [ ] Supabase 프로젝트 생성, 환경변수 설정
- [ ] MVP 접근 제어 방식 결정 (PRD 미결 사항 #1)

## Phase 1 — MVP
- [ ] `friends` 테이블 + Storage 버킷 마이그레이션
- [ ] 친구 등록 폼 (zod 검증, 이미지 업로드)
- [ ] 친구 목록 (카드 UI, empty state)
- [ ] 필터: 성별, 출생연도 범위 (URL 쿼리 기반)
- [ ] 모바일 반응형 점검
- [ ] Vercel 배포

## Phase 2 — 권한/관리자
- [ ] 로그인 수단 결정 (카카오 / 구글) 및 Supabase Auth 연동
- [ ] `admins` 테이블, 관리자 2명 수동 등록
- [ ] RLS 정책 전환 (관리자만 접근)
- [ ] 친구 삭제
- [ ] 관리자 페이지: 등록 항목 추가/삭제/필수 변경 (`field_definitions`, `extra jsonb` 전환)

## Backlog
친구 정보 수정, 목록 정렬/검색, 키·직업·거주지 필터, 매칭 이력 기록
