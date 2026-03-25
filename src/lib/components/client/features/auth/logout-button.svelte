<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { authClient } from '$lib/auth-client';
	import * as m from '$lib/paraglide/messages';
	import { goto } from '$app/navigation';

	let pending = $state(false);

	async function handleLogout() {
		pending = true;
		try {
			await authClient.signOut();
			goto('/auth/login');
		} finally {
			pending = false;
		}
	}
</script>

<Button onclick={handleLogout} disabled={pending} variant="outline">
	{pending ? '...' : m.auth_logout()}
</Button>
