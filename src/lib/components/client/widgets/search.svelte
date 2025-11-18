<script lang="ts">
  import { Input } from '$lib/components/ui/input';
  import * as m from '$lib/paraglide/messages';
  let query = '';
</script>

<form class="flex items-center gap-2">
  <Input type="text" placeholder={m.search()} bind:value={query} />
  <button type="submit" class="hidden">{m.search()}</button>
</form>
