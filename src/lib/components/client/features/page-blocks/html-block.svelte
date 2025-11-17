<script lang="ts">
	let { data } = $props<{ data: Record<string, any> }>();
</script>

<section class="container py-8">
	<div class="max-w-none">
		{@html data.html || ''}
	</div>
</section>
