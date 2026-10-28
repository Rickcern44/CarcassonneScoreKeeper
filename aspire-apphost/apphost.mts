// Aspire TypeScript AppHost
// For more information, see: https://aspire.dev

import { createBuilder } from "./.aspire/modules/aspire.mjs";

const builder = await createBuilder();

// Shared login password for the app. Supply it with
// `aspire secret set Parameters:app-password <value>` or `Parameters__app-password`.
const appPassword = await builder.addParameter("app-password", {
	secret: true,
});

await builder
	.addViteApp("web", "..")
	.withEnvironment("APP_PASSWORD", appPassword)
	.withExternalHttpEndpoints();

await builder.build().run();
