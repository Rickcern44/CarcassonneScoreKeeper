<script>
import { LightSwitch } from "@skeletonlabs/skeleton";
import Button from "../../../components/Button.svelte";
import PageTitle from "../../../components/PageTitle.svelte";
</script>

<svelte:head>
	<title>Settings</title>
</svelte:head>

<PageTitle>Settings</PageTitle>

<div class="mt-4 flex items-center justify-between">
	<p>Dark Mode:</p>
	<LightSwitch />
</div>

<form method="post" action="/?/logout" class="mt-8">
	<Button type="submit" variant="secondary" block>Logout</Button>
</form>
