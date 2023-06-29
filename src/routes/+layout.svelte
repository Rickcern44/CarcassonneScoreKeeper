<script lang="ts">
  import '@skeletonlabs/skeleton/themes/theme-rocket.css';
  import '@skeletonlabs/skeleton/styles/skeleton.css';
  import "../app.css";
  import { AppShell } from "@skeletonlabs/skeleton";
  import Header from "../components/Header.svelte";

</script>


<AppShell>
  <svelte:fragment slot="header">
      <Header />
  </svelte:fragment>
  <div class="container mx-auto self-center">
    <slot />
  </div>
</AppShell>


