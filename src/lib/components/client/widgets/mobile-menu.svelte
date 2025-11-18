<script lang="ts">
import * as Sheet from '$lib/components/ui/sheet';
import { Menu } from '@lucide/svelte';
import * as m from '$lib/paraglide/messages';
let isMenuOpen = $state(false);
</script>

<Sheet.Root bind:open={isMenuOpen}>
  <Sheet.Trigger aria-label={m.nav_toggle_sidebar()}>
	<Menu />
  </Sheet.Trigger>
  <Sheet.Content class="w-screen h-full p-6 bg-white">
	<div class="flex flex-col h-full justify-between">
	  <div>
		<a href="/" class="mb-8 block">
		  <img src="/logo.png" alt="SpiceRoom Logo" class="h-10" />
		</a>
		<nav class="flex flex-col gap-6 text-2xl font-semibold">
		  <a href="/products" onclick={() => (isMenuOpen = false)}>{m.products()}</a>
		  <a href="/blog" onclick={() => (isMenuOpen = false)}>{m.blog()}</a>
		  <a href="/about" onclick={() => (isMenuOpen = false)}>{m.about()}</a>
		  <a href="/contact" onclick={() => (isMenuOpen = false)}>{m.contact()}</a>
		</nav>
	  </div>
	  <!-- Social icons or other footer content can go here -->
	</div>
  </Sheet.Content>
</Sheet.Root>