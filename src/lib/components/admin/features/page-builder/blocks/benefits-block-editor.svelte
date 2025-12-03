<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { X } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';

	let { data = $bindable({}) } = $props<{ data: Record<string, any> }>();

	// Initialize data with defaults
	$effect(() => {
		if (!data.benefits) data.benefits = [];
	});

	function addBenefit() {
		data.benefits = [
			...(data.benefits || []),
			{
				id: crypto.randomUUID(),
				title: '',
				description: '',
				icon: 'Briefcase'
			}
		];
	}

	function removeBenefit(index: number) {
		data.benefits = data.benefits.filter((_: any, i: number) => i !== index);
	}

	function updateBenefit(index: number, field: string, value: string) {
		if (data.benefits[index]) {
			data.benefits[index][field] = value;
			data.benefits = [...data.benefits];
		}
	}

	const iconOptions = [
		'Briefcase',
		'Star',
		'Check',
		'Heart',
		'Zap',
		'Shield',
		'Users',
		'Target'
	];
</script>

<div class="space-y-4">
	<div class="space-y-2">
		<Label>Benefits</Label>
		<p class="text-muted-foreground text-sm">Add benefit items with title, description, and icon</p>
	</div>

	{#if data.benefits && data.benefits.length > 0}
		<div class="grid gap-4">
			{#each data.benefits as benefit, index}
				<div class="space-y-3 rounded-lg border p-4">
					<div class="flex items-center justify-between">
						<span class="text-sm font-medium">Benefit {index + 1}</span>
						<Button
							size="icon-sm"
							variant="destructive"
							onclick={() => removeBenefit(index)}
						>
							<X class="h-3 w-3" />
						</Button>
					</div>

					<div class="space-y-2">
						<Label for={`benefit-title-${index}`} class="text-sm">Title</Label>
						<Input
							id={`benefit-title-${index}`}
							type="text"
							value={benefit.title || ''}
							oninput={(e) => updateBenefit(index, 'title', e.currentTarget.value)}
							placeholder="Enter title"
							class="text-sm"
						/>
					</div>

					<div class="space-y-2">
						<Label for={`benefit-description-${index}`} class="text-sm">Description</Label>
						<Textarea
							id={`benefit-description-${index}`}
							value={benefit.description || ''}
							oninput={(e) => updateBenefit(index, 'description', e.currentTarget.value)}
							placeholder="Enter description"
							rows={2}
							class="text-sm"
						/>
					</div>

					<div class="space-y-2">
						<Label for={`benefit-icon-${index}`} class="text-sm">Icon</Label>
						<select
							id={`benefit-icon-${index}`}
							value={benefit.icon || 'Briefcase'}
							onchange={(e) => updateBenefit(index, 'icon', e.currentTarget.value)}
							class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
						>
							{#each iconOptions as icon}
								<option value={icon}>{icon}</option>
							{/each}
						</select>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<Button size="sm" variant="outline" onclick={addBenefit}>
		Add Benefit
	</Button>
</div>
