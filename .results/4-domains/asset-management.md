# Asset Management Domain

## Overview
Complete asset management system with Cloudflare R2 storage, automatic image optimization, and integrated media library. Allows admin users to upload, browse, and manage images with automatic compression, thumbnail generation, and CDN delivery.

## Technology Stack
- **Cloudflare R2** - S3-compatible object storage with zero egress fees
- **Sharp** - High-performance image processing (resize, compress, thumbnail generation)
- **@aws-sdk/client-s3** - S3-compatible client for R2 operations
- **TipTap Integration** - Asset browser integrated into rich text editor

## Remote Functions
Location: `src/lib/remotes/asset.remote.ts`

### Commands
- `uploadAsset(data)` - Upload image file to R2
  - Validates file type (JPEG, PNG, GIF, WebP, SVG)
  - Validates file size (max 10MB)
  - Optimizes image (max 1920x1080, 85% quality)
  - Generates thumbnail (200x200, 80% quality)
  - Uploads both versions to R2
  - Stores metadata in database
  - Auto-refreshes asset list

### Queries
- `getAllAssets(data)` - Retrieves all assets with filtering
  - Optional filename search
  - Optional MIME type filter
  - Ordered by creation date (newest first)
- `getAssetById(id)` - Retrieves single asset by ID

### Forms
- `deleteAsset(data)` - Deletes asset from R2 and database
  - Removes original image from R2
  - Removes thumbnail from R2
  - Deletes database record
  - Auto-refreshes asset list

## Database Schema
Table: `asset` in `src/lib/server/db/schema.ts`

```typescript
{
  id: text (primary key, UUID)
  filename: text (required, unique R2 filename)
  originalFilename: text (required, user's original filename)
  mimeType: text (required, e.g., 'image/jpeg')
  size: integer (required, bytes)
  url: text (required, public R2 URL)
  thumbnailUrl: text (optional, thumbnail R2 URL)
  uploadedBy: text (foreign key to user.id, required)
  createdAt: integer timestamp (required)
}
```

## Validation Schemas
Location: `src/lib/server/schemas/index.ts`

### DeleteAssetSchema
```typescript
{
  id: string
}
```

### FilterAssetsSchema
```typescript
{
  filename: string (optional)
  mimeType: string (optional)
}
```

### Upload Validation (in remote function)
- File type: Must be one of `['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']`
- File size: Maximum 10MB (10 * 1024 * 1024 bytes)
- Image validity: Verified with Sharp

## Server Utilities

### R2 Client (`src/lib/server/r2.ts`)
S3-compatible client for Cloudflare R2 operations.

**Environment Variables:**
- `CLOUDFLARE_ACCOUNT_ID` - Cloudflare account ID
- `CLOUDFLARE_R2_ACCESS_KEY_ID` - R2 API access key
- `CLOUDFLARE_R2_SECRET_ACCESS_KEY` - R2 API secret key
- `CLOUDFLARE_R2_BUCKET_NAME` - R2 bucket name
- `CLOUDFLARE_R2_PUBLIC_URL` - Public URL for the bucket (optional)

**Functions:**
- `uploadToR2(key, body, contentType)` - Upload file to R2, returns public URL
- `deleteFromR2(key)` - Delete file from R2
- `getFromR2(key)` - Download file from R2
- `extractKeyFromUrl(url)` - Extract R2 key from URL

### Image Optimizer (`src/lib/server/image-optimizer.ts`)
Server-side image processing with Sharp.

**Functions:**
- `processImage(buffer)` - Main function:
  - Optimizes original (max 1920x1080, JPEG 85% quality)
  - Creates thumbnail (200x200, JPEG 80% quality)
  - Returns both buffers with sizes
- `optimizeImage(buffer, maxWidth, maxHeight, quality)` - Resize and compress
- `createThumbnail(buffer, size, quality)` - Generate square thumbnail
- `getImageDimensions(buffer)` - Get width and height
- `isValidImage(buffer)` - Validate image buffer
- `convertToWebP(buffer, quality)` - Convert to WebP format (unused, future enhancement)

## Components

### Common Forms Components
Location: `src/lib/components/common/forms/`

#### ImageUploader
Drag-and-drop image uploader with preview and validation.

**Props:**
- `onUploadComplete?: (asset) => void` - Callback when upload succeeds
- `class?: string` - Additional CSS classes
- `disabled?: boolean` - Disable upload
- `accept?: string` - File accept attribute (default: 'image/*')

**Features:**
- Drag and drop support
- Click to browse
- File type validation (images only)
- File size validation (10MB max)
- Image preview before upload
- Upload progress state
- Error messages
- Keyboard accessible

**Usage:**
```svelte
<ImageUploader onUploadComplete={(asset) => console.log(asset)} />
```

#### AssetBrowser
Dialog for browsing and selecting uploaded assets, with upload option.

**Props:**
- `open?: boolean` (bindable) - Dialog open state
- `onSelect: (asset) => void` - Callback when asset is selected

**Features:**
- Grid view of all assets
- Thumbnail previews
- Search by filename
- Toggle between browse and upload views
- Upload new assets inline
- Click to select
- Hover preview

**Usage:**
```svelte
<AssetBrowser
  bind:open={dialogOpen}
  onSelect={(asset) => editor.insertImage(asset.url)}
/>
```

#### RichTextEditor (Enhanced)
TipTap rich text editor now integrated with AssetBrowser.

**Changes:**
- Image button opens AssetBrowser instead of URL prompt
- Selects images from R2 storage
- Inserts images via AssetBrowser selection

### Admin Feature Components
Location: `src/lib/components/admin/features/asset-management/`

#### AssetListGrid
Grid view of all uploaded assets with management actions.

**Features:**
- Responsive grid layout (1-4 columns based on screen size)
- Thumbnail/image previews
- Search by filename
- File size and upload date display
- Actions:
  - Copy URL to clipboard
  - View full size (opens in new tab)
  - Delete asset
- Empty state
- Loading state
- Error handling

**Usage:**
```svelte
<AssetListGrid />
```

#### DeleteAssetDialog
Confirmation dialog for deleting assets.

**Props:**
- `asset: Asset | null` - Asset to delete
- `open?: boolean` (bindable) - Dialog open state

**Features:**
- Shows asset preview in dialog
- Displays filename in confirmation message
- Auto-closes on successful deletion
- Disabled state during deletion
- Form-based deletion (progressive enhancement)

**Usage:**
```svelte
<DeleteAssetDialog asset={selectedAsset} bind:open={dialogOpen} />
```

## Routes

### Assets Management Page
Path: `/admin/assets`
File: `src/routes/admin/assets/+page.svelte`

**Features:**
- Page header with title and description
- Upload button (opens dialog with ImageUploader)
- AssetListGrid component
- Requires admin authentication

**Layout:**
```
[Header: "Media Library" + Upload Button]
[AssetListGrid with search and cards]
```

## Authentication
All asset operations require admin authentication:
- `uploadAsset` - Admin only (uses `requireAdminUser()`)
- `getAllAssets` - Admin only
- `getAssetById` - Admin only
- `deleteAsset` - Admin only

## File Organization

### R2 Storage Structure
```
bucket-name/
  images/
    {timestamp}-{random}.jpg          # Original optimized image
    {timestamp}-{random}-thumb.jpg    # Thumbnail
```

**Filename Pattern:**
- Timestamp: `Date.now()` (milliseconds)
- Random string: 13 characters (alphanumeric)
- Extension: Based on MIME type

**Example:**
```
1699894523456-abc123def4567.jpg
1699894523456-abc123def4567-thumb.jpg
```

## Image Optimization

### Original Image
- **Max dimensions:** 1920x1080 pixels
- **Format:** JPEG
- **Quality:** 85%
- **Fit:** Inside (maintains aspect ratio, no enlargement)
- **Algorithm:** MozJPEG (better compression)

### Thumbnail
- **Dimensions:** 200x200 pixels
- **Format:** JPEG
- **Quality:** 80%
- **Fit:** Cover (crops to center)
- **Algorithm:** MozJPEG

### Size Reduction
Typical compression results:
- Original 5MB image → ~500KB optimized
- Thumbnail → ~15KB
- Total storage per image: ~515KB
- **Savings:** ~90% reduction in file size

## Translations
Location: `messages/en.json`, `messages/uk.json`

### Asset Keys
- `asset_filename` - "Filename"
- `asset_original_filename` - "Original Filename"
- `asset_size` - "Size"
- `asset_type` - "Type"
- `asset_uploaded_by` - "Uploaded By"
- `asset_uploaded_at` - "Uploaded At"
- `asset_url` - "URL"
- `asset_no_assets` - "No assets found"
- `asset_upload` - "Upload Asset"
- `asset_upload_new` - "Upload New Asset"
- `asset_upload_description` - "Upload images to your media library."
- `asset_delete` - "Delete Asset"
- `asset_delete_description` - "This action cannot be undone."
- `asset_delete_confirmation` - "Are you sure you want to delete {filename}?"
- `asset_manage_description` - "Manage media assets and images"
- `asset_search_placeholder` - "Search assets by filename..."
- `asset_drag_drop` - "Drag & drop an image here, or click to select"
- `asset_select_image` - "Select Image"
- `asset_upload_success` - "Image uploaded successfully"
- `asset_upload_error` - "Error uploading image"
- `asset_max_size` - "Maximum file size: 10MB"
- `asset_allowed_types` - "Allowed types: JPEG, PNG, GIF, WebP, SVG"
- `asset_uploading` - "Uploading..."
- `asset_preview` - "Preview"
- `asset_copy_url` - "Copy URL"
- `asset_url_copied` - "URL copied to clipboard"
- `asset_thumbnail` - "Thumbnail"
- `asset_view_full` - "View Full Size"
- `asset_insert` - "Insert"
- `asset_browse` - "Browse Assets"
- `asset_select` - "Select"
- `asset_media_library` - "Media Library"

## Integration with Rich Text Editor

### Before
```typescript
function addImage() {
  const url = window.prompt('Enter image URL:');
  if (url && editor) {
    editor.chain().focus().setImage({ src: url }).run();
  }
}
```

### After
```typescript
let assetBrowserOpen = $state(false);

function addImage() {
  assetBrowserOpen = true;
}

function handleAssetSelect(asset: { url: string }) {
  if (editor) {
    editor.chain().focus().setImage({ src: asset.url }).run();
  }
}

// In template:
<AssetBrowser bind:open={assetBrowserOpen} onSelect={handleAssetSelect} />
```

## Usage Patterns

### Upload Asset Flow
1. User clicks "Upload" button or drags image
2. ImageUploader validates file (type, size)
3. Image preview shown with file info
4. User confirms upload
5. `uploadAsset` command processes image:
   - Validates it's a real image
   - Generates unique filename
   - Optimizes original image
   - Creates thumbnail
   - Uploads both to R2
   - Saves metadata to database
6. Asset appears in grid immediately (auto-refresh)

### Select Asset from Editor Flow
1. User clicks image button in rich text editor
2. AssetBrowser dialog opens
3. User can:
   - Browse existing assets (search, click to select)
   - Upload new asset (toggle to upload view)
4. On selection:
   - Dialog closes
   - Image inserted at cursor position in editor
   - Image uses R2 URL (CDN-delivered)

### Delete Asset Flow
1. User clicks dropdown menu on asset card
2. Selects "Delete" from menu
3. DeleteAssetDialog opens with preview
4. User confirms deletion
5. `deleteAsset` form handler:
   - Removes original from R2
   - Removes thumbnail from R2
   - Deletes database record
   - Auto-refreshes grid
6. Asset removed from grid immediately

## Cost Estimation

### Cloudflare R2 Free Tier
- Storage: 10 GB/month
- Class A operations (writes): 10 million/month
- Class B operations (reads): 100 million/month
- Egress: **UNLIMITED FREE**

### Example Usage
**Assumptions:**
- Average image: 500KB (optimized) + 15KB (thumbnail) = 515KB
- 100 uploads per month
- 10,000 views per month

**Calculations:**
- Storage: 100 images × 515KB = ~51 MB (**within free tier**)
- Writes: 200 operations (100 images × 2 files) (**within free tier**)
- Reads: 10,000 operations (**within free tier**)
- Egress: Unlimited (**FREE**)

**Cost: $0/month** 🎉

### Scaling Examples

**1,000 images + 100K views:**
- Storage: ~500 MB (**within free tier**)
- Writes: 2,000 operations (**within free tier**)
- Reads: 100,000 operations (**within free tier**)
- **Cost: $0/month**

**10,000 images + 1M views:**
- Storage: ~5 GB (**within free tier**)
- Writes: 20,000 operations (**within free tier**)
- Reads: 1,000,000 operations (**within free tier**)
- **Cost: $0/month**

**100,000 images + 10M views:**
- Storage: ~50 GB ($0.60/month over free tier)
- Writes: 200,000 operations (**within free tier**)
- Reads: 10,000,000 operations (**within free tier**)
- **Cost: ~$0.60/month**

## Best Practices

### File Upload
- Always validate file type and size client-side (better UX)
- Re-validate server-side (security)
- Show preview before upload (confirmation)
- Provide clear error messages
- Limit file size (10MB is generous for web images)

### Image Optimization
- Optimize on upload (one-time cost)
- Store optimized version (save storage)
- Generate thumbnails (fast grid loading)
- Use JPEG for photos (better compression than PNG)
- Consider WebP for future enhancement (better than JPEG)

### Asset Management
- Auto-refresh lists after mutations (consistent UI)
- Use thumbnails in grids (performance)
- Provide search (usability at scale)
- Show file size and date (user context)
- Confirm destructive actions (prevent accidents)

### R2 Integration
- Use unique filenames (prevent conflicts)
- Include timestamp in filename (sortable)
- Organize in folders (`images/`)
- Store metadata in database (faster queries)
- Clean up orphaned files periodically (future enhancement)

### Security
- Require admin auth for all operations
- Validate file types server-side
- Limit file sizes
- Use unique, unpredictable filenames
- Don't expose R2 credentials client-side

## Future Enhancements
Potential improvements for asset management:

1. **Image Transformations** - On-the-fly resize via URL parameters
2. **Multiple Sizes** - Generate small, medium, large versions
3. **Usage Tracking** - Show which blogs use which assets
4. **Bulk Upload** - Multiple files at once
5. **Folders/Albums** - Organize assets into categories
6. **Alt Text** - Store accessibility descriptions
7. **CDN Custom Domain** - Use own domain for assets
8. **Video Support** - Upload and process videos
9. **PDF Support** - Document uploads
10. **Orphan Cleanup** - Delete unused assets automatically
11. **Image Editing** - Crop, rotate, filters in browser
12. **WebP Conversion** - Auto-convert to WebP for browsers that support it

## Troubleshooting

### Upload Fails
**Symptom:** "Error uploading image" message
**Possible causes:**
1. R2 credentials incorrect - Check `.env` file
2. Bucket doesn't exist - Create bucket in R2 dashboard
3. File size too large - Check 10MB limit
4. Invalid image file - Try different image

### Images Not Loading
**Symptom:** Broken image in grid or editor
**Possible causes:**
1. Public URL not configured - Check `CLOUDFLARE_R2_PUBLIC_URL`
2. Bucket not public - Enable public access in R2 settings
3. File deleted from R2 - Database record exists but file doesn't

### Slow Upload
**Symptom:** Upload takes very long
**Possible causes:**
1. Large image file - Optimize image before upload
2. Slow internet connection - Normal for large files
3. Server processing time - Sharp optimization takes time for huge images

### Cannot Delete Asset
**Symptom:** Delete fails silently
**Possible causes:**
1. Not admin user - Check authentication
2. Asset doesn't exist - Refresh page
3. R2 delete fails - Check console for errors (will still delete from DB)

## Summary
Complete, production-ready asset management system with:
- ✅ Cloudflare R2 storage (zero egress fees)
- ✅ Automatic image optimization (90% size reduction)
- ✅ Thumbnail generation (fast loading)
- ✅ Drag & drop upload
- ✅ Asset browser for rich text editor
- ✅ Search and filter
- ✅ Copy URL to clipboard
- ✅ Delete with confirmation
- ✅ Admin authentication
- ✅ Full i18n support
- ✅ Responsive design
- ✅ Free tier covers most use cases
- ✅ Type-safe with TypeScript
- ✅ Progressive enhancement (forms work without JS)
