"use server";

import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { z } from "zod";
import { isAdmin } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/server";

const SHARE_TTL_DAYS = 7;
// 기존 링크를 재사용하려면 최소 이만큼은 남아 있어야 한다.
const REUSE_MIN_REMAINING_MS = 24 * 60 * 60 * 1000;

export type CreateShareLinkResult = { url: string } | { error: string };

export async function createShareLink(friendId: string): Promise<CreateShareLinkResult> {
  if (!(await isAdmin())) return { error: "로그인이 필요해요." };
  if (!z.uuid().safeParse(friendId).success) return { error: "잘못된 요청이에요." };

  const supabase = createAdminClient();

  const { data: friend } = await supabase
    .from("friends")
    .select("id")
    .eq("id", friendId)
    .maybeSingle();
  if (!friend) return { error: "친구를 찾을 수 없어요." };

  // 이미 발급한 유효 링크가 있으면 재사용한다. (눌러서 공유할 때마다 행이 쌓이지 않게)
  const { data: existing } = await supabase
    .from("friend_shares")
    .select("token")
    .eq("friend_id", friendId)
    .is("revoked_at", null)
    .gt("expires_at", new Date(Date.now() + REUSE_MIN_REMAINING_MS).toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let token = existing?.token;
  if (!token) {
    token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + SHARE_TTL_DAYS * 24 * 60 * 60 * 1000);
    const { error } = await supabase
      .from("friend_shares")
      .insert({ friend_id: friendId, token, expires_at: expiresAt.toISOString() });
    if (error) return { error: "공유 링크를 만들지 못했어요. 잠시 후 다시 시도해 주세요." };
  }

  return { url: `${await getOrigin()}/s/${token}` };
}

async function getOrigin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
