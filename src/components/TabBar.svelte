<script lang="ts">
import { ClockIcon, HomeIcon, UsersIcon } from "svelte-feather-icons";
import { page } from "$app/stores";

const tabs = [
	{ href: "/home", label: "Home", icon: HomeIcon },
	{ href: "/players", label: "Players", icon: UsersIcon },
	{ href: "/history", label: "History", icon: ClockIcon },
];

$: pathname = $page.url.pathname;
const isActive = (href: string, path: string) =>
	path === href || path.startsWith(`${href}/`);
</script>

<nav
	class="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)]"
	aria-label="Main"
>
	<ul class="mx-auto flex max-w-md gap-2 px-5 py-3">
		{#each tabs as tab}
			{@const active = isActive(tab.href, pathname)}
			<li class="flex-1">
				<a
					href={tab.href}
					aria-current={active ? "page" : undefined}
					class="flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-2xl py-2 text-sm font-bold {active
						? "bg-meeple-yellow text-ink"
						: "text-muted"}"
				>
					<svelte:component this={tab.icon} size="24" />
					<span>{tab.label}</span>
				</a>
			</li>
		{/each}
	</ul>
</nav>
