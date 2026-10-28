export type ThemeMode = "system" | "light" | "dark";

const KEY = "theme-mode";

/** The saved choice on this device; "system" follows the device setting. */
export function getThemeMode(): ThemeMode {
	try {
		const saved = localStorage.getItem(KEY);
		return saved === "light" || saved === "dark" ? saved : "system";
	} catch {
		return "system";
	}
}

export function setThemeMode(mode: ThemeMode): void {
	const root = document.documentElement;
	if (mode === "system") delete root.dataset.mode;
	else root.dataset.mode = mode;

	try {
		if (mode === "system") localStorage.removeItem(KEY);
		else localStorage.setItem(KEY, mode);
	} catch {
		// Storage can be unavailable (private mode); the choice then lasts for this visit.
	}
}
