import { test, expect, request } from "@playwright/test";

const DEMO_KEY = "pk_demo_proofbell";

test("landing page renders the hero and $49 lifetime pricing", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/ProofBell/i);
  await expect(page.locator("body")).toContainText("ProofBell");
  await expect(page.locator("body")).toContainText("$49");
  await expect(page.locator("body")).toContainText(/lifetime/i);
});

test("landing page links to sign in / get started", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toContainText(/get started/i);
  await expect(page.locator("body")).toContainText(/sign in/i);
});

test("login page shows the magic-link email form", async ({ page }) => {
  await page.goto("/login");
  await expect(page.locator('input[type="email"]')).toBeVisible();
});

test("embed.js is served as javascript", async ({ baseURL }) => {
  const api = await request.newContext();
  const res = await api.get(`${baseURL}/embed.js`);
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("javascript");
});

test("widget API returns config + events for the demo key", async ({
  baseURL,
}) => {
  const api = await request.newContext();
  const res = await api.get(`${baseURL}/api/widget/${DEMO_KEY}`);
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body).toHaveProperty("config");
  expect(Array.isArray(body.events)).toBe(true);
});
