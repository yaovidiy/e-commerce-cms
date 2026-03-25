<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { authClient } from '$lib/auth-client';
	import * as m from '$lib/paraglide/messages';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';

	// Get redirect URL from query params - validate to prevent open redirect
	let rawRedirect = $derived(page.url.searchParams.get('redirect') || '/dashboard');
	let redirectUrl = $derived(
		rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') ? rawRedirect : '/dashboard'
	);

	let username = $state('');
	let password = $state('');
	let pending = $state(false);
	let usernameError = $state('');
	let passwordError = $state('');

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		pending = true;
		usernameError = '';
		passwordError = '';

		try {
			const result = await authClient.signIn.username({
				username,
				password
			});

			if (result.error) {
				passwordError = result.error.message || 'Incorrect username or password';
			} else {
				goto(redirectUrl);
			}
		} catch (error) {
			console.error('Login error:', error);
			toast.error(error instanceof Error ? error.message : 'An unknown error occurred during login.');
		} finally {
			pending = false;
		}
	}
</script>

<form onsubmit={handleSubmit}>
	<div class="space-y-4">
		<div class="space-y-2">
			<Label for="username">{m.auth_username()}</Label>
			<Input
				id="username"
				type="text"
				bind:value={username}
				placeholder={m.auth_username()}
				disabled={pending}
				required
				autocomplete="username"
			/>
			{#if usernameError}
				<p class="text-sm text-red-600 dark:text-red-400">{usernameError}</p>
			{/if}
		</div>

		<div class="space-y-2">
			<Label for="password">{m.auth_password()}</Label>
			<Input
				id="password"
				type="password"
				bind:value={password}
				placeholder={m.auth_password()}
				disabled={pending}
				required
				autocomplete="current-password"
			/>
			{#if passwordError}
				<p class="text-sm text-red-600 dark:text-red-400">{passwordError}</p>
			{/if}
		</div>

		<Button type="submit" class="w-full" disabled={pending}>
			{pending ? '...' : m.auth_sign_in()}
		</Button>
	</div>
</form>
