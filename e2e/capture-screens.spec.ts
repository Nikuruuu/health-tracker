import { test } from "@playwright/test";
import path from "node:path";

const ARTIFACT_DIR = "C:/Users/ASUS/.gemini/antigravity/brain/394b3a47-ac2f-4929-b785-6ee83d428c7a";

test.describe("Capture UI Screenshots", () => {
  test("capture sign-in page", async ({ page }, testInfo) => {
    await page.goto("/sign-in");
    await page.waitForLoadState("networkidle");

    const isMobile = testInfo.project.name.toLowerCase().includes("mobile");
    const filename = isMobile ? "sign-in-mobile.png" : "sign-in-desktop.png";
    await page.screenshot({ path: path.join(ARTIFACT_DIR, filename), fullPage: true });
  });

  test("capture sign-up page", async ({ page }, testInfo) => {
    await page.goto("/sign-up");
    await page.waitForLoadState("networkidle");

    const isMobile = testInfo.project.name.toLowerCase().includes("mobile");
    const filename = isMobile ? "sign-up-mobile.png" : "sign-up-desktop.png";
    await page.screenshot({ path: path.join(ARTIFACT_DIR, filename), fullPage: true });
  });
});
