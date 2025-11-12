<script lang="ts" module>
	import type { HTMLLabelAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	export type LabelProps = HTMLLabelAttributes & {
		children?: Snippet;
	};
</script>

<script lang="ts">
	import { cn } from '$lib/utils.js';

	let { children, class: className, ...restProps }: LabelProps = $props();
</script>

<label
	class={cn(
		'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</label>
