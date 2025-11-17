<script lang="ts">
	import { getCart } from '$lib/remotes/cart.remote';
	import { checkout } from '$lib/remotes/order.remote';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Separator } from '$lib/components/ui/separator';
	import { ShoppingCart, CreditCard, Package } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';
	import { goto } from '$app/navigation';

	// Multi-step form state
	let currentStep = $state(1);
	const totalSteps = 3;

	// Format price helper (cents to dollars)
	function formatPrice(cents: number): string {
		return `$${(cents / 100).toFixed(2)}`;
	}

	// Navigation functions
	function nextStep() {
		if (currentStep < totalSteps) {
			currentStep++;
		}
	}

	function previousStep() {
		if (currentStep > 1) {
			currentStep--;
		}
	}

	function goToCart() {
		goto('/products');
	}
</script>

<div class="container max-w-6xl mx-auto py-8">
	<div class="mb-8">
		<h1 class="text-3xl font-bold mb-2">{m.checkout_title()}</h1>
		
		<!-- Progress indicator -->
		<div class="flex items-center gap-2 mt-4">
			{#each Array(totalSteps) as _, i}
				<div class="flex items-center flex-1">
					<div
						class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold {i + 1 <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}"
					>
						{i + 1}
					</div>
					{#if i < totalSteps - 1}
						<div class="flex-1 h-1 mx-2 {i + 1 < currentStep ? 'bg-primary' : 'bg-muted'}"></div>
					{/if}
				</div>
			{/each}
		</div>
		
		<p class="text-sm text-muted-foreground mt-2">
			{m.checkout_step_info({ current: currentStep.toString(), total: totalSteps.toString() })}
		</p>
	</div>

	{#await getCart()}
		<!-- Loading -->
		<div class="grid md:grid-cols-3 gap-8">
			<div class="md:col-span-2 space-y-6">
				<div class="h-96 bg-muted animate-pulse rounded-lg"></div>
			</div>
			<div class="space-y-4">
				<div class="h-64 bg-muted animate-pulse rounded-lg"></div>
			</div>
		</div>
	{:then cart}
		{#if cart.items.length === 0}
			<!-- Empty cart -->
			<div class="flex flex-col items-center justify-center py-12 text-center">
				<ShoppingCart class="h-16 w-16 text-muted-foreground mb-4" />
				<h2 class="text-2xl font-semibold mb-2">{m.checkout_empty_cart()}</h2>
				<Button onclick={goToCart} class="mt-4">
					{m.checkout_continue_shopping()}
				</Button>
			</div>
		{:else}
			<form {...checkout} class="grid md:grid-cols-3 gap-8">
				<!-- Main content (left side) -->
				<div class="md:col-span-2 space-y-6">
					<!-- Step 1: Customer Information -->
					{#if currentStep === 1}
						<div class="bg-card p-6 rounded-lg border">
							<h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
								<CreditCard class="h-5 w-5" />
								{m.checkout_customer_info()}
							</h2>
							
							<div class="grid md:grid-cols-2 gap-4">
								<div>
									<Label>{m.checkout_first_name()}</Label>
									<Input {...checkout.fields.customerFirstName.as('text')} />
									{#each checkout.fields.customerFirstName.issues() as issue}
										<p class="text-destructive text-sm mt-1">{issue.message}</p>
									{/each}
								</div>
								
								<div>
									<Label>{m.checkout_last_name()}</Label>
									<Input {...checkout.fields.customerLastName.as('text')} />
									{#each checkout.fields.customerLastName.issues() as issue}
										<p class="text-destructive text-sm mt-1">{issue.message}</p>
									{/each}
								</div>
								
								<div>
									<Label>{m.checkout_email()}</Label>
									<Input {...checkout.fields.customerEmail.as('email')} />
									{#each checkout.fields.customerEmail.issues() as issue}
										<p class="text-destructive text-sm mt-1">{issue.message}</p>
									{/each}
								</div>
								
								<div>
									<Label>{m.checkout_phone()}</Label>
									<Input {...checkout.fields.customerPhone.as('tel')} />
									{#each checkout.fields.customerPhone.issues() as issue}
										<p class="text-destructive text-sm mt-1">{issue.message}</p>
									{/each}
								</div>
							</div>
						</div>
					{/if}

					<!-- Step 2: Shipping & Billing Address -->
					{#if currentStep === 2}
						<div class="bg-card p-6 rounded-lg border space-y-6">
							<!-- Shipping Address -->
							<div>
								<h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
									<Package class="h-5 w-5" />
									{m.checkout_shipping_address()}
								</h2>
								
								<div class="space-y-4">
									<div>
										<Label>{m.checkout_address_line_1()}</Label>
										<Input {...checkout.fields.shippingAddress.address1.as('text')} />
										{#each checkout.fields.shippingAddress.address1.issues() as issue}
											<p class="text-destructive text-sm mt-1">{issue.message}</p>
										{/each}
									</div>
									
									<div>
										<Label>{m.checkout_address_line_2()}</Label>
										<Input {...checkout.fields.shippingAddress.address2.as('text')} />
									</div>
									
									<div class="grid md:grid-cols-2 gap-4">
										<div>
											<Label>{m.checkout_city()}</Label>
											<Input {...checkout.fields.shippingAddress.city.as('text')} />
											{#each checkout.fields.shippingAddress.city.issues() as issue}
												<p class="text-destructive text-sm mt-1">{issue.message}</p>
											{/each}
										</div>
										
										<div>
											<Label>{m.checkout_state()}</Label>
											<Input {...checkout.fields.shippingAddress.state.as('text')} />
											{#each checkout.fields.shippingAddress.state.issues() as issue}
												<p class="text-destructive text-sm mt-1">{issue.message}</p>
											{/each}
										</div>
										
										<div>
											<Label>{m.checkout_postal_code()}</Label>
											<Input {...checkout.fields.shippingAddress.postalCode.as('text')} />
											{#each checkout.fields.shippingAddress.postalCode.issues() as issue}
												<p class="text-destructive text-sm mt-1">{issue.message}</p>
											{/each}
										</div>
										
										<div>
											<Label>{m.checkout_country()}</Label>
											<Input {...checkout.fields.shippingAddress.country.as('text')} />
											{#each checkout.fields.shippingAddress.country.issues() as issue}
												<p class="text-destructive text-sm mt-1">{issue.message}</p>
											{/each}
										</div>
									</div>
								</div>
							</div>

							<Separator />

							<!-- Billing Address -->
							<div>
								<div class="flex items-center gap-2 mb-4">
									<input
										{...checkout.fields.sameAsShipping.as('checkbox')}
										id="sameAsShipping"
										class="cursor-pointer"
									/>
									<Label for="sameAsShipping" class="cursor-pointer">
										{m.checkout_same_as_shipping()}
									</Label>
								</div>

								{#if !checkout.fields.sameAsShipping.value()}
									<h2 class="text-xl font-semibold mb-4">
										{m.checkout_billing_address()}
									</h2>
									
									<div class="space-y-4">
										<div>
											<Label>{m.checkout_address_line_1()}</Label>
											<Input {...checkout.fields.billingAddress?.address1?.as('text')} />
										</div>
										
										<div>
											<Label>{m.checkout_address_line_2()}</Label>
											<Input {...checkout.fields.billingAddress?.address2?.as('text')} />
										</div>
										
										<div class="grid md:grid-cols-2 gap-4">
											<div>
												<Label>{m.checkout_city()}</Label>
												<Input {...checkout.fields.billingAddress?.city?.as('text')} />
											</div>
											
											<div>
												<Label>{m.checkout_state()}</Label>
												<Input {...checkout.fields.billingAddress?.state?.as('text')} />
											</div>
											
											<div>
												<Label>{m.checkout_postal_code()}</Label>
												<Input {...checkout.fields.billingAddress?.postalCode?.as('text')} />
											</div>
											
											<div>
												<Label>{m.checkout_country()}</Label>
												<Input {...checkout.fields.billingAddress?.country?.as('text')} />
											</div>
										</div>
									</div>
								{/if}
							</div>
						</div>
					{/if}

					<!-- Step 3: Payment & Review -->
					{#if currentStep === 3}
						<div class="bg-card p-6 rounded-lg border space-y-6">
							<!-- Payment Method -->
							<div>
								<h2 class="text-xl font-semibold mb-4">
									{m.checkout_payment_method()}
								</h2>
								
								<div class="space-y-2">
									<div class="flex items-center space-x-2">
										<input
											{...checkout.fields.paymentMethod.as('radio', 'cod')}
											id="payment-cod"
											class="cursor-pointer"
										/>
										<Label for="payment-cod" class="cursor-pointer">
											{m.checkout_payment_cod()}
										</Label>
									</div>
									<div class="flex items-center space-x-2">
										<input
											{...checkout.fields.paymentMethod.as('radio', 'card')}
											id="payment-card"
											class="cursor-pointer"
										/>
										<Label for="payment-card" class="cursor-pointer">
											{m.checkout_payment_card()}
										</Label>
									</div>
								</div>
							</div>

							<Separator />

							<!-- Order Notes -->
							<div>
								<Label>{m.checkout_order_notes()}</Label>
								<Textarea
									{...checkout.fields.notes.as('text')}
									rows={4}
									placeholder="Special instructions or delivery notes..."
								/>
							</div>
						</div>
					{/if}

					<!-- Navigation buttons -->
					<div class="flex justify-between">
						{#if currentStep > 1}
							<Button type="button" variant="outline" onclick={previousStep}>
								{m.checkout_previous()}
							</Button>
						{:else}
							<Button type="button" variant="outline" onclick={goToCart}>
								{m.checkout_back_to_cart()}
							</Button>
						{/if}

						{#if currentStep < totalSteps}
							<Button
								type="button"
								onclick={() => {
									checkout.validate({ includeUntouched: false });
									const firstNameIssues = checkout.fields.customerFirstName.issues() || [];
									const lastNameIssues = checkout.fields.customerLastName.issues() || [];
									const emailIssues = checkout.fields.customerEmail.issues() || [];
									const addressIssues = checkout.fields.shippingAddress.address1.issues() || [];
									
									if (currentStep === 1 && firstNameIssues.length === 0 && lastNameIssues.length === 0 && emailIssues.length === 0) {
										nextStep();
									} else if (currentStep === 2 && addressIssues.length === 0) {
										nextStep();
									}
								}}
							>
								{m.checkout_continue()}
							</Button>
						{:else}
							<Button type="submit" disabled={!!checkout.pending}>
								{checkout.pending ? m.checkout_processing() : m.checkout_place_order()}
							</Button>
						{/if}
					</div>
				</div>

				<!-- Order Summary (right side) -->
				<div class="space-y-4">
					<div class="bg-card p-6 rounded-lg border sticky top-4">
						<h2 class="text-xl font-semibold mb-4">
							{m.checkout_order_summary()}
						</h2>
						
						<div class="space-y-4">
							{#each cart.items as item}
								{@const product = item.product}
								<div class="flex gap-3">
									<div class="w-16 h-16 shrink-0">
										{#if item.image}
											<img
												src={item.image}
												alt={item.name}
												class="w-full h-full object-cover rounded"
											/>
										{:else}
											<div class="w-full h-full bg-muted rounded flex items-center justify-center">
												<ShoppingCart class="h-6 w-6 text-muted-foreground" />
											</div>
										{/if}
									</div>
									
									<div class="flex-1 min-w-0">
										<h4 class="font-medium text-sm truncate">{item.name}</h4>
										<p class="text-sm text-muted-foreground">
											Qty: {item.quantity}
										</p>
									</div>
									
									<div class="text-sm font-semibold">
										{formatPrice((product?.salePrice && product.salePrice < product.price ? product.salePrice : item.price) * item.quantity)}
									</div>
								</div>
								<Separator />
							{/each}
							
							<div class="space-y-2 pt-2">
								<div class="flex justify-between text-sm">
									<span class="text-muted-foreground">{m.shop_subtotal()}</span>
									<span class="font-medium">{formatPrice(cart.subtotal)}</span>
								</div>
								<div class="flex justify-between text-base font-semibold">
									<span>{m.shop_total()}</span>
									<span>{formatPrice(cart.total)}</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</form>
		{/if}
	{:catch error}
		<!-- Error state -->
		<div class="flex flex-col items-center justify-center py-12 text-center">
			<h2 class="text-2xl font-semibold mb-2">{m.checkout_error()}</h2>
			<p class="text-muted-foreground mb-6">{error.message}</p>
			<Button onclick={goToCart}>
				{m.checkout_back_to_cart()}
			</Button>
		</div>
	{/await}
</div>
