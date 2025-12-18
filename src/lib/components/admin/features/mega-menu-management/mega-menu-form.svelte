<script lang="ts">
	import type { MegaMenu } from '$lib/server/db/schema';
	import MegaMenuCreateForm from './mega-menu-create-form.svelte';
	import MegaMenuEditForm from './mega-menu-edit-form.svelte';

	let { item, onSave } = $props<{
		item?: MegaMenu | null;
		onSave?: (savedItem: MegaMenu) => void;
	}>();
</script>

{#if item}
	<MegaMenuEditForm {item} {onSave} />
{:else}
	<MegaMenuCreateForm {onSave} />
{/if}
