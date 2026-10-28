/** @type {import('tailwindcss').Config} */

const { skeleton } = require("@skeletonlabs/tw-plugin");

module.exports = {
	// 1. Apply the dark mode class setting:
	darkMode: "class",
	content: [
		"./src/**/*.{html,js,svelte,ts}",
		// 2. Append the path for the Skeleton NPM package and files:
		require("node:path").join(
			require.resolve("@skeletonlabs/skeleton"),
			"../**/*.{html,js,svelte,ts}",
		),
	],
	theme: {
		extend: {
			colors: {
				bg: "var(--bg)",
				surface: "var(--surface)",
				ink: "var(--ink)",
				muted: "var(--muted)",
				line: "var(--line)",
				chip: "var(--chip)",
				"on-chip": "var(--on-chip)",
				key: "var(--key)",
				"on-key": "var(--on-key)",
				"on-yellow": "var(--on-yellow)",
				"shadow-ink": "var(--shadow-ink)",
				tile: {
					field: "var(--tile-field)",
					road: "var(--tile-road)",
					city: "var(--tile-city)",
				},
				meeple: {
					red: "var(--meeple-red)",
					blue: "var(--meeple-blue)",
					green: "var(--meeple-green)",
					yellow: "var(--meeple-yellow)",
					black: "var(--meeple-black)",
					gray: "var(--meeple-gray)",
				},
			},
			fontFamily: {
				display: ['"Fredoka"', '"Nunito"', "system-ui", "sans-serif"],
				body: ['"Nunito"', "system-ui", "sans-serif"],
			},
		},
	},
	plugins: [
		require("@tailwindcss/forms"),
		skeleton({
			themes: {
				preset: ["hamlindigo"],
			},
		}),
	],
};
