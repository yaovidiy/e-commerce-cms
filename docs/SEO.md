# SEO Implementation Guide

## Overview
This document explains how to use the SEO components and utilities for optimal search engine optimization.

## Components Created

### 1. SeoHead Component
**Location**: `src/lib/components/common/utility/seo-head.svelte`

Comprehensive meta tags component for all pages.

**Features**:
- Basic meta tags (title, description, keywords)
- Open Graph tags (Facebook, LinkedIn)
- Twitter Card tags
- Robots directives (index/noindex, follow/nofollow)
- Canonical URLs
- Article-specific meta (published/modified time, author)
- Product-specific meta (price, currency, availability, brand)

**Usage**:
```svelte
<script>
  import { SeoHead } from '$lib/components/common/utility';
</script>

<SeoHead
  title="Product Name - Your Store"
  description="Product description for SEO"
  keywords="keyword1, keyword2, keyword3"
  image="/images/product.jpg"
  imageAlt="Product alt text"
  type="product"
  productPrice={1999}
  productCurrency="UAH"
  productAvailability="in stock"
  productBrand="Brand Name"
/>
```

**Props**:
- `title` (string): Page title
- `description` (string): Meta description
- `keywords` (string): Comma-separated keywords
- `image` (string): OG/Twitter image URL
- `imageAlt` (string): Image alt text
- `type` ('website' | 'article' | 'product'): Content type
- `canonical` (string): Canonical URL (auto-generated if not provided)
- `noindex` (boolean): Prevent indexing
- `nofollow` (boolean): Prevent following links
- `author` (string): Content author
- `publishedTime` (string): ISO timestamp for articles
- `modifiedTime` (string): ISO timestamp for articles
- `productPrice` (number): Product price
- `productCurrency` (string): Currency code (default: 'UAH')
- `productAvailability` ('in stock' | 'out of stock' | 'preorder')
- `productBrand` (string): Brand name

---

### 2. ProductSchema Component
**Location**: `src/lib/components/common/utility/product-schema.svelte`

JSON-LD structured data for product pages (Google Shopping, rich snippets).

**Usage**:
```svelte
<script>
  import { ProductSchema } from '$lib/components/common/utility';
</script>

<ProductSchema
  name="Product Name"
  description="Product description"
  image={['/images/product-1.jpg', '/images/product-2.jpg']}
  brand="Brand Name"
  sku="SKU-12345"
  price={1999}
  currency="UAH"
  availability="InStock"
  condition="NewCondition"
  rating={{ value: 4.5, count: 128 }}
/>
```

**Props**:
- `name` (string, required): Product name
- `description` (string, required): Product description
- `image` (string[], required): Array of image URLs
- `brand` (string): Brand name
- `sku` (string): SKU code
- `price` (number, required): Product price
- `currency` (string): Currency code (default: 'UAH')
- `availability` ('InStock' | 'OutOfStock' | 'PreOrder'): Stock status
- `condition` ('NewCondition' | 'UsedCondition' | 'RefurbishedCondition')
- `rating` ({ value: number, count: number }): Aggregate rating

---

### 3. BreadcrumbSchema Component
**Location**: `src/lib/components/common/utility/breadcrumb-schema.svelte`

JSON-LD structured data for breadcrumb navigation.

**Usage**:
```svelte
<script>
  import { BreadcrumbSchema } from '$lib/components/common/utility';
</script>

<BreadcrumbSchema
  items={[
    { name: 'Home', url: '/' },
    { name: 'Products', url: '/products' },
    { name: 'Category', url: '/products?category=electronics' },
    { name: 'Product Name', url: '/products/product-slug' }
  ]}
/>
```

**Props**:
- `items` (Array<{ name: string, url: string }>, required): Breadcrumb items in order

---

### 4. OrganizationSchema Component
**Location**: `src/lib/components/common/utility/organization-schema.svelte`

JSON-LD structured data for organization info (typically used in footer or homepage).

**Usage**:
```svelte
<script>
  import { OrganizationSchema } from '$lib/components/common/utility';
</script>

<OrganizationSchema
  name="Your Store Name"
  logo="/logo.png"
  description="Store description"
  email="info@yourstore.com"
  phone="+380123456789"
  address={{
    street: '123 Main St',
    city: 'Kyiv',
    region: 'Kyiv Oblast',
    postalCode: '01001',
    country: 'Ukraine'
  }}
  socialMedia={{
    facebook: 'https://facebook.com/yourstore',
    instagram: 'https://instagram.com/yourstore',
    twitter: 'https://twitter.com/yourstore',
    youtube: 'https://youtube.com/yourstore',
    linkedin: 'https://linkedin.com/company/yourstore'
  }}
/>
```

**Props**:
- `name` (string, required): Organization name
- `logo` (string): Logo URL
- `url` (string): Website URL (auto-detected)
- `description` (string): Organization description
- `email` (string): Contact email
- `phone` (string): Contact phone
- `address` (object): Postal address
  - `street` (string)
  - `city` (string)
  - `region` (string)
  - `postalCode` (string)
  - `country` (string)
- `socialMedia` (object): Social media URLs
  - `facebook` (string)
  - `instagram` (string)
  - `twitter` (string)
  - `youtube` (string)
  - `linkedin` (string)

---

### 5. WebSiteSchema Component
**Location**: `src/lib/components/common/utility/website-schema.svelte`

JSON-LD structured data for website with search functionality (for Google Search Box).

**Usage**:
```svelte
<script>
  import { WebSiteSchema } from '$lib/components/common/utility';
</script>

<WebSiteSchema
  name="Your Store"
  description="E-commerce store description"
  searchUrl="/products?search={search_term_string}"
/>
```

**Props**:
- `name` (string, required): Website name
- `url` (string): Website URL (auto-detected)
- `description` (string): Website description
- `searchUrl` (string): Search URL template (default: '/products?search={search_term_string}')

---

## Dynamic Routes

### Sitemap (sitemap.xml)
**Location**: `/sitemap.xml`

Automatically generates XML sitemap with:
- Static pages (home, products, auth pages)
- All active products
- All visible categories
- All visible brands
- All published pages
- All blog posts

**Features**:
- Automatic lastmod timestamps
- Proper priority and changefreq values
- Cached for 1 hour

**Access**: `https://yourdomain.com/sitemap.xml`

---

### Robots.txt
**Location**: `/robots.txt`

Provides crawl directives for search engines.

**Configuration**:
- Allow all pages by default
- Block admin panel (`/admin`)
- Block API endpoints (`/api`)
- Block checkout (`/checkout`)
- Block dashboard (`/dashboard`)
- Block password reset pages
- Sitemap reference
- Crawl-delay for polite bots
- Block abusive bots (MJ12bot, dotbot)

**Access**: `https://yourdomain.com/robots.txt`

---

## Implementation Examples

### Product Detail Page
```svelte
<script lang="ts">
  import { SeoHead, ProductSchema, BreadcrumbSchema } from '$lib/components/common/utility';
  import { getProductBySlug } from '$lib/remotes/product.remote';
  
  let { params } = $props();
  const product = $derived(await getProductBySlug(params.slug));
</script>

<!-- SEO Meta Tags -->
<SeoHead
  title="{product.seoTitle || product.name} - Your Store"
  description={product.seoDescription || product.description}
  keywords={product.name}
  image={product.images[0]?.url}
  imageAlt={product.name}
  type="product"
  productPrice={product.price}
  productCurrency="UAH"
  productAvailability={product.quantity > 0 ? 'in stock' : 'out of stock'}
  productBrand={product.brand?.name}
/>

<!-- Product Structured Data -->
<ProductSchema
  name={product.name}
  description={product.description}
  image={product.images.map(img => img.url)}
  brand={product.brand?.name}
  sku={product.sku}
  price={product.price}
  availability={product.quantity > 0 ? 'InStock' : 'OutOfStock'}
/>

<!-- Breadcrumbs -->
<BreadcrumbSchema
  items={[
    { name: 'Home', url: '/' },
    { name: 'Products', url: '/products' },
    { name: product.category?.name, url: `/products?category=${product.category?.slug}` },
    { name: product.name, url: `/products/${product.slug}` }
  ]}
/>

<!-- Page content -->
<article>
  <h1>{product.name}</h1>
  <!-- ... -->
</article>
```

---

### Homepage
```svelte
<script lang="ts">
  import { SeoHead, WebSiteSchema, OrganizationSchema } from '$lib/components/common/utility';
</script>

<!-- SEO Meta Tags -->
<SeoHead
  title="Your Store - Buy Quality Products Online"
  description="Shop the best products at competitive prices. Fast shipping, secure payment."
  keywords="e-commerce, online shopping, products, Ukraine"
  image="/og-image.jpg"
/>

<!-- Website Schema -->
<WebSiteSchema
  name="Your Store"
  description="E-commerce store for quality products"
/>

<!-- Organization Schema -->
<OrganizationSchema
  name="Your Store"
  logo="/logo.png"
  description="Leading e-commerce platform in Ukraine"
  email="info@yourstore.com"
  phone="+380123456789"
  socialMedia={{
    facebook: 'https://facebook.com/yourstore',
    instagram: 'https://instagram.com/yourstore'
  }}
/>

<!-- Page content -->
```

---

### Blog Post
```svelte
<script lang="ts">
  import { SeoHead, BreadcrumbSchema } from '$lib/components/common/utility';
  import { getPostBySlug } from '$lib/remotes/blog.remote';
  
  let { params } = $props();
  const post = $derived(await getPostBySlug(params.slug));
</script>

<!-- SEO Meta Tags -->
<SeoHead
  title="{post.title} - Blog"
  description={post.content.substring(0, 160)}
  type="article"
  publishedTime={post.createdAt.toISOString()}
  author={post.author.username}
/>

<!-- Breadcrumbs -->
<BreadcrumbSchema
  items={[
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
    { name: post.title, url: `/blog/${post.slug}` }
  ]}
/>

<!-- Page content -->
```

---

### Custom Page (Page Builder)
```svelte
<script lang="ts">
  import { SeoHead } from '$lib/components/common/utility';
  import { getPageBySlug } from '$lib/remotes/page.remote';
  
  let { params } = $props();
  const page = $derived(await getPageBySlug(params.slug));
</script>

<!-- SEO Meta Tags -->
<SeoHead
  title={page.seoTitle || page.title}
  description={page.seoDescription}
  noindex={page.status !== 'published'}
/>

<!-- Page content -->
```

---

## Best Practices

### 1. Title Tags
- Keep under 60 characters
- Include primary keyword
- Format: "Primary Keyword - Secondary Keyword | Brand"
- Make unique for each page

### 2. Meta Descriptions
- Keep 150-160 characters
- Include call-to-action
- Summarize page content
- Include target keyword naturally

### 3. Keywords
- 5-10 relevant keywords
- Use comma separation
- Include synonyms and variations
- Don't stuff keywords

### 4. Images
- Use descriptive alt text
- Optimize image size (< 200KB)
- Use descriptive filenames
- Provide multiple sizes for OG images

### 5. Structured Data
- Always include on product pages
- Use breadcrumbs on all pages
- Organization schema on homepage/footer
- Test with Google Rich Results Test

### 6. Canonical URLs
- Always set for paginated content
- Use for duplicate content prevention
- Point to preferred URL version

### 7. Robots Directives
- Use noindex for duplicate content
- Use noindex for admin/private pages
- Use nofollow for untrusted links
- Default to index, follow for public pages

---

## Testing Tools

### Google Tools
- **Rich Results Test**: https://search.google.com/test/rich-results
- **PageSpeed Insights**: https://pagespeed.web.dev/
- **Search Console**: https://search.google.com/search-console
- **Mobile-Friendly Test**: https://search.google.com/test/mobile-friendly

### Third-Party Tools
- **Schema.org Validator**: https://validator.schema.org/
- **Open Graph Debugger**: https://www.opengraph.xyz/
- **Twitter Card Validator**: https://cards-dev.twitter.com/validator
- **Lighthouse (in Chrome DevTools)**

---

## Monitoring

### Track These Metrics:
1. **Organic traffic** (Google Analytics)
2. **Search impressions** (Google Search Console)
3. **Click-through rate** (Search Console)
4. **Page rankings** (manual or tools)
5. **Core Web Vitals** (PageSpeed Insights)
6. **Rich results** (Search Console)

### Regular Audits:
- [ ] Check sitemap.xml is updating
- [ ] Verify robots.txt is correct
- [ ] Test structured data with Google tools
- [ ] Review meta tags for new pages
- [ ] Check for duplicate content
- [ ] Monitor 404 errors
- [ ] Verify canonical URLs

---

## Troubleshooting

### Sitemap Not Updating
- Check database queries in `/sitemap.xml/+server.ts`
- Verify cache headers (max-age: 3600)
- Manually trigger in Google Search Console

### Rich Results Not Showing
- Validate with Rich Results Test
- Ensure required properties are present
- Allow 1-2 weeks for Google to process
- Check for structured data errors in Search Console

### Meta Tags Not Appearing
- Verify `<svelte:head>` is in correct location
- Check for conflicting meta tags
- Inspect page source (View > Developer > View Source)
- Clear browser cache

### Canonical Issues
- Ensure canonical URL matches actual URL
- Check for http vs https mismatch
- Verify trailing slash consistency

---

## Additional Resources

- [Google Search Central](https://developers.google.com/search)
- [Schema.org Documentation](https://schema.org/)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [MDN Web Docs - SEO](https://developer.mozilla.org/en-US/docs/Glossary/SEO)
