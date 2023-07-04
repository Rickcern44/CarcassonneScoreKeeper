<script>
  import Login from "./Login.svelte";
  import { SignUp } from "@supabase/auth-ui-svelte";

  let state = 'signIn'
</script>

{#if state === 'signIn'}
  <Login />
{/if}

{#if state === 'signUp'}
  <SignUp />
{/if}

{#if state === 'reset'}
  <Login />
{/if}
