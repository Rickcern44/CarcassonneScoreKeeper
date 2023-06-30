<script lang="ts">
  import { onMount } from "svelte";
  import {TrashIcon} from 'svelte-feather-icons'
  import type { ToastSettings } from "@skeletonlabs/skeleton";
  import { toastStore } from "@skeletonlabs/skeleton";
  // props
  export let data;
  // variables
  let availablePlayers = [];
  let currentPlayers = [];
  let playerId;
  // load events
  onMount(() => {
    availablePlayers = data.players;
  })

  // methods
  const failureToast: ToastSettings = {
    message: 'Unable to add Additional players to game!',
    background: 'variant-filled-warning',
  };

  const addPlayerToCurrentGame = () => {
    let selectedPlayer = availablePlayers.find(x => x.id === playerId)


    if (currentPlayers.length === 2){
      toastStore.trigger(failureToast);

    }
    else{
      availablePlayers = availablePlayers.filter(x => x.id != playerId)

      // Add Player to current players
      currentPlayers = [...currentPlayers, selectedPlayer]
      // Remove players from available players
      availablePlayers = [...availablePlayers]

      playerId = "0";
    }

  }
  const removePlayerFromGame = (id: string) => {
    let selectedPlayer = currentPlayers.find(x => x.id === id)
    currentPlayers = currentPlayers.filter(x => x.id != id)

    // Add Player to current players
    availablePlayers = [...availablePlayers, selectedPlayer]
    // Remove players from available players
    currentPlayers = [...currentPlayers]
    // Reset the player dropdown to select player option
    playerId = "0";
  }

</script>
<!--Current available players-->
<div class="flex flex-col">
  <h2 class="h2 self-center mb-2">Add Players</h2>
  <select class="select" bind:value={playerId}>
    <option value="0" selected>Select Player</option>
    {#each availablePlayers as player}
        <option value={player.id}>{player.name}</option>
      {/each }
  </select>
  <button class="btn bg-green-200 mt-2 disabled:bg-yellow-200" on:click={addPlayerToCurrentGame} disabled={playerId === undefined || playerId === '0'}>Add</button>
</div>
<!--Players in the current game-->
<div class="flex flex-col text-center mt-4">
  <h2 class="h2">Current Game</h2>
  <ul class="list">
  {#each currentPlayers as player}
    <li>
      <span class="placeholder-circle w-16"></span>
      <span class="flex-auto">{player.name}</span>
      <span class="flex-auto" >
        <button on:click={() => removePlayerFromGame(player.id)}>
          <TrashIcon size="2x" />
        </button>
      </span>
    </li>
    {/each}
  </ul>
</div>
<div class="flex">
  <button class="btn bg-gray-500 flex-auto mt-5">Start Game</button>
</div>

