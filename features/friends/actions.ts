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
import type { Friend } from "./types";

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

type ParsedForm =
  | { ok: true; input: z.infer<ReturnType<typeof createFriendSchema>>; values: NonNullable<CreateFriendState["values"]> }
  | { ok: false; state: CreateFriendState };

// 텍스트 항목을 검증한다. 사진은 등록/수정마다 규칙이 달라 호출하는 쪽에서 검사한다.
function parseFields(
  formData: FormData,
  imageError: (values: NonNullable<CreateFriendState["values"]>) => string | undefined,
): ParsedForm {
  const values: NonNullable<CreateFriendState["values"]> = {};
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
  const image = imageError(values);
  if (image) errors.image = image;

  if (!parsed.success || Object.keys(errors).length > 0) {
    return {
      ok: false,
      state: { errors, values, nonce: randomUUID(), message: "입력한 내용을 확인해 주세요." },
    };
  }
  return { ok: true, input: parsed.data, values };
}

function newImageFiles(formData: FormData) {
  return formData.getAll("image").filter((f): f is File => f instanceof File && f.size > 0);
}

// 새로 올리는 사진 자체의 검사. `existing`은 유지하는 기존 사진 수.
function validateNewImages(files: File[], existing: number) {
  if (existing + files.length > MAX_IMAGES) return `사진은 최대 ${MAX_IMAGES}장까지 올릴 수 있어요.`;
  if (files.some((f) => !(f.type in IMAGE_MIME_TYPES))) return "jpg, png, webp 이미지만 올릴 수 있어요.";
  if (files.some((f) => f.size > MAX_IMAGE_SIZE)) return "이미지는 한 장당 5MB 이하만 올릴 수 있어요.";
  return undefined;
}

// 선택한 순서대로 업로드한다. 하나라도 실패하면 이미 올린 것을 지우고 null을 돌려준다.
async function uploadImages(
  supabase: ReturnType<typeof createAdminClient>,
  friendId: string,
  files: File[],
): Promise<string[] | null> {
  const paths = files.map((f, i) => `${friendId}/${Date.now()}-${i}.${IMAGE_MIME_TYPES[f.type]}`);
  const uploaded: string[] = [];
  for (const [i, file] of files.entries()) {
    const { error } = await supabase.storage
      .from(IMAGE_BUCKET)
      .upload(paths[i], Buffer.from(await file.arrayBuffer()), { contentType: file.type });
    if (error) {
      if (uploaded.length > 0) await supabase.storage.from(IMAGE_BUCKET).remove(uploaded);
      return null;
    }
    uploaded.push(paths[i]);
  }
  return paths;
}

function toRow(input: z.infer<ReturnType<typeof createFriendSchema>>) {
  return {
    name: input.name,
    gender: input.gender,
    height_cm: input.heightCm,
    birth_year: input.birthYear,
    religion: input.religion ?? null,
    job: input.job,
    residence: input.residence ?? null,
    personality: input.personality ?? null,
    ideal_type: input.idealType ?? null,
  };
}

const UPLOAD_FAILED = "이미지 업로드에 실패했어요. 잠시 후 다시 시도해 주세요.";
const SAVE_FAILED = "저장에 실패했어요. 잠시 후 다시 시도해 주세요.";

export async function createFriend(
  _prev: CreateFriendState,
  formData: FormData,
): Promise<CreateFriendState> {
  await requireAdmin();
  const images = newImageFiles(formData);
  const result = parseFields(formData, () => validateNewImages(images, 0));
  if (!result.ok) return result.state;

  const { input, values } = result;
  const supabase = createAdminClient();
  const id = randomUUID();

  // 첫 번째가 대표 이미지.
  const imagePaths = await uploadImages(supabase, id, images);
  if (!imagePaths) return { values, nonce: randomUUID(), message: UPLOAD_FAILED };

  const { error } = await supabase
    .from("friends")
    .insert({ id, ...toRow(input), image_paths: imagePaths });

  if (error) {
    if (imagePaths.length > 0) await supabase.storage.from(IMAGE_BUCKET).remove(imagePaths);
    return { values, nonce: randomUUID(), message: SAVE_FAILED };
  }

  updateTag(FRIENDS_CACHE_TAG);
  redirect("/friends");
}

// 폼의 `keepImage`(유지할 기존 사진 경로, 표시 순서)와 `image`(새 사진)로 사진 목록을 다시 구성한다.
export async function updateFriend(
  id: string,
  _prev: CreateFriendState,
  formData: FormData,
): Promise<CreateFriendState> {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data, error: findError } = await supabase
    .from("friends")
    .select("image_paths")
    .eq("id", id)
    .maybeSingle<Pick<Friend, "image_paths">>();
  if (findError) {
    return { nonce: randomUUID(), message: "친구 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요." };
  }
  if (!data) return { nonce: randomUUID(), message: "이미 삭제된 친구예요." };

  // 이 친구가 실제로 가진 사진만 유지할 수 있다. (조작된 경로 무시)
  const keep = formData
    .getAll("keepImage")
    .filter((v): v is string => typeof v === "string" && data.image_paths.includes(v));
  const images = newImageFiles(formData);
  const result = parseFields(formData, () => validateNewImages(images, keep.length));
  if (!result.ok) return result.state;

  const { input, values } = result;
  const added = await uploadImages(supabase, id, images);
  if (!added) return { values, nonce: randomUUID(), message: UPLOAD_FAILED };

  const { error } = await supabase
    .from("friends")
    .update({ ...toRow(input), image_paths: [...keep, ...added] })
    .eq("id", id);
  if (error) {
    if (added.length > 0) await supabase.storage.from(IMAGE_BUCKET).remove(added);
    return { values, nonce: randomUUID(), message: SAVE_FAILED };
  }

  // 목록에서 빠진 기존 사진 파일 정리. 실패해도 저장은 끝났으므로 무시한다.
  const dropped = data.image_paths.filter((p) => !keep.includes(p));
  if (dropped.length > 0) await supabase.storage.from(IMAGE_BUCKET).remove(dropped);

  updateTag(FRIENDS_CACHE_TAG);
  redirect("/friends");
}

// 행과 Storage 사진을 함께 지운다. 공유 링크는 FK cascade로 같이 삭제된다.
export async function deleteFriend(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data, error: findError } = await supabase
    .from("friends")
    .select("image_paths")
    .eq("id", id)
    .maybeSingle<Pick<Friend, "image_paths">>();
  if (findError) return { error: "삭제에 실패했어요. 잠시 후 다시 시도해 주세요." };

  const { error } = await supabase.from("friends").delete().eq("id", id);
  if (error) return { error: "삭제에 실패했어요. 잠시 후 다시 시도해 주세요." };

  // 행을 먼저 지우므로 사진 삭제가 실패해도 화면에는 남지 않는다.
  if (data && data.image_paths.length > 0) {
    await supabase.storage.from(IMAGE_BUCKET).remove(data.image_paths);
  }

  updateTag(FRIENDS_CACHE_TAG);
  return {};
}
