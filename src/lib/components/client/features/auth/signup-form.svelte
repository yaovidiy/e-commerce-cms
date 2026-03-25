<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { authClient } from '$lib/auth-client';
	import * as m from '$lib/paraglide/messages';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';

	let username = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let pending = $state(false);
	let usernameError = $state('');
	let emailError = $state('');
	let passwordError = $state('');
	let passwordMismatch = $state(false);

	function checkPasswords() {
		passwordMismatch = password !== confirmPassword && confirmPassword.length > 0;
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (passwordMismatch) return;

		pending = true;
		usernameError = '';
		emailError = '';
		passwordError = '';

		try {
			const result = await authClient.signUp.email({
				name: username,
				email,
				password,
				username
			});

			if (result.error) {
				const message = result.error.message || 'Registration failed';
				if (message.toLowerCase().includes('username')) {
					usernameError = message;
				} else if (message.toLowerCase().includes('email')) {
					emailError = message;
				} else {
					passwordError = message;
				}
			} else {
				confirmPassword = '';
				passwordMismatch = false;
				goto('/');
			}
		} catch (error) {
			console.error('Registration error:', error);
			toast.error(error instanceof Error ? error.message : 'An unknown error occurred during registration.');
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
			<Label for="email">{m.auth_email()}</Label>
			<Input
				id="email"
				type="email"
				bind:value={email}
				placeholder={m.auth_email()}
				disabled={pending}
				required
				autocomplete="email"
			/>
			{#if emailError}
				<p class="text-sm text-red-600 dark:text-red-400">{emailError}</p>
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
				oninput={checkPasswords}
				required
				autocomplete="new-password"
			/>
			{#if passwordError}
				<p class="text-sm text-red-600 dark:text-red-400">{passwordError}</p>
			{/if}
		</div>

		<div class="space-y-2">
			<Label for="confirmPassword">{m.auth_confirm_password()}</Label>
			<Input
				id="confirmPassword"
				type="password"
				bind:value={confirmPassword}
				placeholder={m.auth_confirm_password()}
				disabled={pending}
				oninput={checkPasswords}
				required
				autocomplete="new-password"
			/>
			{#if passwordMismatch}
				<p class="text-sm text-red-600 dark:text-red-400">{m.auth_error_passwords_not_match()}</p>
			{/if}
		</div>

		<Button type="submit" class="w-full" disabled={pending || passwordMismatch}>
			{pending ? '...' : m.auth_sign_up()}
		</Button>
	</div>
</form>
