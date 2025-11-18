<script lang="ts">
  import { $props } from 'svelte';
  let { blog } = $props();
</script>

<a href={`/blog/${blog.slug}`} class="block bg-white rounded-lg shadow p-4 hover:shadow-md transition">
  <img src={blog.imageUrl} alt={blog.title} class="w-full h-40 object-cover rounded" />
  <h3 class="font-semibold mt-2">{blog.title}</h3>
  <p class="text-gray-600 text-sm mt-1">{blog.description}</p>
</a>
