import { expect, test } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROLES = [
  { id: "solo", handle: "Razor", name: "Solo" },
  { id: "rocker", handle: "Johnny Chrome", name: "Rockerboy" },
  { id: "netrunner", handle: "Ghost_0x", name: "Netrunner" },
  { id: "media", handle: "Vera Truth", name: "Media" },
  { id: "nomad", handle: "Dust", name: "Nomad" },
  { id: "fixer", handle: "Slick", name: "Fixer" },
  { id: "cop", handle: "Kowalski", name: "Cop" },
  { id: "corporate", handle: "Vance Sterling", name: "Corporate" },
  { id: "techie", handle: "Ratchet", name: "Techie" },
  { id: "medtechie", handle: "Doc Trauma", name: "Medtechie" },
];

test.describe("Cyberpunk 2020 Character Generator", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();
  });

  test("happy path through all 6 steps, save, reload persistence, and screenshots", async ({
    page,
  }) => {
    const screenshotsDir = resolve(process.cwd(), "docs/screenshots");
    mkdirSync(screenshotsDir, { recursive: true });

    // Step 1: Identity
    await page.getByTestId("input-handle").fill("Viper");
    await page.getByTestId("input-real-name").fill("Alex Mercer");
    await page.getByTestId("role-card-solo").click();
    await page.getByTestId("input-age").fill("22");
    await page.getByTestId("input-gender").fill("Male");
    await page.screenshot({
      path: resolve(screenshotsDir, "step-1-identity.png"),
      fullPage: true,
    });
    await page.getByTestId("btn-next").click();

    // Step 2: Stats
    await page.getByTestId("method-cinematic").click();
    await page.getByTestId("cinematic-preset-select").selectOption("major_hero");
    await page.getByTestId("stat-REF-input").fill("9");
    await page.getByTestId("stat-BODY-input").fill("8");
    await page.getByTestId("stat-MA-input").fill("8");
    await page.getByTestId("stat-EMP-input").fill("7");
    await expect(page.getByTestId("derived-btm")).toContainText("-3");
    await expect(page.getByTestId("derived-bdm")).toContainText("+1");
    await expect(page.getByTestId("derived-run")).toContainText("24");
    await expect(page.getByTestId("derived-leap")).toContainText("6");
    await page.screenshot({
      path: resolve(screenshotsDir, "step-2-stats.png"),
      fullPage: true,
    });
    await page.getByTestId("btn-next").click();

    // Step 3: Skills
    await page.getByTestId("career-choice-martial_arts").click();
    await page.getByTestId("skill-combat_sense-career").fill("5");
    await page.getByTestId("skill-handgun-career").fill("5");
    await page.getByTestId("skill-martial_arts-career").fill("4");
    await page.getByTestId("skill-martial_arts-detail").fill("Aikido");
    await page.screenshot({
      path: resolve(screenshotsDir, "step-3-skills.png"),
      fullPage: true,
    });
    await page.getByTestId("btn-next").click();

    // Step 4: Lifepath (age 22 => 6 events)
    await expect(page.getByTestId("life-event-input-5")).toBeVisible();
    await page.getByTestId("btn-roll-lifepath-all").click();
    await page.screenshot({
      path: resolve(screenshotsDir, "step-4-lifepath.png"),
      fullPage: true,
    });
    await page.getByTestId("btn-next").click();

    // Step 5: Gear
    await page.getByTestId("buy-heavy_pistol").click();
    await page.getByTestId("buy-light_armor_jacket").click();
    await page.getByTestId("buy-cyberoptic").click();
    await page.screenshot({
      path: resolve(screenshotsDir, "step-5-gear.png"),
      fullPage: true,
    });
    await page.getByTestId("btn-next").click();

    // Step 6: Character Sheet + Save & Reload
    await expect(page.locator(".wizard-main")).toContainText("Viper");
    await expect(page.getByTestId("btn-save")).toBeVisible();
    await page.getByTestId("btn-save").click();
    await expect(page.getByTestId("save-status")).toContainText("Saved");
    await page.screenshot({
      path: resolve(screenshotsDir, "step-6-sheet.png"),
      fullPage: true,
    });

    await page.reload();
    await expect(page.locator(".wizard-main")).toContainText("Viper");
    await expect(page.getByTestId("btn-save")).toBeVisible();
  });

  test("blocks Next on validation errors for empty handle, stat range, and overspent points", async ({
    page,
  }) => {
    await page.getByTestId("btn-reset").click();
    await page.getByTestId("btn-next").click();
    await expect(page.getByTestId("step-errors")).toContainText("Handle is required.");

    await page.getByTestId("input-handle").fill("TestRunner");
    await page.getByTestId("btn-next").click();

    await page.getByTestId("stat-BODY-input").fill("11");
    await page.getByTestId("btn-next").click();
    await expect(page.getByTestId("step-errors")).toContainText(
      "Stat BODY must be an integer between 2 and 10.",
    );

    await page.getByTestId("method-cinematic").click();
    await page.getByTestId("cinematic-preset-select").selectOption("average"); // 50 pts
    await page.getByTestId("stat-BODY-input").fill("10");
    await page.getByTestId("stat-INT-input").fill("10");
    await page.getByTestId("btn-next").click();
    await expect(page.getByTestId("step-errors")).toContainText("Too many stat points spent");
  });

  test("updates derived values live when BODY and MA change", async ({ page }) => {
    await page.getByTestId("input-handle").fill("DerivedTester");
    await page.getByTestId("btn-next").click();

    await page.getByTestId("stat-BODY-input").fill("2");
    await expect(page.getByTestId("derived-btm")).toContainText("0");
    await expect(page.getByTestId("derived-bdm")).toContainText("-2");

    await page.getByTestId("stat-BODY-input").fill("8");
    await expect(page.getByTestId("derived-btm")).toContainText("-3");
    await expect(page.getByTestId("derived-bdm")).toContainText("+1");

    await page.getByTestId("stat-BODY-input").fill("10");
    await expect(page.getByTestId("derived-btm")).toContainText("-4");
    await expect(page.getByTestId("derived-bdm")).toContainText("+2");

    await page.getByTestId("stat-MA-input").fill("8");
    await expect(page.getByTestId("derived-run")).toContainText("24");
    await expect(page.getByTestId("derived-leap")).toContainText("6");
  });

  test("renders 2D pixel avatar canvas and updates visually on role and appearance changes", async ({
    page,
  }) => {
    const canvas = page.getByTestId("pixel-avatar-canvas");
    await expect(canvas).toBeVisible();

    const getPng = () =>
      canvas.evaluate((el) => (el as HTMLCanvasElement).toDataURL("image/png"));

    await page.getByTestId("role-card-solo").click();
    const soloPng = await getPng();
    expect(soloPng.length).toBeGreaterThan(500);

    await page.getByTestId("role-card-netrunner").click();
    const netrunnerPng = await getPng();
    expect(netrunnerPng).not.toBe(soloPng);

    await page.getByTestId("skin-chrome").click();
    const chromePng = await getPng();
    expect(chromePng).not.toBe(netrunnerPng);

    await page.getByTestId("appearance-hair-style").selectOption("2");
    const mohawkPng = await getPng();
    expect(mohawkPng).not.toBe(chromePng);
  });

  test("Randomize all produces a valid sheet with no validation errors", async ({
    page,
  }) => {
    await page.getByTestId("btn-randomize-all").click();
    await expect(page.getByTestId("step-errors")).toHaveCount(0);
    await expect(page.getByTestId("btn-save")).toBeVisible();
  });

  test("loads all 10 sample characters cleanly", async ({ page }) => {
    const picker = page.getByTestId("sample-picker");
    for (const role of ROLES) {
      await picker.selectOption(role.id);
      await expect(page.getByTestId("step-errors")).toHaveCount(0);
      await expect(page.locator(".wizard-main")).toContainText(role.handle);
      await expect(page.locator(".wizard-main")).toContainText(role.name);
    }
  });

  test("exports and imports JSON round-trip and rejects invalid schema version", async ({
    page,
  }, testInfo) => {
    await page.getByTestId("sample-picker").selectOption("solo");
    const downloadPromise = page.waitForEvent("download");
    await page.getByTestId("btn-export-json").click();
    const download = await downloadPromise;
    const exportPath = testInfo.outputPath("exported-char.json");
    await download.saveAs(exportPath);
    const exportedJson = readFileSync(exportPath, "utf-8");
    expect(JSON.parse(exportedJson).identity.handle).toBe("Razor");

    await page.getByTestId("btn-reset").click();
    await page.getByTestId("step-tab-6").isDisabled().catch(() => {});
    // Jump directly to sheet via sample or step? Wait: we can expose import or navigate after handle,
    // OR test importing from Step 6 via quick handle -> next -> ... OR better, jump to Step 6 after Randomize All!
    await page.getByTestId("btn-randomize-all").click();
    await page.getByTestId("input-import-json").setInputFiles(exportPath);
    await expect(page.locator(".wizard-main")).toContainText("Razor");

    const badPath = testInfo.outputPath("bad-version.json");
    writeFileSync(badPath, JSON.stringify({ version: 99 }), "utf-8");
    await page.getByTestId("input-import-json").setInputFiles(badPath);
    await expect(page.getByTestId("import-error")).toContainText(
      "Unsupported character schema version",
    );
  });

  test("can complete steps using keyboard only", async ({ page }) => {
    await page.getByTestId("btn-reset").click();
    const handle = page.getByTestId("input-handle");
    await handle.focus();
    await page.keyboard.type("KeyMaster");
    await page.getByTestId("btn-next").focus();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("remaining-points")).toBeVisible();

    const bodyInput = page.getByTestId("stat-BODY-input");
    await bodyInput.focus();
    await page.keyboard.press("ArrowUp");
    await expect(page.getByTestId("derived-save")).toContainText("6");
  });
});
