<script lang="ts">
import "../app.css";
import { afterNavigate } from "$app/navigation";

// Client-side navigations never check for a new service worker, so ask for one
// after each, letting a new deployment install during a session.
afterNavigate(() => {
	navigator.serviceWorker?.getRegistration().then((registration) => {
		registration?.update().catch(() => {});
	});
});
</script>

<slot />
