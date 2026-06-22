import { test, expect } from "@playwright/test";

// Cockpit E2E (MASTER-TODOS G2; PLAN §9 E2E + §10). Playwright loads the real stdlib cockpit
// (booted by playwright.config.ts webServer on :7799), drives the ask-the-employee box to run
// a `stamp audit` (sees the gap report render) and a `stamp sso-plan` (sees the badge_handoff
// render), and asserts the DEFINING BOUNDARY visibly holds:
//   - the rendered sso-plan view contains "badge" (the mechanism is handed off), and
//   - the rendered audit view does NOT claim the company is "compliant".
// Red-blocking in CI (the acceptance/CI job runs `pnpm exec playwright test`).

test.describe("stamp cockpit", () => {
  test("loads and shows all four views in the nav", async ({ page }) => {
    await page.goto("/");
    // brand + the defining boundary one-liner are present on first paint
    await expect(page.locator("header .brand")).toContainText("stamp");
    await expect(page.locator(".boundary")).toContainText("badge");
    await expect(page.locator(".boundary")).toContainText("proves it to the auditor");
    // all four nav buttons render
    const navLabels = await page.locator("#nav button").allTextContents();
    expect(navLabels).toEqual(["Brain browser", "Run log", "Eval scores", "Ask the employee"]);
  });

  test("brain browser renders the 6 files and opens one", async ({ page }) => {
    await page.goto("/");
    // default view is the brain browser; the list populates from /api/brain
    const files = page.locator(".brain-list .file");
    await expect(files).toHaveCount(6);
    // the first file auto-opens; its markdown renders into the content pane
    await expect(page.locator(".brain-content pre")).toContainText("stamp EXPERTISE-MAP");
  });

  test("ask-the-employee renders a gap report and NEVER claims 'compliant' (audit)", async ({ page }) => {
    await page.goto("/");
    await page.locator('#nav button[data-view="ask"]').click();
    await page.locator("#ask-verb").selectOption("audit");
    await page.locator("#ask-btn").click();

    // the gap report renders: a control-mapped finding shows up
    const answer = page.locator("#ask-answer");
    await expect(answer.locator(".finding")).toHaveCount(3, { timeout: 20_000 });
    await expect(answer).toContainText("CC7.2");
    await expect(answer).toContainText("gap report");
    await expect(answer).toContainText("audit-ready evidence");

    // THE BOUNDARY: the rendered audit answer must NOT claim the company is "compliant".
    // (stamp's creed — OP O24/KP P7. The only allowed appearance is the disclaimer's
    // "readiness is not certification" framing, which does not assert a compliant state.)
    const text = (await answer.innerText()).toLowerCase();
    expect(text).not.toMatch(/\bis compliant\b/);
    expect(text).not.toMatch(/\bwe(?:'re| are) compliant\b/);
    expect(text).not.toMatch(/\bnow compliant\b/);
    expect(text).not.toMatch(/\bcertified\b/);
  });

  test("ask-the-employee renders the badge handoff and NO SAML code (sso-plan)", async ({ page }) => {
    await page.goto("/");
    await page.locator('#nav button[data-view="ask"]').click();
    await page.locator("#ask-verb").selectOption("sso-plan");
    // acv input appears for sso-plan; the default 300000 triggers build-now
    await expect(page.locator("#ask-acv")).toBeVisible();
    await page.locator("#ask-btn").click();

    const answer = page.locator("#ask-answer");
    // THE BOUNDARY (load-bearing): the mechanism is handed to badge — the handoff renders.
    await expect(answer.locator(".badge-handoff")).toBeVisible({ timeout: 20_000 });
    await expect(answer.locator(".badge-handoff code")).toContainText("badge");
    await expect(answer).toContainText("program plan");
    await expect(answer).toContainText("badge"); // the verify line's explicit assertion

    // and the plan emits NO auth code — the boundary FAIL conditions (HARNESS-OVERRIDES §boundary).
    const text = await answer.innerText();
    expect(text).not.toMatch(/SAMLResponse|samlp:|<saml|AssertionConsumerService|new SAML\(/);
  });
});
