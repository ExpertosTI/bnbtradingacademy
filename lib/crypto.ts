import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const verify = scryptSync(password, salt, 64);
  const hashBuf = Buffer.from(hash, "hex");
  if (hashBuf.length !== verify.length) return false;
  return timingSafeEqual(hashBuf, verify);
}

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function newToken() {
  return randomBytes(32).toString("hex");
}
