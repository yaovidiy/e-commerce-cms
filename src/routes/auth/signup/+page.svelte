<script lang="ts">
	import { SignupForm } from '$lib/components/client/features/auth';
	import * as m from '$lib/paraglide/messages';
</script>

<svelte:head>
	<title>{m.auth_signup()} - E-commerce CMS</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
	<div class="w-full max-w-md space-y-8">
		<div class="text-center">
			<h2 class="text-3xl font-bold tracking-tight">{m.auth_create_account()}</h2>
			<p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
				{m.auth_have_account()}
				<a href="/auth/login" class="font-medium text-primary hover:underline">
					{m.auth_sign_in()}
				</a>
			</p>
		</div>

		<div class="rounded-lg border bg-card p-8 shadow-sm">
			<SignupForm />
		</div>
	</div>
</div>
