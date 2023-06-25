<script>
  export let data;
</script>

{#each data.players as {name, id}}
    <p>{name}</p>
  {/each}
