<script lang="ts">
	import { getDrawerStore } from '@skeletonlabs/skeleton';
	import { invalidateAll } from '$app/navigation';
	import type { SupabaseClient } from '@supabase/supabase-js';

	export let supabase: SupabaseClient;
	const drawerStore = getDrawerStore();

	function drawerClose(): void {
		drawerStore.close();
	}

	const logout = async () => {
		await supabase.auth.signOut();
		await invalidateAll();
		drawerClose();
	};
</script>

<nav class="list-nav p-4">
	<ul>
		<li><a href="/home" on:click={drawerClose}>Home</a></li>
		<li><a href="/newgame" on:click={drawerClose}>New Game</a></li>
		<li><a href="/players" on:click={drawerClose}>Players</a></li>
		<li><button class="btn" on:click={logout}>Logout</button></li>
	</ul>
</nav>
