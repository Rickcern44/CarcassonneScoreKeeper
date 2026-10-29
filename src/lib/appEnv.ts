// Which deployment the app is running in. Pure rules, so they can be unit
// tested; the server reads the inputs (see src/routes/+layout.server.ts).
export type AppEnv = "development" | "staging" | "production";

// The Vite dev server is always "development" (this covers `npm run dev` and
// Aspire). Otherwise only the exact values "staging" and "development" count;
// anything else, including unset, is production, so a typo never adds a banner
// to production and an unconfigured deploy looks like production.
export function resolveAppEnv(dev: boolean, raw: string | undefined): AppEnv {
	if (dev) return "development";
	const value = raw?.trim().toLowerCase();
	if (value === "staging" || value === "development") return value;
	return "production";
}

export interface AppIdentity {
	label: string;
	titlePrefix: string;
	banner: string;
	manifest: string;
	appleTouchIcon: string;
	favicon: string;
	themeColor: { light: string; dark: string };
}

const PRODUCTION: AppIdentity = {
	label: "Production",
	titlePrefix: "",
	banner: "",
	manifest: "manifest.webmanifest",
	appleTouchIcon: "apple-touch-icon.png",
	favicon: "meeple_logo.png",
	themeColor: { light: "#f5f0e4", dark: "#16130f" },
};

const IDENTITIES: Record<AppEnv, AppIdentity> = {
	production: PRODUCTION,
	staging: {
		label: "Staging",
		titlePrefix: "[Staging] ",
		banner: "STAGING: test copy of production data, changes are discarded",
		manifest: "manifest.staging.webmanifest",
		appleTouchIcon: "apple-touch-icon-staging.png",
		favicon: "icon-staging-192.png",
		themeColor: { light: "#f97316", dark: "#f97316" },
	},
	// Local runs get a banner and title only. The service worker does not run
	// under the dev server, so there is no installed app to tell apart.
	development: {
		...PRODUCTION,
		label: "Local",
		titlePrefix: "[Local] ",
		banner: "LOCAL: development server",
	},
};

export const identityFor = (env: AppEnv): AppIdentity => IDENTITIES[env];

// Adds the environment prefix to a page title once; production has no prefix.
export function prefixTitle(title: string, prefix: string): string {
	return prefix && !title.startsWith(prefix) ? `${prefix}${title}` : title;
}
