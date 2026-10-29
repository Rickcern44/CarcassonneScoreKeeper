const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): number {
	return new Date(
		date.getFullYear(),
		date.getMonth(),
		date.getDate(),
	).getTime();
}

/** "Today", "Yesterday", a weekday within the last week, else a short date. */
export function formatGameDate(iso: string, now: Date = new Date()): string {
	const date = new Date(iso);
	const daysAgo = Math.round((startOfDay(now) - startOfDay(date)) / DAY_MS);

	if (daysAgo <= 0) return "Today";
	if (daysAgo === 1) return "Yesterday";
	if (daysAgo < 7)
		return date.toLocaleDateString(undefined, { weekday: "long" });
	return date.toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
		year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
	});
}

/** "Ben", "Ben & Ada", "Ben, Ada & Cleo". */
export function joinNames(names: string[]): string {
	if (names.length <= 1) return names.join("");
	return `${names.slice(0, -1).join(", ")} & ${names[names.length - 1]}`;
}

/** "+8" or "−1", with a real minus sign. */
export const signedPoints = (points: number): string =>
	points < 0 ? `−${-points}` : `+${points}`;

/**
 * "just now", "3 min ago", "2 hr ago", then the date. `long` spells units out
 * ("3 minutes ago") for screen readers.
 */
export function relativeTime(
	iso: string,
	now: Date = new Date(),
	long = false,
): string {
	const seconds = Math.max(
		0,
		Math.round((now.getTime() - Date.parse(iso)) / 1000),
	);
	if (seconds < 45) return "just now";
	const unit = (count: number, short: string, full: string) =>
		long
			? `${count} ${full}${count === 1 ? "" : "s"} ago`
			: `${count} ${short} ago`;
	const minutes = Math.round(seconds / 60);
	if (minutes < 60) return unit(minutes, "min", "minute");
	const hours = Math.round(minutes / 60);
	if (hours < 24) return unit(hours, "hr", "hour");
	return formatGameDate(iso, now);
}
