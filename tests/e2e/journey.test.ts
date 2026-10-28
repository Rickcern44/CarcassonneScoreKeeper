import { expect, test } from "@playwright/test";

const PASSWORD = "playwright-test";

// Needs a fresh, migrated Postgres: see "End-to-end tests" in the README.
test("core journey: players, game, scoring, undo, finish, history", async ({
	page,
}) => {
	const tab = (name: string) =>
		page.getByRole("navigation", { name: "Main" }).getByRole("link", { name });

	// Log in.
	await page.goto("/");
	await page.getByLabel("Table password").fill(PASSWORD);
	await page.getByRole("button", { name: "Let's play" }).click();
	await expect(page).toHaveURL("/home");

	// Add players.
	await tab("Players").click();
	for (const name of ["Ada", "Ben", "Cleo"]) {
		await page.getByLabel("Player name").fill(name);
		await page.getByRole("button", { name: "Add" }).click();
		await expect(page.getByRole("list").getByText(name)).toBeVisible();
	}

	// Start a game with all three.
	await tab("Home").click();
	await page.getByRole("link", { name: "New game" }).click();
	await expect(
		page.getByRole("button", { name: /Pick at least 2 players/ }),
	).toBeDisabled();
	for (const name of ["Ada", "Ben", "Cleo"]) {
		await page.locator("label", { hasText: name }).click();
		await expect(page.getByRole("checkbox", { name })).toBeChecked();
	}
	await page.getByRole("button", { name: "Start game · 3 players" }).click();
	await expect(page).toHaveURL(/\/game\/[0-9a-f-]{36}$/);
	await expect(page.getByRole("heading", { name: "Scoreboard" })).toBeVisible();

	// Quick buttons.
	await page.getByRole("button", { name: /^Ada, rank/ }).click();
	await page.getByRole("button", { name: "Add 5 points to Ada" }).click();
	await expect(
		page.getByRole("button", { name: "Ada, rank 1, 5 points" }),
	).toBeVisible();

	await page.getByRole("button", { name: /^Ben, rank/ }).click();
	await page.getByRole("button", { name: "Add 3 points to Ben" }).click();
	await expect(
		page.getByRole("button", { name: "Ben, rank 2, 3 points" }),
	).toBeVisible();

	// Keypad: Ada +13 takes her to 18.
	await page.getByRole("button", { name: /^Ada, rank/ }).click();
	await page
		.getByRole("button", { name: "Enter a custom amount for Ada" })
		.click();
	const keypad = page.getByRole("dialog", { name: "Enter points for Ada" });
	await expect(
		keypad.getByRole("button", { name: "Enter points" }),
	).toBeDisabled();
	await keypad.getByRole("button", { name: "1", exact: true }).click();
	await keypad.getByRole("button", { name: "3", exact: true }).click();
	await keypad.getByRole("button", { name: "Add 13 to Ada" }).click();
	await expect(keypad).toBeHidden();
	await expect(
		page.getByRole("button", { name: "Ada, rank 1, 18 points" }),
	).toBeVisible();

	// Undo reverses the keypad entry.
	await page.getByRole("button", { name: "Undo" }).click();
	await expect(
		page.getByRole("button", { name: "Ada, rank 1, 5 points" }),
	).toBeVisible();

	// Keypad subtract, then re-rank: Ben passes Ada.
	await page.getByRole("button", { name: /^Ben, rank/ }).click();
	await page.getByRole("button", { name: "Add 5 points to Ben" }).click();
	await expect(
		page.getByRole("button", { name: "Ben, rank 1, 8 points" }),
	).toBeVisible();
	await expect(
		page.getByRole("button", { name: "Ada, rank 2, 5 points" }),
	).toBeVisible();

	// Scores survive a reload.
	await page.reload();
	await expect(
		page.getByRole("button", { name: "Ben, rank 1, 8 points" }),
	).toBeVisible();

	// Finish, with a confirmation first.
	await page.getByRole("button", { name: "Finish game" }).click();
	await expect(page.getByText("Finish this game?")).toBeVisible();
	await page.getByRole("button", { name: "Finish game" }).last().click();
	await expect(page.getByRole("heading", { name: "Game over" })).toBeVisible();
	await expect(page.getByLabel("Winner")).toContainText("Ben");
	await expect(page.getByLabel("Winner")).toContainText("8 points");

	// The finished game can't be edited, and the results open by URL.
	await expect(page.getByRole("button", { name: /Undo/ })).toHaveCount(0);
	await page.reload();
	await expect(page.getByRole("heading", { name: "Game over" })).toBeVisible();

	// Home and History show the game.
	await page.getByRole("link", { name: "Back to home" }).click();
	await expect(page.getByText("Ben won")).toBeVisible();
	await tab("History").click();
	await expect(page.getByText("Ben · 8")).toBeVisible();
	await page.getByText("Ben · 8").click();
	await expect(page.getByRole("heading", { name: "Game over" })).toBeVisible();

	// Players show their record.
	await page.goto("/players");
	await expect(page.getByText("1 game · 1 win")).toBeVisible();
});
