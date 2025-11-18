<script lang="ts">
	import { searchAutocomplete } from '$lib/remotes/product.remote';
	import { goto } from '$app/navigation';
	import { Search } from '@lucide/svelte';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import * as m from '$lib/paraglide/messages';

	let searchQuery = $state('');
	let showSuggestions = $state(false);
	let selectedIndex = $state(-1);
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	// Debounced search query for autocomplete
	let debouncedQuery = $state('');

	// Watch for changes to searchQuery and debounce
	$effect(() => {
		if (debounceTimer) clearTimeout(debounceTimer);

		debounceTimer = setTimeout(() => {
			debouncedQuery = searchQuery;
		}, 300);
	});

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (searchQuery.trim()) {
			showSuggestions = false;
			goto(`/search?q=${encodeURIComponent(searchQuery)}`);
		}
	}

	function selectSuggestion(slug: string) {
		showSuggestions = false;
		searchQuery = '';
		goto(`/products/${slug}`);
	}

	function handleKeyDown(e: KeyboardEvent) {
		const suggestions = debouncedQuery.length >= 2 ? [] : []; // Will be populated by query

		if (e.key === 'ArrowDown') {
			e.preventDefault();
			selectedIndex = Math.min(selectedIndex + 1, suggestions.length - 1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			selectedIndex = Math.max(selectedIndex - 1, -1);
		} else if (e.key === 'Enter' && selectedIndex >= 0) {
			e.preventDefault();
			const selected = suggestions[selectedIndex];
			if (selected) {
				selectSuggestion((selected as any).slug);
			}
		} else if (e.key === 'Escape') {
			showSuggestions = false;
			selectedIndex = -1;
		}
	}

	function formatPrice(price: number) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(price / 100);
	}

	// Close suggestions when clicking outside
	function handleClickOutside(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (!target.closest('.search-container')) {
			showSuggestions = false;
		}
	}

	$effect(() => {
		document.addEventListener('click', handleClickOutside);
		return () => document.removeEventListener('click', handleClickOutside);
	});
</script>

<div class="search-container relative w-full max-w-2xl">
	<form onsubmit={handleSubmit} class="relative">
		<Input
			type="text"
			bind:value={searchQuery}
			placeholder={m.search_placeholder()}
			class="pr-12"
			onfocus={() => {
				if (debouncedQuery.length >= 2) showSuggestions = true;
			}}
			onkeydown={handleKeyDown}
		/>
		<Button
			type="submit"
			variant="ghost"
			size="icon"
			class="absolute right-0 top-0 h-full"
			disabled={!searchQuery.trim()}
		>
			<Search class="h-5 w-5" />
		</Button>
	</form>

	{#if showSuggestions && debouncedQuery.length >= 2}
		{#await searchAutocomplete({ query: debouncedQuery })}
			<div
				class="absolute top-full mt-2 w-full rounded-lg border bg-white shadow-lg z-50 p-4"
			>
				<p class="text-sm text-muted-foreground">{m.loading()}</p>
			</div>
		{:then suggestions}
			{#if suggestions.length > 0}
				<div
					class="absolute top-full mt-2 w-full rounded-lg border bg-white shadow-lg z-50 overflow-hidden"
				>
					<ul class="divide-y">
						{#each suggestions as suggestion, index}
							{@const typedSuggestion = suggestion as any}
							{@const images = typeof typedSuggestion.images === 'string' 
								? JSON.parse(typedSuggestion.images) 
								: typedSuggestion.images}
							<li>
								<button
									type="button"
									class="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors text-left"
									class:bg-muted={index === selectedIndex}
									onclick={() => selectSuggestion(typedSuggestion.slug)}
								>
									{#if images && images.length > 0}
										<img
											src={images[0]}
											alt={typedSuggestion.name}
											class="w-12 h-12 object-cover rounded"
										/>
									{:else}
										<div class="w-12 h-12 bg-muted rounded flex items-center justify-center">
											<Search class="h-6 w-6 text-muted-foreground" />
										</div>
									{/if}
									<div class="flex-1 min-w-0">
										<p class="font-medium truncate">{typedSuggestion.name}</p>
										<p class="text-sm text-muted-foreground">
											{formatPrice(typedSuggestion.price)}
										</p>
									</div>
								</button>
							</li>
						{/each}
					</ul>
				</div>
			{:else}
				<div
					class="absolute top-full mt-2 w-full rounded-lg border bg-white shadow-lg z-50 p-4"
				>
					<p class="text-sm text-muted-foreground">
						{m.no_results_found()}
					</p>
				</div>
			{/if}
		{:catch error}
			<div
				class="absolute top-full mt-2 w-full rounded-lg border bg-white shadow-lg z-50 p-4"
			>
				<p class="text-sm text-destructive">
					{m.search_error()}
				</p>
			</div>
		{/await}
	{/if}
</div>
