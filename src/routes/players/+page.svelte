<script>
  export let data;
</script>
<form method="POST" action="?/create">
  <label for="playerName">Player Name</label>
  <input type="text" name="name" id="playerName" placeholder="Enter Player Name"/>
</form>

{#each data.players as {name, id}}
    <a href="/players/{id}">{name}</a>
    <p>{id}</p>
  {/each}
