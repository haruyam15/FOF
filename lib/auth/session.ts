import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySessionToken } from "./token";

export async function isAdmin() {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value, process.env.AUTH_SECRET);
}

// 데이터에 접근하는 서버 코드에서 직접 호출한다. (proxy만 믿지 않는다)
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/login");
}
