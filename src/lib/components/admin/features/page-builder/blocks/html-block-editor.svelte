<script lang="ts">
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import * as m from '$lib/paraglide/messages';

	let { data = $bindable({}) } = $props<{ data: Record<string, any> }>();

	// Initialize data with defaults
	$effect(() => {
		if (!data.html) data.html = '';
	});
</script>

<div class="space-y-2">
	<Label for="html">{m.page_block_html()}</Label>
	<Textarea
		id="html"
		bind:value={data.html}
		placeholder="<div>Your custom HTML code here...</div>"
		rows={12}
		class="font-mono text-sm"
	/>
	<p class="text-muted-foreground text-xs">
		Enter custom HTML code. Be careful - invalid HTML can break the page layout. Make sure to test
		your code.
	</p>
</div>
