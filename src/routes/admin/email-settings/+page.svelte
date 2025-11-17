<script lang="ts">
	import { getEmailSettings, updateEmailSettings, sendTestEmail } from '$lib/remotes/email.remote';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Card from '$lib/components/ui/card';
	import * as Switch from '$lib/components/ui/switch';
	import { Mail, Send, CheckCircle, XCircle } from '@lucide/svelte';

	let testResult = $state<{ success: boolean; message: string } | null>(null);

	// Auto-close test result after 5 seconds
	$effect(() => {
		if (testResult) {
			const timeout = setTimeout(() => {
				testResult = null;
			}, 5000);
			return () => clearTimeout(timeout);
		}
	});

	// Watch for test email submission success
	$effect(() => {
		if (sendTestEmail.result) {
			testResult = sendTestEmail.result;
		}
	});

	// Watch for form submission success
	$effect(() => {
		if (updateEmailSettings.result) {
			// Show success message
			alert('Email settings saved successfully!');
		}
	});
</script>

<div class="container mx-auto py-6">
	<!-- Header -->
	<div class="mb-6">
		<h1 class="text-3xl font-bold">Email Settings</h1>
		<p class="text-muted-foreground">Configure email notifications and test delivery</p>
	</div>

	{#await getEmailSettings()}
		<Card.Root>
			<Card.Content class="pt-6">
				<p class="text-muted-foreground">Loading settings...</p>
			</Card.Content>
		</Card.Root>
	{:then settings}
		<form {...updateEmailSettings}>
			<div class="grid gap-6">
				<!-- Email Configuration -->
				<Card.Root>
					<Card.Header>
						<Card.Title>Email Configuration</Card.Title>
						<Card.Description>Configure the sender information for outgoing emails</Card.Description>
					</Card.Header>
					<Card.Content>
						<div class="space-y-4">
							<div class="grid md:grid-cols-2 gap-4">
								<div>
									<Label>From Email *</Label>
									<Input {...updateEmailSettings.fields.fromEmail.as('email')} />
									{#each updateEmailSettings.fields.fromEmail.issues() as issue}
										<p class="text-destructive text-sm mt-1">{issue.message}</p>
									{/each}
									<p class="text-muted-foreground text-xs mt-1">
										Must be a verified domain in Resend
									</p>
								</div>

								<div>
									<Label>From Name *</Label>
									<Input {...updateEmailSettings.fields.fromName.as('text')} />
									{#each updateEmailSettings.fields.fromName.issues() as issue}
										<p class="text-destructive text-sm mt-1">{issue.message}</p>
									{/each}
								</div>
							</div>

							<div>
								<Label>Reply-To Email (Optional)</Label>
								<Input {...updateEmailSettings.fields.replyToEmail.as('email')} />
								{#each updateEmailSettings.fields.replyToEmail.issues() as issue}
									<p class="text-destructive text-sm mt-1">{issue.message}</p>
								{/each}
								<p class="text-muted-foreground text-xs mt-1">
									Customers will reply to this email if different from sender
								</p>
							</div>
						</div>
					</Card.Content>
				</Card.Root>

				<!-- Email Toggles -->
				<Card.Root>
					<Card.Header>
						<Card.Title>Email Notifications</Card.Title>
						<Card.Description>Enable or disable specific email types</Card.Description>
					</Card.Header>
					<Card.Content>
						<div class="space-y-4">
						<div class="space-y-4">
							<div class="flex items-center justify-between">
								<div class="space-y-0.5">
									<Label>Order Confirmation</Label>
									<p class="text-sm text-muted-foreground">
										Sent after successful payment
									</p>
								</div>
								<input {...updateEmailSettings.fields.enableOrderConfirmation.as('checkbox')} class="sr-only" />
								<Switch.Root
									checked={updateEmailSettings.fields.enableOrderConfirmation.value()}
									onCheckedChange={(checked) => updateEmailSettings.fields.enableOrderConfirmation.set(checked)}
								/>
							</div>

							<div class="flex items-center justify-between">
								<div class="space-y-0.5">
									<Label>Order Shipped</Label>
									<p class="text-sm text-muted-foreground">
										Sent when order status changes to shipped
									</p>
								</div>
								<input {...updateEmailSettings.fields.enableOrderShipped.as('checkbox')} class="sr-only" />
								<Switch.Root
									checked={updateEmailSettings.fields.enableOrderShipped.value()}
									onCheckedChange={(checked) => updateEmailSettings.fields.enableOrderShipped.set(checked)}
								/>
							</div>

							<div class="flex items-center justify-between">
								<div class="space-y-0.5">
									<Label>Order Delivered</Label>
									<p class="text-sm text-muted-foreground">
										Sent when order status changes to delivered
									</p>
								</div>
								<input {...updateEmailSettings.fields.enableOrderDelivered.as('checkbox')} class="sr-only" />
								<Switch.Root
									checked={updateEmailSettings.fields.enableOrderDelivered.value()}
									onCheckedChange={(checked) => updateEmailSettings.fields.enableOrderDelivered.set(checked)}
								/>
							</div>

							<div class="flex items-center justify-between">
								<div class="space-y-0.5">
									<Label>Order Cancelled</Label>
									<p class="text-sm text-muted-foreground">
										Sent when an order is cancelled
									</p>
								</div>
								<input {...updateEmailSettings.fields.enableOrderCancelled.as('checkbox')} class="sr-only" />
								<Switch.Root
									checked={updateEmailSettings.fields.enableOrderCancelled.value()}
									onCheckedChange={(checked) => updateEmailSettings.fields.enableOrderCancelled.set(checked)}
								/>
							</div>

							<div class="flex items-center justify-between">
								<div class="space-y-0.5">
									<Label>Password Reset</Label>
									<p class="text-sm text-muted-foreground">
										Sent when user requests password reset
									</p>
								</div>
								<input {...updateEmailSettings.fields.enablePasswordReset.as('checkbox')} class="sr-only" />
								<Switch.Root
									checked={updateEmailSettings.fields.enablePasswordReset.value()}
									onCheckedChange={(checked) => updateEmailSettings.fields.enablePasswordReset.set(checked)}
								/>
							</div>

							<div class="flex items-center justify-between">
								<div class="space-y-0.5">
									<Label>Welcome Email</Label>
									<p class="text-sm text-muted-foreground">
										Sent when new user registers
									</p>
								</div>
								<input {...updateEmailSettings.fields.enableWelcome.as('checkbox')} class="sr-only" />
								<Switch.Root
									checked={updateEmailSettings.fields.enableWelcome.value()}
									onCheckedChange={(checked) => updateEmailSettings.fields.enableWelcome.set(checked)}
								/>
							</div>
						</div>
					</Card.Content>
				</Card.Root>

				<!-- Save Button -->
				<div class="flex justify-end">
					<Button type="submit" disabled={!!updateEmailSettings.pending}>
						{updateEmailSettings.pending ? 'Saving...' : 'Save All Settings'}
					</Button>
				</div>
			</div>
		</form>

		<div class="mt-6">
			<!-- Test Email -->
			<Card.Root>
				<Card.Header>
					<Card.Title>Test Email Delivery</Card.Title>
					<Card.Description>Send a test email to verify configuration</Card.Description>
				</Card.Header>
				<Card.Content>
					<form {...sendTestEmail} class="space-y-4">
						<div>
							<Label>Test Email Address</Label>
							<div class="flex gap-2">
								<Input
									{...sendTestEmail.fields.toEmail.as('email')}
									placeholder="test@example.com"
									class="flex-1"
								/>
								<Button type="submit" disabled={!!sendTestEmail.pending}>
									<Send class="h-4 w-4 mr-2" />
									{sendTestEmail.pending ? 'Sending...' : 'Send Test'}
								</Button>
							</div>
							{#each sendTestEmail.fields.toEmail.issues() as issue}
								<p class="text-destructive text-sm mt-1">{issue.message}</p>
							{/each}
						</div>

						{#if testResult}
							<div class={`flex items-start gap-2 p-4 rounded-lg ${
								testResult.success 
									? 'bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100' 
									: 'bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100'
							}`}>
								{#if testResult.success}
									<CheckCircle class="h-5 w-5 mt-0.5" />
								{:else}
									<XCircle class="h-5 w-5 mt-0.5" />
								{/if}
								<div>
									<p class="font-medium">
										{testResult.success ? 'Success!' : 'Failed'}
									</p>
									<p class="text-sm">{testResult.message}</p>
								</div>
							</div>
						{/if}

						<div class="bg-muted p-4 rounded-lg">
							<h4 class="font-medium mb-2 flex items-center gap-2">
								<Mail class="h-4 w-4" />
								Configuration Status
							</h4>
							<dl class="space-y-2 text-sm">
								<div class="flex justify-between">
									<dt class="text-muted-foreground">From Email:</dt>
									<dd class="font-mono text-xs">{settings.fromEmail}</dd>
								</div>
								<div class="flex justify-between">
									<dt class="text-muted-foreground">Provider:</dt>
									<dd>{settings.provider || 'Resend'}</dd>
								</div>
							</dl>
						</div>

						<p class="text-muted-foreground text-sm">
							<strong>Note:</strong> Ensure your domain is verified in Resend before sending emails.
							Visit <a href="https://resend.com/domains" target="_blank" class="text-primary hover:underline">resend.com/domains</a> to verify.
						</p>
					</form>
				</Card.Content>
			</Card.Root>
		</div>
	{:catch error}
		<Card.Root>
			<Card.Content class="pt-6">
				<p class="text-destructive">Error loading settings: {error.message}</p>
			</Card.Content>
		</Card.Root>
	{/await}
</div>
