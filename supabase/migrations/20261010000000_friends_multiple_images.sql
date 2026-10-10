-- 친구 사진을 최대 3장까지 저장한다. 배열 순서가 표시 순서이고 첫 번째가 대표 이미지다.
alter table public.friends
  add column image_paths text[] not null default '{}'
  check (cardinality(image_paths) <= 3);

-- 기존 한 장짜리 데이터를 옮기고 옛 컬럼은 제거한다.
update public.friends
  set image_paths = array[image_path]
  where image_path is not null;

alter table public.friends drop column image_path;
