<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { register } from '$lib/remotes/user.remote';
	import * as m from '$lib/paraglide/messages';
	import { goto } from '$app/navigation';

	let confirmPassword = $state('');
	let passwordMismatch = $state(false);

	function checkPasswords() {
		const password = register.fields.password.value();
		passwordMismatch = password !== confirmPassword && confirmPassword.length > 0;
	}
</script>

<form
	{...register.enhance(async ({ submit, form }) => {
		try {
			await submit();
			confirmPassword = '';
			passwordMismatch = false;
			goto('/');
			form.reset();
		} catch (error) {
			console.error('Registration error:', error);
		}
	})}
>
	<div class="space-y-4">
		<div class="space-y-2">
			<Label for="username">{m.auth_username()}</Label>
			<Input
				{...register.fields.username.as('text')}
				id="username"
				placeholder={m.auth_username()}
				disabled={!!register.pending}
				required
			/>
			{#each register.fields.username.issues() as issue}
				<p class="text-sm text-red-600 dark:text-red-400">{issue.message}</p>
			{/each}
		</div>

		<div class="space-y-2">
			<Label for="email">{m.auth_email()}</Label>
			<Input
				{...register.fields.email.as('email')}
				id="email"
				placeholder={m.auth_email()}
				disabled={!!register.pending}
			/>
			{#each register.fields.email.issues() as issue}
				<p class="text-sm text-red-600 dark:text-red-400">{issue.message}</p>
			{/each}
		</div>

		<div class="space-y-2">
			<Label for="password">{m.auth_password()}</Label>
			<Input
				{...register.fields.password.as('password')}
				id="password"
				placeholder={m.auth_password()}
				disabled={!!register.pending}
				oninput={checkPasswords}
				required
			/>
			{#each register.fields.password.issues() as issue}
				<p class="text-sm text-red-600 dark:text-red-400">{issue.message}</p>
			{/each}
		</div>

		<div class="space-y-2">
			<Label for="confirmPassword">{m.auth_confirm_password()}</Label>
			<Input
				id="confirmPassword"
				type="password"
				bind:value={confirmPassword}
				placeholder={m.auth_confirm_password()}
				disabled={!!register.pending}
				oninput={checkPasswords}
				required
			/>
			{#if passwordMismatch}
				<p class="text-sm text-red-600 dark:text-red-400">{m.auth_error_passwords_not_match()}</p>
			{/if}
		</div>

		<Button type="submit" class="w-full" disabled={!!register.pending || passwordMismatch}>
			{register.pending ? '...' : m.auth_sign_up()}
		</Button>
	</div>
</form>
