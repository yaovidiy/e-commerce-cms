<script lang="ts">
  import { $props } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import * as m from '$lib/paraglide/messages';
  let { product } = $props();
</script>

<div class="bg-white rounded-lg shadow p-4 flex flex-col gap-2">
  <a href={`/products/${product.slug}`}>
    <img src={product.imageUrl} alt={product.name} class="w-full h-48 object-cover rounded" />
    <h3 class="font-semibold mt-2">{product.name}</h3>
  </a>
  <div class="flex items-center justify-between mt-1">
    <span class="text-lg font-bold">${product.price}</span>
    <Button>{m.addToCart()}</Button>
  </div>
</div>
