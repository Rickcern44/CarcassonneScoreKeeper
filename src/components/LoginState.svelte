<script>
  export let data;
</script>
{#if data}
  <p>Logged In</p>
{:else}
  <a href="/auth">Log In</a>
{/if}
