<script lang="ts">
  import { onMount } from "svelte";
  import { database } from "$lib/db";
  import { invalidateAll } from "$app/navigation";

  onMount(() => {
      const {data: { subscription }} = database.auth.onAuthStateChange(() => {
        invalidateAll();
      })

      return () => {
          subscription.unsubscribe();
      }
    }
  )
</script>

<nav>
  <a href="/">Home</a>
  <a href="test">Test</a>
  <a href="newgame">New Game</a>
  <a href="players">Players</a>
</nav>

<slot />
