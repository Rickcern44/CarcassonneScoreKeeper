import { readable } from "svelte/store";

/**
 * Whether the device is online, as a store. Legacy-syntax components (`export
 * let`, `$:`) use it as `$isOnline`: their `$:` statements only re-run for the
 * component's own variables and stores, never for `online.current` from
 * svelte/reactivity/window, which would leave `offline` stale after mount.
 */
export const isOnline = readable(true, (set) => {
	if (typeof window === "undefined") return;
	set(navigator.onLine);
	const up = () => set(true);
	const down = () => set(false);
	window.addEventListener("online", up);
	window.addEventListener("offline", down);
	return () => {
		window.removeEventListener("online", up);
		window.removeEventListener("offline", down);
	};
});
