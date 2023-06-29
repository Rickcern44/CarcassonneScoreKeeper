<script>
  import { AppBar } from "@skeletonlabs/skeleton";
</script>

<AppBar>
  <svelte:fragment slot="lead">
    <a href="/">Carc Keeper</a>
  </svelte:fragment>
  <svelte:fragment slot="trail">
    <a href="/newgame">New Game</a>
    <a href="/players">Players</a>
  </svelte:fragment>
</AppBar>

