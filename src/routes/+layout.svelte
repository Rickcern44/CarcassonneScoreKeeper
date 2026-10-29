<script lang="ts">
import "../app.css";
import type { Snippet } from "svelte";
import { identityFor, prefixTitle } from "#lib/appEnv.js";
import { afterNavigate } from "$app/navigation";
import { asset } from "$app/paths";
import EnvBanner from "../components/EnvBanner.svelte";
import type { LayoutData } from "./$types";

type AssetPath = Parameters<typeof asset>[0];

let { data, children }: { data: LayoutData; children: Snippet } = $props();

const identity = $derived(identityFor(data.appEnv));

// Client-side navigations never check for a new service worker, so ask for one
// after each, letting a new deployment install during a session.
afterNavigate(() => {
	navigator.serviceWorker?.getRegistration().then((registration) => {
		registration?.update().catch(() => {});
	});
});

// Pages set their own <title>. Keep the environment prefix on whatever they
// set (the server adds it to the first render, see src/hooks.server.ts).
$effect(() => {
	const prefix = identity.titlePrefix;
	if (!prefix) return;
	const title = document.querySelector("title");
	if (!title) return;
	const apply = () => {
		const next = prefixTitle(document.title, prefix);
		if (next !== document.title) document.title = next;
	};
	apply();
	const observer = new MutationObserver(apply);
	observer.observe(title, {
		childList: true,
		characterData: true,
		subtree: true,
	});
	return () => observer.disconnect();
});
</script>

<svelte:head>
	<link rel="icon" href={asset(identity.favicon as AssetPath)}>
	<link rel="manifest" href={asset(identity.manifest as AssetPath)}>
	<link
		rel="apple-touch-icon"
		href={asset(identity.appleTouchIcon as AssetPath)}
	>
	<meta
		name="theme-color"
		content={identity.themeColor.light}
		media="(prefers-color-scheme: light)"
	>
	<meta
		name="theme-color"
		content={identity.themeColor.dark}
		media="(prefers-color-scheme: dark)"
	>
</svelte:head>

<EnvBanner env={data.appEnv} />
{@render children()}
