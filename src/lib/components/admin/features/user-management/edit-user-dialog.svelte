<script lang="ts">
	import { updateUser, getAllUsers } from '$lib/remotes/user.remote';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';
	import * as m from '$lib/paraglide/messages';

	let {
		user,
		open = $bindable(false)
	}: {
		user: {
			id: string;
			username: string;
			email: string | null;
			role: string;
			isAdmin: boolean;
		};
		open?: boolean;
	} = $props();

	$effect(() => {
		// Reset form fields when dialog opens
		if (open) {
			updateUser.fields.role.set(user.role as 'admin' | 'user');
			updateUser.fields.isAdmin.set(user.isAdmin);
		}
	});

	const RoleLabel = $derived.by(() => {
		const role = updateUser.fields.role.value();

		if (role === 'admin') {
			return m.user_role_admin();
		} else if (role === 'user') {
			return m.user_role_user();
		} else {
			return m.user_role();
		}
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>{m.user_edit_user()}</Dialog.Title>
			<Dialog.Description>{m.user_edit_user_description()}</Dialog.Description>
		</Dialog.Header>
		<form
			{...updateUser.enhance(({ form, submit }) => {
				submit();

				open = false;
			})}
			class="space-y-4"
		>
			<input {...updateUser.fields.id.as('hidden', user.id)} />

			<div class="space-y-2">
				<Label>{m.auth_username()}</Label>
				<Input
					{...updateUser.fields.username.as('text')}
					value={user.username}
					placeholder="john_doe"
				/>
				{#each updateUser.fields.username.issues() as issue}
					<p class="text-destructive text-sm">{issue.message}</p>
				{/each}
			</div>

			<div class="space-y-2">
				<Label>{m.auth_email()}</Label>
				<Input
					{...updateUser.fields.email.as('email')}
					value={user.email || ''}
					placeholder="john@example.com"
				/>
				{#each updateUser.fields.email.issues() as issue}
					<p class="text-destructive text-sm">{issue.message}</p>
				{/each}
			</div>

			<div class="space-y-2">
				<Label>{m.user_role()}</Label>
				<Select.Root
					{...updateUser.fields.role.as('select')}
					value={user.role}
					type="single"
					onValueChange={(value) => updateUser.fields.role.set(value as 'admin' | 'user')}
				>
					<Select.Trigger>
						{RoleLabel}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="user" label={m.user_role_user()}>
							{m.user_role_user()}
						</Select.Item>
						<Select.Item value="admin" label={m.user_role_admin()}>
							{m.user_role_admin()}
						</Select.Item>
					</Select.Content>
				</Select.Root>
				{#each updateUser.fields.role.issues() as issue}
					<p class="text-destructive text-sm">{issue.message}</p>
				{/each}
			</div>

			<div class="flex items-center justify-between space-x-2">
				<Label class="text-sm font-normal">
					{m.user_grant_admin_privileges()}
				</Label>
				<Switch
					onCheckedChange={(checked) => updateUser.fields.isAdmin.set(checked)}
					checked={updateUser.fields.isAdmin.value()}
				/>
				<input {...updateUser.fields.isAdmin.as('checkbox')} hidden />
			</div>

			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (open = false)}>
					{m.common_cancel()}
				</Button>
				<Button type="submit" disabled={!!updateUser.pending}>
					{updateUser.pending ? m.common_saving() : m.common_save()}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
