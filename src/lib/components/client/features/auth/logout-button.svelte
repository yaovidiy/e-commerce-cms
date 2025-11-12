<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { logout } from '$lib/remotes/user.remote';
	import * as m from '$lib/paraglide/messages';
</script>

<form {...logout}>
	<Button type="submit" disabled={!!logout.pending} variant="outline">
		{logout.pending ? '...' : m.auth_logout()}
	</Button>
</form>
