<script lang="ts">
  import { $props } from 'svelte';
  import ProductCard from './product-card.svelte';
  let { products } = $props();
</script>

<div class="grid grid-cols-2 md:grid-cols-4 gap-6">
  {#each products as product}
    <ProductCard {product} />
  {/each}
</div>
