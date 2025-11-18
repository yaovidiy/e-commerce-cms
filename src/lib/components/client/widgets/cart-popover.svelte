<script lang="ts">
  // Placeholder for cart popover
  import { Button } from '$lib/components/ui/button';
  import * as m from '$lib/paraglide/messages';
</script>

<div class="relative">
  <Button variant="ghost">
    <svg width="24" height="24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg>
    <span class="sr-only">{m.shop_cart()}</span>
  </Button>
  <!-- Cart dropdown would go here -->
</div>
