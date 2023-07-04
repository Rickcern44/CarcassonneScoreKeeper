<script>
  import { LightSwitch, modeCurrent } from "@skeletonlabs/skeleton";

  export let data
  let darkMode = $modeCurrent

  async function getCurrentState(){
    darkMode = $modeCurrent;
  }
</script>

<div class="flex flex-col mt-2">
  <div class="text-center">
    <h1 class="h1">Settings</h1>
  </div>
  <div class="flex flex-auto">
    <div class="flex w-1/2 text-center justify-center">
      <p>Dark Mode:</p>
    </div>
    <div class="flex w-1/2 text-center justify-center">
      <LightSwitch on:click={getCurrentState}/>
    </div>
  </div>
</div>
