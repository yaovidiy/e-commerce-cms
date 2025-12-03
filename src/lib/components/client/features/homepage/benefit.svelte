<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Briefcase } from '@lucide/svelte';

	let {
		title = 'Професійність',
		description = 'Ефективність моїх стратегій підтверджується кейсами клієнтів. І постійно проводжу маркетингові дослідження, тому добре знаю ваш ринок.',
		icon
	}: {
		title?: string;
		description?: string;
		icon?: Snippet;
	} = $props();
</script>

<div class="border-primary space-y-4 border p-3">
	<div class="border-primary flex h-16 w-16 items-center justify-center rounded-full border">
		{#if icon}
			{@render icon()}
		{:else}
			<Briefcase size={32} />
		{/if}
	</div>

	<h5 class="h-6 text-xl font-bold">{title}</h5>
	<p class="text-base text-gray-600">{description}</p>
</div>
