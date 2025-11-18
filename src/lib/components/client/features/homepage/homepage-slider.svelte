<script lang="ts">
  // import { $props, $state } from 'svelte';
  let { slides } = $props();
  let current = $state(0);
  function next() { current = (current + 1) % slides.length; }
  function prev() { current = (current - 1 + slides.length) % slides.length; }
</script>

<div class="relative w-full h-64 overflow-hidden rounded-lg">
  {#if slides.length}
    <img src={slides[current].imageUrl} alt={slides[current].alt} class="w-full h-64 object-cover" />
    <button class="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-2" onclick={prev}>&lt;</button>
    <button class="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-2" onclick={next}>&gt;</button>
  {/if}
</div>
