import { expect, test } from "@playwright/test";

test("index page shows the login screen", async ({ page }) => {
	await page.goto("/");
	await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
});

test("protected pages redirect to the login screen", async ({ page }) => {
	await page.goto("/players");
	await expect(page).toHaveURL("/");
	await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
});
