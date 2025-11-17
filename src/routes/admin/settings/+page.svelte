<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Switch } from '$lib/components/ui/switch';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as Card from '$lib/components/ui/card';
	import * as m from '$lib/paraglide/messages';
	import {
		getAllSettings,
		initializeDefaultSettings,
		updateGeneralSettings,
		updateStoreInfoSettings,
		updateCheckoutSettings,
		updateEmailConfigSettings,
		updateSeoSettings,
		updateAdvancedSettings
	} from '$lib/remotes/settings.remote';

	// Load all settings
	const settingsQuery = getAllSettings();

	// Helper to get setting value by key
	function getSettingValue(key: string, defaultValue: any = '') {
		const settings = settingsQuery.current;
		if (!settings) return defaultValue;
		
		const setting = settings.find((s) => s.key === key);
		return setting ? setting.parsedValue : defaultValue;
	}

	// General settings state
	let generalSettings = $state({
		storeName: '',
		storeLogo: '',
		storeFavicon: '',
		storeEmail: '',
		storePhone: '',
		timezone: '',
		currency: '',
		currencySymbol: '',
		defaultLanguage: ''
	});

	// Store info settings state
	let storeInfoSettings = $state({
		storeAddress1: '',
		storeAddress2: '',
		storeCity: '',
		storeState: '',
		storePostalCode: '',
		storeCountry: '',
		facebookUrl: '',
		instagramUrl: '',
		twitterUrl: '',
		youtubeUrl: '',
		linkedinUrl: ''
	});

	// Checkout settings state
	let checkoutSettings = $state({
		enableGuestCheckout: true,
		requirePhoneNumber: false,
		enableOrderNotes: true,
		termsAndConditionsUrl: '',
		privacyPolicyUrl: '',
		returnPolicyUrl: '',
		enableNewsletterSignup: true
	});

	// Email settings state
	let emailSettings = $state({
		emailSmtpHost: '',
		emailSmtpPort: 587,
		emailSmtpUsername: '',
		emailSmtpPassword: '',
		emailSmtpSecure: true,
		emailFromName: '',
		emailFromAddress: '',
		emailReplyToAddress: ''
	});

	// SEO settings state
	let seoSettings = $state({
		seoDefaultTitle: '',
		seoDefaultDescription: '',
		seoDefaultKeywords: '',
		seoDefaultOgImage: '',
		seoGoogleAnalyticsId: '',
		seoGoogleSearchConsoleId: '',
		seoFacebookPixelId: '',
		enableStructuredData: true,
		enableSitemap: true
	});

	// Advanced settings state
	let advancedSettings = $state({
		maintenanceMode: false,
		maintenanceMessage: '',
		customHeadScripts: '',
		customBodyScripts: '',
		enableDebugMode: false,
		enableCaching: true,
		cacheDuration: 3600
	});

	// Load settings into state when data is available
	$effect(() => {
		if (settingsQuery.current) {
			// General settings
			generalSettings.storeName = getSettingValue('store_name', 'My E-commerce Store');
			generalSettings.storeLogo = getSettingValue('store_logo', '');
			generalSettings.storeFavicon = getSettingValue('store_favicon', '');
			generalSettings.storeEmail = getSettingValue('store_email', 'contact@example.com');
			generalSettings.storePhone = getSettingValue('store_phone', '');
			generalSettings.timezone = getSettingValue('timezone', 'UTC');
			generalSettings.currency = getSettingValue('currency', 'USD');
			generalSettings.currencySymbol = getSettingValue('currency_symbol', '$');
			generalSettings.defaultLanguage = getSettingValue('default_language', 'en');

			// Store info settings
			storeInfoSettings.storeAddress1 = getSettingValue('store_address_1', '');
			storeInfoSettings.storeAddress2 = getSettingValue('store_address_2', '');
			storeInfoSettings.storeCity = getSettingValue('store_city', '');
			storeInfoSettings.storeState = getSettingValue('store_state', '');
			storeInfoSettings.storePostalCode = getSettingValue('store_postal_code', '');
			storeInfoSettings.storeCountry = getSettingValue('store_country', '');
			storeInfoSettings.facebookUrl = getSettingValue('facebook_url', '');
			storeInfoSettings.instagramUrl = getSettingValue('instagram_url', '');
			storeInfoSettings.twitterUrl = getSettingValue('twitter_url', '');
			storeInfoSettings.youtubeUrl = getSettingValue('youtube_url', '');
			storeInfoSettings.linkedinUrl = getSettingValue('linkedin_url', '');

			// Checkout settings
			checkoutSettings.enableGuestCheckout = getSettingValue('enable_guest_checkout', true);
			checkoutSettings.requirePhoneNumber = getSettingValue('require_phone_number', false);
			checkoutSettings.enableOrderNotes = getSettingValue('enable_order_notes', true);
			checkoutSettings.termsAndConditionsUrl = getSettingValue('terms_and_conditions_url', '');
			checkoutSettings.privacyPolicyUrl = getSettingValue('privacy_policy_url', '');
			checkoutSettings.returnPolicyUrl = getSettingValue('return_policy_url', '');
			checkoutSettings.enableNewsletterSignup = getSettingValue('enable_newsletter_signup', true);

			// Email settings
			emailSettings.emailSmtpHost = getSettingValue('email_smtp_host', '');
			emailSettings.emailSmtpPort = getSettingValue('email_smtp_port', 587);
			emailSettings.emailSmtpUsername = getSettingValue('email_smtp_username', '');
			emailSettings.emailSmtpPassword = getSettingValue('email_smtp_password', '');
			emailSettings.emailSmtpSecure = getSettingValue('email_smtp_secure', true);
			emailSettings.emailFromName = getSettingValue('email_from_name', 'My Store');
			emailSettings.emailFromAddress = getSettingValue('email_from_address', 'noreply@example.com');
			emailSettings.emailReplyToAddress = getSettingValue('email_reply_to_address', '');

			// SEO settings
			seoSettings.seoDefaultTitle = getSettingValue('seo_default_title', 'My E-commerce Store');
			seoSettings.seoDefaultDescription = getSettingValue(
				'seo_default_description',
				'Shop the best products online'
			);
			seoSettings.seoDefaultKeywords = getSettingValue('seo_default_keywords', '');
			seoSettings.seoDefaultOgImage = getSettingValue('seo_default_og_image', '');
			seoSettings.seoGoogleAnalyticsId = getSettingValue('seo_google_analytics_id', '');
			seoSettings.seoGoogleSearchConsoleId = getSettingValue('seo_google_search_console_id', '');
			seoSettings.seoFacebookPixelId = getSettingValue('seo_facebook_pixel_id', '');
			seoSettings.enableStructuredData = getSettingValue('enable_structured_data', true);
			seoSettings.enableSitemap = getSettingValue('enable_sitemap', true);

			// Advanced settings
			advancedSettings.maintenanceMode = getSettingValue('maintenance_mode', false);
			advancedSettings.maintenanceMessage = getSettingValue(
				'maintenance_message',
				'We are currently performing maintenance. Please check back soon.'
			);
			advancedSettings.customHeadScripts = getSettingValue('custom_head_scripts', '');
			advancedSettings.customBodyScripts = getSettingValue('custom_body_scripts', '');
			advancedSettings.enableDebugMode = getSettingValue('enable_debug_mode', false);
			advancedSettings.enableCaching = getSettingValue('enable_caching', true);
			advancedSettings.cacheDuration = getSettingValue('cache_duration', 3600);
		}
	});

	// Initialize default settings
	async function handleInitialize() {
		await initializeDefaultSettings({});
		await settingsQuery.refresh();
	}
</script>

<div class="container mx-auto py-6 space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">{m.settings_title()}</h1>
			<p class="text-muted-foreground">{m.settings_description()}</p>
		</div>

		{#if settingsQuery.current && settingsQuery.current.length === 0}
			<Button onclick={handleInitialize}>{m.settings_initialize()}</Button>
		{/if}
	</div>

	{#await settingsQuery}
		<div class="text-center py-12">
			<p class="text-muted-foreground">Loading settings...</p>
		</div>
	{:then settings}
		{#if settings && settings.length === 0}
			<Card.Root>
				<Card.Header>
					<Card.Title>No Settings Found</Card.Title>
					<Card.Description>
						Initialize default settings to get started with configuring your store.
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<Button onclick={handleInitialize}>{m.settings_initialize()}</Button>
				</Card.Content>
			</Card.Root>
		{:else}
			<Tabs.Root value="general" class="space-y-4">
				<Tabs.List>
					<Tabs.Trigger value="general">{m.settings_category_general()}</Tabs.Trigger>
					<Tabs.Trigger value="store">{m.settings_category_store()}</Tabs.Trigger>
					<Tabs.Trigger value="checkout">{m.settings_category_checkout()}</Tabs.Trigger>
					<Tabs.Trigger value="email">{m.settings_category_email()}</Tabs.Trigger>
					<Tabs.Trigger value="seo">{m.settings_category_seo()}</Tabs.Trigger>
					<Tabs.Trigger value="advanced">{m.settings_category_advanced()}</Tabs.Trigger>
				</Tabs.List>

				<!-- General Settings Tab -->
				<Tabs.Content value="general">
					<form {...updateGeneralSettings}>
						<Card.Root>
							<Card.Header>
								<Card.Title>{m.settings_category_general()}</Card.Title>
								<Card.Description>Manage your store's general settings</Card.Description>
							</Card.Header>
							<Card.Content class="space-y-6">
								<!-- Store Name -->
								<div class="space-y-2">
									<Label for="store-name">{m.settings_general_store_name()}</Label>
									<Input
										id="store-name"
										{...updateGeneralSettings.fields.storeName.as('text')}
										bind:value={generalSettings.storeName}
										placeholder="My E-commerce Store"
									/>
									<p class="text-sm text-muted-foreground">
										{m.settings_general_store_name_help()}
									</p>
									{#each updateGeneralSettings.fields.storeName.issues() as issue}
										<p class="text-sm text-destructive">{issue.message}</p>
									{/each}
								</div>

								<!-- Store Logo -->
								<div class="space-y-2">
									<Label for="store-logo">{m.settings_general_store_logo()}</Label>
									<Input
										id="store-logo"
										{...updateGeneralSettings.fields.storeLogo.as('text')}
										bind:value={generalSettings.storeLogo}
										placeholder="https://example.com/logo.png"
									/>
									<p class="text-sm text-muted-foreground">
										{m.settings_general_store_logo_help()}
									</p>
									{#each updateGeneralSettings.fields.storeLogo.issues() as issue}
										<p class="text-sm text-destructive">{issue.message}</p>
									{/each}
								</div>

								<!-- Store Favicon -->
								<div class="space-y-2">
									<Label for="store-favicon">{m.settings_general_store_favicon()}</Label>
									<Input
										id="store-favicon"
										{...updateGeneralSettings.fields.storeFavicon.as('text')}
										bind:value={generalSettings.storeFavicon}
										placeholder="https://example.com/favicon.ico"
									/>
									<p class="text-sm text-muted-foreground">
										{m.settings_general_store_favicon_help()}
									</p>
									{#each updateGeneralSettings.fields.storeFavicon.issues() as issue}
										<p class="text-sm text-destructive">{issue.message}</p>
									{/each}
								</div>

								<!-- Store Email -->
								<div class="space-y-2">
									<Label for="store-email">{m.settings_general_store_email()}</Label>
									<Input
										id="store-email"
										{...updateGeneralSettings.fields.storeEmail.as('email')}
										bind:value={generalSettings.storeEmail}
										placeholder="contact@example.com"
									/>
									<p class="text-sm text-muted-foreground">
										{m.settings_general_store_email_help()}
									</p>
									{#each updateGeneralSettings.fields.storeEmail.issues() as issue}
										<p class="text-sm text-destructive">{issue.message}</p>
									{/each}
								</div>

								<!-- Store Phone -->
								<div class="space-y-2">
									<Label for="store-phone">{m.settings_general_store_phone()}</Label>
									<Input
										id="store-phone"
										{...updateGeneralSettings.fields.storePhone.as('text')}
										bind:value={generalSettings.storePhone}
										placeholder="+1 (555) 123-4567"
									/>
									<p class="text-sm text-muted-foreground">
										{m.settings_general_store_phone_help()}
									</p>
								</div>

								<div class="grid gap-6 md:grid-cols-2">
									<!-- Timezone -->
									<div class="space-y-2">
										<Label for="timezone">{m.settings_general_timezone()}</Label>
										<Input
											id="timezone"
											{...updateGeneralSettings.fields.timezone.as('text')}
											bind:value={generalSettings.timezone}
											placeholder="UTC"
										/>
										<p class="text-sm text-muted-foreground">
											{m.settings_general_timezone_help()}
										</p>
									</div>

									<!-- Currency -->
									<div class="space-y-2">
										<Label for="currency">{m.settings_general_currency()}</Label>
										<Input
											id="currency"
											{...updateGeneralSettings.fields.currency.as('text')}
											bind:value={generalSettings.currency}
											placeholder="USD"
										/>
										<p class="text-sm text-muted-foreground">
											{m.settings_general_currency_help()}
										</p>
									</div>

									<!-- Currency Symbol -->
									<div class="space-y-2">
										<Label for="currency-symbol">{m.settings_general_currency_symbol()}</Label>
										<Input
											id="currency-symbol"
											{...updateGeneralSettings.fields.currencySymbol.as('text')}
											bind:value={generalSettings.currencySymbol}
											placeholder="$"
										/>
										<p class="text-sm text-muted-foreground">
											{m.settings_general_currency_symbol_help()}
										</p>
									</div>

									<!-- Default Language -->
									<div class="space-y-2">
										<Label for="default-language">{m.settings_general_default_language()}</Label>
										<Input
											id="default-language"
											{...updateGeneralSettings.fields.defaultLanguage.as('text')}
											bind:value={generalSettings.defaultLanguage}
											placeholder="en"
										/>
										<p class="text-sm text-muted-foreground">
											{m.settings_general_default_language_help()}
										</p>
									</div>
								</div>
							</Card.Content>
							<Card.Footer>
								<Button type="submit" disabled={!!updateGeneralSettings.pending}>
									{updateGeneralSettings.pending ? 'Saving...' : m.settings_save_changes()}
								</Button>
							</Card.Footer>
						</Card.Root>
					</form>
				</Tabs.Content>

				<!-- Store Info Settings Tab -->
				<Tabs.Content value="store">
					<form {...updateStoreInfoSettings}>
						<Card.Root>
							<Card.Header>
								<Card.Title>{m.settings_category_store()}</Card.Title>
								<Card.Description>Manage your store's contact information</Card.Description>
							</Card.Header>
							<Card.Content class="space-y-6">
								<!-- Address Line 1 -->
								<div class="space-y-2">
									<Label for="address-1">{m.settings_store_address_1()}</Label>
									<Input
										id="address-1"
										{...updateStoreInfoSettings.fields.storeAddress1.as('text')}
										bind:value={storeInfoSettings.storeAddress1}
										placeholder="123 Main Street"
									/>
									<p class="text-sm text-muted-foreground">
										{m.settings_store_address_1_help()}
									</p>
								</div>

								<!-- Address Line 2 -->
								<div class="space-y-2">
									<Label for="address-2">{m.settings_store_address_2()}</Label>
									<Input
										id="address-2"
										{...updateStoreInfoSettings.fields.storeAddress2.as('text')}
										bind:value={storeInfoSettings.storeAddress2}
										placeholder="Suite 100"
									/>
									<p class="text-sm text-muted-foreground">
										{m.settings_store_address_2_help()}
									</p>
								</div>

								<div class="grid gap-6 md:grid-cols-2">
									<!-- City -->
									<div class="space-y-2">
										<Label for="city">{m.settings_store_city()}</Label>
										<Input
											id="city"
											{...updateStoreInfoSettings.fields.storeCity.as('text')}
											bind:value={storeInfoSettings.storeCity}
											placeholder="New York"
										/>
									</div>

									<!-- State -->
									<div class="space-y-2">
										<Label for="state">{m.settings_store_state()}</Label>
										<Input
											id="state"
											{...updateStoreInfoSettings.fields.storeState.as('text')}
											bind:value={storeInfoSettings.storeState}
											placeholder="NY"
										/>
									</div>

									<!-- Postal Code -->
									<div class="space-y-2">
										<Label for="postal-code">{m.settings_store_postal_code()}</Label>
										<Input
											id="postal-code"
											{...updateStoreInfoSettings.fields.storePostalCode.as('text')}
											bind:value={storeInfoSettings.storePostalCode}
											placeholder="10001"
										/>
									</div>

									<!-- Country -->
									<div class="space-y-2">
										<Label for="country">{m.settings_store_country()}</Label>
										<Input
											id="country"
											{...updateStoreInfoSettings.fields.storeCountry.as('text')}
											bind:value={storeInfoSettings.storeCountry}
											placeholder="United States"
										/>
									</div>
								</div>

								<div class="pt-6">
									<h3 class="text-lg font-semibold mb-4">Social Media</h3>
									<div class="space-y-4">
										<!-- Facebook -->
										<div class="space-y-2">
											<Label for="facebook">{m.settings_store_facebook()}</Label>
											<Input
												id="facebook"
												{...updateStoreInfoSettings.fields.facebookUrl.as('text')}
												bind:value={storeInfoSettings.facebookUrl}
												placeholder="https://facebook.com/yourstore"
											/>
											<p class="text-sm text-muted-foreground">
												{m.settings_store_facebook_help()}
											</p>
										</div>

										<!-- Instagram -->
										<div class="space-y-2">
											<Label for="instagram">{m.settings_store_instagram()}</Label>
											<Input
												id="instagram"
												{...updateStoreInfoSettings.fields.instagramUrl.as('text')}
												bind:value={storeInfoSettings.instagramUrl}
												placeholder="https://instagram.com/yourstore"
											/>
											<p class="text-sm text-muted-foreground">
												{m.settings_store_instagram_help()}
											</p>
										</div>

										<!-- Twitter -->
										<div class="space-y-2">
											<Label for="twitter">{m.settings_store_twitter()}</Label>
											<Input
												id="twitter"
												{...updateStoreInfoSettings.fields.twitterUrl.as('text')}
												bind:value={storeInfoSettings.twitterUrl}
												placeholder="https://twitter.com/yourstore"
											/>
											<p class="text-sm text-muted-foreground">
												{m.settings_store_twitter_help()}
											</p>
										</div>

										<!-- YouTube -->
										<div class="space-y-2">
											<Label for="youtube">{m.settings_store_youtube()}</Label>
											<Input
												id="youtube"
												{...updateStoreInfoSettings.fields.youtubeUrl.as('text')}
												bind:value={storeInfoSettings.youtubeUrl}
												placeholder="https://youtube.com/c/yourstore"
											/>
											<p class="text-sm text-muted-foreground">
												{m.settings_store_youtube_help()}
											</p>
										</div>

										<!-- LinkedIn -->
										<div class="space-y-2">
											<Label for="linkedin">{m.settings_store_linkedin()}</Label>
											<Input
												id="linkedin"
												{...updateStoreInfoSettings.fields.linkedinUrl.as('text')}
												bind:value={storeInfoSettings.linkedinUrl}
												placeholder="https://linkedin.com/company/yourstore"
											/>
											<p class="text-sm text-muted-foreground">
												{m.settings_store_linkedin_help()}
											</p>
										</div>
									</div>
								</div>
							</Card.Content>
							<Card.Footer>
								<Button type="submit" disabled={!!updateStoreInfoSettings.pending}>
									{updateStoreInfoSettings.pending ? 'Saving...' : m.settings_save_changes()}
								</Button>
							</Card.Footer>
						</Card.Root>
					</form>
				</Tabs.Content>

				<!-- Checkout Settings Tab -->
				<Tabs.Content value="checkout">
					<form {...updateCheckoutSettings}>
						<Card.Root>
							<Card.Header>
								<Card.Title>{m.settings_category_checkout()}</Card.Title>
								<Card.Description>Configure checkout and payment options</Card.Description>
							</Card.Header>
							<Card.Content class="space-y-6">
								<!-- Enable Guest Checkout -->
								<div class="flex items-center justify-between">
									<div class="space-y-0.5">
										<Label>{m.settings_checkout_guest_checkout()}</Label>
										<p class="text-sm text-muted-foreground">
											{m.settings_checkout_guest_checkout_help()}
										</p>
									</div>
									<Switch
										name="enableGuestCheckout"
										bind:checked={checkoutSettings.enableGuestCheckout}
									/>
								</div>

								<!-- Require Phone -->
								<div class="flex items-center justify-between">
									<div class="space-y-0.5">
										<Label>{m.settings_checkout_require_phone()}</Label>
										<p class="text-sm text-muted-foreground">
											{m.settings_checkout_require_phone_help()}
										</p>
									</div>
									<Switch
										name="requirePhoneNumber"
										bind:checked={checkoutSettings.requirePhoneNumber}
									/>
								</div>

								<!-- Enable Order Notes -->
								<div class="flex items-center justify-between">
									<div class="space-y-0.5">
										<Label>{m.settings_checkout_order_notes()}</Label>
										<p class="text-sm text-muted-foreground">
											{m.settings_checkout_order_notes_help()}
										</p>
									</div>
									<Switch
										name="enableOrderNotes"
										bind:checked={checkoutSettings.enableOrderNotes}
									/>
								</div>

								<!-- Enable Newsletter Signup -->
								<div class="flex items-center justify-between">
									<div class="space-y-0.5">
										<Label>{m.settings_checkout_newsletter()}</Label>
										<p class="text-sm text-muted-foreground">
											{m.settings_checkout_newsletter_help()}
										</p>
									</div>
									<Switch
										name="enableNewsletterSignup"
										bind:checked={checkoutSettings.enableNewsletterSignup}
									/>
								</div>								<div class="pt-6">
									<h3 class="text-lg font-semibold mb-4">Policy Links</h3>
									<div class="space-y-4">
										<!-- Terms & Conditions URL -->
										<div class="space-y-2">
											<Label for="terms-url">{m.settings_checkout_terms_url()}</Label>
											<Input
												id="terms-url"
												{...updateCheckoutSettings.fields.termsAndConditionsUrl.as('text')}
												bind:value={checkoutSettings.termsAndConditionsUrl}
												placeholder="/terms"
											/>
											<p class="text-sm text-muted-foreground">
												{m.settings_checkout_terms_url_help()}
											</p>
										</div>

										<!-- Privacy Policy URL -->
										<div class="space-y-2">
											<Label for="privacy-url">{m.settings_checkout_privacy_url()}</Label>
											<Input
												id="privacy-url"
												{...updateCheckoutSettings.fields.privacyPolicyUrl.as('text')}
												bind:value={checkoutSettings.privacyPolicyUrl}
												placeholder="/privacy"
											/>
											<p class="text-sm text-muted-foreground">
												{m.settings_checkout_privacy_url_help()}
											</p>
										</div>

										<!-- Return Policy URL -->
										<div class="space-y-2">
											<Label for="return-url">{m.settings_checkout_return_url()}</Label>
											<Input
												id="return-url"
												{...updateCheckoutSettings.fields.returnPolicyUrl.as('text')}
												bind:value={checkoutSettings.returnPolicyUrl}
												placeholder="/returns"
											/>
											<p class="text-sm text-muted-foreground">
												{m.settings_checkout_return_url_help()}
											</p>
										</div>
									</div>
								</div>
							</Card.Content>
							<Card.Footer>
								<Button type="submit" disabled={!!updateCheckoutSettings.pending}>
									{updateCheckoutSettings.pending ? 'Saving...' : m.settings_save_changes()}
								</Button>
							</Card.Footer>
						</Card.Root>
					</form>
				</Tabs.Content>

				<!-- Email Settings Tab -->
				<Tabs.Content value="email">
					<form {...updateEmailConfigSettings}>
						<Card.Root>
							<Card.Header>
								<Card.Title>{m.settings_category_email()}</Card.Title>
								<Card.Description>Configure email and SMTP settings</Card.Description>
							</Card.Header>
							<Card.Content class="space-y-6">
								<div class="grid gap-6 md:grid-cols-2">
									<!-- SMTP Host -->
									<div class="space-y-2">
										<Label for="smtp-host">{m.settings_email_smtp_host()}</Label>
										<Input
											id="smtp-host"
											{...updateEmailConfigSettings.fields.emailSmtpHost.as('text')}
											bind:value={emailSettings.emailSmtpHost}
											placeholder="smtp.example.com"
										/>
										<p class="text-sm text-muted-foreground">
											{m.settings_email_smtp_host_help()}
										</p>
									</div>

									<!-- SMTP Port -->
									<div class="space-y-2">
										<Label for="smtp-port">{m.settings_email_smtp_port()}</Label>
										<Input
											id="smtp-port"
											{...updateEmailConfigSettings.fields.emailSmtpPort.as('number')}
											bind:value={emailSettings.emailSmtpPort}
											placeholder="587"
										/>
										<p class="text-sm text-muted-foreground">
											{m.settings_email_smtp_port_help()}
										</p>
									</div>

									<!-- SMTP Username -->
									<div class="space-y-2">
										<Label for="smtp-username">{m.settings_email_smtp_username()}</Label>
										<Input
											id="smtp-username"
											{...updateEmailConfigSettings.fields.emailSmtpUsername.as('text')}
											bind:value={emailSettings.emailSmtpUsername}
											placeholder="user@example.com"
										/>
										<p class="text-sm text-muted-foreground">
											{m.settings_email_smtp_username_help()}
										</p>
									</div>

									<!-- SMTP Password -->
									<div class="space-y-2">
										<Label for="smtp-password">{m.settings_email_smtp_password()}</Label>
										<Input
											id="smtp-password"
											{...updateEmailConfigSettings.fields.emailSmtpPassword.as('password')}
											bind:value={emailSettings.emailSmtpPassword}
											placeholder="••••••••"
										/>
										<p class="text-sm text-muted-foreground">
											{m.settings_email_smtp_password_help()}
										</p>
									</div>
								</div>

								<!-- Use SSL/TLS -->
								<div class="flex items-center justify-between">
									<div class="space-y-0.5">
										<Label>{m.settings_email_smtp_secure()}</Label>
										<p class="text-sm text-muted-foreground">
											{m.settings_email_smtp_secure_help()}
										</p>
									</div>
									<Switch
										name="emailSmtpSecure"
										bind:checked={emailSettings.emailSmtpSecure}
									/>
								</div>

								<div class="pt-6">
									<h3 class="text-lg font-semibold mb-4">Email Configuration</h3>
									<div class="space-y-4">
										<!-- From Name -->
										<div class="space-y-2">
											<Label for="from-name">{m.settings_email_from_name()}</Label>
											<Input
												id="from-name"
												{...updateEmailConfigSettings.fields.emailFromName.as('text')}
												bind:value={emailSettings.emailFromName}
												placeholder="My Store"
											/>
											<p class="text-sm text-muted-foreground">
												{m.settings_email_from_name_help()}
											</p>
										</div>

										<!-- From Email -->
										<div class="space-y-2">
											<Label for="from-email">{m.settings_email_from_address()}</Label>
											<Input
												id="from-email"
												{...updateEmailConfigSettings.fields.emailFromAddress.as('email')}
												bind:value={emailSettings.emailFromAddress}
												placeholder="noreply@example.com"
											/>
											<p class="text-sm text-muted-foreground">
												{m.settings_email_from_address_help()}
											</p>
										</div>

										<!-- Reply-To Email -->
										<div class="space-y-2">
											<Label for="reply-to">{m.settings_email_reply_to()}</Label>
											<Input
												id="reply-to"
												{...updateEmailConfigSettings.fields.emailReplyToAddress.as('email')}
												bind:value={emailSettings.emailReplyToAddress}
												placeholder="support@example.com"
											/>
											<p class="text-sm text-muted-foreground">
												{m.settings_email_reply_to_help()}
											</p>
										</div>
									</div>
								</div>
							</Card.Content>
							<Card.Footer>
								<Button type="submit" disabled={!!updateEmailConfigSettings.pending}>
									{updateEmailConfigSettings.pending ? 'Saving...' : m.settings_save_changes()}
								</Button>
							</Card.Footer>
						</Card.Root>
					</form>
				</Tabs.Content>

				<!-- SEO Settings Tab -->
				<Tabs.Content value="seo">
					<form {...updateSeoSettings}>
						<Card.Root>
							<Card.Header>
								<Card.Title>{m.settings_category_seo()}</Card.Title>
								<Card.Description>Optimize your store for search engines</Card.Description>
							</Card.Header>
							<Card.Content class="space-y-6">
								<!-- Default Title -->
								<div class="space-y-2">
									<Label for="seo-title">{m.settings_seo_default_title()}</Label>
									<Input
										id="seo-title"
										{...updateSeoSettings.fields.seoDefaultTitle.as('text')}
										bind:value={seoSettings.seoDefaultTitle}
										placeholder="My E-commerce Store"
										maxlength={60}
									/>
									<p class="text-sm text-muted-foreground">{m.settings_seo_default_title_help()}</p>
								</div>

								<!-- Default Description -->
								<div class="space-y-2">
									<Label for="seo-description">{m.settings_seo_default_description()}</Label>
									<Textarea
										id="seo-description"
										{...updateSeoSettings.fields.seoDefaultDescription.as('text')}
										bind:value={seoSettings.seoDefaultDescription}
										placeholder="Shop the best products online"
										maxlength={160}
										rows={3}
									/>
									<p class="text-sm text-muted-foreground">
										{m.settings_seo_default_description_help()}
									</p>
								</div>

								<!-- Default Keywords -->
								<div class="space-y-2">
									<Label for="seo-keywords">{m.settings_seo_default_keywords()}</Label>
									<Input
										id="seo-keywords"
										{...updateSeoSettings.fields.seoDefaultKeywords.as('text')}
										bind:value={seoSettings.seoDefaultKeywords}
										placeholder="ecommerce, shopping, products"
									/>
									<p class="text-sm text-muted-foreground">
										{m.settings_seo_default_keywords_help()}
									</p>
								</div>

								<!-- Default OG Image -->
								<div class="space-y-2">
									<Label for="og-image">{m.settings_seo_default_og_image()}</Label>
									<Input
										id="og-image"
										{...updateSeoSettings.fields.seoDefaultOgImage.as('text')}
										bind:value={seoSettings.seoDefaultOgImage}
										placeholder="https://example.com/og-image.jpg"
									/>
									<p class="text-sm text-muted-foreground">
										{m.settings_seo_default_og_image_help()}
									</p>
									{#each updateSeoSettings.fields.seoDefaultOgImage.issues() as issue}
										<p class="text-sm text-destructive">{issue.message}</p>
									{/each}
								</div>

								<div class="pt-6">
									<h3 class="text-lg font-semibold mb-4">Analytics & Tracking</h3>
									<div class="space-y-4">
										<!-- Google Analytics -->
										<div class="space-y-2">
											<Label for="ga-id">{m.settings_seo_google_analytics()}</Label>
											<Input
												id="ga-id"
												{...updateSeoSettings.fields.seoGoogleAnalyticsId.as('text')}
												bind:value={seoSettings.seoGoogleAnalyticsId}
												placeholder="G-XXXXXXXXXX"
											/>
											<p class="text-sm text-muted-foreground">
												{m.settings_seo_google_analytics_help()}
											</p>
										</div>

										<!-- Google Search Console -->
										<div class="space-y-2">
											<Label for="gsc-id">{m.settings_seo_google_console()}</Label>
											<Input
												id="gsc-id"
												{...updateSeoSettings.fields.seoGoogleSearchConsoleId.as('text')}
												bind:value={seoSettings.seoGoogleSearchConsoleId}
												placeholder="verification_code"
											/>
											<p class="text-sm text-muted-foreground">
												{m.settings_seo_google_console_help()}
											</p>
										</div>

										<!-- Facebook Pixel -->
										<div class="space-y-2">
											<Label for="fb-pixel">{m.settings_seo_facebook_pixel()}</Label>
											<Input
												id="fb-pixel"
												{...updateSeoSettings.fields.seoFacebookPixelId.as('text')}
												bind:value={seoSettings.seoFacebookPixelId}
												placeholder="123456789012345"
											/>
											<p class="text-sm text-muted-foreground">
												{m.settings_seo_facebook_pixel_help()}
											</p>
										</div>
									</div>
								</div>

								<div class="pt-6 space-y-4">
									<!-- Enable Structured Data -->
									<div class="flex items-center justify-between">
										<div class="space-y-0.5">
											<Label>{m.settings_seo_structured_data()}</Label>
											<p class="text-sm text-muted-foreground">
												{m.settings_seo_structured_data_help()}
											</p>
										</div>
										<Switch
											name="enableStructuredData"
											bind:checked={seoSettings.enableStructuredData}
										/>
									</div>

									<!-- Enable Sitemap -->
									<div class="flex items-center justify-between">
										<div class="space-y-0.5">
											<Label>{m.settings_seo_sitemap()}</Label>
											<p class="text-sm text-muted-foreground">{m.settings_seo_sitemap_help()}</p>
										</div>
										<Switch
											name="enableSitemap"
											bind:checked={seoSettings.enableSitemap}
										/>
									</div>
								</div>
							</Card.Content>
							<Card.Footer>
								<Button type="submit" disabled={!!updateSeoSettings.pending}>
									{updateSeoSettings.pending ? 'Saving...' : m.settings_save_changes()}
								</Button>
							</Card.Footer>
						</Card.Root>
					</form>
				</Tabs.Content>

				<!-- Advanced Settings Tab -->
				<Tabs.Content value="advanced">
					<form {...updateAdvancedSettings}>
						<Card.Root>
							<Card.Header>
								<Card.Title>{m.settings_category_advanced()}</Card.Title>
								<Card.Description>Advanced configuration options</Card.Description>
							</Card.Header>
							<Card.Content class="space-y-6">
								<!-- Maintenance Mode -->
								<div class="flex items-center justify-between">
									<div class="space-y-0.5">
										<Label>{m.settings_advanced_maintenance_mode()}</Label>
										<p class="text-sm text-muted-foreground">
											{m.settings_advanced_maintenance_mode_help()}
										</p>
									</div>
									<Switch
										name="maintenanceMode"
										bind:checked={advancedSettings.maintenanceMode}
									/>
								</div>

								<!-- Maintenance Message -->
								<div class="space-y-2">
									<Label for="maintenance-msg">{m.settings_advanced_maintenance_message()}</Label>
									<Textarea
										id="maintenance-msg"
										{...updateAdvancedSettings.fields.maintenanceMessage.as('text')}
										bind:value={advancedSettings.maintenanceMessage}
										placeholder="We are currently performing maintenance. Please check back soon."
										rows={3}
									/>
									<p class="text-sm text-muted-foreground">
										{m.settings_advanced_maintenance_message_help()}
									</p>
								</div>

								<div class="pt-6">
									<h3 class="text-lg font-semibold mb-4">Custom Scripts</h3>
									<div class="space-y-4">
										<!-- Custom Head Scripts -->
										<div class="space-y-2">
											<Label for="head-scripts">{m.settings_advanced_custom_head()}</Label>
											<Textarea
												id="head-scripts"
												{...updateAdvancedSettings.fields.customHeadScripts.as('text')}
												bind:value={advancedSettings.customHeadScripts}
												placeholder="Custom scripts..."
												rows={6}
												class="font-mono text-sm"
											/>
											<p class="text-sm text-muted-foreground">
												{m.settings_advanced_custom_head_help()}
											</p>
										</div>

										<!-- Custom Body Scripts -->
										<div class="space-y-2">
											<Label for="body-scripts">{m.settings_advanced_custom_body()}</Label>
											<Textarea
												id="body-scripts"
												{...updateAdvancedSettings.fields.customBodyScripts.as('text')}
												bind:value={advancedSettings.customBodyScripts}
												placeholder="Custom scripts..."
												rows={6}
												class="font-mono text-sm"
											/>
											<p class="text-sm text-muted-foreground">
												{m.settings_advanced_custom_body_help()}
											</p>
										</div>
									</div>
								</div>

								<div class="pt-6 space-y-4">
									<!-- Debug Mode -->
									<div class="flex items-center justify-between">
										<div class="space-y-0.5">
											<Label>{m.settings_advanced_debug_mode()}</Label>
											<p class="text-sm text-muted-foreground">
												{m.settings_advanced_debug_mode_help()}
											</p>
										</div>
										<Switch
											name="enableDebugMode"
											bind:checked={advancedSettings.enableDebugMode}
										/>
									</div>

									<!-- Enable Caching -->
									<div class="flex items-center justify-between">
										<div class="space-y-0.5">
											<Label>{m.settings_advanced_caching()}</Label>
											<p class="text-sm text-muted-foreground">
												{m.settings_advanced_caching_help()}
											</p>
										</div>
										<Switch
											name="enableCaching"
											bind:checked={advancedSettings.enableCaching}
										/>
									</div>

									<!-- Cache Duration -->
									<div class="space-y-2">
										<Label for="cache-duration">{m.settings_advanced_cache_duration()}</Label>
										<Input
											id="cache-duration"
											{...updateAdvancedSettings.fields.cacheDuration.as('number')}
											bind:value={advancedSettings.cacheDuration}
											placeholder="3600"
										/>
										<p class="text-sm text-muted-foreground">
											{m.settings_advanced_cache_duration_help()}
										</p>
									</div>
								</div>
							</Card.Content>
							<Card.Footer>
								<Button type="submit" disabled={!!updateAdvancedSettings.pending}>
									{updateAdvancedSettings.pending ? 'Saving...' : m.settings_save_changes()}
								</Button>
							</Card.Footer>
						</Card.Root>
					</form>
				</Tabs.Content>
			</Tabs.Root>
		{/if}
	{:catch error}
		<Card.Root>
			<Card.Header>
				<Card.Title>Error Loading Settings</Card.Title>
				<Card.Description>{error.message}</Card.Description>
			</Card.Header>
		</Card.Root>
	{/await}
</div>
