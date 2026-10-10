"use server";

import { randomUUID } from "node:crypto";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/server";
import { IMAGE_BUCKET, IMAGE_MIME_TYPES, MAX_IMAGES, MAX_IMAGE_SIZE } from "./fields";
import { FRIENDS_CACHE_TAG } from "./queries";
import { createFriendSchema, type FriendFormField } from "./schema";

export type CreateFriendState = {
  errors?: Partial<Record<FriendFormField | "image", string>>;
  message?: string;
  values?: Partial<Record<FriendFormField, string>>;
  // 결과가 돌아올 때마다 바뀌는 값. 폼의 key로 써서 입력값 복원 시 폼을 새로 마운트한다.
  nonce?: string;
};

const FIELD_KEYS = [
  "name", "gender", "heightCm", "birthYear", "religion", "job", "residence", "personality", "idealType",
] as const satisfies readonly FriendFormField[];

export async function createFriend(
  _prev: CreateFriendState,
  formData: FormData,
): Promise<CreateFriendState> {
  await requireAdmin();
  const values: CreateFriendState["values"] = {};
  for (const key of FIELD_KEYS) {
    const v = formData.get(key);
    if (typeof v === "string") values[key] = v;
  }

  const parsed = createFriendSchema().safeParse(values);
  const errors: NonNullable<CreateFriendState["errors"]> = {};
  if (!parsed.success) {
    const fieldErrors = z.flattenError(parsed.error).fieldErrors as Record<string, string[]>;
    for (const [key, msgs] of Object.entries(fieldErrors)) {
      errors[key as FriendFormField] = msgs[0];
    }
  }

  const images = formData
    .getAll("image")
    .filter((f): f is File => f instanceof File && f.size > 0);
  if (images.length > MAX_IMAGES) {
    errors.image = `사진은 최대 ${MAX_IMAGES}장까지 올릴 수 있어요.`;
  } else if (images.some((f) => !(f.type in IMAGE_MIME_TYPES))) {
    errors.image = "jpg, png, webp 이미지만 올릴 수 있어요.";
  } else if (images.some((f) => f.size > MAX_IMAGE_SIZE)) {
    errors.image = "이미지는 한 장당 5MB 이하만 올릴 수 있어요.";
  }

  if (!parsed.success || Object.keys(errors).length > 0) {
    return { errors, values, nonce: randomUUID(), message: "입력한 내용을 확인해 주세요." };
  }

  const input = parsed.data;
  const supabase = createAdminClient();
  const id = randomUUID();

  // 선택한 순서대로 업로드한다. 첫 번째가 대표 이미지.
  const imagePaths = images.map((f, i) => `${id}/${Date.now()}-${i}.${IMAGE_MIME_TYPES[f.type]}`);
  const uploaded: string[] = [];
  for (const [i, file] of images.entries()) {
    const { error } = await supabase.storage
      .from(IMAGE_BUCKET)
      .upload(imagePaths[i], Buffer.from(await file.arrayBuffer()), { contentType: file.type });
    if (error) {
      if (uploaded.length > 0) await supabase.storage.from(IMAGE_BUCKET).remove(uploaded);
      return {
        values,
        nonce: randomUUID(),
        message: "이미지 업로드에 실패했어요. 잠시 후 다시 시도해 주세요.",
      };
    }
    uploaded.push(imagePaths[i]);
  }

  const { error } = await supabase.from("friends").insert({
    id,
    name: input.name,
    gender: input.gender,
    height_cm: input.heightCm,
    birth_year: input.birthYear,
    religion: input.religion ?? null,
    job: input.job,
    residence: input.residence ?? null,
    personality: input.personality ?? null,
    ideal_type: input.idealType ?? null,
    image_paths: imagePaths,
  });

  if (error) {
    if (imagePaths.length > 0) await supabase.storage.from(IMAGE_BUCKET).remove(imagePaths);
    return { values, nonce: randomUUID(), message: "저장에 실패했어요. 잠시 후 다시 시도해 주세요." };
  }

  updateTag(FRIENDS_CACHE_TAG);
  redirect("/friends");
}
