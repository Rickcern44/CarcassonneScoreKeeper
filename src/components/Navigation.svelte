<script lang="ts">
  import { drawerStore } from '@skeletonlabs/skeleton';
  import { invalidateAll } from "$app/navigation";

  export let supabase;

  function drawerClose(): void {
    drawerStore.close();
  }

  const logout = async () => {
    await supabase.auth.signOut()
    await invalidateAll();
    drawerClose();
  }
</script>

<nav class="list-nav p-4">
  <ul>
    <li><a href="/home" id="homeLink" on:click={drawerClose}>Home</a></li>
    <li><a href="/newgame" id="newGameLink" on:click={drawerClose}>New Game</a></li>
    <li><a href="/players" id="playersLink" on:click={drawerClose}>Players</a></li>
    <li><button class="btn" on:click={logout}>Logout</button></li>
  </ul>
</nav>
