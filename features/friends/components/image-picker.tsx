'use client';

import { ImagePlusIcon, XIcon } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { compressImage } from '@/lib/compress-image';
import { MAX_IMAGES } from '../fields';
import type { ExistingImage } from '../types';

// 압축 전 원본 허용 크기 (너무 큰 파일은 브라우저 메모리 문제가 있어 막는다)
const MAX_ORIGINAL_SIZE = 30 * 1024 * 1024;

// path가 있으면 이미 저장된 사진(서버에는 경로만 보낸다), 없으면 새로 고른 압축본.
type Picked = { key: string; file?: File; path?: string; url: string };

type ImagePickerProps = {
  id: string;
  name: string;
  invalid?: boolean;
  /** 압축 중에는 폼 제출을 막기 위해 상태를 알려준다. */
  onBusyChange?: (busy: boolean) => void;
  /** 선택 단계에서 생긴 에러(용량 초과, 변환 실패 등) */
  onErrorChange?: (message: string | undefined) => void;
  /** 수정 화면에서 이미 저장된 사진. 새로 고른 사진보다 앞에 표시된다. */
  initialImages?: ExistingImage[];
  /** 유지하는 기존 사진 경로를 보낼 폼 필드 이름 */
  keepName?: string;
};

// 사진을 최대 MAX_IMAGES장까지 고르는 썸네일형 입력. 고른 순서가 저장 순서이고 첫 번째가 대표 사진이다.
// 선택하면 브라우저에서 압축하고, 압축본 전체를 `name` 파일 input에 담아 폼과 함께 제출한다.
export function ImagePicker({
  id,
  name,
  invalid,
  onBusyChange,
  onErrorChange,
  initialImages = [],
  keepName = 'keepImage',
}: ImagePickerProps) {
  // 파일 선택용 input(이름 없음)과 폼 제출용 input(name 있음)을 분리한다. 후자에 압축본 목록을 채운다.
  const pickerRef = useRef<HTMLInputElement>(null);
  const submitRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Picked[]>(() =>
    initialImages.map((img) => ({ key: img.path, path: img.path, url: img.url })),
  );
  const [busy, setBusy] = useState(false);
  const itemsRef = useRef(items);

  useEffect(() => {
    itemsRef.current = items;
    if (!submitRef.current) return;
    const dt = new DataTransfer();
    for (const item of items) if (item.file) dt.items.add(item.file);
    submitRef.current.files = dt.files;
  }, [items]);

  // 언마운트 시 남아 있는 미리보기 URL 해제
  useEffect(() => {
    return () => {
      for (const item of itemsRef.current) if (item.file) URL.revokeObjectURL(item.url);
    };
  }, []);

  function setBusyState(value: boolean) {
    setBusy(value);
    onBusyChange?.(value);
  }

  function remove(key: string) {
    onErrorChange?.(undefined);
    setItems((prev) => {
      const target = prev.find((p) => p.key === key);
      if (target?.file) URL.revokeObjectURL(target.url);
      return prev.filter((p) => p.key !== key);
    });
  }

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const selected = Array.from(input.files ?? []);
    // 같은 파일을 다시 고를 수 있도록 선택 input은 바로 비운다.
    input.value = '';
    onErrorChange?.(undefined);
    if (selected.length === 0) return;

    const remaining = MAX_IMAGES - items.length;
    if (selected.length > remaining) {
      onErrorChange?.(`사진은 최대 ${MAX_IMAGES}장까지 올릴 수 있어요.`);
      return;
    }
    if (selected.some((f) => f.size > MAX_ORIGINAL_SIZE)) {
      onErrorChange?.('이미지는 한 장당 30MB 이하만 선택할 수 있어요.');
      return;
    }

    setBusyState(true);
    try {
      const compressed = await Promise.all(selected.map((f) => compressImage(f)));
      setItems((prev) => [
        ...prev,
        ...compressed.map((file) => ({
          key: crypto.randomUUID(),
          file,
          url: URL.createObjectURL(file),
        })),
      ]);
    } catch {
      onErrorChange?.(
        '이 이미지는 사용할 수 없어요. jpg, png, webp 이미지를 선택해 주세요.',
      );
    } finally {
      setBusyState(false);
    }
  }

  const canAdd = items.length < MAX_IMAGES;

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={pickerRef}
        id={id}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        className="sr-only"
        tabIndex={-1}
      />
      <input ref={submitRef} name={name} type="file" className="sr-only" tabIndex={-1} aria-hidden />
      {items.map(
        (item) => item.path && <input key={item.key} type="hidden" name={keepName} value={item.path} />,
      )}

      <ul className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <li key={item.key} className="relative size-24 overflow-hidden rounded-lg bg-muted">
            <Image
              src={item.url}
              alt={`선택한 사진 ${i + 1}`}
              fill
              unoptimized
              className="object-cover"
            />
            {i === 0 && (
              <span className="absolute bottom-1 left-1 rounded-full bg-background/90 px-2 py-0.5 text-xs font-medium shadow-sm">
                대표
              </span>
            )}
            {/* 보이는 크기는 작은 배지, 누를 수 있는 영역은 44px */}
            <button
              type="button"
              onClick={() => remove(item.key)}
              aria-label={`사진 ${i + 1} 삭제`}
              disabled={busy}
              className="absolute top-0 right-0 flex size-11 items-start justify-end p-1 outline-none disabled:opacity-50"
            >
              <span className="flex size-6 items-center justify-center rounded-full bg-background/90 shadow-sm">
                <XIcon className="size-3.5" />
              </span>
            </button>
          </li>
        ))}

        {canAdd && (
          <li>
            <button
              type="button"
              onClick={() => pickerRef.current?.click()}
              data-invalid={invalid ? "true" : undefined}
              disabled={busy}
              className="flex size-24 flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-xs text-muted-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 data-[invalid=true]:border-destructive"
            >
              <ImagePlusIcon className="size-5" />
              {busy ? '최적화 중...' : `사진 추가 ${items.length}/${MAX_IMAGES}`}
            </button>
          </li>
        )}
      </ul>

      <p className="text-xs text-muted-foreground">
        {items.length > 1
          ? '첫 번째 사진이 대표 사진이에요. 고른 순서대로 보여요.'
          : `최대 ${MAX_IMAGES}장까지 올릴 수 있어요.`}
      </p>
    </div>
  );
}
