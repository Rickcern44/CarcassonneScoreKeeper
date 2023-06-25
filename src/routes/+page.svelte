<script>
  import { env } from '$env/dynamic/public'
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<a href="/test">To Test</a>
<p>{env.PUBLIC_TEST_VAR}</p>
