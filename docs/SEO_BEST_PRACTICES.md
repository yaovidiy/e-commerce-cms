# SEO Best Practices Implementation Guide

This guide outlines all SEO improvements implemented in this e-commerce CMS and how to maintain and extend them.

## Overview of SEO Improvements

### 1. Server-Side SEO Rendering

All critical SEO data is now rendered on the server-side before sending HTML to the client. This ensures:
- Search engines see complete, properly structured meta tags
- Faster Time to First Contentful Paint (FCP)
- Better SEO scores on Google PageSpeed Insights

**Implementation**:
- Created `src/lib/utils/seo.ts` with utility functions for generating SEO metadata
- Added `+layout.server.ts` for (client) layout to load default SEO from settings
- Added `+page.server.ts` for key pages (homepage, product detail, product listing)

### 2. Enhanced Robots.txt with Admin Exclusion

Updated `src/routes/(client)/robots.txt/+server.ts` to properly exclude:
- `/admin` paths (entire admin panel)
- `/api` endpoints
- `/checkout` pages
- `/dashboard` user dashboard
- `/auth` authentication pages

**Features**:
- Separate rules for different search engines (Google, Bing, Yandex, Baidu)
- Blocked bad bots (AhrefsBot, SemrushBot, MJ12bot, DotBot)
- Crawl-delay for polite bot behavior
- Explicit cache headers (24 hours)

### 3. Server-Side HTTP Headers for SEO

Enhanced `src/hooks.server.ts` with `handleSeoHeaders` middleware that:

**For Admin/Private Paths**:
- Sets `X-Robots-Tag: noindex, nofollow` header
- Prevents caching entirely
- Excludes from indexing at HTTP level

**For Public Pages**:
- Implements smart caching strategy:
  - Homepage & product listing: 1 hour (with stale-while-revalidate)
  - Product detail pages: 24 hours
  - Static assets: 1 year with immutable flag
  - Other pages: 1 hour default

**Security Headers** (added for all pages):
- `X-Content-Type-Options: nosniff` - Prevent MIME sniffing
- `X-Frame-Options: SAMEORIGIN` - Prevent clickjacking
- `Referrer-Policy: strict-origin-when-cross-origin` - Control referrer info
- `Permissions-Policy` - Restrict browser features

### 4. Improved SeoHead Component

Enhanced `src/lib/components/common/utility/seo-head.svelte` with:

**New Features**:
- Title truncation to 60 characters (SEO best practice)
- Description truncation to 160 characters
- Locale and alternate locale support
- JSON-LD structured data support
- Automatic breadcrumb schema generation
- Twitter Card with image optimization (1200x630)
- Additional meta tags:
  - `theme-color` for browser UI
  - `apple-mobile-web-app-capable` for iOS
  - Standard viewport and charset

**Better Structure**:
```svelte
<SeoHead
  title="Product Name | Store"
  description="Product description"
  keywords="keyword1, keyword2"
  image="/image.jpg"
  imageAlt="Alt text"
  type="product"
  canonical="https://example.com/products/slug"
  noindex={false}
  nofollow={false}
  productPrice={1999}
  productCurrency="UAH"
  productAvailability="in stock"
  productBrand="Brand Name"
  structuredData={jsonLdSchema}
  breadcrumbs={[...]}
/>
```

### 5. Structured Data (JSON-LD) Support

Created comprehensive structured data utilities in `src/lib/utils/seo.ts`:

**Supported Schema Types**:
1. **BreadcrumbList** - Navigation hierarchy
2. **Organization** - Company information
3. **LocalBusiness** - Store location and hours
4. **Product** - Product details (for Google Shopping)
5. **FAQPage** - FAQ sections
6. **WebSite** - Website with search box
7. **Article/BlogPosting** - Blog content
8. **Website** - General website info

**Usage Example**:
```typescript
import { createProductSchema, createBreadcrumbSchema } from '$lib/utils/seo';

const productSchema = createProductSchema({
  name: 'Product Name',
  description: 'Description',
  image: ['/image1.jpg', '/image2.jpg'],
  brand: 'Brand',
  sku: 'SKU-123',
  price: 1999,
  currency: 'UAH',
  availability: 'InStock',
  url: 'https://example.com/products/slug'
});
```

### 6. Page-Level Load Functions

Created `+page.server.ts` files for key pages:

**Homepage** (`src/routes/(client)/+page.server.ts`):
- Generates SEO for homepage
- Includes website and organization structured data
- Sets up search functionality schema

**Product Detail** (`src/routes/(client)/products/[slug]/+page.server.ts`):
- Fetches product data server-side
- Generates product-specific SEO
- Creates product JSON-LD schema
- Generates breadcrumb trail
- Handles 404 for missing products

**Product Listing** (`src/routes/(client)/products/+page.server.ts`):
- Generates SEO based on filters (category, brand, search)
- Dynamic titles and descriptions
- Breadcrumb schema

## SEO Checklist for New Pages

When creating a new page, follow this checklist:

### ✅ Create +page.server.ts

```typescript
import type { PageServerLoad } from './$types';
import { generateSeoMeta, createBreadcrumbSchema } from '$lib/utils/seo';

export const load: PageServerLoad = async ({ url }) => {
  const baseUrl = url.origin;

  const seo = generateSeoMeta({
    title: 'Page Title | Store',
    description: 'Page description (160 chars max)',
    keywords: 'keyword1, keyword2, keyword3',
    image: '/og-image.jpg',
    imageAlt: 'Alt text',
    type: 'website',
    canonical: `${baseUrl}/page-path`,
    noindex: false,
    nofollow: false
  });

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Current Page', url: '/page-path' }
  ];

  const breadcrumbSchema = createBreadcrumbSchema(breadcrumbs, baseUrl);

  return { seo, structuredData: { breadcrumb: breadcrumbSchema } };
};
```

### ✅ Use SeoHead Component

```svelte
<script lang="ts">
  import SeoHead from '$lib/components/common/utility/seo-head.svelte';
  
  let { data } = $props();
  const seo = data?.seo;
  const structuredData = data?.structuredData;
</script>

<SeoHead
  title={seo?.title}
  description={seo?.description}
  keywords={seo?.keywords}
  image={seo?.image}
  imageAlt={seo?.imageAlt}
  type={seo?.type}
  canonical={seo?.canonical}
  noindex={seo?.noindex}
  nofollow={seo?.nofollow}
  structuredData={structuredData?.product}
  breadcrumbs={breadcrumbs}
/>
```

### ✅ SEO Content Guidelines

**Titles** (50-60 characters):
- Include primary keyword
- Unique for each page
- Format: "Keyword | Secondary | Brand"
- Example: "Running Shoes for Men | Premium Quality | MyStore"

**Descriptions** (150-160 characters):
- Summarize page content
- Include call-to-action
- Include target keyword naturally
- Example: "Shop premium running shoes for men. Fast shipping, 30-day returns, best prices guaranteed. Browse our collection today."

**Keywords** (5-10 relevant terms):
- Include synonyms and variations
- Don't keyword stuff
- Separate with commas
- Example: "running shoes, athletic shoes, men's shoes, jogging shoes, sports footwear"

### ✅ Image Optimization

All images should have:
- Descriptive alt text (include keywords naturally)
- Optimized file size (< 200KB for thumbnails)
- Multiple formats (WebP for modern browsers)
- Responsive sizes for different devices

```html
<img 
  src="/products/running-shoes.webp" 
  alt="Red running shoes for men with cushioning support"
  loading="lazy"
  width="600"
  height="600"
/>
```

### ✅ Heading Structure

- One `<h1>` per page (page title)
- Proper hierarchy: h1 → h2 → h3
- Include keywords in headings
- Never skip heading levels

```html
<h1>Premium Running Shoes for Men</h1>
<h2>Features</h2>
<h3>Cushioning Technology</h3>
<h3>Breathable Material</h3>
<h2>Customer Reviews</h2>
```

### ✅ Internal Linking

- Link to related products
- Use descriptive anchor text (avoid "click here")
- Limit to 5-10 internal links per page
- Use canonical URLs consistently

```svelte
<a href="/products/running-shoes">Premium running shoes</a>
```

### ✅ Mobile Responsiveness

- Viewport meta tag ✅ (in app.html)
- Touch-friendly buttons (44x44px minimum)
- Readable font size (16px+ for body text)
- Proper spacing on mobile

### ✅ Page Speed

- Images compressed and lazy-loaded ✅
- CSS/JS minified via Vite ✅
- Server caching enabled ✅
- Use Chrome DevTools to check:
  - First Contentful Paint (FCP) < 2.5s
  - Largest Contentful Paint (LCP) < 4s
  - Cumulative Layout Shift (CLS) < 0.1

## Monitoring & Testing

### Google Tools

1. **Google Search Console** (https://search.google.com/search-console)
   - Verify site ownership
   - Submit sitemap
   - Monitor search performance
   - Check for indexing issues

2. **Google PageSpeed Insights** (https://pagespeed.web.dev/)
   - Check FCP, LCP, CLS scores
   - Get optimization recommendations
   - Test mobile and desktop separately

3. **Rich Results Test** (https://search.google.com/test/rich-results)
   - Validate structured data
   - Preview how Google displays your page
   - Check for schema errors

### Testing Checklist

- [ ] All pages have unique titles (50-60 chars)
- [ ] All pages have unique descriptions (150-160 chars)
- [ ] Product pages have structured data
- [ ] Images have descriptive alt text
- [ ] Canonical URLs are correct
- [ ] No 404 errors in Search Console
- [ ] Sitemap updated (automatically done)
- [ ] Robots.txt blocking /admin ✅
- [ ] Mobile viewport is set ✅
- [ ] HTTPS enabled (production)

## Admin Page Exclusion Verification

To verify that admin pages are NOT being indexed:

### Check robots.txt
```bash
curl https://yourdomain.com/robots.txt | grep -i admin
# Should show: Disallow: /admin
```

### Check HTTP Headers
```bash
curl -i https://yourdomain.com/admin/dashboard | grep -i "X-Robots"
# Should show: X-Robots-Tag: noindex, nofollow
```

### Check Search Console
- Go to Settings > Coverage
- Look for "Excluded by robots.txt"
- Verify /admin URLs are excluded

## Maintenance Tasks

### Weekly
- [ ] Check Google Search Console for errors
- [ ] Monitor page speed trends

### Monthly
- [ ] Review top performing keywords
- [ ] Check for broken links
- [ ] Verify structured data is rendering

### Quarterly
- [ ] Conduct full SEO audit
- [ ] Update outdated content
- [ ] Optimize underperforming pages
- [ ] Add new keywords/content

## Advanced SEO Features to Add Later

1. **FAQ Schema** - For FAQ pages
   ```typescript
   createFaqSchema([
     { question: 'Q1?', answer: 'A1' },
     { question: 'Q2?', answer: 'A2' }
   ])
   ```

2. **AMP Pages** - For faster mobile rendering

3. **Voice Search Optimization** - Natural language content

4. **Local SEO** - Location pages with LocalBusiness schema

5. **Social Signals Integration** - OpenGraph and Twitter Card optimization

6. **Schema.org Validation** - Automated testing

7. **Hreflang for Multi-language** - Already configured in i18n

8. **XML Sitemap Images** - Include product images in sitemap

9. **Structured Data Testing** - Automated validation

10. **Core Web Vitals Monitoring** - Continuous performance tracking

## Useful Resources

- [Google Search Central](https://developers.google.com/search)
- [Schema.org Documentation](https://schema.org/)
- [Moz SEO Beginner's Guide](https://moz.com/beginners-guide-to-seo)
- [Search Engine Journal](https://www.searchenginejournal.com/)
- [Web.dev Performance Guide](https://web.dev/performance/)

## Common Issues & Solutions

### Issue: Pages not indexed
**Solution**: 
- Check Google Search Console
- Verify noindex/nofollow not set
- Check robots.txt allows page
- Request indexing in Search Console

### Issue: Admin pages appearing in search
**Solution**:
- Verify X-Robots-Tag header present
- Check robots.txt syntax
- Request removal in Search Console
- Check for duplicate content

### Issue: Structured data not showing
**Solution**:
- Validate with Rich Results Test
- Check schema.org for required fields
- Ensure JSON-LD is valid JSON
- Allow 1-2 weeks for Google to process

### Issue: Page speed slow
**Solution**:
- Compress images
- Enable lazy loading
- Minimize CSS/JS (Vite does this)
- Check server response time
- Use CDN for assets

