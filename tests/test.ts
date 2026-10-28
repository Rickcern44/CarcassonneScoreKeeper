import { expect, test } from "@playwright/test";

const PASSWORD = "playwright-test";

test("unauthenticated visitors are redirected to the login screen", async ({
	page,
}) => {
	await page.goto("/home");
	await expect(page).toHaveURL("/");
	await expect(page.getByLabel("Table password")).toBeVisible();
});

test("a wrong password shows an error and stays on the login screen", async ({
	page,
}) => {
	await page.goto("/");
	await page.getByLabel("Table password").fill("nope");
	await page.getByRole("button", { name: "Let's play" }).click();
	await expect(page.getByRole("alert")).toHaveText("Incorrect password.");
	await expect(page.getByLabel("Table password")).toBeVisible();
});

// Home reads games from the database, so the default suite only checks the
// redirect; the page itself is covered by the journey in tests/e2e.
test("the right password redirects to home", async ({ page }) => {
	await page.goto("/");
	await page.getByLabel("Table password").fill(PASSWORD);
	await page.getByRole("button", { name: "Let's play" }).click();
	await expect(page).toHaveURL("/home");
});
