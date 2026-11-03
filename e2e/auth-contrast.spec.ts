import { test, expect, type Page } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

const ARTIFACT_DIR = "C:/Users/ASUS/.gemini/antigravity/brain/b45172c0-9e7a-4b0f-afbe-abb978222c48/screenshots";

// Helper to set theme in browser context
async function applyTheme(page: Page, theme: "light" | "dark") {
  await page.emulateMedia({ colorScheme: theme });
  await page.evaluate((t: string) => {
    localStorage.setItem("theme", t);
    if (t === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
    }
    window.dispatchEvent(new Event("vitapath-theme-change"));
  }, theme);
  await page.waitForTimeout(300);
}

// Function to measure contrast ratio between an element and its effective background
async function measureContrast(page: Page, selector: string, containsText?: string) {
  return await page.evaluate(
    ({ sel, text }: { sel: string; text?: string }) => {
      let el: Element | null = null;
      if (text) {
        const candidates = Array.from(document.querySelectorAll(sel));
        el = candidates.find((c) => c.textContent?.includes(text)) || null;
      } else {
        el = document.querySelector(sel);
      }
      if (!el) return null;

      function parseRgb(colorStr: string) {
        const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (!match) return [0, 0, 0, 1];
        return [
          parseInt(match[1], 10),
          parseInt(match[2], 10),
          parseInt(match[3], 10),
          match[4] !== undefined ? parseFloat(match[4]) : 1,
        ];
      }

      function getLuminance(r: number, g: number, b: number) {
        const a = [r, g, b].map((v) => {
          v /= 255;
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
      }

      function getEffectiveBg(element: Element | null): number[] {
        let curr = element;
        while (curr && curr !== document.documentElement) {
          const style = window.getComputedStyle(curr);
          const bg = parseRgb(style.backgroundColor);
          if (bg[3] > 0.5) {
            return bg;
          }
          curr = curr.parentElement;
        }
        const isDark = document.documentElement.classList.contains("dark");
        return isDark ? [13, 21, 16, 1] : [247, 248, 246, 1];
      }

      const fgStyle = window.getComputedStyle(el);
      const fg = parseRgb(fgStyle.color);
      const bg = getEffectiveBg(el);

      const fgLum = getLuminance(fg[0], fg[1], fg[2]);
      const bgLum = getLuminance(bg[0], bg[1], bg[2]);

      const ratio = (Math.max(fgLum, bgLum) + 0.05) / (Math.min(fgLum, bgLum) + 0.05);

      return {
        text: el.textContent?.trim().slice(0, 30),
        fg: `rgb(${fg[0]}, ${fg[1]}, ${fg[2]})`,
        bg: `rgb(${bg[0]}, ${bg[1]}, ${bg[2]})`,
        ratio: Math.round(ratio * 100) / 100,
        fontSize: fgStyle.fontSize,
        fontWeight: fgStyle.fontWeight,
      };
    },
    { sel: selector, text: containsText }
  );
}

test.describe("Auth & Onboarding Dark Mode Contrast Audit", () => {
  test.beforeAll(() => {
    if (!fs.existsSync(ARTIFACT_DIR)) {
      fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
    }
  });

  for (const theme of ["light", "dark"] as const) {
    test(`Audit Sign In Page (${theme})`, async ({ page }, testInfo) => {
      const isMobile = testInfo.project.name.toLowerCase().includes("mobile");
      const viewport = isMobile ? "390px" : "1280px";

      await page.goto("/sign-in");
      await page.waitForLoadState("networkidle");
      await applyTheme(page, theme);

      const filename = `sign-in-${theme}-${isMobile ? "mobile" : "desktop"}.png`;
      await page.screenshot({ path: path.join(ARTIFACT_DIR, filename), fullPage: true });

      // Measure key elements
      const elementsToCheck = [
        { name: "Welcome heading", sel: "h2" },
        { name: "Subtitle", sel: "h2 + p" },
        { name: "Email Label", sel: "label[for='email']" },
        { name: "Password Label", sel: "label[for='password']" },
        { name: "Forgot Link", sel: "button", text: "Forgot?" },
        { name: "Keep me signed in", sel: "label[for='remember']" },
        { name: "Submit Button", sel: "button[type='submit']" },
        { name: "Divider text", sel: "span", text: "or continue with" },
        { name: "Google Button", sel: "button", text: "Google" },
        { name: "Apple Button", sel: "button", text: "Apple" },
        { name: "Tab Active (Sign In)", sel: "a[href='/sign-in']" },
        { name: "Tab Inactive (Create account)", sel: "a[href='/sign-up']" },
        { name: "Footer link", sel: "a", text: "Create an account" },
      ];

      console.log(`\n--- Contrast Audit: /sign-in [${theme.toUpperCase()} - ${viewport}] ---`);
      for (const item of elementsToCheck) {
        const metrics = await measureContrast(page, item.sel, item.text);
        if (metrics) {
          console.log(
            `[${metrics.ratio >= 4.5 ? "PASS" : "WARN"}] ${item.name.padEnd(28)}: ${metrics.ratio}:1 (FG: ${metrics.fg} vs BG: ${metrics.bg})`
          );
          if (metrics.fontSize && parseFloat(metrics.fontSize) >= 18) {
            expect(metrics.ratio).toBeGreaterThanOrEqual(3.0);
          } else {
            expect(metrics.ratio).toBeGreaterThanOrEqual(4.5);
          }
        }
      }
    });

    test(`Audit Sign Up Page (${theme})`, async ({ page }, testInfo) => {
      const isMobile = testInfo.project.name.toLowerCase().includes("mobile");
      const viewport = isMobile ? "390px" : "1280px";

      await page.goto("/sign-up");
      await page.waitForLoadState("networkidle");
      await applyTheme(page, theme);

      const filename = `sign-up-${theme}-${isMobile ? "mobile" : "desktop"}.png`;
      await page.screenshot({ path: path.join(ARTIFACT_DIR, filename), fullPage: true });

      const elementsToCheck = [
        { name: "Sign Up heading", sel: "h2" },
        { name: "Subtitle", sel: "h2 + p" },
        { name: "Name Label", sel: "label[for='name']" },
        { name: "Email Label", sel: "label[for='email']" },
        { name: "Password Label", sel: "label[for='password']" },
        { name: "Submit Button", sel: "button[type='submit']" },
        { name: "Divider text", sel: "span", text: "or continue with" },
        { name: "Footer text", sel: "div", text: "Already have an account?" },
        { name: "Sign in link", sel: "a", text: "Sign in" },
      ];

      console.log(`\n--- Contrast Audit: /sign-up [${theme.toUpperCase()} - ${viewport}] ---`);
      for (const item of elementsToCheck) {
        const metrics = await measureContrast(page, item.sel, item.text);
        if (metrics) {
          console.log(
            `[${metrics.ratio >= 4.5 ? "PASS" : "WARN"}] ${item.name.padEnd(28)}: ${metrics.ratio}:1 (FG: ${metrics.fg} vs BG: ${metrics.bg})`
          );
          if (metrics.fontSize && parseFloat(metrics.fontSize) >= 18) {
            expect(metrics.ratio).toBeGreaterThanOrEqual(3.0);
          } else {
            expect(metrics.ratio).toBeGreaterThanOrEqual(4.5);
          }
        }
      }
    });

    test(`Audit Onboarding Page (${theme})`, async ({ page }, testInfo) => {
      const isMobile = testInfo.project.name.toLowerCase().includes("mobile");
      const viewport = isMobile ? "390px" : "1280px";
      const testEmail = `onboard_${Date.now()}_${theme}_${isMobile ? "m" : "d"}@example.com`;

      // Sign up new user to reach /onboarding
      await page.goto("/sign-up");
      await page.waitForLoadState("networkidle");
      await page.fill("#name", "Jordan Lee");
      await page.fill("#email", testEmail);
      await page.fill("#password", "Password123!");
      await page.click("button[type='submit']");

      await page.waitForURL("**/onboarding", { timeout: 15000 });
      await page.waitForLoadState("networkidle");
      await applyTheme(page, theme);

      const filename = `onboarding-${theme}-${isMobile ? "mobile" : "desktop"}.png`;
      await page.screenshot({ path: path.join(ARTIFACT_DIR, filename), fullPage: true });

      const elementsToCheck = [
        { name: "Welcome heading", sel: "h1" },
        { name: "Subtitle", sel: "h1 + p" },
        { name: "Unit System Label", sel: "label", text: "Unit System" },
        { name: "Metric Unit Button", sel: "button", text: "Metric (kg, cm)" },
        { name: "Imperial Unit Button", sel: "button", text: "Imperial (lbs, in)" },
        { name: "Starting Weight Label", sel: "label[for='startWeight']" },
        { name: "Final Goal Label", sel: "label[for='finalGoalWeight']" },
        { name: "Height Label", sel: "label[for='height']" },
        { name: "Start Date Label", sel: "label[for='startDate']" },
        { name: "Timezone Label", sel: "label[for='timezone']" },
        { name: "Submit Button", sel: "button[type='submit']" },
      ];

      console.log(`\n--- Contrast Audit: /onboarding [${theme.toUpperCase()} - ${viewport}] ---`);
      for (const item of elementsToCheck) {
        const metrics = await measureContrast(page, item.sel, item.text);
        if (metrics) {
          console.log(
            `[${metrics.ratio >= 4.5 ? "PASS" : "WARN"}] ${item.name.padEnd(28)}: ${metrics.ratio}:1 (FG: ${metrics.fg} vs BG: ${metrics.bg})`
          );
          if (metrics.fontSize && parseFloat(metrics.fontSize) >= 18) {
            expect(metrics.ratio).toBeGreaterThanOrEqual(3.0);
          } else {
            expect(metrics.ratio).toBeGreaterThanOrEqual(4.5);
          }
        }
      }
    });
  }
});
