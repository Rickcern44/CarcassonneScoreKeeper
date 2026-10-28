<script lang="ts">
import OfflineBanner from "../../components/OfflineBanner.svelte";
</script>

<div class="mx-auto flex min-h-full max-w-md flex-col px-5 pb-8 pt-6">
	<OfflineBanner />
	<slot />
</div>
