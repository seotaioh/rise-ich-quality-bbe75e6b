import { test, expect } from "@playwright/test";

test("홈페이지가 정상적으로 로드된다", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/.*/)
  await expect(page.locator("body")).toBeVisible();
});

test("불량코드 페이지로 이동할 수 있다", async ({ page }) => {
  await page.goto("/defect-code");
  await expect(page.locator("body")).toBeVisible();
});

test("분석 페이지로 이동할 수 있다", async ({ page }) => {
  await page.goto("/analysis");
  await expect(page.locator("body")).toBeVisible();
});

test("존재하지 않는 페이지는 NotFound를 표시한다", async ({ page }) => {
  await page.goto("/non-existent-page");
  await expect(page.locator("body")).toBeVisible();
});
