import {
	add,
	expect,
	finish,
	goOffline,
	newPage,
	startGame,
	test,
} from "./helpers";

// Buttons that need the server follow the connection while a screen stays open,
// in both directions (they used to be set once, when the screen appeared).

test("the keypad's submit button follows the connection while the sheet is open", async ({
	browser,
}) => {
	const page = await newPage(browser);
	const [ann] = await startGame(page);
	await page.getByRole("button", { name: new RegExp(`^${ann}, rank`) }).click();
	await page
		.getByRole("button", { name: `Enter a custom amount for ${ann}` })
		.click();
	const keypad = page.getByRole("dialog", { name: `Enter points for ${ann}` });
	await keypad.getByRole("button", { name: "7", exact: true }).click();
	const submit = keypad.getByRole("button", { name: `Add 7 to ${ann}` });
	await expect(submit).toBeEnabled();

	await goOffline(page);
	await expect(submit).toBeDisabled();

	await page.context().setOffline(false);
	await expect(submit).toBeEnabled();

	await submit.click();
	await expect(keypad).toBeHidden();
	await finish(page);
});

test("the Rematch button follows the connection on the results screen", async ({
	browser,
}) => {
	const page = await newPage(browser);
	await startGame(page);
	await finish(page);
	const rematch = page.getByRole("button", {
		name: "Rematch with the same players",
	});
	await expect(rematch).toBeEnabled();

	await goOffline(page);
	await expect(rematch).toBeDisabled();

	await page.context().setOffline(false);
	await expect(rematch).toBeEnabled();
	await expect(page.getByRole("status")).toHaveCount(0);
});
