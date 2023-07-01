<script lang="ts">
  import "../app.css";
  import { Auth } from "@supabase/auth-ui-svelte";
  import { ThemeMinimal, ThemeSupa } from "@supabase/auth-ui-shared";

  export let data

</script>
<svelte:head>
  <title>Login</title>
</svelte:head>

<section class="flex container h-2/3 justify-center">
  <div class="row flex-center flex">
    <div class="col-6 form-widget self-center">
      <Auth
        supabaseClient={data.supabase}
        view="sign_in"
        redirectTo={`http://127.0.0.1:5173/auth/callback`}
        showLinks={true}
        appearance={{ theme: ThemeSupa, style: { input: 'color: #fff' } }}
      />
    </div>
  </div>
</section>


