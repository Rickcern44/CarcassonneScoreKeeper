export const MEEPLE_COLORS = [
	"red",
	"blue",
	"green",
	"yellow",
	"black",
	"gray",
] as const;
export type MeepleColor = (typeof MEEPLE_COLORS)[number];

// Full class names (not built from parts) so Tailwind can see them.
export const meepleBg: Record<MeepleColor, string> = {
	red: "bg-meeple-red",
	blue: "bg-meeple-blue",
	green: "bg-meeple-green",
	yellow: "bg-meeple-yellow",
	black: "bg-meeple-black",
	gray: "bg-meeple-gray",
};

/** Text that stays readable on top of each meeple color in every theme. */
export const meepleText: Record<MeepleColor, string> = {
	red: "text-white",
	blue: "text-white",
	green: "text-white",
	yellow: "text-on-yellow",
	black: "text-white",
	gray: "text-white",
};

export function nextFreeColor(
	taken: Iterable<MeepleColor>,
	from?: MeepleColor,
): MeepleColor | undefined {
	const used = new Set(taken);
	const start = from ? MEEPLE_COLORS.indexOf(from) + 1 : 0;
	for (let i = 0; i < MEEPLE_COLORS.length; i++) {
		const color = MEEPLE_COLORS[(start + i) % MEEPLE_COLORS.length];
		if (!used.has(color)) return color;
	}
	return undefined;
}
