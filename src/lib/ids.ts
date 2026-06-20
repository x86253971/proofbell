import { randomBytes } from "crypto";

function token(bytes = 18): string {
  return randomBytes(bytes).toString("base64url");
}

// Public key embedded in the widget snippet (safe to expose, read-only).
export function newPublicKey(): string {
  return "pk_" + token(18);
}

// Secret used for server-to-server event ingestion (treat like a password).
export function newIngestSecret(): string {
  return "sk_" + token(24);
}
