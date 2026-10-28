// Aspire TypeScript AppHost
// For more information, see: https://aspire.dev

import { createBuilder } from "./.aspire/modules/aspire.mjs";

const builder = await createBuilder();

// Shared login password for the app. Supply it with
// `aspire secret set Parameters:app-password <value>` or `Parameters__app-password`.
const appPassword = await builder.addParameter("app-password", {
	secret: true,
});

// Local Postgres (a container; needs Docker or Podman). Production uses Neon.
const postgres = builder.addPostgres("postgres").withDataVolume();
const db = postgres.addDatabase("carcassonne");
const databaseUrl = await db.uriExpression();

// Applies Drizzle migrations before the app starts.
const migrate = builder
	.addExecutable("db-migrate", "npm", "..", ["run", "db:migrate"])
	.withEnvironment("DATABASE_URL", databaseUrl)
	.waitFor(db);

await builder
	.addViteApp("web", "..")
	.withEnvironment("APP_PASSWORD", appPassword)
	.withEnvironment("DATABASE_URL", databaseUrl)
	.waitForCompletion(migrate)
	.withExternalHttpEndpoints();

await builder.build().run();
