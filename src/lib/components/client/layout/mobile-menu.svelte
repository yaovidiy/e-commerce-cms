<script lang="ts">
  // import { $state } from 'svelte';
  import * as m from '$lib/paraglide/messages';
  let open = $state(false);
</script>

<!-- Mobile menu drawer -->
<div class="md:hidden">
  <button class="p-2" onclick={() => open = !open} aria-label="Open menu">
    <svg width="24" height="24" fill="none" stroke="currentColor"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
  </button>
  {#if open}
    <div class="fixed inset-0 bg-black/40 z-50" onclick={() => open = false}></div>
    <nav class="fixed top-0 left-0 w-64 h-full bg-white shadow-lg z-50 flex flex-col p-6 gap-4">
      <a href="/products" class="hover:underline">{m.products()}</a>
      <a href="/blog" class="hover:underline">{m.blog()}</a>
      <a href="/about" class="hover:underline">{m.about()}</a>
      <a href="/contact" class="hover:underline">{m.contact()}</a>
      <button class="mt-auto" onclick={() => open = false}>{m.close()}</button>
    </nav>
  {/if}
</div>
