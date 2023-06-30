<script lang="ts">
  import { page } from '$app/stores';

  // Skeleton Features
  import { AppShell, AppBar, Toast, popup,storePopup, Drawer, drawerStore, LightSwitch } from "@skeletonlabs/skeleton";
  import type {PopupSettings} from "@skeletonlabs/skeleton";
  import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';

  // Icons
  import { SettingsIcon } from 'svelte-feather-icons'

  // Local Features
  import Navigation from '../components/Navigation.svelte';

  // Stylesheets
  import '@skeletonlabs/skeleton/themes/theme-hamlindigo.css';
  import '@skeletonlabs/skeleton/styles/skeleton.css';
  import "../app.css";

  storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

  const settingsPopup: PopupSettings = {
    event: 'click',
    target: 'settingsPopup',
    placement: 'bottom',
  }
  function drawerOpen(): void {
    drawerStore.open({});
  }

  // Reactive Properties
  $: classesSidebarLeft = $page.url.pathname === '/' ? 'w-0' : 'w-0 lg:w-64';
</script>

<!-- Drawer -->
<Drawer>
  <h2 class="p-4">Navigation</h2>
  <hr />
  <Navigation />
</Drawer>

<!-- App Shell -->
<AppShell slotSidebarLeft="bg-surface-500/5 {classesSidebarLeft}">
  <svelte:fragment slot="header">
    <!-- App Bar -->
    <AppBar>
      <svelte:fragment slot="lead">
        <div class="flex items-center">
          <button class="lg:hidden btn btn-sm mr-4" on:click={drawerOpen}>
						<span>
							<svg viewBox="0 0 100 80" class="fill-token w-4 h-4">
								<rect width="100" height="20" />
								<rect y="30" width="100" height="20" />
								<rect y="60" width="100" height="20" />
							</svg>
						</span>
          </button>
          <strong class="text-xl uppercase">Carc Keeper</strong>
        </div>
      </svelte:fragment>
      <svelte:fragment slot="trail">
        <button use:popup={settingsPopup}>
          <SettingsIcon size="2x"/>
        </button>
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

<!--Popup Design-->
<div class="card p-4 w-72 shadow-xl" data-popup="settingsPopup">
  <LightSwitch />
  <a href="/settings">Settings</a>
</div>

<Toast />


