"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { IMAGE_BUCKET, IMAGE_MIME_TYPES, MAX_IMAGE_SIZE } from "./fields";
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

  const file = formData.get("image");
  const image = file instanceof File && file.size > 0 ? file : null;
  if (image) {
    if (!(image.type in IMAGE_MIME_TYPES)) {
      errors.image = "jpg, png, webp 이미지만 올릴 수 있어요.";
    } else if (image.size > MAX_IMAGE_SIZE) {
      errors.image = "이미지는 5MB 이하만 올릴 수 있어요.";
    }
  }

  if (!parsed.success || Object.keys(errors).length > 0) {
    return { errors, values, nonce: randomUUID(), message: "입력한 내용을 확인해 주세요." };
  }

  const input = parsed.data;
  const supabase = createAdminClient();
  const id = randomUUID();

  let imagePath: string | null = null;
  if (image) {
    imagePath = `${id}/${Date.now()}.${IMAGE_MIME_TYPES[image.type]}`;
    const { error } = await supabase.storage
      .from(IMAGE_BUCKET)
      .upload(imagePath, Buffer.from(await image.arrayBuffer()), { contentType: image.type });
    if (error) {
      return {
        values,
        nonce: randomUUID(),
        message: "이미지 업로드에 실패했어요. 잠시 후 다시 시도해 주세요.",
      };
    }
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
    image_path: imagePath,
  });

  if (error) {
    if (imagePath) await supabase.storage.from(IMAGE_BUCKET).remove([imagePath]);
    return { values, nonce: randomUUID(), message: "저장에 실패했어요. 잠시 후 다시 시도해 주세요." };
  }

  revalidatePath("/friends");
  redirect("/friends");
}
