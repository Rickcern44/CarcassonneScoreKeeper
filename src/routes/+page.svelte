<script lang="ts">
  import type { ActionData } from "./$types";
  import "../app.css";
  import Authentication from "../components/Authentication.svelte";

  export let data
  export let form: ActionData

  let {supabase} = data.supabase

</script>
<svelte:head>
  <title>Login</title>
</svelte:head>

<section class="flex container h-2/3 justify-center">
  <div class="flex flex-center self-center">
    <Authentication />
    {#if form}
      <p>{form?.error}</p>
    {/if}

  </div>
</section>


