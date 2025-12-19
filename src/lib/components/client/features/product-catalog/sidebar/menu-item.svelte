<script lang="ts">
	let {
		title,
		onClick
	}: {
		onClick?: () => void;
		title: string;
	} = $props();
</script>

<button aria-label={title} onclick={() => onClick?.()} class="flex w-full items-center justify-between px-2 text-sm">
	{title}
</button>
