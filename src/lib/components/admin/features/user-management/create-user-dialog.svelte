<script lang="ts">
	import { createUser, getAllUsers } from '$lib/remotes/user.remote';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';
	import * as m from '$lib/paraglide/messages';

	let open = $state(false);

	const RoleLabel = $derived.by(() => {
		const role = createUser.fields.role.value();

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
	<Dialog.Trigger>
		<Button>{m.user_create_user()}</Button>
	</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>{m.user_create_user()}</Dialog.Title>
			<Dialog.Description>{m.user_create_user_description()}</Dialog.Description>
		</Dialog.Header>
		<form
			{...createUser.enhance(({submit, form}) => {
				submit();

                form.reset();

                createUser.action
				open = false;
			})}
			class="space-y-4"
		>
			<div class="space-y-2">
				<Label>{m.auth_username()}</Label>
				<Input {...createUser.fields.username.as('text')} placeholder="john_doe" />
				{#each createUser.fields.username.issues() as issue}
					<p class="text-destructive text-sm">{issue.message}</p>
				{/each}
			</div>

			<div class="space-y-2">
				<Label>{m.auth_email()}</Label>
				<Input
					{...createUser.fields.email.as('text')}
					type="email"
					placeholder="john@example.com"
				/>
				{#each createUser.fields.email.issues() as issue}
					<p class="text-destructive text-sm">{issue.message}</p>
				{/each}
			</div>

			<div class="space-y-2">
				<Label>{m.auth_password()}</Label>
				<Input {...createUser.fields.password.as('password')} placeholder="••••••••" />
				{#each createUser.fields.password.issues() as issue}
					<p class="text-destructive text-sm">{issue.message}</p>
				{/each}
			</div>

			<div class="space-y-2">
				<Label>{m.user_role()}</Label>
				<Select.Root
					{...createUser.fields.role.as('select')}
					type="single"
					onValueChange={(value) => createUser.fields.role.set(value as 'admin' | 'user')}
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
				{#each createUser.fields.role.issues() as issue}
					<p class="text-destructive text-sm">{issue.message}</p>
				{/each}
			</div>

			<div class="flex items-center justify-between space-x-2">
				<Label class="text-sm font-normal">
					{m.user_grant_admin_privileges()}
				</Label>
				<Switch onCheckedChange={(checked) => createUser.fields.isAdmin.set(checked)} />
				<input {...createUser.fields.isAdmin.as('checkbox')} hidden />
			</div>

			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (open = false)}>
					{m.common_cancel()}
				</Button>
				<Button type="submit" disabled={!!createUser.pending}>
					{createUser.pending ? m.common_creating() : m.common_create()}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
