import { test, expect } from "@playwright/test";
import path from "node:path";

const ARTIFACT_DIR = "C:/Users/ASUS/.gemini/antigravity/brain/427a697a-aeee-4014-8ac8-fbb9ebfdb06a";

test.describe("Settings Page Visual Capture", () => {
  test("captures /settings on desktop (1280px) and mobile (390px) in light and dark", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.toLowerCase().includes("mobile");
    const testEmail = `settings_${Date.now()}_${isMobile ? "m" : "d"}@example.com`;

    // 1. Visit sign-up and register a fresh user
    await page.goto("/sign-up");
    await page.waitForLoadState("networkidle");

    await page.fill("#name", "Elena Rostova");
    await page.fill("#email", testEmail);
    await page.fill("#password", "Password123!");
    await page.click("button[type='submit']");

    // 2. Complete onboarding
    await page.waitForURL("**/onboarding", { timeout: 15000 });
    await page.waitForLoadState("networkidle");
    await page.click("button[type='submit']");

    // 3. Wait for dashboard /
    await page.waitForURL("**/", { timeout: 15000 });
    await page.waitForLoadState("networkidle");

    // 4. Navigate to /settings
    await page.goto("/settings");
    await page.waitForLoadState("networkidle");

    // Ensure settings header is rendered
    await expect(page.getByRole("heading", { name: "Settings & Phase Calibration" })).toBeVisible();

    // Light mode screenshot
    await page.evaluate(() => {
      localStorage.setItem("theme", "light");
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
    });
    await page.waitForTimeout(500);

    const lightFilename = isMobile ? "settings-390px-light.png" : "settings-1280px-light.png";
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, lightFilename),
      fullPage: true,
    });

    // Dark mode screenshot
    await page.evaluate(() => {
      localStorage.setItem("theme", "dark");
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    });
    await page.waitForTimeout(500);

    const darkFilename = isMobile ? "settings-390px-dark.png" : "settings-1280px-dark.png";
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, darkFilename),
      fullPage: true,
    });
  });
});

