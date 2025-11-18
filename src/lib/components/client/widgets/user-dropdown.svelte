<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { User as UserIcon } from '@lucide/svelte/icons';
	import { goto } from '$app/navigation';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import { getMyProfile } from '$lib/remotes/profile.remote';
	import { logout } from '$lib/remotes/user.remote';
	import * as m from '$lib/paraglide/messages';

	let open = false;
	const userPromise = getMyProfile();
</script>

<DropdownMenu.Root bind:open>
	<DropdownMenu.Trigger>
		<UserIcon />
		<span class="sr-only">User Dropdown</span>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		{#await userPromise}
			<DropdownMenu.Group>
				<DropdownMenu.GroupHeading>
					<Skeleton class="h-5 w-full" />
				</DropdownMenu.GroupHeading>
			</DropdownMenu.Group>
		{:then user}
			{#if user}
				<DropdownMenu.Group>
					<DropdownMenu.GroupHeading>
						{user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}
					</DropdownMenu.GroupHeading>
					<DropdownMenu.Separator />
					<DropdownMenu.Item
						onclick={() => {
							open = false;
							goto('/dashboard');
						}}>{m.nav_profile?.() || 'Профіль'}</DropdownMenu.Item>
					<DropdownMenu.Item
						onclick={() => {
							open = false;
							goto('/dashboard/settings');
						}}>{m.nav_settings?.() || 'Налаштування'}</DropdownMenu.Item>
					<DropdownMenu.Separator />
					<DropdownMenu.Item
						onclick={async () => {
							open = false;
							await logout();
							goto('/');
						}}
					>
						{m.auth_logout?.() || 'Вийти'}
					</DropdownMenu.Item>
				</DropdownMenu.Group>
			{:else}
				<DropdownMenu.Item
					onclick={() => {
						open = false;
						goto('/auth/login');
					}}>{m.auth_sign_in?.() || 'Увійти'}</DropdownMenu.Item>
			{/if}
		{:catch}
			<DropdownMenu.Group>
				<DropdownMenu.GroupHeading>
					<Skeleton class="h-5 w-full" />
				</DropdownMenu.GroupHeading>
			</DropdownMenu.Group>
		{/await}
	</DropdownMenu.Content>
</DropdownMenu.Root>