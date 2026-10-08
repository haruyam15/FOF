"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { compressImage } from "@/lib/compress-image";
import { createFriend, type CreateFriendState } from "../actions";
import {
  BIRTH_YEAR_MIN,
  GENDERS,
  HEIGHT_MAX,
  HEIGHT_MIN,
  RELIGIONS,
} from "../fields";

const initialState: CreateFriendState = {};
// 압축 전 원본 허용 크기 (너무 큰 파일은 브라우저 메모리 문제가 있어 막는다)
const MAX_ORIGINAL_SIZE = 30 * 1024 * 1024;

export function FriendForm() {
  const [state, formAction, pending] = useActionState(createFriend, initialState);
  const { errors = {}, values = {} } = state;
  const [compressing, setCompressing] = useState(false);
  const [imageError, setImageError] = useState<string>();

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const file = input.files?.[0];
    setImageError(undefined);
    if (!file) return;

    if (file.size > MAX_ORIGINAL_SIZE) {
      input.value = "";
      setImageError("이미지는 30MB 이하만 선택할 수 있어요.");
      return;
    }

    setCompressing(true);
    try {
      const compressed = await compressImage(file);
      const dt = new DataTransfer();
      dt.items.add(compressed);
      input.files = dt.files;
    } catch {
      input.value = "";
      setImageError("이 이미지는 사용할 수 없어요. jpg, png, webp 이미지를 선택해 주세요.");
    } finally {
      setCompressing(false);
    }
  }

  return (
    <form key={state.nonce} action={formAction} className="flex flex-col gap-6">
      <FieldGroup>
        <Field data-invalid={!!(errors.image || imageError)}>
          <FieldLabel htmlFor="image">사진 (선택)</FieldLabel>
          <Input
            id="image"
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
          />
          {compressing && <p className="text-sm text-muted-foreground">이미지 최적화 중...</p>}
          <FieldError>{imageError ?? errors.image}</FieldError>
        </Field>

        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="name">이름</FieldLabel>
          <Input
            id="name"
            name="name"
            defaultValue={values.name}
            maxLength={30}
            aria-invalid={!!errors.name}
            required
          />
          <FieldError>{errors.name}</FieldError>
        </Field>

        <Field data-invalid={!!errors.gender}>
          <FieldLabel>성별</FieldLabel>
          <RadioGroup name="gender" defaultValue={values.gender} className="flex gap-6" required>
            {GENDERS.map((g) => (
              <div key={g.value} className="flex items-center gap-2">
                <RadioGroupItem id={`gender-${g.value}`} value={g.value} />
                <Label htmlFor={`gender-${g.value}`}>{g.label}</Label>
              </div>
            ))}
          </RadioGroup>
          <FieldError>{errors.gender}</FieldError>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field data-invalid={!!errors.birthYear}>
            <FieldLabel htmlFor="birthYear">출생연도</FieldLabel>
            <Input
              id="birthYear"
              name="birthYear"
              type="number"
              inputMode="numeric"
              placeholder="1996"
              min={BIRTH_YEAR_MIN}
              defaultValue={values.birthYear}
              aria-invalid={!!errors.birthYear}
              required
            />
            <FieldError>{errors.birthYear}</FieldError>
          </Field>

          <Field data-invalid={!!errors.heightCm}>
            <FieldLabel htmlFor="heightCm">키 (cm)</FieldLabel>
            <Input
              id="heightCm"
              name="heightCm"
              type="number"
              inputMode="numeric"
              placeholder="170"
              min={HEIGHT_MIN}
              max={HEIGHT_MAX}
              defaultValue={values.heightCm}
              aria-invalid={!!errors.heightCm}
              required
            />
            <FieldError>{errors.heightCm}</FieldError>
          </Field>
        </div>

        <Field data-invalid={!!errors.job}>
          <FieldLabel htmlFor="job">직업</FieldLabel>
          <Input
            id="job"
            name="job"
            defaultValue={values.job}
            maxLength={50}
            aria-invalid={!!errors.job}
            required
          />
          <FieldError>{errors.job}</FieldError>
        </Field>

        <Field data-invalid={!!errors.residence}>
          <FieldLabel htmlFor="residence">거주지 (선택)</FieldLabel>
          <Input
            id="residence"
            name="residence"
            placeholder="예) 서울 마포구"
            defaultValue={values.residence}
            maxLength={50}
            aria-invalid={!!errors.residence}
          />
          <FieldError>{errors.residence}</FieldError>
        </Field>

        <Field data-invalid={!!errors.religion}>
          <FieldLabel htmlFor="religion">종교 (선택)</FieldLabel>
          <select
            id="religion"
            name="religion"
            defaultValue={values.religion ?? ""}
            className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          >
            <option value="">선택 안 함</option>
            {RELIGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <FieldError>{errors.religion}</FieldError>
        </Field>

        <Field data-invalid={!!errors.personality}>
          <FieldLabel htmlFor="personality">성격 (선택)</FieldLabel>
          <Textarea
            id="personality"
            name="personality"
            rows={3}
            maxLength={500}
            placeholder="예) 차분하고 배려심이 많아요"
            defaultValue={values.personality}
            aria-invalid={!!errors.personality}
          />
          <FieldError>{errors.personality}</FieldError>
        </Field>

        <Field data-invalid={!!errors.idealType}>
          <FieldLabel htmlFor="idealType">이상형 (선택)</FieldLabel>
          <Textarea
            id="idealType"
            name="idealType"
            rows={4}
            maxLength={500}
            defaultValue={values.idealType}
            aria-invalid={!!errors.idealType}
          />
          <FieldError>{errors.idealType}</FieldError>
        </Field>
      </FieldGroup>

      {state.message && <FieldError>{state.message}</FieldError>}

      <Button type="submit" size="lg" disabled={pending || compressing}>
        {pending ? "등록 중..." : "친구 등록"}
      </Button>
    </form>
  );
}
