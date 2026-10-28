<script lang="ts">
export let color: "red" | "blue" | "green" | "yellow" | "black" | "gray" =
	"red";
export let label: string | undefined = undefined;
export let size = 40;

const backgrounds = {
	red: "bg-meeple-red",
	blue: "bg-meeple-blue",
	green: "bg-meeple-green",
	yellow: "bg-meeple-yellow",
	black: "bg-meeple-black",
	gray: "bg-meeple-gray",
};
</script>

<span
	class="inline-flex shrink-0 items-center justify-center rounded-full font-display font-bold {backgrounds[
		color
	]} {color === "yellow" ? "text-ink" : "text-white"}"
	style="width: {size}px; height: {size}px; font-size: {size * 0.45}px"
	aria-hidden={label ? undefined : "true"}
>
	{label ?? ""}
</span>
