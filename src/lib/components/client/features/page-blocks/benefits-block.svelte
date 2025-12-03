<script lang="ts">
	import Benefit from '$lib/components/client/features/homepage/benefit.svelte';

	let {
		data
	}: {
		data: {
			benefits?: Array<{
				id: string;
				title?: string;
				description?: string;
				icon?: string;
			}>;
		};
	} = $props();
</script>

<div class="container grid gap-6 py-12 sm:grid-cols-2 lg:grid-cols-3">
	{#each data.benefits || [] as benefit (benefit.id)}
		<Benefit
			title={benefit.title}
			description={benefit.description}
		/>
	{/each}
</div>
