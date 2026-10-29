import type { Page } from "@playwright/test";
import { add, card, expect, finish, newPage, startGame, test } from "./helpers";

// Needs a migrated Postgres: see "End-to-end tests" in the README.
// A clean-up after every test discards a game left active by a failure.

const strip = (page: Page) => page.getByRole("button", { name: /^Score log/ });

async function openLog(page: Page) {
	await strip(page).click();
	const log = page.getByRole("dialog", { name: "Score log" });
	await expect(log).toBeVisible();
	return log;
}

async function removeEntry(page: Page, text: string, name: string) {
	await page
		.getByRole("button", { name: `Remove ${text} from ${name}` })
		.click();
	await page.getByRole("button", { name: "Remove", exact: true }).click();
}

test("the strip and log show entries newest first with running totals, and a middle entry can be removed", async ({
	browser,
}) => {
	const page = await newPage(browser);
	const [ann, bob] = await startGame(page);
	await expect(strip(page)).toContainText("No scores yet");

	await add(page, ann, 5);
	await add(page, bob, 3);
	await add(page, ann, 3);
	await expect(card(page, ann, 8)).toBeVisible();
	await expect(strip(page)).toContainText(`${ann} scored +3`);

	const log = await openLog(page);
	const rows = log.getByRole("listitem");
	await expect(rows).toHaveCount(3);
	await expect(rows.nth(0)).toContainText(`${ann}`);
	await expect(rows.nth(0)).toContainText("+3");
	await expect(rows.nth(0)).toContainText("8");
	await expect(rows.nth(1)).toContainText(`${bob}`);
	await expect(rows.nth(1)).toContainText("+3");
	await expect(rows.nth(2)).toContainText("+5");

	// Keep keeps it; Remove removes only that entry, and totals follow.
	await log.getByRole("button", { name: `Remove +3 from ${bob}` }).click();
	await expect(log.getByText(`Remove +3 from ${bob}?`)).toBeVisible();
	await log.getByRole("button", { name: "Keep" }).click();
	await expect(rows).toHaveCount(3);

	await removeEntry(page, "+3", bob);
	await expect(rows).toHaveCount(2);
	await expect(card(page, bob, 0)).toBeVisible();
	await expect(card(page, ann, 8)).toBeVisible();

	// Escape closes the sheet.
	await page.keyboard.press("Escape");
	await expect(log).toBeHidden();

	await finish(page);
});

test("another device follows entries, removals and a remove-then-add", async ({
	browser,
}) => {
	const a = await newPage(browser);
	const [ann] = await startGame(a);
	const b = await newPage(browser);
	await b.goto(a.url());
	await expect(card(b, ann, 0)).toBeVisible();

	await add(a, ann, 5);
	await expect(strip(b)).toContainText(`${ann} scored +5`, { timeout: 2000 });

	// B has the log open while A removes the entry: the list updates in place.
	const bLog = await openLog(b);
	await expect(bLog.getByRole("listitem")).toHaveCount(1);
	await openLog(a);
	await removeEntry(a, "+5", ann);
	await expect(bLog.getByRole("listitem")).toHaveCount(0, { timeout: 2000 });
	await expect(bLog.getByText("No scores yet")).toBeVisible();
	await a.keyboard.press("Escape");
	await b.keyboard.press("Escape");

	// Remove, then add a corrected score: the count stays the same, so B must
	// notice the new last entry.
	await add(a, ann, 3);
	await expect(card(b, ann, 3)).toBeVisible({ timeout: 2000 });
	await openLog(a);
	await removeEntry(a, "+3", ann);
	await a.keyboard.press("Escape");
	await add(a, ann, 1);
	await expect(card(b, ann, 1)).toBeVisible({ timeout: 2000 });

	await finish(a);
	await expect(b.getByRole("heading", { name: "Game over" })).toBeVisible({
		timeout: 2000,
	});
});

test("removal is disabled while a tap is still saving, and shown as saving", async ({
	browser,
}) => {
	const page = await newPage(browser);
	const [ann] = await startGame(page);
	await add(page, ann, 5);
	await expect(card(page, ann, 5)).toBeVisible();
	await expect(strip(page)).toContainText(`${ann} scored +5`);

	let release: () => void = () => {};
	const gate = new Promise<void>((resolve) => {
		release = resolve;
	});
	await page.route(/\?\/score/, async (route) => {
		await gate;
		await route.continue();
	});
	await add(page, ann, 3);
	await expect(strip(page)).toContainText("Saving");

	const log = await openLog(page);
	await expect(log.getByText("Saving…").first()).toBeVisible();
	await expect(
		log.getByRole("button", { name: `Remove +5 from ${ann}` }),
	).toBeDisabled();

	const saved = page.waitForResponse(/\?\/score/);
	release();
	await saved;
	await expect(log.getByText("Saving…")).toHaveCount(0);
	await expect(
		log.getByRole("button", { name: `Remove +5 from ${ann}` }),
	).toBeEnabled();
	await page.keyboard.press("Escape");

	await finish(page);
});
