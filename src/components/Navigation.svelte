<script lang="ts">
  import { drawerStore } from '@skeletonlabs/skeleton';
  import { redirect } from "@sveltejs/kit";

  export let supabase;

  function drawerClose(): void {
    drawerStore.close();
  }

  const logout = async () => {
    await supabase.auth.signOut()
    throw redirect(303, '/')
  }
</script>

<nav class="list-nav p-4">
  <ul>
    <li><a href="/home" on:click={drawerClose}>Home</a></li>
    <li><a href="/newgame" on:click={drawerClose}>New Game</a></li>
    <li><a href="/players" on:click={drawerClose}>Players</a></li>
    <li><button class="btn" on:click={logout}>Logout</button></li>
  </ul>
</nav>
