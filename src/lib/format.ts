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
