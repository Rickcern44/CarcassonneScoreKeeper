<script lang="ts">
import { initializeStores, Toast } from "@skeletonlabs/skeleton";
import "../app.css";

initializeStores();
</script>

<slot />

<Toast />
