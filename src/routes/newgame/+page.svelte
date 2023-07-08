<script lang="ts">
  import { onMount } from "svelte";
  import {TrashIcon} from 'svelte-feather-icons'
  import type { ToastSettings } from "@skeletonlabs/skeleton";
  import {addPlayerToGame, removePlayerFromGame} from '$lib/services/newGameService'
  import type {Player} from "../../types/player.type";
  import type {GameColor} from "../../types/enums/gamecolor.enum";
  import {GameColor as GameColors} from "../../types/enums/gamecolor.enum";
  import type {SelectOption} from "../../types/selectOption.type";
  import mapEnumToSelect from "$lib/helpers/enumHelpers";


  // props
  export let data;
  let availableColors: Array<SelectOption> = mapEnumToSelect(GameColors)
  let disabled = true;
  let colorDisabled = true;
  // variables
  let availablePlayers: Array<Player> = [];
  let currentPlayers: Array<Player> = [];

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
  const successToast: ToastSettings = {
    message: 'Unable to add Additional players to game!',
    background: 'variant-filled-warning',
  };

  const addPlayer = () => {
    let {current, available, success} = addPlayerToGame(selectedPlayerId, selectedColorId as unknown as GameColor, availablePlayers,currentPlayers)

    availablePlayers = available;
    currentPlayers = current;

    selectedPlayerId = "0";
    selectedColorId = "0"
  }
  const removePlayer = () => {
    console.log('Remove Player from game')
  }

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
      <option value={color.value}>{color.name}</option>
    {/each }
  </select>
  <button class="btn variant-outline-success mt-2 disabled:variant-outline-warning"
          on:click={addPlayer}
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
                on:click={() => removePlayer}>
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

