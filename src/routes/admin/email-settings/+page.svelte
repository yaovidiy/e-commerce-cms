<script lang="ts">
	import { getEmailSettings, updateEmailSettings, sendTestEmail } from '$lib/remotes/email.remote';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Card from '$lib/components/ui/card';
	import * as Switch from '$lib/components/ui/switch';
	import { Mail, Send, CheckCircle, XCircle } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';
	import { watch } from 'runed';
	import { toast } from 'svelte-sonner';

	let testResult = $state<{ success: boolean; message: string; messageId?: string } | null>(null);

	// Auto-close test result after 5 seconds
	watch(
		() => testResult,
		() => {
			if (testResult) {
				const timeout = setTimeout(() => {
					testResult = null;
				}, 60000);
				return () => clearTimeout(timeout);
			}
		}
	);

	// Watch for test email submission success
	watch(
		() => sendTestEmail.result,
		() => {
			if (sendTestEmail.result) {
				testResult = sendTestEmail.result;
			}
		}
	);

	// Watch for form submission success
	watch(
		() => updateEmailSettings.result,
		() => {
			if (updateEmailSettings.result) {
				// Show success message
				toast.success(m.email_settings_saved_success());
			}
		}
	);

	// Fetch email settings query
	const emailSettingsQuery = getEmailSettings();

	// Pre-populate form with loaded settings using watch
	watch(
		() => emailSettingsQuery.current,
		() => {
			if (emailSettingsQuery.current) {
				const settings = emailSettingsQuery.current;
				updateEmailSettings.fields.set({
					fromEmail: settings.fromEmail || '',
					fromName: settings.fromName || '',
					replyToEmail: settings.replyToEmail || '',
					enableOrderConfirmation: settings.enableOrderConfirmation ?? true,
					enableOrderShipped: settings.enableOrderShipped ?? true,
					enableOrderDelivered: settings.enableOrderDelivered ?? true,
					enableOrderCancelled: settings.enableOrderCancelled ?? true,
					enablePasswordReset: settings.enablePasswordReset ?? true,
					enableWelcome: settings.enableWelcome ?? true
				});
			}
		}
	);
</script>

<div class="container mx-auto py-6">
	<!-- Header -->
	<div class="mb-6">
		<h1 class="text-3xl font-bold">{m.admin_email_settings()}</h1>
		<p class="text-muted-foreground">{m.email_settings_description()}</p>
	</div>

	{#await getEmailSettings()}
		<Card.Root>
			<Card.Content class="pt-6">
				<p class="text-muted-foreground">{m.loading()}</p>
			</Card.Content>
		</Card.Root>
	{:then settings}
		<form {...updateEmailSettings}>
			<div class="grid gap-6">
				<!-- Email Configuration -->
				<Card.Root>
					<Card.Header>
						<Card.Title>{m.email_settings_configuration()}</Card.Title>
						<Card.Description>{m.email_settings_configuration_description()}</Card.Description>
					</Card.Header>
					<Card.Content>
						<div class="space-y-4">
							<div class="grid gap-4 md:grid-cols-2">
								<div>
									<Label>{m.email_settings_from_email()} *</Label>
									<Input {...updateEmailSettings.fields.fromEmail.as('email')} />
									{#each updateEmailSettings.fields.fromEmail.issues() as issue}
										<p class="text-destructive mt-1 text-sm">{issue.message}</p>
									{/each}
									<p class="text-muted-foreground mt-1 text-xs">
										{m.email_settings_from_email_help()}
									</p>
								</div>

								<div>
									<Label>{m.email_settings_from_name()} *</Label>
									<Input {...updateEmailSettings.fields.fromName.as('text')} />
									{#each updateEmailSettings.fields.fromName.issues() as issue}
										<p class="text-destructive mt-1 text-sm">{issue.message}</p>
									{/each}
								</div>
							</div>

							<div>
								<Label>{m.email_settings_reply_to_email()}</Label>
								<Input {...updateEmailSettings.fields.replyToEmail.as('email')} />
								{#each updateEmailSettings.fields.replyToEmail.issues() as issue}
									<p class="text-destructive mt-1 text-sm">{issue.message}</p>
								{/each}
								<p class="text-muted-foreground mt-1 text-xs">
									{m.email_settings_reply_to_email_help()}
								</p>
							</div>
						</div>
					</Card.Content>
				</Card.Root>

				<!-- Email Toggles -->
				<Card.Root>
					<Card.Header>
						<Card.Title>{m.email_settings_notifications_title()}</Card.Title>
						<Card.Description>{m.email_settings_notifications_description()}</Card.Description>
					</Card.Header>
					<Card.Content>
						<div class="space-y-4">
							<div class="flex items-center justify-between">
								<div class="space-y-0.5">
									<Label>{m.email_settings_order_confirmation()}</Label>
									<p class="text-muted-foreground text-sm">
										{m.email_settings_order_confirmation_description()}
									</p>
								</div>
								<input
									{...updateEmailSettings.fields.enableOrderConfirmation.as('checkbox')}
									class="sr-only"
								/>
								<Switch.Root
									checked={updateEmailSettings.fields.enableOrderConfirmation.value()}
									onCheckedChange={(checked) =>
										updateEmailSettings.fields.enableOrderConfirmation.set(checked)}
								/>
							</div>

							<div class="flex items-center justify-between">
								<div class="space-y-0.5">
									<Label>{m.email_settings_order_shipped()}</Label>
									<p class="text-muted-foreground text-sm">
										{m.email_settings_order_shipped_description()}
									</p>
								</div>
								<input
									{...updateEmailSettings.fields.enableOrderShipped.as('checkbox')}
									class="sr-only"
								/>
								<Switch.Root
									checked={updateEmailSettings.fields.enableOrderShipped.value()}
									onCheckedChange={(checked) =>
										updateEmailSettings.fields.enableOrderShipped.set(checked)}
								/>
							</div>

							<div class="flex items-center justify-between">
								<div class="space-y-0.5">
									<Label>{m.email_settings_order_delivered()}</Label>
									<p class="text-muted-foreground text-sm">
										{m.email_settings_order_delivered_description()}
									</p>
								</div>
								<input
									{...updateEmailSettings.fields.enableOrderDelivered.as('checkbox')}
									class="sr-only"
								/>
								<Switch.Root
									checked={updateEmailSettings.fields.enableOrderDelivered.value()}
									onCheckedChange={(checked) =>
										updateEmailSettings.fields.enableOrderDelivered.set(checked)}
								/>
							</div>

							<div class="flex items-center justify-between">
								<div class="space-y-0.5">
									<Label>{m.email_settings_order_cancelled()}</Label>
									<p class="text-muted-foreground text-sm">
										{m.email_settings_order_cancelled_description()}
									</p>
								</div>
								<input
									{...updateEmailSettings.fields.enableOrderCancelled.as('checkbox')}
									class="sr-only"
								/>
								<Switch.Root
									checked={updateEmailSettings.fields.enableOrderCancelled.value()}
									onCheckedChange={(checked) =>
										updateEmailSettings.fields.enableOrderCancelled.set(checked)}
								/>
							</div>

							<div class="flex items-center justify-between">
								<div class="space-y-0.5">
									<Label>{m.email_settings_password_reset()}</Label>
									<p class="text-muted-foreground text-sm">
										{m.email_settings_password_reset_description()}
									</p>
								</div>
								<input
									{...updateEmailSettings.fields.enablePasswordReset.as('checkbox')}
									class="sr-only"
								/>
								<Switch.Root
									checked={updateEmailSettings.fields.enablePasswordReset.value()}
									onCheckedChange={(checked) =>
										updateEmailSettings.fields.enablePasswordReset.set(checked)}
								/>
							</div>

							<div class="flex items-center justify-between">
								<div class="space-y-0.5">
									<Label>{m.email_settings_welcome_email()}</Label>
									<p class="text-muted-foreground text-sm">
										{m.email_settings_welcome_email_description()}
									</p>
								</div>
								<input
									{...updateEmailSettings.fields.enableWelcome.as('checkbox')}
									class="sr-only"
								/>
								<Switch.Root
									checked={updateEmailSettings.fields.enableWelcome.value()}
									onCheckedChange={(checked) =>
										updateEmailSettings.fields.enableWelcome.set(checked)}
								/>
							</div>
						</div>
					</Card.Content>
				</Card.Root>

				<!-- Save Button -->
				<div class="flex justify-end">
					<Button type="submit" disabled={!!updateEmailSettings.pending}>
						{updateEmailSettings.pending ? m.saving() : m.email_settings_save_all()}
					</Button>
				</div>
			</div>
		</form>

		<div class="mt-6">
			<!-- Test Email -->
			<Card.Root>
				<Card.Header>
					<Card.Title>{m.email_settings_test_delivery()}</Card.Title>
					<Card.Description>{m.email_settings_test_delivery_description()}</Card.Description>
				</Card.Header>
				<Card.Content>
					<form {...sendTestEmail} class="space-y-4">
						<div>
							<Label>{m.email_settings_test_email_address()}</Label>
							<div class="flex gap-2">
								<Input
									{...sendTestEmail.fields.toEmail.as('email')}
									placeholder="test@example.com"
									class="flex-1"
								/>
								<Button type="submit" disabled={!!sendTestEmail.pending}>
									<Send class="mr-2 h-4 w-4" />
									{sendTestEmail.pending ? m.sending() : m.email_settings_send_test()}
								</Button>
							</div>
							{#each sendTestEmail.fields.toEmail.issues() as issue}
								<p class="text-destructive mt-1 text-sm">{issue.message}</p>
							{/each}
						</div>

						{#if testResult}
							<div
								class={`flex items-start gap-2 rounded-lg p-4 ${
									testResult.success
										? 'bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100'
										: 'bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100'
								}`}
							>
								{#if testResult.success}
									<CheckCircle class="mt-0.5 h-5 w-5" />
								{:else}
									<XCircle class="mt-0.5 h-5 w-5" />
								{/if}
								<div>
									<p class="font-medium">
										{testResult.success ? m.email_settings_success() : m.email_settings_failed()}
									</p>
									<p class="text-sm">{testResult.message}</p>
								</div>
								{#if testResult.messageId}
									<p class="ml-auto font-mono text-xs">{testResult.messageId}</p>
								{/if}
							</div>
						{/if}

						<div class="bg-muted rounded-lg p-4">
							<h4 class="mb-2 flex items-center gap-2 font-medium">
								<Mail class="h-4 w-4" />
								{m.email_settings_configuration_status()}
							</h4>
							<dl class="space-y-2 text-sm">
								<div class="flex justify-between">
									<dt class="text-muted-foreground">{m.email_settings_from_email()}:</dt>
									<dd class="font-mono text-xs">{settings.fromEmail}</dd>
								</div>
								<div class="flex justify-between">
									<dt class="text-muted-foreground">{m.email_settings_provider()}:</dt>
									<dd>{settings.provider || 'Resend'}</dd>
								</div>
							</dl>
						</div>

						<p class="text-muted-foreground text-sm">
							<strong>{m.email_settings_note()}:</strong>
							{m.email_settings_verify_domain_note()}
							<a
								href="https://resend.com/domains"
								target="_blank"
								class="text-primary hover:underline">resend.com/domains</a
							>
							{m.email_settings_to_verify()}.
						</p>
					</form>
				</Card.Content>
			</Card.Root>
		</div>
	{:catch error}
		<Card.Root>
			<Card.Content class="pt-6">
				<p class="text-destructive">{m.email_settings_error_loading()}: {error.message}</p>
			</Card.Content>
		</Card.Root>
	{/await}
</div>
