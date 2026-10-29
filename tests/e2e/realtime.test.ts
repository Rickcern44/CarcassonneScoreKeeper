import type { Browser, Page } from "@playwright/test";
import { add, card, expect, finish, newPage, startGame, test } from "./helpers";

// Needs a migrated Postgres: see "End-to-end tests" in the README.
// A clean-up after every test discards a game left active by a failure.

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

/** Device B has the game open; A scores. Returns both pages and the player. */
async function twoDevices(browser: Browser) {
	const a = await newPage(browser);
	const [ann] = await startGame(a);
	const b = await newPage(browser);
	// Remember each live connection, so a test can hand it a message by hand.
	await b.addInitScript(() => {
		const Real = window.EventSource;
		const seen: EventSource[] = [];
		(window as unknown as { __sources: EventSource[] }).__sources = seen;
		window.EventSource = class extends Real {
			constructor(url: string | URL, init?: EventSourceInit) {
				super(url, init);
				seen.push(this);
			}
		};
	});
	await b.goto(a.url());
	await expect(card(b, ann, 0)).toBeVisible();
	return { a, b, ann };
}

/** Goes offline and waits until the page has noticed (banner showing). */
async function goOffline(page: Page) {
	await page.context().setOffline(true);
	await expect(page.getByRole("status")).toContainText("Offline");
}

const noErrorPage = (page: Page) =>
	expect(page.getByText("Internal Error")).toHaveCount(0);

test("a device that was offline catches up when it reconnects", async ({
	browser,
}) => {
	const { a, b, ann } = await twoDevices(browser);

	await goOffline(b);
	// Changes are off while offline.
	await b.getByRole("button", { name: new RegExp(`^${ann}, rank`) }).click();
	await expect(
		b.getByRole("button", { name: `Add 5 points to ${ann}` }),
	).toBeDisabled();
	await add(a, ann, 5);
	await expect(card(a, ann, 5)).toBeVisible();
	await expect(card(b, ann, 0)).toBeVisible();
	await noErrorPage(b);

	await b.context().setOffline(false);
	await expect(card(b, ann, 5)).toBeVisible({ timeout: 5000 });
	await expect(b.getByRole("status")).toHaveCount(0);
	await noErrorPage(b);
	await finish(a);
});

test("switching back to the tab while offline keeps the saved scores, then catches up", async ({
	browser,
}) => {
	const { a, b, ann } = await twoDevices(browser);
	await add(a, ann, 3);
	await expect(card(b, ann, 3)).toBeVisible({ timeout: 2000 });

	await goOffline(b);
	await add(a, ann, 1);
	await b.evaluate(() => {
		Object.defineProperty(document, "visibilityState", {
			configurable: true,
			get: () => "visible",
		});
		document.dispatchEvent(new Event("visibilitychange"));
	});
	await b.waitForTimeout(500);
	await noErrorPage(b);
	await expect(card(b, ann, 3)).toBeVisible();
	await expect(b.getByRole("status")).toContainText("Offline");

	await b.context().setOffline(false);
	await expect(card(b, ann, 4)).toBeVisible({ timeout: 5000 });
	await noErrorPage(b);
	await finish(a);
});

test("a change that arrives on a connection that is still open while offline is held until reconnect", async ({
	browser,
}) => {
	const { a, b, ann } = await twoDevices(browser);

	await goOffline(b);
	await add(a, ann, 5);
	// The live connection may outlive the loss of signal for a moment: hand it
	// the message the server would have sent.
	await b.evaluate(() => {
		const sources = (window as unknown as { __sources: EventSource[] })
			.__sources;
		const message = {
			type: "changed",
			eventCount: 1,
			lastEventId: 1e9,
			status: "active",
		};
		sources
			.at(-1)
			?.onmessage?.(
				new MessageEvent("message", { data: JSON.stringify(message) }),
			);
	});
	await b.waitForTimeout(500);
	await noErrorPage(b);
	await expect(card(b, ann, 0)).toBeVisible();

	await b.context().setOffline(false);
	await expect(card(b, ann, 5)).toBeVisible({ timeout: 5000 });
	await noErrorPage(b);
	await finish(a);
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
