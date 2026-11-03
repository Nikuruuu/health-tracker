import { test, expect } from "@playwright/test";

test.describe("Full Onboarding Lifecycle", () => {
  test("completes onboarding and verifies bidirectional route gates", async ({ page }) => {
    const testEmail = `journey_${Date.now()}@example.com`;

    // 1. Sign up
    await page.goto("/sign-up");
    await page.waitForLoadState("networkidle");
    await page.fill("#name", "Taylor Swift");
    await page.fill("#email", testEmail);
    await page.fill("#password", "Password123!");
    await page.click("button[type='submit']");

    // 2. Verified redirect to /onboarding
    await page.waitForURL("**/onboarding", { timeout: 15000 });
    await expect(page.locator("h1")).toContainText("Welcome to VitaPath");

    // 3. Complete onboarding
    await page.fill("#startWeight", "88.0");
    await page.fill("#finalGoalWeight", "62.0");
    await page.fill("#height", "172");
    await page.click("button[type='submit']");

    // 4. Should redirect to dashboard /
    await page.waitForURL("http://localhost:3000/", { timeout: 15000 });
    await expect(page.locator("h1")).toContainText("Dashboard");

    // 5. Check that onboarded user visiting /onboarding gets redirected to /
    await page.goto("/onboarding");
    await page.waitForURL("http://localhost:3000/", { timeout: 15000 });
    await expect(page.locator("h1")).toContainText("Dashboard");
  });
});

