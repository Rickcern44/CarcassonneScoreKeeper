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
// Icons
import { SettingsIcon } from "svelte-feather-icons";
import { page } from "$app/stores";

// Local Features
import Navigation from "../components/Navigation.svelte";

// Stylesheets
import "../app.css";

initializeStores();
const drawerStore = getDrawerStore();

function drawerOpen(): void {
	drawerStore.open({});
}
// Reactive Properties
$: classesSidebarLeft = $page.url.pathname === "/" ? "w-0" : "w-0 lg:w-64";
</script>

<!-- Drawer -->
<Drawer>
	<Navigation />
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
		<Navigation />
	</svelte:fragment>
	<!-- Page Route Content -->
	<slot />
</AppShell>

<Toast />
