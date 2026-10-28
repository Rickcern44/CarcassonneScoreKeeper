<script lang="ts">
import { SettingsIcon } from "svelte-feather-icons";
import TabBar from "../../components/TabBar.svelte";
</script>

<div class="mx-auto min-h-full max-w-md px-5 pb-32 pt-6">
	<div class="mb-2 flex justify-end">
		<a
			href="/settings"
			class="flex h-11 w-11 items-center justify-center rounded-full text-muted"
			aria-label="Settings"
		>
			<SettingsIcon size="24" />
		</a>
	</div>
	<main>
		<slot />
	</main>
</div>

<TabBar />
