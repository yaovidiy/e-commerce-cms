<script lang="ts">
  import * as m from '$lib/paraglide/messages';
</script>

<footer class="w-full bg-gray-100 py-8 mt-12 border-t">
  <div class="container flex flex-col md:flex-row justify-between items-center gap-4">
    <div class="text-lg font-bold">Spiceroom</div>
    <nav class="flex gap-6">
      <a href="/products" class="hover:underline">{m.products()}</a>
      <a href="/blog" class="hover:underline">{m.blog()}</a>
      <a href="/about" class="hover:underline">{m.about()}</a>
      <a href="/contact" class="hover:underline">{m.contact()}</a>
    </nav>
    <div class="text-sm text-gray-500">© {new Date().getFullYear()} Spiceroom</div>
  </div>
</footer>
