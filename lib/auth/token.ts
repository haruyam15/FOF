// 세션 토큰 서명/검증. proxy(Edge 호환)에서도 쓰므로 Web Crypto만 사용한다.
export const SESSION_COOKIE = "fof_session";
export const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 30;

const encoder = new TextEncoder();

function toBase64Url(buf: ArrayBuffer) {
  let s = "";
  for (const b of new Uint8Array(buf)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string) {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

function importKey(secret: string, usage: KeyUsage) {
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [usage]);
}

// "{만료 epoch초}.{서명}" 형태의 토큰을 만든다.
export async function createSessionToken(secret: string) {
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SEC;
  const sig = await crypto.subtle.sign("HMAC", await importKey(secret, "sign"), encoder.encode(String(exp)));
  return `${exp}.${toBase64Url(sig)}`;
}

export async function verifySessionToken(token: string | undefined, secret: string | undefined) {
  if (!token || !secret) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || !/^\d+$/.test(exp) || Number(exp) < Date.now() / 1000) return false;
  try {
    return await crypto.subtle.verify("HMAC", await importKey(secret, "verify"), fromBase64Url(sig), encoder.encode(exp));
  } catch {
    return false;
  }
}
