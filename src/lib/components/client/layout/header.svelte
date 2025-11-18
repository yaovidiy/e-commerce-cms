<script lang="ts">
	import { type AvailableLanguageTag, languageTag } from '$lib/paraglide/runtime';
	import { i18n } from '$lib/i18n';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import UserDropdown from '$lib/components/client/widgets/user-dropdown.svelte';
	import { globalState } from '$lib/state/global.svelte';
	import MobileMenu from '$lib/components/client/widgets/mobile-menu.svelte';
	import Megamenu from '$lib/components/client/widgets/mega-menu.svelte';

	import Cart from '$lib/components/client/widgets/cart-popover.svelte';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import Search from '$lib/components/client/widgets/search.svelte';
	import PhoneDropdown from '$lib/components/client/widgets/phone-dropdown.svelte';
	import { onMount } from 'svelte';
	import { getNavigationMenuByLocation } from '$lib/remotes/navigation.remote';

	let desktopHeader = $state<HTMLElement | null>(null);
	const headerMenuPromise = getNavigationMenuByLocation('header');

	function switchToLanguage(newLanguage: AvailableLanguageTag) {
		const canonicalPath = i18n.route(page.url.pathname);
		const localisedPath = i18n.resolveRoute(canonicalPath, newLanguage);
		goto(localisedPath);
	}

	function onScroll() {
		if (window.scrollY > 50 && desktopHeader) {
			desktopHeader.style.top = '0px';
			desktopHeader.classList.add('shadow-md');
		} else {
			if (desktopHeader) {
				desktopHeader.style.top = '56px';
				desktopHeader.classList.remove('shadow-md');
			}
		}
	}

	onMount(() => {
		if (!globalState.isMobile.current) {
			window.addEventListener('scroll', onScroll);
		}
		return () => {
			window.removeEventListener('scroll', onScroll);
		};
	});
</script>

{#if globalState.isMobile.current}
	<header
		class="bg-milky fixed top-0 z-10 flex h-20 w-full items-center justify-between px-8 py-4 md:hidden"
	>
		<a href="/" class="flex h-10 max-w-40 items-center">
			<img src="/logo.png" alt="SpiceRoom Logo" />
		</a>

		<div class="flex gap-4">
			<PhoneDropdown />
			<UserDropdown />
			<Cart />
			<MobileMenu />
		</div>
	</header>
{:else}
	<header class="hidden flex-col items-center justify-between md:flex">
		<div class="items-ceter mx-auto flex w-full max-w-7xl justify-between px-8 py-2">
			<a href="/" class="flex h-10 max-w-40 items-center">
				<img src="/logo.png" alt="SpiceRoom Logo" />
			</a>
			<nav class="flex items-center gap-5">
				{#await headerMenuPromise}
					{#each new Array(5)}
						<Skeleton class="h-5 w-20" />
					{/each}
				{:then menu}
					{#if menu && menu.items && menu.items.length > 0}
						{#each menu.items as item (item.id)}
							<a
								href={item.url}
								class="hover:text-primary transition-colors {page.url.pathname === item.url
									? 'text-primary'
									: ''}"
								target={item.openInNewTab ? '_blank' : '_self'}
							>
								{item.label}
							</a>
						{/each}
					{/if}
				{:catch}
					{#each new Array(5)}
						<Skeleton class="h-5 w-20" />
					{/each}
				{/await}
			</nav>
			<div class="flex items-center gap-4"></div>
		</div>
		<div bind:this={desktopHeader} class="bg-milky fixed top-14 z-10 h-20 w-full transition-all">
			<div class="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-8">
				<Megamenu />
				<div class="w-1/2">
					<Search />
				</div>
				<div class="flex gap-4">
					<PhoneDropdown />
					<UserDropdown />
					<Cart />
				</div>
			</div>
		</div>
	</header>
{/if}
