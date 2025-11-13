<script lang="ts">
	import { deleteUser, getAllUsers } from '$lib/remotes/user.remote';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as m from '$lib/paraglide/messages';

	let { user, open = $bindable(false) } = $props<{
		user: {
			id: string;
			username: string;
		};
		open?: boolean;
	}>();

	// Watch for successful deletion
	$effect(() => {
		if (deleteUser.result) {
			// Close dialog on success
			open = false;
			// Refresh user list
			getAllUsers().refresh();
		}
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>{m.user_delete_user()}</Dialog.Title>
			<Dialog.Description>{m.user_delete_user_description()}</Dialog.Description>
		</Dialog.Header>
		<form {...deleteUser} class="space-y-4">
			<input type="hidden" name="id" value={user.id} />

			<p class="text-sm">
				{m.user_delete_confirmation({ username: user.username })}
			</p>

			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (open = false)}>
					{m.common_cancel()}
				</Button>
				<Button type="submit" variant="destructive" disabled={!!deleteUser.pending}>
					{deleteUser.pending ? m.common_deleting() : m.common_delete()}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
