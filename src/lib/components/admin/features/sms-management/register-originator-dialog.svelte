<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as m from '$lib/paraglide/messages';
	import { registerOriginator } from '$lib/remotes/sms.remote';

	interface Props {
		open?: boolean;
	}

	let { open = $bindable(false) } = $props();

	// Auto-refresh after form submission
	$effect(() => {
		if (registerOriginator.result) {
			open = false;
			registerOriginator.fields.set({
				senderId: '',
				companyName: '',
				companyType: 'tov',
				subject: '',
				description: '',
				siteUrl: ''
			});
		}
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>{m.sms_register_sender_name?.() || 'Register New Sender Name'}</Dialog.Title>
			<Dialog.Description>
				{m.sms_register_sender_description?.() || 'Register a new sender name with SMS Club for approval'}
			</Dialog.Description>
		</Dialog.Header>

		<form {...registerOriginator} class="space-y-4">
			<!-- Sender ID -->
			<div class="space-y-2">
				<Label for="senderId">{m.sms_sender_id?.() || 'Sender ID (Alphanumeric)'}</Label>
				<Input {...registerOriginator.fields.senderId.as('text')} id="senderId" placeholder="YourBrand" />
				{#each registerOriginator.fields.senderId.issues() as issue}
					<p class="text-destructive text-sm">{issue.message}</p>
				{/each}
			</div>

			<!-- Company Name -->
			<div class="space-y-2">
				<Label for="companyName">{m.sms_company_name?.() || 'Company Name'}</Label>
				<Input {...registerOriginator.fields.companyName.as('text')} id="companyName" placeholder="Your Company" />
				{#each registerOriginator.fields.companyName.issues() as issue}
					<p class="text-destructive text-sm">{issue.message}</p>
				{/each}
			</div>

			<!-- Company Type -->
			<div class="space-y-2">
				<Label for="companyType">{m.sms_company_type?.() || 'Company Type'}</Label>
				<select
					{...registerOriginator.fields.companyType.as('select')}
					id="companyType"
					class="w-full px-3 py-2 border rounded-md bg-background text-foreground"
				>
					<option value="tov">{m.sms_company_type_tov?.() || 'Limited Company (ТОВ)'}</option>
					<option value="fop">{m.sms_company_type_fop?.() || 'Individual Entrepreneur (ФОП)'}</option>
				</select>
				{#each registerOriginator.fields.companyType.issues() as issue}
					<p class="text-destructive text-sm">{issue.message}</p>
				{/each}
			</div>

			<!-- OKPO (for companies) -->
			<div class="space-y-2">
				<Label for="okpo">
					{m.sms_okpo?.() || 'OKPO'} {registerOriginator.fields.companyType.value() !== 'fop' && '*'}
				</Label>
				<Input
					{...registerOriginator.fields.okpo.as('text')}
					id="okpo"
					placeholder="Company registration number"
				/>
				{#each registerOriginator.fields.okpo.issues() as issue}
					<p class="text-destructive text-sm">{issue.message}</p>
				{/each}
			</div>

			<!-- INN (for entrepreneurs) -->
			<div class="space-y-2">
				<Label for="inn">
					{m.sms_inn?.() || 'Tax ID'} {registerOriginator.fields.companyType.value() === 'fop' && '*'}
				</Label>
				<Input
					{...registerOriginator.fields.inn.as('text')}
					id="inn"
					placeholder="Individual tax registration number"
				/>
				{#each registerOriginator.fields.inn.issues() as issue}
					<p class="text-destructive text-sm">{issue.message}</p>
				{/each}
			</div>

			<!-- Subject -->
			<div class="space-y-2">
				<Label for="subject">{m.sms_subject?.() || 'Purpose of Messaging'}</Label>
				<Textarea
					{...registerOriginator.fields.subject.as('text')}
					id="subject"
					placeholder="What will you use this sender name for?"
					class="resize-none"
				/>
				{#each registerOriginator.fields.subject.issues() as issue}
					<p class="text-destructive text-sm">{issue.message}</p>
				{/each}
			</div>

			<!-- Description -->
			<div class="space-y-2">
				<Label for="description">{m.sms_description?.() || 'Company Description'}</Label>
				<Textarea
					{...registerOriginator.fields.description.as('text')}
					id="description"
					placeholder="Describe your company and services..."
					class="resize-none"
				/>
				{#each registerOriginator.fields.description.issues() as issue}
					<p class="text-destructive text-sm">{issue.message}</p>
				{/each}
			</div>

			<!-- Site URL -->
			<div class="space-y-2">
				<Label for="siteUrl">{m.sms_site_url?.() || 'Website URL'}</Label>
				<Input
					{...registerOriginator.fields.siteUrl.as('text')}
					id="siteUrl"
					type="url"
					placeholder="https://yoursite.com"
				/>
				{#each registerOriginator.fields.siteUrl.issues() as issue}
					<p class="text-destructive text-sm">{issue.message}</p>
				{/each}
			</div>

			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (open = false)}>
					{m.common_cancel?.() || 'Cancel'}
				</Button>
				<Button type="submit" disabled={!!registerOriginator.pending}>
					{registerOriginator.pending ? m.common_saving?.() || 'Saving...' : m.sms_register?.() || 'Register'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
