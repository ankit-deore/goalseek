import { createHash, randomBytes } from "node:crypto";

const KEY_PREFIX = "gs_";

/**
 * A new personal API key. Only the SHA-256 hash is stored; the plain key is
 * shown to the user once.
 */
export function generateApiKey(): { key: string; prefix: string; hash: string } {
  const key = `${KEY_PREFIX}${randomBytes(24).toString("base64url")}`;
  return { key, prefix: key.slice(0, 10), hash: hashApiKey(key) };
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

/** Read "Authorization: Bearer gs_..." (or an x-api-key header). */
export function readApiKey(headers: Headers): string | null {
  const auth = headers.get("authorization");
  const fromAuth = auth?.match(/^Bearer\s+(\S+)$/i)?.[1];
  const key = fromAuth ?? headers.get("x-api-key");
  return key && key.startsWith(KEY_PREFIX) ? key : null;
}
