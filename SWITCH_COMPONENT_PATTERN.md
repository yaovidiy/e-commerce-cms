# Quick Reference: Switch Components in Forms

## The Problem
Switch components were sending `'on'` / `'off'` instead of `true` / `false`:
```
❌ Form data: { enableGuestCheckout: 'on' }
✅ Expected: { enableGuestCheckout: true }
```

## The Solution
Pair hidden input with Switch component:

```svelte
<script lang="ts">
  import { Switch } from '$lib/components/ui/switch';
  import { updateCheckoutSettings } from '$lib/remotes/settings.remote';
  
  let settings = $state({ enableGuestCheckout: false });
</script>

<!-- Hidden input for form serialization -->
<input
  {...updateCheckoutSettings.fields.enableGuestCheckout.as('checkbox')}
  bind:checked={settings.enableGuestCheckout}
  type="checkbox"
  class="hidden"
/>

<!-- Switch component for UI -->
<Switch bind:checked={settings.enableGuestCheckout} />
```

## Error Handling Pattern
Add $effect after form definition:

```typescript
$effect(() => {
  if (updateCheckoutSettings.result?.success === false) {
    toast.error(updateCheckoutSettings.result.message || 'Failed to save');
  }
  if (updateCheckoutSettings.result?.success === true) {
    toast.success('Saved successfully');
  }
});
```

## Form Submission Flow
1. User toggles Switch
2. `bind:checked` updates state
3. Hidden input captures value via `.as('checkbox')`
4. Form submission happens
5. Remote function receives `true` / `false`
6. $effect detects result
7. Toast shows success/error

## Key Points
- ✅ **Always use `.as('checkbox')` for boolean fields**
- ✅ **Keep hidden input inside form element**
- ✅ **Pair with Switch for visual feedback**
- ✅ **Import toast from 'svelte-sonner'**
- ✅ **Add error handling $effects**
- ❌ **Never use plain `name` attributes**
- ❌ **Don't remove the hidden input**

## Imports Needed
```typescript
import { Switch } from '$lib/components/ui/switch';
import { toast } from 'svelte-sonner';
import { updateFormName } from '$lib/remotes/module.remote';
```

## Example in Context
```svelte
<form {...updateCheckoutSettings}>
  <div class="flex items-center justify-between">
    <label>Enable Guest Checkout</label>
    
    <!-- This handles form serialization -->
    <input
      {...updateCheckoutSettings.fields.enableGuestCheckout.as('checkbox')}
      bind:checked={checkoutSettings.enableGuestCheckout}
      type="checkbox"
      class="hidden"
    />
    
    <!-- This handles visual display -->
    <Switch bind:checked={checkoutSettings.enableGuestCheckout} />
  </div>
  
  <button type="submit">Save</button>
</form>

<!-- Error handling -->
<script>
  $effect(() => {
    if (updateCheckoutSettings.result?.success) {
      toast.success('Settings saved!');
    } else if (updateCheckoutSettings.result?.success === false) {
      toast.error(updateCheckoutSettings.result.message);
    }
  });
</script>
```

## Testing
1. Open DevTools Network tab
2. Submit form with Switch toggled
3. Check form data payload - should show `true` or `false`
4. Check browser console - should show correct boolean value
5. Verify toast appears
6. Check database - boolean value should be stored correctly

## Common Mistakes
```svelte
<!-- ❌ WRONG - This sends 'on'/'off' -->
<Switch name="enableFeature" bind:checked={checked} />

<!-- ❌ WRONG - This forgets the .as('checkbox') -->
<input {...form.fields.enableFeature} class="hidden" />

<!-- ✅ RIGHT - This handles everything -->
<input {...form.fields.enableFeature.as('checkbox')} class="hidden" />
<Switch bind:checked={checked} />
```
