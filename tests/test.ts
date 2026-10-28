import { expect, type Page, test } from "@playwright/test";

const PASSWORD = "playwright-test";

async function login(page: Page) {
	await page.goto("/");
	await page.getByLabel("Table password").fill(PASSWORD);
	await page.getByRole("button", { name: "Let's play" }).click();
	await expect(page).toHaveURL("/home");
}

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

test.describe("progressive web app", () => {
	test("the manifest is public and describes an installable app", async ({
		request,
	}) => {
		const response = await request.get("/manifest.webmanifest", {
			maxRedirects: 0,
		});
		expect(response.status()).toBe(200);
		const manifest = await response.json();
		expect(manifest).toMatchObject({
			name: "Carc Keeper",
			short_name: "Carc Keeper",
			start_url: "/home",
			display: "standalone",
		});

		const sizes = manifest.icons.map((icon: { sizes: string }) => icon.sizes);
		expect(sizes).toContain("192x192");
		expect(sizes).toContain("512x512");
		expect(
			manifest.icons.some(
				(icon: { purpose: string }) => icon.purpose === "maskable",
			),
		).toBe(true);

		for (const icon of manifest.icons) {
			const iconResponse = await request.get(icon.src, { maxRedirects: 0 });
			expect(iconResponse.status(), icon.src).toBe(200);
		}
		const touch = await request.get("/apple-touch-icon.png", {
			maxRedirects: 0,
		});
		expect(touch.status()).toBe(200);
	});

	test("the login page links the manifest", async ({ page }) => {
		await page.goto("/");
		await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
			"href",
			/manifest\.webmanifest$/,
		);
	});

	test("a page that was never viewed shows the offline page when offline", async ({
		page,
		context,
	}) => {
		await page.goto("/");
		await page.evaluate(() => navigator.serviceWorker.ready);
		// The worker controls pages from the next load on.
		await page.reload();
		await page.waitForFunction(() => navigator.serviceWorker.controller);

		await context.setOffline(true);
		await page.goto("/history").catch(() => {});
		await expect(
			page.getByRole("heading", { name: "You're offline" }),
		).toBeVisible();

		await context.setOffline(false);
		await page.getByRole("button", { name: "Try again" }).click();
		await expect(page).toHaveURL("/");
	});
	// The settings page reads no data, so these two checks need no database.
	test("the app shows an offline banner while the device is offline", async ({
		page,
		context,
	}) => {
		await login(page);
		await page.goto("/settings");
		const banner = page.getByRole("status");
		await expect(banner).toHaveCount(0);

		await context.setOffline(true);
		await expect(banner).toContainText("Offline");

		await context.setOffline(false);
		await expect(banner).toHaveCount(0);
	});

	test("logging out clears the saved-data caches but keeps the app files", async ({
		page,
	}) => {
		await login(page);
		await page.goto("/settings");
		await page.evaluate(async () => {
			await caches.open("data-test");
			await caches.open("app-test");
		});

		await page.getByRole("button", { name: "Logout" }).click();
		await expect(page).toHaveURL("/");

		const names = await page.evaluate(() => caches.keys());
		expect(names).toContain("app-test");
		expect(names.filter((name) => name.startsWith("data-"))).toEqual([]);
	});
});
