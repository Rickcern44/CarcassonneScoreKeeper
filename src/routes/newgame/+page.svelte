<script lang="ts">
  import { onMount } from "svelte";
  import {TrashIcon} from 'svelte-feather-icons'
  import type { ToastSettings } from "@skeletonlabs/skeleton";
  import { removePlayerFromGame } from '$lib/services/newGameService'


  // props
  export let data;
  let disabled = true;
  let colorDisabled = true;
  // variables
  let availablePlayers = [];
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


  removePlayerFromGame(selectedPlayerId, availablePlayers, currentPlayers)
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

