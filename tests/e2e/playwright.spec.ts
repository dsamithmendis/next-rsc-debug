import { test, expect } from "@playwright/test";

test("playground loads and shows scenarios", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("Next RSC Debug Playground");
  await expect(page.locator("text=Basic Fetch")).toBeVisible();
  await expect(page.locator("text=Slow Request")).toBeVisible();
});

test("basic page performs a fetch", async ({ page }) => {
  await page.goto("/basic");
  await expect(page.locator("h1")).toContainText("Basic Fetch");
});

test("slow page performs a slow fetch", async ({ page }) => {
  await page.goto("/slow");
  await expect(page.locator("h1")).toContainText("Slow Request");
});

test("debug dashboard loads", async ({ page }) => {
  await page.goto("/__next-rsc-debug");
  await expect(page.locator("text=Next RSC Debug")).toBeVisible();
});

test("SSE endpoint responds", async ({ page }) => {
  const response = await page.request.get("/api/debug-events");
  expect(response.ok()).toBe(true);
  const body = await response.json();
  expect(body.enabled).toBe(true);
  expect(Array.isArray(body.events)).toBe(true);
});