<script lang="ts">
	import { getNavigationMenuByLocation, getAllSocialLinks, getContactInfo } from '$lib/remotes/navigation.remote';
	import Image from '$lib/components/common/data-display/asset-image.svelte';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';

	// Fetch navigation data
	const footerMenuPromise = getNavigationMenuByLocation('footer');
	const socialLinksPromise = getAllSocialLinks();
	const contactInfoPromise = getContactInfo();

	// Helper to group menu items by parent
	function groupMenuItemsByParent(items: any[]) {
		return items.reduce<Record<string, any[]>>((acc, item) => {
			if (!item.parent?.title) {
				return acc;
			}

			const key = `${item.parent.order}${item.parent?.title}`;
			if (!acc[key]) {
				acc[key] = [];
			}

			acc[key].push(item);

			return acc;
		}, {});
	}
</script>

<footer class="bg-milky">
	<div class="container mx-auto flex max-w-7xl flex-col gap-4 px-8 py-4">
		<div class="flex flex-col gap-4 md:flex-row-reverse md:justify-between">
			<div class="flex flex-col gap-4 xl:flex-row-reverse xl:items-start">
				<div class="flex items-center gap-8">
					<a href="/" class="flex w-full items-center">
						<img
							src="/logo.png"
							alt="SpiceRoom Logo"
							width="240"
							height="40"
						/>
					</a>
				</div>

				<div class="flex flex-col gap-4">
					{#await contactInfoPromise}
						{#each Array.from({ length: 4 })}
							<Skeleton class="w-full h-5" />
						{/each}
					{:then contactData}
						{#if contactData}
							{#if contactData.phones && contactData.phones.length > 0}
								{#each contactData.phones as phone (phone.id)}
									<a
										href={`tel:${phone.phoneNumber}`}
										class="text-base font-semibold"
									>
										{phone.phoneNumber}
									</a>
								{/each}
							{/if}
							{#if contactData.email}
								<a
									href={`mailto:${contactData.email}`}
									class="text-base font-semibold"
								>
									{contactData.email}
								</a>
							{/if}
						{/if}
					{:catch}
						<p class="text-caption font-normal">Failed to load contact information</p>
					{/await}
				</div>
			</div>
			{#await footerMenuPromise}
				<!-- Loading footer menu -->
			{:then footerMenu}
				{#if footerMenu?.items && footerMenu.items.length > 0}
					<section class="flex flex-col gap-8 md:flex-row md:gap-16">
						{#each Object.entries(groupMenuItemsByParent(footerMenu.items)) as [key, items] (key)}
							<nav class="flex flex-col gap-4">
								<h2 class="text-lg font-semibold">{items[0].parent?.title}</h2>
								<ul class="flex flex-col gap-2">
									{#each items as item (item.id)}
										<li>
											<a class="transition-colors hover:text-primary" href={item.url}>{item.label}</a
											>
										</li>
									{/each}
								</ul>
							</nav>
						{/each}
					</section>
				{/if}
			{:catch}
				<!-- Failed to load footer menu -->
			{/await}
		</div>
		<div class="flex flex-col md:flex-row items-center gap-5 justify-between">
			<div class="flex gap-4">
				{#await socialLinksPromise}
					<!-- Loading social links -->
				{:then socialLinks}
					{#if socialLinks && socialLinks.length > 0}
						{#each socialLinks as social}
							<a
								target="_blank"
								href={social.url}
								class="transition-colors hover:text-primary"
								rel="noopener noreferrer"
								title={social.platform}
							>
								<div class="flex h-6 w-6 xl:h-6 xl:w-6 items-center justify-center">
									{#if social.iconAssetId}
										<Image assetId={social.iconAssetId} thumbnail={false} />
									{:else}
										<!-- Placeholder if no custom icon -->
										<div class="h-full w-full bg-gray-300 rounded"></div>
									{/if}
								</div>
							</a>
						{/each}
					{/if}
				{:catch}
					<!-- Failed to load social links -->
				{/await}
			</div>
			<p class="text-xs text-center md:text-right">©{new Date().getFullYear()} The Spiceroom Shop</p>
		</div>
	</div>
</footer>
