<script lang="ts">
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import * as m from '$lib/paraglide/messages';

	let { data = $bindable({}) } = $props<{ data: Record<string, any> }>();

	// Initialize data with defaults
	$effect(() => {
		if (!data.content) data.content = '';
	});
</script>

<div class="space-y-2">
	<Label for="content">{m.page_block_content()}</Label>
	<Textarea
		id="content"
		bind:value={data.content}
		placeholder="Enter your text content here. You can use HTML for formatting."
		rows={10}
		class="font-mono text-sm"
	/>
	<p class="text-muted-foreground text-xs">
		Supports HTML formatting. Use tags like &lt;p&gt;, &lt;h2&gt;, &lt;strong&gt;, &lt;em&gt;,
		&lt;ul&gt;, &lt;ol&gt;, etc.
	</p>
</div>
