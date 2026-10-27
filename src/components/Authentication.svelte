<script>
	import Login from './Login.svelte';
	import { SignUp } from '@supabase/auth-ui-svelte';

	export let supabase;
	let state = 'signIn';
</script>

{#if state === 'signIn'}
	<Login />
{/if}

{#if state === 'signUp'}
	<SignUp supabaseClient={supabase} />
{/if}

{#if state === 'reset'}
	<Login />
{/if}
