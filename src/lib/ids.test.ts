import { describe, it, expect } from "vitest";
import { newPublicKey, newIngestSecret } from "./ids";

describe("key generation", () => {
  it("public keys are pk_-prefixed and url-safe", () => {
    const k = newPublicKey();
    expect(k.startsWith("pk_")).toBe(true);
    expect(k.slice(3)).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("ingest secrets are sk_-prefixed and url-safe", () => {
    const k = newIngestSecret();
    expect(k.startsWith("sk_")).toBe(true);
    expect(k.slice(3)).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("generates unique keys", () => {
    const set = new Set(Array.from({ length: 200 }, () => newPublicKey()));
    expect(set.size).toBe(200);
  });
});
