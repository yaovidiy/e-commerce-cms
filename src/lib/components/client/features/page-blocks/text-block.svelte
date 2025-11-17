<script lang="ts">
	let { data } = $props<{ data: Record<string, any> }>();
</script>

<section class="container py-8">
	<div class="prose prose-lg max-w-none">
		{@html data.content || ''}
	</div>
</section>
