# Blog Management Domain

## Overview
Complete CRUD system for managing blog posts in the admin panel. Allows admin users to create, view, edit, and delete blog posts with automatic slug generation and search functionality.

## Remote Functions
Location: `src/lib/remotes/blog.remote.ts`

### Queries
- `getAllBlogs()` - Retrieves all blog posts
- `getBlog(slug)` - Retrieves a single blog post by slug
- `getBlogById(id)` - Retrieves a single blog post by ID (used for editing)
- `getBlogsByAuthor(authorId)` - Retrieves blog posts by author ID
- `searchBlogsByTitle(title)` - Searches blog posts by title

### Forms
- `createBlog(data)` - Creates a new blog post
  - Uses logged-in user as author (authorId auto-filled)
  - Auto-refreshes blog list after creation
- `updateBlog(data)` - Updates existing blog post
  - Auto-refreshes blog list after update
- `deleteBlog(data)` - Deletes a blog post
  - Auto-refreshes blog list after deletion

## Database Schema
Table: `blog` in `src/lib/server/db/schema.ts`

```typescript
{
  id: text (primary key, UUID)
  title: text (required)
  content: text (required)
  slug: text (required, unique)
  authorId: text (foreign key to user.id)
  createdAt: integer timestamp (required)
}
```

## Validation Schemas
Location: `src/lib/server/schemas/index.ts`

### CreateBlogSchema
```typescript
{
  title: string (1-200 chars)
  content: string (min 1 char)
  slug: string (1-200 chars)
}
```
Note: `authorId` is automatically set from logged-in user

### UpdateBlogSchema
```typescript
{
  id: string
  title: string (1-200 chars)
  content: string (min 1 char)
  slug: string (1-200 chars)
}
```

### DeleteBlogSchema
```typescript
{
  id: string
}
```

## Components

### Admin Feature Components
Location: `src/lib/components/admin/features/blog-management/`

#### BlogListTable
- Displays all blog posts in a table format
- Includes search functionality (filters by title)
- Dropdown menu with actions: View, Edit, Delete
- Auto-refreshes when blog operations complete
- Shows: title, slug, created date, and actions

#### BlogForm
- Form for creating and editing blog posts
- Supports both create and edit modes via `blog` prop
- Auto-generates slug from title (can be manually edited) - only in create mode
- Uses RichTextEditor component for content (supports formatting, images, videos, links)
- Fields: title, slug, content (rich text)
- In edit mode: pre-populates fields with existing blog data
- Redirects to `/admin/blogs` on successful creation/update
- Form validation with error messages
- Dynamic button text based on mode (Create/Save)

#### DeleteBlogDialog
- Confirmation dialog for deleting blogs
- Shows blog title in confirmation message
- Auto-closes and refreshes list on successful deletion

## Routes

### Admin Blogs List Page
Path: `/admin/blogs`
File: `src/routes/admin/blogs/+page.svelte`
- Displays `BlogListTable` component
- "Create Blog" button navigates to create page

### Blog Creation Page
Path: `/admin/blogs/create`
File: `src/routes/admin/blogs/create/+page.svelte`
- Displays `BlogForm` component (create mode)
- Back button returns to blogs list
- Form submission creates blog and redirects to list

### Blog Edit Page
Path: `/admin/blogs/edit/[id]`
File: `src/routes/admin/blogs/edit/[id]/+page.svelte`
- Dynamic route using blog ID as parameter
- Fetches blog data using `getBlogById(id)` query
- Displays `BlogForm` component with blog data (edit mode)
- Back button returns to blogs list
- Shows loading state while fetching blog
- Handles not found and error states
- Form submission updates blog and redirects to list

## Authentication & Authorization
- All blog management operations require admin privileges
- Uses `requireAdminUser()` helper in all remote functions
- Redirects to `/auth/login` if user is not an admin
- Author ID is automatically set to logged-in user on creation

## Features

### Auto-Slug Generation
- Slugs are automatically generated from blog titles
- Converts to lowercase, replaces spaces with hyphens
- Removes special characters, keeps only alphanumeric and hyphens
- User can manually edit slug if needed
- Flag prevents auto-generation after manual edit

### Search & Filter
- Client-side filtering by blog title
- Case-insensitive search
- Instant results as user types

### Automatic Query Refresh
- Blog list automatically refreshes after create/update/delete
- Server-side query refresh in remote function handlers
- Uses `getAllBlogs().refresh()` pattern

## Internationalization
All user-facing text uses translation keys from `messages/{locale}.json`:

### Translation Keys
- `blog_title`, `blog_content`, `blog_slug` - Field labels
- `blog_author`, `blog_created_at` - Display labels
- `blog_create_blog`, `blog_create_new_blog` - Action buttons
- `blog_edit_blog`, `blog_delete_blog`, `blog_view` - Menu actions
- `blog_no_blogs` - Empty state message
- `blog_search_placeholder` - Search input placeholder
- `blog_*_placeholder` - Form field placeholders
- `blog_*_description` - Dialog descriptions
- `blog_delete_confirmation` - Confirmation message with title parameter

## Usage Patterns

### Creating a Blog
1. Navigate to `/admin/blogs`
2. Click "Create Blog" button
3. Fill in title (slug auto-generates)
4. Edit slug if needed
5. Write content in textarea
6. Click "Create" to submit
7. Redirected to blogs list with new post

### Viewing Blogs
1. Navigate to `/admin/blogs`
2. Use search to filter by title
3. View title, slug, created date in table
4. Click actions menu (three dots) for operations

### Editing Blogs
1. In blogs list, click actions menu on desired blog
2. Select "Edit" to navigate to `/admin/blogs/edit/{id}`
3. Blog data is fetched and pre-populated in form
4. Modify title, slug, or content as needed
5. Click "Save" to update
6. Redirected to blogs list with updated post
7. List auto-refreshes after operation

### Deleting Blogs
1. In blogs list, click actions menu on desired blog
2. Select "Edit" to modify (route: `/admin/blogs/edit/{id}`)
3. Or select "Delete" to open confirmation dialog
4. Confirm deletion to permanently remove blog
5. List auto-refreshes after operation

## Best Practices

### Remote Functions
- Always use `requireAdminUser()` for admin operations
- Auto-refresh related queries after mutations
- Return meaningful data from form handlers
- Use proper Valibot validation schemas

### Components
- Follow 4-tier component architecture (admin/features/blog-management/)
- Use barrel exports in `index.ts`
- Implement auto-refresh with `$effect()` watching `form.result`
- Use translation keys for all user-facing text

### Forms
- Spread form object onto `<form>` element: `{...createBlog}`
- Use `fields.as()` method for inputs: `{...createBlog.fields.title.as('text')}`
- Display validation errors: `{#each form.fields.title.issues() as issue}`
- Check pending state: `disabled={!!createBlog.pending}`

### Search & Filter
- Implement client-side filtering for simple use cases
- Use server-side filtering for large datasets
- Debounce search input for better performance
- Show empty state when no results

## Future Enhancements
Potential improvements for blog management:

1. ~~**Rich Text Editor**~~ ✅ **Implemented** - TipTap editor with formatting, images, videos, links
2. ~~**Edit Page**~~ ✅ **Implemented** - Edit route at `/admin/blogs/edit/[id]` with dynamic parameter
3. **Image Upload** - Add featured image support with local storage/CDN
4. **Categories/Tags** - Add taxonomy system
5. **Draft Status** - Add published/draft status field
6. **Pagination** - Add pagination for large blog lists
7. **Preview** - Add blog preview before publishing
8. **SEO Fields** - Add meta description, keywords
9. **Scheduled Publishing** - Add future publish dates
10. **Bulk Actions** - Select multiple blogs for batch operations

## Rich Text Editor

### Component
Location: `src/lib/components/common/forms/rich-text-editor.svelte`

### Features
- **Text Formatting**: Bold, italic, strikethrough, inline code
- **Text Alignment**: Left, center, right, justify alignment for paragraphs and headings
- **Headings**: H1, H2, H3 support
- **Lists**: Bullet lists and numbered lists
- **Blockquotes**: Quote formatting
- **Links**: Add/edit hyperlinks
- **Images**: Insert images via URL
- **YouTube Videos**: Embed YouTube videos via URL
- **Undo/Redo**: Full history support
- **Clear Formatting**: Remove all formatting

### Technology
- Built with **TipTap v3** (headless rich text editor)
- Extensions: StarterKit, Link, Image, Youtube, TextAlign
- Fully reactive with Svelte 5 runes
- Stores content as HTML

### Usage
```svelte
<script>
  import { RichTextEditor } from '$lib/components/common/forms';
  let content = $state('');
</script>

<RichTextEditor 
  bind:value={content} 
  placeholder="Write something..." 
/>
```

### Toolbar Actions
- Text: Bold, Italic, Strikethrough, Code
- Alignment: Left, Center, Right, Justify
- Headings: H1, H2, H3
- Lists: Bullet list, Ordered list, Blockquote
- Media: Link, Image, YouTube video
- History: Undo, Redo, Clear formatting

### Styling
- Uses Tailwind CSS for consistent styling
- Prose styles for content rendering
- Responsive toolbar layout
- Active button highlighting
- Disabled state support
