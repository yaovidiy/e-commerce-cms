<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { login } from '$lib/remotes/user.remote';
	import * as m from '$lib/paraglide/messages';
	import { page } from '$app/state';
	import { toast } from 'svelte-sonner';

	// Get redirect URL from query params
	let redirectUrl = $derived(page.url.searchParams.get('redirect') || '');
</script>

<form
	{...login.enhance(async ({ submit, form }) => {
		try {
			await submit();
			form.reset();
		} catch (error) {
			console.error('Login error:', error);
			toast.error((error instanceof Error ? error.message : 'An unknown error occurred during login.'));
		}
	})}
>
	<!-- Hidden redirect field -->
	<input {...login.fields.redirect.as('text')} type="hidden" value={redirectUrl} />
	
	<div class="space-y-4">
		<div class="space-y-2">
			<Label for="username">{m.auth_username()}</Label>
			<Input
				{...login.fields.username.as('text')}
				id="username"
				placeholder={m.auth_username()}
				disabled={!!login.pending}
				required
			/>
			{#each login.fields.username.issues() as issue}
				<p class="text-sm text-red-600 dark:text-red-400">{issue.message}</p>
			{/each}
		</div>

		<div class="space-y-2">
			<Label for="password">{m.auth_password()}</Label>
			<Input
				{...login.fields.password.as('password')}
				id="password"
				placeholder={m.auth_password()}
				disabled={!!login.pending}
				required
			/>
			{#each login.fields.password.issues() as issue}
				<p class="text-sm text-red-600 dark:text-red-400">{issue.message}</p>
			{/each}
		</div>

		<Button type="submit" class="w-full" disabled={!!login.pending}>
			{login.pending ? '...' : m.auth_sign_in()}
		</Button>
	</div>
</form>
