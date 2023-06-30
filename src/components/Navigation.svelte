<script lang="ts">
  import { drawerStore } from '@skeletonlabs/skeleton';

  function drawerClose(): void {
    drawerStore.close();
  }
</script>

<nav class="list-nav p-4">
  <ul>
    <li><a href="/home" on:click={drawerClose}>Home</a></li>
    <li><a href="/newgame" on:click={drawerClose}>New Game</a></li>
    <li><a href="/players" on:click={drawerClose}>Players</a></li>
  </ul>
</nav>
