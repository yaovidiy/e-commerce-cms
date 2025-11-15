# Asset Management Guide

## Overview

This guide covers how to work with assets (images, files) in the CMS, including the AssetImage component for displaying images with automatic fetching and thumbnail support.

---

## AssetImage Component

### Purpose

The `AssetImage` component is a reusable component for displaying images from assets stored in the database. It automatically:
- Fetches asset data by ID using remote functions
- Displays thumbnail or full-size image based on prop
- Shows loading state while fetching
- Handles errors gracefully with fallback UI

### Location

```
src/lib/components/common/data-display/asset-image.svelte
```

### Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `assetId` | `string` | - | Yes | The asset ID to fetch and display |
| `alt` | `string` | - | Yes | Alt text for the image (accessibility) |
| `thumbnail` | `boolean` | `true` | No | Whether to display thumbnail (true) or full image (false) |
| `class` | `string` | `''` | No | Additional CSS classes for styling |

### Usage Examples

#### Basic Usage (Thumbnail)

```svelte
<script lang="ts">
  import { AssetImage } from '$lib/components/common/data-display';
</script>

<AssetImage 
  assetId={brand.logo} 
  alt={brand.name} 
  thumbnail={true}
  class="size-8 rounded object-contain"
/>
```

#### Full-Size Image

```svelte
<AssetImage 
  assetId={product.featuredImage} 
  alt={product.name} 
  thumbnail={false}
  class="w-full h-96 object-cover"
/>
```

#### In Table Cells

```svelte
<Table.Cell class="font-medium">
  <div class="flex items-center gap-2">
    {#if brand.logo}
      <AssetImage
        assetId={brand.logo}
        alt={brand.name}
        thumbnail={true}
        class="size-8 rounded object-contain"
      />
    {/if}
    <span>{brand.name}</span>
  </div>
</Table.Cell>
```

#### Gallery with Full Images

```svelte
<div class="grid grid-cols-3 gap-4">
  {#each product.images as imageId}
    <AssetImage
      assetId={imageId}
      alt={product.name}
      thumbnail={false}
      class="aspect-square w-full rounded-lg object-cover"
    />
  {/each}
</div>
```

### States

The component handles three states:

1. **Loading State**
   - Shows animated pulse background
   - Uses provided `class` for sizing

2. **Success State**
   - Displays image (thumbnail or full based on `thumbnail` prop)
   - Automatically uses `thumbnailUrl` if `thumbnail={true}` and available
   - Falls back to full `url` if thumbnail not available

3. **Error State**
   - Shows gray background with "?" character
   - Uses provided `class` for sizing
   - Prevents layout shift

### How It Works

1. **Fetches Asset**: Uses `getAssetById()` remote function to fetch asset data
2. **Selects URL**: Chooses between `asset.thumbnailUrl` and `asset.url` based on `thumbnail` prop
3. **Renders Image**: Displays `<img>` tag with selected URL and provided props
4. **Handles Errors**: Shows fallback UI if asset not found or fetch fails

### Database Schema

Assets are stored in the `asset` table with the following relevant fields:

```typescript
{
  id: string;              // UUID primary key
  url: string;             // Full-size image URL (R2 storage)
  thumbnailUrl: string;    // Thumbnail URL (R2 storage)
  originalFilename: string;
  mimeType: string;
  size: number;
}
```

### Remote Functions

The component uses the following remote function:

```typescript
// src/lib/remotes/asset.remote.ts
export const getAssetById = query(v.string(), async (id) => {
  requireAdminUser();
  
  const [asset] = await db.select()
    .from(tables.asset)
    .where(eq(tables.asset.id, id));
  
  if (!asset) {
    throw new Error('Asset not found');
  }
  
  return asset;
});
```

---

## Asset Storage Architecture

### Overview

Assets are stored in **Cloudflare R2** (S3-compatible storage) with the following features:
- Zero egress fees
- Automatic image optimization (Sharp)
- Thumbnail generation
- Secure uploads via admin authentication

### File Structure

```
R2 Bucket: images/
├── {timestamp}-{random}.jpg          # Full-size optimized image
└── {timestamp}-{random}-thumb.jpg    # Thumbnail (max 400x400)
```

### Upload Flow

1. **Admin uploads file** via AssetBrowser component
2. **Server validates image** using Sharp
3. **Server optimizes original** (compression, format conversion)
4. **Server generates thumbnail** (max 400x400, maintains aspect ratio)
5. **Both files uploaded to R2** with unique filenames
6. **Metadata saved to database** with both URLs
7. **Asset list refreshed** to show new upload

### Image Optimization

Handled by `src/lib/server/image-optimizer.ts`:

```typescript
// Validates image buffer
await isValidImage(buffer);

// Processes and optimizes
const { original, thumbnail } = await processImage(buffer);
```

**Optimization Settings:**
- Format: JPEG or WebP
- Quality: 80%
- Thumbnail: Max 400x400px (aspect ratio preserved)
- Compression: Automatic based on content

---

## Best Practices

### 1. Always Use AssetImage Component

**❌ Don't** fetch assets manually in components:
```svelte
<!-- BAD: Fetching asset in component -->
<script>
  let asset = $state(null);
  
  $effect(() => {
    getAssetById(brand.logo).then(a => asset = a);
  });
</script>

{#if asset}
  <img src={asset.url} alt={brand.name} />
{/if}
```

**✅ Do** use AssetImage component:
```svelte
<!-- GOOD: Use AssetImage component -->
<AssetImage 
  assetId={brand.logo} 
  alt={brand.name} 
  thumbnail={true}
  class="size-8 rounded"
/>
```

### 2. Use Thumbnails for Lists

**❌ Don't** load full images in list views:
```svelte
<AssetImage 
  assetId={product.image} 
  alt={product.name} 
  thumbnail={false}  <!-- BAD: Full image in list -->
  class="size-8"
/>
```

**✅ Do** use thumbnails for performance:
```svelte
<AssetImage 
  assetId={product.image} 
  alt={product.name} 
  thumbnail={true}  <!-- GOOD: Thumbnail in list -->
  class="size-8"
/>
```

### 3. Conditional Rendering

**✅ Always check if asset ID exists before rendering**:
```svelte
{#if brand.logo}
  <AssetImage 
    assetId={brand.logo} 
    alt={brand.name} 
    thumbnail={true}
    class="size-8 rounded"
  />
{:else}
  <div class="bg-muted size-8 rounded"></div>
{/if}
```

### 4. Accessibility

**✅ Always provide meaningful alt text**:
```svelte
<!-- GOOD: Descriptive alt text -->
<AssetImage 
  assetId={product.image} 
  alt="{product.name} product image"
  thumbnail={true}
/>

<!-- BAD: Generic alt text -->
<AssetImage 
  assetId={product.image} 
  alt="image"  <!-- Too generic -->
  thumbnail={true}
/>
```

### 5. Responsive Sizing

**✅ Use Tailwind classes for responsive images**:
```svelte
<AssetImage 
  assetId={banner.image} 
  alt={banner.title} 
  thumbnail={false}
  class="w-full h-48 sm:h-64 md:h-96 object-cover rounded-lg"
/>
```

---

## Common Use Cases

### Brand Logos in Table

```svelte
<Table.Cell class="font-medium">
  <div class="flex items-center gap-2">
    {#if brand.logo}
      <AssetImage
        assetId={brand.logo}
        alt={brand.name}
        thumbnail={true}
        class="size-8 rounded object-contain"
      />
    {/if}
    <span>{brand.name}</span>
  </div>
</Table.Cell>
```

### Category Images in Grid

```svelte
<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
  {#each categories as category}
    {#if category.image}
      <div class="relative">
        <AssetImage
          assetId={category.image}
          alt={category.name}
          thumbnail={true}
          class="aspect-square w-full rounded-lg object-cover"
        />
        <div class="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
          <p class="text-white text-sm font-medium">{category.name}</p>
        </div>
      </div>
    {/if}
  {/each}
</div>
```

### Product Image Gallery

```svelte
<script lang="ts">
  let selectedImageId = $state(product.images[0]);
</script>

<!-- Main Image -->
<AssetImage
  assetId={selectedImageId}
  alt={product.name}
  thumbnail={false}
  class="w-full h-96 rounded-lg object-cover"
/>

<!-- Thumbnail Gallery -->
<div class="flex gap-2 mt-4">
  {#each product.images as imageId}
    <button onclick={() => selectedImageId = imageId}>
      <AssetImage
        assetId={imageId}
        alt={product.name}
        thumbnail={true}
        class="size-20 rounded border-2"
        class:border-primary={selectedImageId === imageId}
        class:border-transparent={selectedImageId !== imageId}
      />
    </button>
  {/each}
</div>
```

### Form Preview with Full Image

```svelte
<Card.Root>
  <Card.Header>
    <Card.Title>Product Image</Card.Title>
  </Card.Header>
  <Card.Content class="flex flex-col gap-4">
    {#if selectedImage}
      <AssetImage
        assetId={selectedImage.id}
        alt="Product preview"
        thumbnail={false}
        class="h-48 w-full rounded-md border object-contain bg-white"
      />
      <Button 
        type="button" 
        variant="outline" 
        onclick={handleChangeImage}
      >
        Change Image
      </Button>
    {:else}
      <div class="border-border bg-muted h-48 flex items-center justify-center rounded-md border border-dashed">
        <p class="text-muted-foreground text-sm">No image selected</p>
      </div>
      <Button 
        type="button" 
        variant="outline" 
        onclick={handleSelectImage}
      >
        Select Image
      </Button>
    {/if}
  </Card.Content>
</Card.Root>
```

---

## Troubleshooting

### Image Not Displaying

**Symptom**: Component shows "?" or loading state forever

**Possible Causes**:
1. Invalid asset ID
2. Asset deleted from database but ID still referenced
3. R2 URL expired or inaccessible
4. User not authenticated (requireAdminUser() in getAssetById)

**Solutions**:
```svelte
<!-- Add conditional check -->
{#if brand.logo}
  <AssetImage assetId={brand.logo} alt={brand.name} />
{:else}
  <div class="bg-muted size-8 rounded flex items-center justify-center">
    <ImageOff class="size-4 text-muted-foreground" />
  </div>
{/if}
```

### Performance Issues

**Symptom**: Slow page load with many images

**Solutions**:
1. **Use thumbnails in list views**: `thumbnail={true}`
2. **Lazy load images**: Implement intersection observer
3. **Limit displayed images**: Use pagination
4. **Optimize queries**: Batch asset fetches if needed

### Layout Shift

**Symptom**: Page jumps when images load

**Solutions**:
```svelte
<!-- Define explicit dimensions -->
<AssetImage
  assetId={product.image}
  alt={product.name}
  thumbnail={true}
  class="size-8"  <!-- Fixed size prevents shift -->
/>

<!-- Or use aspect ratio -->
<AssetImage
  assetId={banner.image}
  alt={banner.title}
  thumbnail={false}
  class="aspect-video w-full"  <!-- Maintains space -->
/>
```

---

## Related Documentation

- **Components Structure**: `docs/COMPONENTS_STRUCTURE.md`
- **Authentication**: `docs/AUTHENTICATION.md`
- **Asset Browser**: `src/lib/components/common/forms/asset-browser.svelte`
- **Image Optimizer**: `src/lib/server/image-optimizer.ts`
- **R2 Storage**: `src/lib/server/r2.ts`

---

## Future Enhancements

Potential improvements for the AssetImage component:

1. **Lazy Loading**: Add intersection observer for deferred loading
2. **Blur Placeholder**: Show blurred thumbnail while full image loads
3. **Error Retry**: Automatic retry on fetch failure
4. **Cache Strategy**: Client-side caching of fetched assets
5. **Srcset Support**: Responsive images with multiple sizes
6. **WebP Support**: Automatic format detection and fallback
