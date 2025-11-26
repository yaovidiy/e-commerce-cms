<script lang="ts">
	import { getMyProfile, updateProfile } from '$lib/remotes/profile.remote';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as m from '$lib/paraglide/messages';
	
	// Auto-refresh profile after form submission
	$effect(() => {
		if (updateProfile.result) {
			getMyProfile().refresh();
		}
	});
</script>

<div class="flex flex-col gap-6 px-8">
	<div>
		<h1 class="text-3xl font-bold tracking-tight">{m.profile_title()}</h1>
		<p class="text-muted-foreground mt-1">{m.profile_description()}</p>
	</div>

	{#await getMyProfile()}
		<Card.Root>
			<Card.Content class="py-8">
				<div class="flex items-center justify-center">
					<div class="text-muted-foreground">Loading profile...</div>
				</div>
			</Card.Content>
		</Card.Root>
	{:then profile}
		<Card.Root>
			<Card.Header>
				<Card.Title>{m.profile_title()}</Card.Title>
				<Card.Description>{m.profile_description()}</Card.Description>
			</Card.Header>
			<Card.Content>
				<form {...updateProfile} class="space-y-6">
					<div class="grid gap-6 md:grid-cols-2">
						<div class="space-y-2">
							<Label>
								{m.profile_first_name()}
							</Label>
							<Input
								{...updateProfile.fields.firstName.as('text')}
								value={profile?.firstName || ''}
								placeholder="John"
							/>
							{#each updateProfile.fields.firstName.issues() as issue}
								<p class="text-destructive text-sm">{issue.message}</p>
							{/each}
						</div>

						<div class="space-y-2">
							<Label>
								{m.profile_last_name()}
							</Label>
							<Input
								{...updateProfile.fields.lastName.as('text')}
								value={profile?.lastName || ''}
								placeholder="Doe"
							/>
							{#each updateProfile.fields.lastName.issues() as issue}
								<p class="text-destructive text-sm">{issue.message}</p>
							{/each}
						</div>
					</div>

					<div class="space-y-2">
						<Label>
							{m.auth_email()}
						</Label>
						<Input
							{...updateProfile.fields.email.as('email')}
							value={profile?.email || ''}
							placeholder="john.doe@example.com"
						/>
						{#each updateProfile.fields.email.issues() as issue}
							<p class="text-destructive text-sm">{issue.message}</p>
						{/each}
					</div>

					<div class="space-y-2">
						<Label>
							{m.profile_phone()}
						</Label>
						<Input
							{...updateProfile.fields.phone.as('text')}
							value={profile?.phone || ''}
							placeholder="+380 50 123 4567"
						/>
						{#each updateProfile.fields.phone.issues() as issue}
							<p class="text-destructive text-sm">{issue.message}</p>
						{/each}
					</div>

					<div class="flex items-center space-x-2">
						<Checkbox
							checked={profile?.marketingOptIn || false}
							onCheckedChange={(checked) => {
								updateProfile.fields.marketingOptIn.set(checked as boolean);
							}}
						/>
						<Label class="cursor-pointer font-normal">
							{m.profile_marketing_opt_in()}
						</Label>
					</div>

					{#each updateProfile.fields.allIssues() as issue}
						<p class="text-destructive text-sm">{issue.message}</p>
					{/each}

					<div class="flex justify-end gap-3 pt-4">
						<Button type="submit" disabled={!!updateProfile.pending}>
							{updateProfile.pending ? 'Saving...' : m.common_save()}
						</Button>
					</div>
				</form>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>{m.nav_account()}</Card.Title>
				<Card.Description>Account information</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-3">
				<div>
					<div class="text-muted-foreground text-sm">{m.user_username()}</div>
					<div class="font-medium">{profile?.username}</div>
				</div>
				<div>
					<div class="text-muted-foreground text-sm">{m.user_role()}</div>
					<div class="font-medium capitalize">{profile?.role}</div>
				</div>
				<div>
					<div class="text-muted-foreground text-sm">Member since</div>
					<div class="font-medium">
						{new Date(profile?.createdAt ?? '').toLocaleDateString()}
					</div>
				</div>
				{#if profile?.lastLoginAt}
					<div>
						<div class="text-muted-foreground text-sm">Last login</div>
						<div class="font-medium">
							{new Date(profile?.lastLoginAt ?? '').toLocaleString()}
						</div>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	{:catch error}
		<Card.Root>
			<Card.Content class="py-8">
				<div class="flex items-center justify-center">
					<div class="text-destructive">Error loading profile: {error.message}</div>
				</div>
			</Card.Content>
		</Card.Root>
	{/await}
</div>
