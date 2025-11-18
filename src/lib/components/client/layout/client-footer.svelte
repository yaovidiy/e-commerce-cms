<script lang="ts">
	import * as m from '$lib/paraglide/messages';
</script>

<footer class="border-t" style="background-color: hsl(var(--color-milky))">
	<div class="mx-auto max-w-7xl px-4 py-12 md:px-6">
		<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
			<!-- Logo and description -->
			<div class="space-y-4">
				<a href="/" class="flex items-center space-x-2">
					<div class="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-lg font-bold text-lg">
						SR
					</div>
					<span class="font-bold text-lg">SpiceRoom</span>
				</a>
				<p class="text-muted-foreground text-sm">
					{m.footer_description?.() || 'Your trusted e-commerce platform'}
				</p>
			</div>

			<!-- Navigation -->
			<div class="space-y-4">
				<h3 class="font-semibold text-sm">{m.footer_navigation?.() || 'Navigation'}</h3>
				<ul class="space-y-2 text-sm">
					<li>
						<a href="/" class="text-muted-foreground hover:text-foreground transition-colors">
							{m.nav_home()}
						</a>
					</li>
					<li>
						<a href="/products" class="text-muted-foreground hover:text-foreground transition-colors">
							{m.nav_products()}
						</a>
					</li>
					<li>
						<a href="/blog" class="text-muted-foreground hover:text-foreground transition-colors">
							{m.nav_blog()}
						</a>
					</li>
				</ul>
			</div>

			<!-- Information -->
			<div class="space-y-4">
				<h3 class="font-semibold text-sm">{m.footer_information?.() || 'Information'}</h3>
				<ul class="space-y-2 text-sm">
					<li>
						<a href="/pages/about-us" class="text-muted-foreground hover:text-foreground transition-colors">
							{m.nav_about()}
						</a>
					</li>
					<li>
						<a href="/pages/contact-us" class="text-muted-foreground hover:text-foreground transition-colors">
							{m.nav_contact()}
						</a>
					</li>
				</ul>
			</div>

			<!-- Contact -->
			<div class="space-y-4">
				<h3 class="font-semibold text-sm">{m.footer_contact?.() || 'Contact'}</h3>
				<ul class="space-y-2 text-sm">
					<li class="text-muted-foreground">
						+380 XX XXX XXXX
					</li>
					<li class="text-muted-foreground">
						info@spiceroom.shop
					</li>
				</ul>
			</div>
		</div>

		<!-- Bottom bar -->
		<div class="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
			<p>©{new Date().getFullYear()} {m.footer_copyright?.() || 'The SpiceRoom Shop'}</p>
		</div>
	</div>
</footer>
