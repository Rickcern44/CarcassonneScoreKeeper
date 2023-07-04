<script lang="ts">
  import { onMount } from "svelte";
  import {TrashIcon} from 'svelte-feather-icons'
  import type { ToastSettings } from "@skeletonlabs/skeleton";
  import { toastStore } from "@skeletonlabs/skeleton";

  // props
  export let data;
  let disabled = true;
  let colorDisabled = true;
  // variables
  let availablePlayers = [];
  let availableColors = [
    {id: '1', color: 'red'},
    {id: '2', color: 'black'},
    {id: '3', color: 'green'},
    {id: '4', color: 'yellow'},
    {id: '5', color: 'blue'},
    {id: '6', color: 'pink'},
  ];
  let selectedColors = [];
  let currentPlayers = [];

  // Current Selected Player and Color
  let selectedPlayerId = "0";
  let selectedColorId = "0";

  // load events
  onMount(() => {
    availablePlayers = data.players;
  })

  // methods
  const failureToast: ToastSettings = {
    message: 'Unable to add Additional players to game!',
    background: 'variant-filled-warning',
  };

  const addPlayerToCurrentGame = (playerId: string, colorId: string) => {
    let selectedPlayer = availablePlayers.find(x => x.id === playerId)
    let selectedColor = availableColors.find(x => x.id === colorId)
    let colorToAdd = { id: selectedColor?.id, color: selectedColor?.color, playerId: selectedPlayer.id }

    if (currentPlayers.length === 6){
      toastStore.trigger(failureToast);
    }
    else{
      availablePlayers = availablePlayers.filter(x => x.id != playerId)

      // Add Player to current players and selected Colors
      currentPlayers = [...currentPlayers, selectedPlayer]
      selectedColors = [...selectedColors, colorToAdd]
      // Remove players from available players
      availablePlayers = [...availablePlayers]
      availableColors = [...availableColors]

      playerId = "0";
      colorId = "0";
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
    selectedPlayerId = "0";
  }
  const changeDisabledState = (state: boolean, variableName = '' ) => {
    if(variableName === 'colorSelect') {
      colorDisabled = state;
    }
    else if(variableName === 'addPlayer' && selectedColorId !== "0"){
      disabled = false;
    }
    else{
      colorDisabled = false;
      disabled = false;
    }
  };

</script>
<!--Current available players-->
<div class="flex flex-col">
  <h2 class="h2 self-center mb-2">Add Players</h2>
  <select class="select"
          bind:value={selectedPlayerId}
          on:change={() => changeDisabledState(false)}>
    <option value="0" selected>Select Player</option>
    {#each availablePlayers as player}
        <option value={player.id}>{player.name}</option>
      {/each }
  </select>
  <h2 class="h2 self-center mb-2">Meeple Color</h2>
  <select class="select" bind:value={selectedColorId} disabled={ colorDisabled }>
    <option value="0" selected>Select Color</option>
    {#each availableColors as color}
      <option value={color.id}>{color.color}</option>
    {/each }
  </select>
  <button class="btn variant-outline-success mt-2 disabled:variant-outline-warning"
          on:click={addPlayerToCurrentGame}
          {disabled}
  >Add</button>
</div>
<!--Players in the current game-->
<div class="flex flex-col text-center mt-4">
  <h2 class="h2">Current Game</h2>
  <ul class="list">
  {#each currentPlayers as player}
    <li>
      <span class="placeholder-amber-300 placeholder-circle w-16 ml-1"></span>
      <span class="flex-auto">{player.name}</span>
      <span class="flex-auto" >
        <button
                on:click={() => removePlayerFromGame(player.id)}>
          <TrashIcon size="2x" />
        </button>
      </span>
    </li>
    {/each}
  </ul>
</div>
<div class="flex">
  <button class="btn variant-outline-success mt-2 disabled:variant-outline-warning flex-auto" disabled={currentPlayers.length === 0}>Start Game</button>
</div>

