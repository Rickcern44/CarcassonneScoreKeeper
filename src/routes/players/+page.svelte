<script>
  export let data;
</script>

<form method="POST" action="?/create">
  <div class="flex flex-col">
    <label class="label" for="playerName">
      <span>Label</span>
    </label>
    <input class="playerName variant-form-material" id="playerName" title="Player Name" type="text" placeholder="Enter Player Name" />
  </div>
</form>


<nav class="list-nav">
  <ul>
    {#each data.players as {name, id}}
      <li>
        <a
          href="/players/{id}">
          <span class="placeholder-circle w-16"></span>
          <span class="flex-auto">{name}</span>
        </a>
      </li>
    {/each}
  </ul>
</nav>

