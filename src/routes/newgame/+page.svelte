<script lang="ts">
  import { onMount } from "svelte";
  import * as events from "events";

  export let data;

  let availablePlayers = [];
  let currentPlayers = [];

  let playerId;

  onMount(() => {
    availablePlayers = data.players;
  })

  const addPlayerToCurrentGame = () => {
    let selectedPlayer = availablePlayers.find(x => x.id === playerId)
    availablePlayers = availablePlayers.filter(x => x.id != playerId)

    // Add Player to current players
    currentPlayers = [...currentPlayers, selectedPlayer]
    // Remove players from available players
    availablePlayers = [...availablePlayers]

    playerId = "0";
  }
  const removePlayerFromGame = (id: string) => {
    let selectedPlayer = currentPlayers.find(x => x.id === playerId)
    currentPlayers = currentPlayers.filter(x => x.id != playerId)

    // Add Player to current players
    availablePlayers = [...availablePlayers, selectedPlayer]
    // Remove players from available players
    currentPlayers = [...currentPlayers]
    // Reset the player dropdown to select player option
    playerId = "0";
  }


</script>

<div>
  <h2>Add Players</h2>
  <select bind:value={playerId}>
    <option value="0" selected>Select Player</option>
    {#each availablePlayers as player}
        <option value={player.id}>{player.name}</option>
      {/each }
  </select>
  <button on:click={addPlayerToCurrentGame}>Add Players</button>
</div>
<div>
  <h2>Current Game</h2>
  {#each currentPlayers as player}
    <p>{player.name}</p>
    <button on:click={() => removePlayerFromGame(player.id)}>Remove</button>
    {/each}
</div>
