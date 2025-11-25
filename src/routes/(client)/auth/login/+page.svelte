<script lang="ts">
	import { LoginForm } from '$lib/components/client/features/auth';
	import * as m from '$lib/paraglide/messages';
</script>

<svelte:head>
	<title>{m.auth_login()} - E-commerce CMS</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
	<div class="w-full max-w-md space-y-8">
		<div class="text-center">
			<h2 class="text-3xl font-bold tracking-tight">{m.auth_welcome_back()}</h2>
			<p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
				{m.auth_no_account()}
				<a href="/auth/signup" class="font-medium text-primary hover:underline">
					{m.auth_sign_up()}
				</a>
			</p>
		</div>

		<div class="rounded-lg border bg-card p-8 shadow-sm">
			<LoginForm />
		</div>
	</div>
</div>
