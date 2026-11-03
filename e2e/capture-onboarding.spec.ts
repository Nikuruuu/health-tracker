import { test } from "@playwright/test";
import path from "node:path";

const ARTIFACT_DIR = "C:/Users/ASUS/.gemini/antigravity/brain/394b3a47-ac2f-4929-b785-6ee83d428c7a";

test.describe("Onboarding Flow", () => {
  test("sign-up redirects to /onboarding and renders form", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.toLowerCase().includes("mobile");
    const testEmail = `test_${Date.now()}_${isMobile ? "m" : "d"}@example.com`;

    // 1. Visit sign-up
    await page.goto("/sign-up");
    await page.waitForLoadState("networkidle");

    // 2. Fill registration details
    await page.fill("#name", "Alex Hunter");
    await page.fill("#email", testEmail);
    await page.fill("#password", "Password123!");

    // 3. Submit
    await page.click("button[type='submit']");

    // 4. Should redirect to /onboarding
    await page.waitForURL("**/onboarding", { timeout: 15000 });
    await page.waitForLoadState("networkidle");

    // 5. Take screenshot
    const filename = isMobile ? "onboarding-mobile.png" : "onboarding-desktop.png";
    await page.screenshot({ path: path.join(ARTIFACT_DIR, filename), fullPage: true });
  });
});

