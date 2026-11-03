import { test, expect } from "@playwright/test";
import path from "node:path";

const ARTIFACT_DIR = "C:/Users/ASUS/.gemini/antigravity/brain/f7697c09-f77b-48ff-855c-7fe559dddc36";

test.describe("App Shell and Theme", () => {
  test("renders shell on desktop and mobile in light and dark modes", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.toLowerCase().includes("mobile");
    const testEmail = `shell_${Date.now()}_${isMobile ? "m" : "d"}@example.com`;

    // 1. Visit sign-up and register
    await page.goto("/sign-up");
    await page.waitForLoadState("networkidle");

    // Take screenshot of sign-up
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, isMobile ? "sign-up-mobile.png" : "sign-up-desktop.png"),
      fullPage: true,
    });

    await page.fill("#name", "Maya Lin");
    await page.fill("#email", testEmail);
    await page.fill("#password", "Password123!");
    await page.click("button[type='submit']");

    // 2. Complete onboarding
    await page.waitForURL("**/onboarding", { timeout: 15000 });
    await page.waitForLoadState("networkidle");

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, isMobile ? "onboarding-mobile.png" : "onboarding-desktop.png"),
      fullPage: true,
    });

    // Onboarding form defaults: startWeight is 90.0, finalGoalWeight is 65.0
    await page.click("button[type='submit']");

    // 3. Arrive at dashboard /
    await page.waitForURL("**/", { timeout: 15000 });
    await page.waitForLoadState("networkidle");

    // Take light mode screenshot
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, isMobile ? "overview-light-mobile.png" : "overview-light-desktop.png"),
      fullPage: true,
    });

    // Toggle dark mode via script
    await page.evaluate(() => {
      localStorage.setItem("theme", "dark");
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    });
    await page.waitForTimeout(500);

    // Take dark mode screenshot
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, isMobile ? "overview-dark-mobile.png" : "overview-dark-desktop.png"),
      fullPage: true,
    });

    // Switch back to light mode for page comparisons
    await page.evaluate(() => {
      localStorage.setItem("theme", "light");
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
    });
    await page.waitForTimeout(300);

    // 4. Test navigation to /nutrition
    if (isMobile) {
      await page.locator("nav[aria-label='Mobile Navigation'] a[href='/nutrition']").click();
    } else {
      await page.locator("nav[aria-label='Main Navigation'] a[href='/nutrition']").click();
    }
    await page.waitForURL("**/nutrition", { timeout: 10000 });
    await page.waitForLoadState("networkidle");

    // Verify plain title and subtitle exist
    await expect(page.getByRole("heading", { name: "Nutrition", exact: true })).toBeVisible();

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, isMobile ? "nutrition-mobile.png" : "nutrition-desktop.png"),
      fullPage: true,
    });
  });
});
