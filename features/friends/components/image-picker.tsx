'use client';

import { CameraIcon, ImagePlusIcon } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { compressImage } from '@/lib/compress-image';

// 압축 전 원본 허용 크기 (너무 큰 파일은 브라우저 메모리 문제가 있어 막는다)
const MAX_ORIGINAL_SIZE = 30 * 1024 * 1024;

type ImagePickerProps = {
  id: string;
  name: string;
  invalid?: boolean;
  /** 압축 중에는 폼 제출을 막기 위해 상태를 알려준다. */
  onBusyChange?: (busy: boolean) => void;
  /** 선택 단계에서 생긴 에러(용량 초과, 변환 실패 등) */
  onErrorChange?: (message: string | undefined) => void;
};

// 사진 한 장을 고르는 썸네일형 입력. 선택하면 브라우저에서 압축한 파일로 교체해 폼에 담는다.
export function ImagePicker({
  id,
  name,
  invalid,
  onBusyChange,
  onErrorChange,
}: ImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function setBusyState(value: boolean) {
    setBusy(value);
    onBusyChange?.(value);
  }

  function clear() {
    if (inputRef.current) inputRef.current.value = '';
    setPreviewUrl(undefined);
  }

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const file = input.files?.[0];
    onErrorChange?.(undefined);
    if (!file) return;

    if (file.size > MAX_ORIGINAL_SIZE) {
      clear();
      onErrorChange?.('이미지는 30MB 이하만 선택할 수 있어요.');
      return;
    }

    setBusyState(true);
    try {
      const compressed = await compressImage(file);
      const dt = new DataTransfer();
      dt.items.add(compressed);
      input.files = dt.files;
      setPreviewUrl(URL.createObjectURL(compressed));
    } catch {
      clear();
      onErrorChange?.(
        '이 이미지는 사용할 수 없어요. jpg, png, webp 이미지를 선택해 주세요.',
      );
    } finally {
      setBusyState(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={inputRef}
        id={id}
        name={name}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        className="sr-only"
        tabIndex={-1}
      />

      {previewUrl ? (
        // 선택 후에는 썸네일 자체가 버튼. 모서리의 작은 카메라 배지와 안내 문구로 다시 누를 수 있음을 알려준다.
        <div className="flex flex-col items-start gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            aria-label="사진 변경"
            disabled={busy}
            className="relative size-24 overflow-hidden rounded-lg bg-muted outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
          >
            <Image
              src={previewUrl}
              alt="선택한 사진 미리보기"
              fill
              unoptimized
              className="object-cover"
            />
            <span className="absolute right-1 bottom-1 flex size-6 items-center justify-center rounded-full bg-background/90 shadow-sm">
              <CameraIcon className="size-3.5" />
            </span>
          </button>
          <p className="text-xs text-muted-foreground">
            {busy ? '최적화 중...' : '사진을 눌러 변경할 수 있어요'}
          </p>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full border-dashed text-muted-foreground aria-invalid:border-destructive"
          onClick={() => inputRef.current?.click()}
          aria-invalid={invalid}
          disabled={busy}
        >
          <ImagePlusIcon />
          {busy ? '최적화 중...' : '사진 추가'}
        </Button>
      )}
    </div>
  );
}
