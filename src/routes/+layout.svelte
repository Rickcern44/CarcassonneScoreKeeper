<script lang="ts">
// Skeleton Features
import {
	AppBar,
	AppShell,
	Drawer,
	getDrawerStore,
	initializeStores,
	Toast,
} from "@skeletonlabs/skeleton";
import { onMount } from "svelte";
// Icons
import { SettingsIcon } from "svelte-feather-icons";
import { invalidate } from "$app/navigation";
import { page } from "$app/stores";

// Local Features
import Navigation from "../components/Navigation.svelte";

// Stylesheets
import "../app.css";
import { env } from "$env/dynamic/public";
import type { LayoutData } from "./$types";

initializeStores();
const drawerStore = getDrawerStore();

function drawerOpen(): void {
	drawerStore.open({});
}
export let data: LayoutData;

if (env.PUBLIC_ENVIRONMENT === "Development") {
	console.log(data?.session);
}

let { supabase, session } = data;
$: ({ supabase, session } = data);

onMount(() => {
	const { data } = supabase.auth.onAuthStateChange((_event, _session) => {
		if (_session?.expires_at !== session?.expires_at) {
			invalidate("supabase:auth");
		}
	});

	return () => data.subscription.unsubscribe();
});

// Reactive Properties
$: classesSidebarLeft = $page.url.pathname === "/" ? "w-0" : "w-0 lg:w-64";
</script>

<!-- Drawer -->
<Drawer>
	<h2 class="p-4">{data?.session?.user?.email ?? "Not Signed In"}</h2>
	<hr>
	<Navigation {supabase} />
</Drawer>

<!-- App Shell -->
<AppShell slotSidebarLeft="bg-surface-500/5 {classesSidebarLeft}">
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar>
			<svelte:fragment slot="lead">
				<div class="flex items-center">
					<button
						type="button"
						class="lg:hidden btn btn-sm mr-4"
						on:click={drawerOpen}
						aria-label="Open navigation"
					>
						<span>
							<svg
								viewBox="0 0 100 80"
								class="fill-token w-4 h-4"
								aria-hidden="true"
							>
								<rect width="100" height="20" />
								<rect y="30" width="100" height="20" />
								<rect y="60" width="100" height="20" />
							</svg>
						</span>
					</button>
					<a href="/home">
						<strong class="text-xl uppercase">Carc Keeper</strong>
					</a>
				</div>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<a href="settings">
					<SettingsIcon size="2x" />
				</a>
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<!-- Left Sidebar Slot -->
	<svelte:fragment slot="sidebarLeft">
		<Navigation {supabase} />
	</svelte:fragment>
	<!-- Page Route Content -->
	<slot />
</AppShell>

<Toast />
