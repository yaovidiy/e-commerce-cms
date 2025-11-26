<script lang="ts">
  import * as m from '$lib/paraglide/messages';
  import { getPublicSettings } from '$lib/remotes/settings.remote';
  import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';

  const storeSettingsPromise = getPublicSettings();
</script>

<footer class="w-full bg-gray-100 py-8 mt-12 border-t">
  <div class="container flex flex-col md:flex-row justify-between items-center gap-4">
    {#await storeSettingsPromise}
      <Skeleton class="h-6 w-32" />
    {:then settings}
      <div class="text-lg font-bold">{settings.storeName}</div>
    {:catch}
      <div class="text-lg font-bold">Store</div>
    {/await}
    <nav class="flex gap-6">
      <a href="/products" class="hover:underline">{m.products()}</a>
      <a href="/blog" class="hover:underline">{m.blog()}</a>
      <a href="/about" class="hover:underline">{m.about()}</a>
      <a href="/contact" class="hover:underline">{m.contact()}</a>
    </nav>
    {#await storeSettingsPromise}
      <Skeleton class="h-4 w-24" />
    {:then settings}
      <div class="text-sm text-gray-500">© {new Date().getFullYear()} {settings.storeName}</div>
    {:catch}
      <div class="text-sm text-gray-500">© {new Date().getFullYear()}</div>
    {/await}
  </div>
</footer>
