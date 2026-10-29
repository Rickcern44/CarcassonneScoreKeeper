import { type Browser, expect, type Page, test } from "@playwright/test";

const PASSWORD = "playwright-test";

// Needs a migrated Postgres: see "End-to-end tests" in the README. Each test
// ends its game, so the next one can start (only one game is active at a time).

async function newPage(browser: Browser): Promise<Page> {
	const context = await browser.newContext();
	const page = await context.newPage();
	await page.goto("/");
	await page.getByLabel("Table password").fill(PASSWORD);
	await page.getByRole("button", { name: "Let's play" }).click();
	await expect(page).toHaveURL("/home");
	return page;
}

/** Adds two uniquely named players, starts a game with them, returns the names. */
async function startGame(page: Page) {
	const suffix = Math.random().toString(36).slice(2, 7);
	const names = [`Ann${suffix}`, `Bob${suffix}`];
	await page.goto("/players");
	for (const name of names) {
		await page.getByLabel("Player name").fill(name);
		await page.getByRole("button", { name: "Add" }).click();
		await expect(page.getByRole("list").getByText(name)).toBeVisible();
	}
	await page.goto("/newgame");
	for (const name of names) {
		await page.locator("label", { hasText: name }).click();
		await expect(page.getByRole("checkbox", { name })).toBeChecked();
	}
	await page.getByRole("button", { name: "Start game · 2 players" }).click();
	await expect(page).toHaveURL(/\/game\/[0-9a-f-]{36}$/);
	return names;
}

const card = (page: Page, name: string, score: number) =>
	page.getByRole("button", {
		name: new RegExp(`^${name}, rank \\d, ${score} points$`),
	});

/** Taps a quick-point button, opening the player's card first unless it is open. */
async function add(page: Page, name: string, points: number) {
	const button = page.getByRole("button", {
		name: `Add ${points} point${points === 1 ? "" : "s"} to ${name}`,
	});
	if (!(await button.isVisible())) {
		await page
			.getByRole("button", { name: new RegExp(`^${name}, rank`) })
			.click();
	}
	await button.click();
}

test("a second device follows scores, undo and finish live", async ({
	browser,
}) => {
	const a = await newPage(browser);
	const [ann, bob] = await startGame(a);
	const b = await newPage(browser);
	await b.goto(a.url());
	await expect(card(b, ann, 0)).toBeVisible();

	await add(a, ann, 5);
	await expect(card(b, ann, 5)).toBeVisible({ timeout: 2000 });

	await add(a, bob, 3);
	await expect(card(b, bob, 3)).toBeVisible({ timeout: 2000 });

	await a.getByRole("button", { name: "Undo" }).click();
	await expect(card(b, bob, 0)).toBeVisible({ timeout: 2000 });

	await a.getByRole("button", { name: "Finish game" }).click();
	await a.getByRole("button", { name: "Finish game" }).last().click();
	await expect(b.getByRole("heading", { name: "Game over" })).toBeVisible({
		timeout: 2000,
	});
	await expect(b.getByLabel("Winner")).toContainText(ann);
});

test("discarding a game sends the other device home", async ({ browser }) => {
	const a = await newPage(browser);
	await startGame(a);
	const b = await newPage(browser);
	await b.goto(a.url());
	await expect(b.getByRole("heading", { name: "Scoreboard" })).toBeVisible();

	await a.getByRole("button", { name: "Finish game" }).click();
	await a.getByRole("button", { name: /Discard this game instead/ }).click();

	await expect(b).toHaveURL(/\/home/, { timeout: 2000 });
	await expect(b.getByText("That game was discarded.")).toBeVisible();
});

test("a rematch moves the other device to the new game", async ({
	browser,
}) => {
	const a = await newPage(browser);
	await startGame(a);
	const finishedUrl = a.url();
	await a.getByRole("button", { name: "Finish game" }).click();
	await a.getByRole("button", { name: "Finish game" }).last().click();
	await expect(a.getByRole("heading", { name: "Game over" })).toBeVisible();
	const b = await newPage(browser);
	await b.goto(finishedUrl);
	await expect(b.getByRole("heading", { name: "Game over" })).toBeVisible();

	await a
		.getByRole("button", { name: "Rematch with the same players" })
		.click();

	await expect(a).not.toHaveURL(finishedUrl);
	await expect(b).toHaveURL(a.url(), { timeout: 2000 });
	await expect(b.getByRole("heading", { name: "Scoreboard" })).toBeVisible();

	// Leave no active game behind.
	await a.getByRole("button", { name: "Finish game" }).click();
	await a.getByRole("button", { name: "Finish game" }).last().click();
	await expect(a.getByRole("heading", { name: "Game over" })).toBeVisible();
});

test("a device that was offline catches up when it reconnects", async ({
	browser,
}) => {
	const a = await newPage(browser);
	const [ann] = await startGame(a);
	const b = await newPage(browser);
	await b.goto(a.url());
	await expect(card(b, ann, 0)).toBeVisible();

	await b.context().setOffline(true);
	await add(a, ann, 5);
	await expect(card(b, ann, 0)).toBeVisible();

	await b.context().setOffline(false);
	await expect(card(b, ann, 5)).toBeVisible({ timeout: 5000 });

	await a.getByRole("button", { name: "Finish game" }).click();
	await a.getByRole("button", { name: "Finish game" }).last().click();
	await expect(a.getByRole("heading", { name: "Game over" })).toBeVisible();
});

test("tapped points show before the server replies, and a failed save rolls back", async ({
	browser,
}) => {
	const a = await newPage(browser);
	const [ann] = await startGame(a);

	// Hold the save until we say so.
	let release: () => void = () => {};
	const gate = new Promise<void>((resolve) => {
		release = resolve;
	});
	await a.route(/\?\/score/, async (route) => {
		await gate;
		await route.continue();
	});
	await add(a, ann, 5);
	await expect(card(a, ann, 5)).toBeVisible();
	await add(a, ann, 3);
	await expect(card(a, ann, 8)).toBeVisible();
	const saved = [1, 2].map(() => a.waitForResponse(/\?\/score/));
	release();
	await Promise.all(saved);
	// Both saved exactly once: no lost or doubled points after the reload.
	await expect(card(a, ann, 8)).toBeVisible();
	await a.reload();
	await expect(card(a, ann, 8)).toBeVisible();
	await a.unroute(/\?\/score/);

	// A failed save is rolled back with an error.
	await a.route(/\?\/score/, (route) => route.abort());
	await add(a, ann, 1);
	await expect(a.getByRole("alert")).toContainText("Couldn't save");
	await expect(card(a, ann, 8)).toBeVisible();
	await a.unroute(/\?\/score/);

	await a.getByRole("button", { name: "Finish game" }).click();
	await a.getByRole("button", { name: "Finish game" }).last().click();
	await expect(a.getByRole("heading", { name: "Game over" })).toBeVisible();
});
