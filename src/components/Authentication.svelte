<script>
import { SignUp } from "@supabase/auth-ui-svelte";
import Login from "./Login.svelte";

export let supabase;
let state = "signIn";
</script>

{#if state === "signIn"}
	<Login />
{/if}

{#if state === "signUp"}
	<SignUp supabaseClient={supabase} />
{/if}

{#if state === "reset"}
	<Login />
{/if}
