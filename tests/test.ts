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

test("the right password lands on home inside the app shell", async ({
	page,
}) => {
	await page.goto("/");
	await page.getByLabel("Table password").fill(PASSWORD);
	await page.getByRole("button", { name: "Let's play" }).click();
	await expect(page).toHaveURL("/home");
	await expect(
		page.getByRole("navigation", { name: "Main" }).getByRole("link"),
	).toHaveCount(3);
});
