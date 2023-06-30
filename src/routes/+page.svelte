<script lang="ts">
  import "../app.css";

  import { Auth } from "@supabase/auth-ui-svelte";
  import { ThemeMinimal, ThemeSupa } from "@supabase/auth-ui-shared";

  export let data
</script>
<svelte:head>
  <title>Login</title>
</svelte:head>

 <div class="flex">
    <Auth
      supabaseClient={data.supabase}
      view="sign_in"
      redirectTo={`${data.url}/auth/callback`}
      showLinks={true}
      appearance={{ theme: ThemeSupa, class: {container: 'flex w-screen'} }}
    />
</div>



