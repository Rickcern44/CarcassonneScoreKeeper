import {
	type Browser,
	test as base,
	expect,
	type Page,
} from "@playwright/test";

export { expect };
export const PASSWORD = "playwright-test";

export async function newPage(browser: Browser): Promise<Page> {
	const page = await (await browser.newContext()).newPage();
	await page.goto("/");
	await page.getByLabel("Table password").fill(PASSWORD);
	await page.getByRole("button", { name: "Let's play" }).click();
	await expect(page).toHaveURL("/home");
	return page;
}

/** Adds two uniquely named players, starts a game with them, returns the names. */
export async function startGame(page: Page) {
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

export const card = (page: Page, name: string, score: number) =>
	page.getByRole("button", {
		name: new RegExp(`^${name}, rank \\d, ${score} points$`),
	});

/** Taps a quick-point button, opening the player's card first unless it is open. */
export async function add(page: Page, name: string, points: number) {
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

export async function finish(page: Page) {
	await page.getByRole("button", { name: "Finish game" }).click();
	await page.getByRole("button", { name: "Finish game" }).last().click();
	await expect(page.getByRole("heading", { name: "Game over" })).toBeVisible();
}

/**
 * Discards the game in progress, if any. Only one game can be active at a time,
 * so a test that fails halfway must not leave its game behind for the next one.
 */
async function discardActiveGame(browser: Browser) {
	const context = await browser.newContext();
	try {
		const page = await context.newPage();
		await page.goto("/");
		await page.getByLabel("Table password").fill(PASSWORD);
		await page.getByRole("button", { name: "Let's play" }).click();
		await expect(page).toHaveURL("/home");
		const resume = page.getByRole("link", { name: "Resume game" });
		if (await resume.isVisible()) {
			await resume.click();
			await page.getByRole("button", { name: "Finish game" }).click();
			await page
				.getByRole("button", { name: /Discard this game instead/ })
				.click();
			await expect(page).toHaveURL(/\/home/);
		}
	} finally {
		await context.close();
	}
}

/** `test` with an automatic clean-up after every test, passed or failed. */
export const test = base.extend<{ cleanup: undefined }>({
	cleanup: [
		async ({ browser }, use) => {
			await use(undefined);
			await discardActiveGame(browser);
		},
		{ auto: true },
	],
});
