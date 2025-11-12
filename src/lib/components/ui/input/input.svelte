<script lang="ts" module>
	import type { HTMLInputAttributes } from 'svelte/elements';

	export type InputProps = HTMLInputAttributes & {
		ref?: HTMLInputElement | null;
	};
</script>

<script lang="ts">
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		type,
		value = $bindable(),
		...restProps
	}: InputProps = $props();
</script>

<input
	bind:this={ref}
	{type}
	bind:value
	class={cn(
		'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
		className
	)}
	{...restProps}
/>
