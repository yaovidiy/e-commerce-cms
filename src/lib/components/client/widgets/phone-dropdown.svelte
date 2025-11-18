<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Phone } from '@lucide/svelte/icons';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import { getAllContactPhones } from '$lib/remotes/navigation.remote';

	const phonesPromise = getAllContactPhones();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		<span class="sr-only">Phone Dropdown Menu</span>
		<Phone />
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		{#await phonesPromise}
			<DropdownMenu.Item>
				<Skeleton class="h-6 w-full" />
			</DropdownMenu.Item>
		{:then phones}
			{#if phones && phones.length > 0}
				{#each phones as phone}
					<DropdownMenu.Item>
						<a href={`tel:${phone.phoneNumber}`} class="block px-4 py-2">
							<span>{phone.phoneNumber}</span>
						</a>
					</DropdownMenu.Item>
				{/each}
			{:else}
				<DropdownMenu.Item>
					<span class="block px-4 py-2 text-muted-foreground">No phone numbers</span>
				</DropdownMenu.Item>
			{/if}
		{:catch}
			<DropdownMenu.Item>
				<Skeleton class="h-6 w-full" />
			</DropdownMenu.Item>
		{/await}
	</DropdownMenu.Content>
</DropdownMenu.Root>