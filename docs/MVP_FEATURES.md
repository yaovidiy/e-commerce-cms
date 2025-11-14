# MVP Features List - E-commerce CMS

## Overview
This document outlines the minimum viable product (MVP) features required for a fully functional e-commerce website with an admin panel for content management without code changes.

---

## Current Implementation Status

### ✅ Completed Features
1. **User Authentication & Management**
   - User registration/login
   - Session management
   - Admin/user roles
   - User CRUD operations in admin panel

2. **Blog Management**
   - Blog post creation/editing/deletion
   - Rich text editor
   - Admin panel for blog management

3. **Asset Management**
   - Image upload to Cloudflare R2
   - Image optimization with Sharp
   - Thumbnail generation
   - Asset library in admin panel

4. **Internationalization (i18n)**
   - Multi-language support (English, Ukrainian)
   - Compile-time translations

---

## 🚧 Required MVP Features

### 1. **Product Management** (Priority: CRITICAL)

#### 1.1 Product Catalog
**Database Schema:**
- `product` table with fields:
  - id, name, description, slug
  - price, compareAtPrice (for sale pricing)
  - sku, barcode
  - quantity (inventory)
  - status (draft, active, archived)
  - categoryId, brandId
  - images (JSON array of asset IDs)
  - variants (JSON for size/color variations)
  - seo_title, seo_description
  - createdAt, updatedAt

**Admin Features:**
- Product list with search/filter/pagination
- Create/Edit/Delete products
- Bulk actions (delete, status change, export)
- Image gallery management
- Inventory tracking
- SEO optimization fields
- Product variant management (size, color, etc.)

**Customer Features:**
- Product listing page with filters
- Product detail page
- Product search
- Related products
- Recently viewed products

---

### 2. **Category & Brand Management** (Priority: CRITICAL)

#### 2.1 Categories
**Database Schema:**
- `category` table:
  - id, name, slug, description
  - parentId (for nested categories)
  - image (asset ID)
  - displayOrder
  - isVisible
  - seo_title, seo_description
  - createdAt, updatedAt

**Admin Features:**
- Hierarchical category tree management
- Drag-and-drop ordering
- Category image upload
- Create/Edit/Delete categories
- SEO optimization

**Customer Features:**
- Category navigation menu
- Category landing pages with products
- Breadcrumb navigation

#### 2.2 Brands
**Database Schema:**
- `brand` table:
  - id, name, slug, description
  - logo (asset ID)
  - isVisible
  - createdAt, updatedAt

**Admin Features:**
- Brand list management
- Create/Edit/Delete brands
- Logo upload

**Customer Features:**
- Brand filtering
- Brand landing pages

---

### 3. **Shopping Cart & Checkout** (Priority: CRITICAL)

#### 3.1 Cart Management
**Database Schema:**
- `cart` table:
  - id, sessionId/userId
  - items (JSON array)
  - subtotal, total
  - createdAt, updatedAt

**Features:**
- Add to cart (with variant selection)
- Update quantity
- Remove items
- Cart persistence (session/user-based)
- Cart drawer/modal
- Mini cart in header
- Applied discounts display

#### 3.2 Checkout Process
**Database Schema:**
- `order` table:
  - id, orderNumber
  - userId (optional for guest checkout)
  - status (pending, processing, shipped, delivered, cancelled, refunded)
  - items (JSON array)
  - shippingAddress (JSON)
  - billingAddress (JSON)
  - customerEmail, customerPhone
  - subtotal, shippingCost, tax, discount, total
  - paymentMethod, paymentStatus
  - shippingMethod
  - notes
  - createdAt, updatedAt, shippedAt, deliveredAt

**Features:**
- Guest checkout option
- Customer information form
- Shipping address form
- Billing address form (same as shipping option)
- Shipping method selection
- Order summary
- Order confirmation page
- Order confirmation email

---

### 4. **Payment Integration** (Priority: CRITICAL)

#### 4.1 Payment Gateway
**Recommended Providers:**
- LiqPay (primary - for Ukraine market)
- Stripe (optional for global expansion)
- PayPal (optional)

**Database Schema:**
- `payment` table:
  - id, orderId
  - provider (liqpay, stripe, paypal, etc.)
  - transactionId
  - amount, currency
  - status (pending, completed, failed, refunded)
  - liqpayData (JSON - payment_id, status, etc.)
  - metadata (JSON)
  - createdAt, updatedAt

**Features:**
- Multiple payment method support
- Secure payment processing
- Payment status tracking
- Refund processing
- Payment history in admin

---

### 4.5 **Checkbox РРО Integration** (Priority: CRITICAL for Ukraine)

#### 4.5.1 Fiscal Receipt System
**About Checkbox:**
- Leading cloud-based fiscal receipt system (програмний РРО) in Ukraine
- Required by Ukrainian law for all businesses conducting sales (ФОП групи 2-4, юридичні особи)
- Replaces traditional physical cash registers with cloud software
- Official fiscal data transmission to State Tax Service (ДПС України)
- Cost: 249 UAH/month per cash register (30-day free trial)

**Database Schema:**
- `checkbox_receipt` table:
  - id, orderId
  - receiptId (from Checkbox API)
  - fiscalCode (фіскальний номер чека)
  - receiptUrl (link to electronic receipt)
  - status (created, sent, error, cancelled)
  - checkboxData (JSON - full receipt data)
  - shiftId (касова зміна ID)
  - cashRegisterId (каса ID)
  - createdAt, updatedAt

- `checkbox_shift` table:
  - id, shiftId
  - cashRegisterId
  - status (opened, closed)
  - openedAt, closedAt
  - balance (готівка, безготівка)

**Integration Features:**
- Automatic receipt generation on successful LiqPay payment only
- Electronic receipt delivery (email, SMS, Viber)
- Paper receipt printing via thermal printer (optional)
- Real-time fiscal data transmission to ДПС
- Shift management (відкриття/закриття зміни)
- X-reports and Z-reports (денні звіти)
- Refund receipt generation (for LiqPay refunds)
- Multiple cash registers support
- Offline mode support (queue receipts when internet lost)
- Receipt history and search

**Important Note:**
Checkbox receipts are generated **only for orders paid via LiqPay**. Cash-on-delivery (COD) or other payment methods that don't involve immediate online payment will not trigger automatic receipt generation. This aligns with Ukrainian fiscal requirements where receipts must be issued at the moment of payment.

**Admin Features:**
- Configure Checkbox API credentials (login, password, license key)
- Manage cash registers (торгові точки)
- Manage cashiers (касири)
- View receipt history
- Generate reports (shift reports, daily reports)
- Manual receipt creation
- Receipt correction/cancellation
- Tax rate configuration (ПДВ settings)
- Shift opening/closing

**API Integration:**
Checkbox provides REST API for:
- Authentication (login, token refresh)
- Cash register management
- Receipt creation (sale, return, service)
- Shift operations (open, close)
- Reports generation
- Receipt search and retrieval

**Receipt Types:**
- **Sale receipt** (чек продажу) - standard purchase
- **Return receipt** (чек повернення) - product return/refund
- **Service receipt** (службовий чек) - cash in/out operations

**Required Receipt Data:**
- Goods/services list with prices
- Payment type (готівка, картка, змішаний)
- VAT information (if applicable)
- Cashier information
- Cash register information
- Customer contact (email/phone for electronic receipt)

**Implementation Steps:**
1. Register on checkbox.ua and create account
2. Configure cash register (каса) and add cashiers
3. Obtain API credentials
4. Implement API client in SvelteKit
5. Listen for successful LiqPay payment webhook
6. Create Checkbox receipt only when payment method is LiqPay and status is 'success'
7. Send electronic receipt to customer
8. Handle offline queue and retry logic
9. Implement shift management
10. Generate reports for admin

**Legal Compliance:**
- All online payment transactions (LiqPay) MUST generate fiscal receipt
- Receipt must be issued immediately upon successful payment
- Fiscal data transmitted to ДПС in real-time
- Receipt must contain all legally required information
- Z-reports must be generated at shift close
- Receipt data stored for 3 years minimum
- Cash-on-delivery orders require manual receipt generation upon actual payment delivery

**Error Handling:**
- Queue receipts when Checkbox API unavailable
- Retry failed receipts automatically
- Admin notification on receipt creation failure
- Manual receipt creation option for edge cases

---

### 5. **Order Management** (Priority: CRITICAL)

**Admin Features:**
- Order list with search/filter
- Order detail view
- Order status management
- Print invoice/packing slip
- Order notes
- Refund processing
- Email customer notifications
- Export orders

**Customer Features:**
- Order history (for registered users)
- Order tracking
- Order status updates
- Re-order functionality
- Cancel order (if status allows)

---

### 6. **Customer Account** (Priority: HIGH)

#### 6.1 Customer Profile
**Database Schema Extensions:**
- Update `user` table:
  - firstName, lastName
  - phone
  - defaultShippingAddressId
  - defaultBillingAddressId
  - marketingOptIn
  - lastLoginAt

- `address` table:
  - id, userId
  - firstName, lastName
  - company (optional)
  - address1, address2
  - city, state/province, zip/postalCode
  - country
  - phone
  - isDefault
  - createdAt, updatedAt

**Features:**
- Profile management
- Address book
- Order history
- Wishlist (future enhancement)
- Email preferences

---

### 7. **Shipping Management** (Priority: HIGH)

**Database Schema:**
- `shipping_zone` table:
  - id, name
  - countries (JSON array)
  - createdAt, updatedAt

- `shipping_rate` table:
  - id, zoneId
  - name
  - description
  - price
  - minOrderAmount, maxOrderAmount
  - estimatedDays
  - isActive
  - createdAt, updatedAt

**Admin Features:**
- Define shipping zones
- Configure shipping rates
- Weight-based or price-based shipping
- Free shipping rules
- Flat rate shipping

---

### 8. **Discount & Promotion System** (Priority: HIGH)

**Database Schema:**
- `discount` table:
  - id, code
  - type (percentage, fixed, free_shipping)
  - value
  - minOrderAmount
  - maxUsesTotal, maxUsesPerCustomer
  - currentUses
  - startsAt, endsAt
  - isActive
  - applicableProducts (JSON array - null for all)
  - applicableCategories (JSON array - null for all)
  - createdAt, updatedAt

**Admin Features:**
- Create discount codes
- Percentage or fixed amount discounts
- Free shipping codes
- Usage limits
- Product/category restrictions
- Date range validity
- Bulk discount code generation

**Customer Features:**
- Apply discount code at checkout
- Automatic discount application
- Discount display in cart/checkout

---

### 9. **Inventory Management** (Priority: MEDIUM)

**Database Schema Extensions:**
- Update `product` table:
  - trackInventory (boolean)
  - quantity
  - lowStockThreshold
  - allowBackorders

- `inventory_transaction` table:
  - id, productId, variantId
  - type (sale, restock, adjustment, return)
  - quantity
  - note
  - orderId (if applicable)
  - createdBy
  - createdAt

**Admin Features:**
- Stock level monitoring
- Low stock alerts
- Inventory adjustment
- Stock history
- Backorder management
- CSV import/export for bulk updates

---

### 10. **Site Configuration & CMS** (Priority: HIGH)

#### 10.1 Site Settings
**Database Schema:**
- `site_setting` table:
  - key (unique)
  - value (text)
  - type (string, number, boolean, json)
  - category (general, store, checkout, etc.)
  - updatedAt

**Configurable Settings:**
- Store name, logo, favicon
- Contact information
- Social media links
- Currency settings
- Tax settings
- Email templates
- Store policies (privacy, terms, returns)
- Meta tags (default SEO)

**Admin Features:**
- Settings management interface
- Logo/favicon upload
- Email template editor
- Policy page editor

#### 10.2 Page Builder (Content Management)
**Database Schema:**
- `page` table:
  - id, title, slug
  - content (JSON - structured content blocks)
  - template
  - status (draft, published)
  - seo_title, seo_description
  - createdAt, updatedAt, publishedAt

**Content Block Types:**
- Hero banner
- Text block
- Image block
- Image gallery
- Product showcase
- Category showcase
- Video embed
- HTML/Custom code
- Newsletter signup
- Testimonials

**Admin Features:**
- Drag-and-drop page builder
- Reusable content blocks
- Template selection
- Preview before publish
- Page management (create/edit/delete)

---

### 11. **Banner & Promotion Management** (Priority: MEDIUM)

**Database Schema:**
- `banner` table:
  - id, title
  - image (asset ID)
  - link, linkText
  - position (home_hero, home_secondary, category_top, etc.)
  - displayOrder
  - startsAt, endsAt
  - isActive
  - createdAt, updatedAt

**Admin Features:**
- Banner CRUD operations
- Multiple banner positions
- Scheduling (start/end dates)
- Click-through URL
- Ordering/prioritization
- Image upload with optimization

**Customer Features:**
- Responsive banner display
- Automatic banner rotation
- Position-based rendering

---

### 12. **Search & Filtering** (Priority: HIGH)

**Features:**
- Full-text product search
- Autocomplete suggestions
- Search results page
- Filter by:
  - Category
  - Brand
  - Price range
  - Attributes (color, size, etc.)
  - Availability
  - Rating (future)
- Sort by:
  - Relevance
  - Price (low to high, high to low)
  - Newest
  - Best selling
  - Name (A-Z, Z-A)

**Implementation:**
- SQLite FTS5 (full-text search)
- Or integrate Meilisearch/Algolia for better performance

---

### 13. **Email Notifications** (Priority: HIGH)

**Required Email Templates:**
- Order confirmation
- Order shipped
- Order delivered
- Order cancelled/refunded
- Password reset
- Welcome email
- Account verification (optional)

**Implementation:**
- Use Resend, SendGrid, or Mailgun
- HTML email templates
- Email queue system
- Admin email notification settings

---

### 14. **Analytics & Reporting** (Priority: MEDIUM)

**Admin Dashboard Metrics:**
- Revenue (today, week, month, year)
- Orders count
- Average order value
- Top selling products
- Revenue chart (time series)
- Recent orders
- Low stock alerts
- Customer count

**Reports:**
- Sales report (by date range)
- Product performance
- Customer report
- Abandoned cart report (future)
- Traffic sources (integrate Google Analytics)

**Implementation:**
- Database aggregation queries
- Chart.js or similar for visualizations
- Export to CSV/PDF

---

### 15. **Customer Reviews & Ratings** (Priority: LOW - Post-MVP)

**Database Schema:**
- `review` table:
  - id, productId, userId
  - rating (1-5)
  - title, content
  - isVerifiedPurchase
  - isApproved
  - createdAt, updatedAt

**Features:**
- Submit review
- Admin moderation
- Display on product pages
- Average rating calculation

---

### 16. **Wishlist** (Priority: LOW - Post-MVP)

**Database Schema:**
- `wishlist` table:
  - id, userId
  - items (JSON array of product IDs)
  - createdAt, updatedAt

**Features:**
- Add/remove products
- Wishlist page
- Share wishlist
- Move to cart

---

### 17. **Newsletter & Email Marketing** (Priority: MEDIUM)

**Database Schema:**
- `newsletter_subscriber` table:
  - id, email
  - status (subscribed, unsubscribed)
  - subscribedAt, unsubscribedAt

**Features:**
- Newsletter signup form
- Subscriber management in admin
- Email campaign creation (basic)
- Integrate with Mailchimp/SendGrid

---

### 18. **SEO Optimization** (Priority: HIGH)

**Features:**
- Dynamic meta tags per page
- Open Graph tags
- Structured data (Schema.org)
  - Product schema
  - Organization schema
  - Breadcrumb schema
- XML sitemap generation
- robots.txt configuration
- 301 redirects management

---

### 19. **Security & Compliance** (Priority: CRITICAL)

**Features:**
- HTTPS enforcement
- CSRF protection (SvelteKit built-in)
- Rate limiting
- PCI DSS compliance (payment gateway handles this)
- GDPR compliance:
  - Cookie consent
  - Privacy policy
  - Data export/deletion
- Session security
- Input sanitization

---

### 20. **Performance Optimization** (Priority: HIGH)

**Features:**
- Image lazy loading
- Image optimization (already implemented)
- CDN for static assets
- Database query optimization
- Caching strategy
- SSR for SEO-critical pages
- Code splitting

---

## Implementation Priority Roadmap

### Phase 1: Core E-commerce (Weeks 1-4)
1. ✅ Product database schema
2. ✅ Product management in admin
3. ✅ Product listing pages
4. ✅ Product detail pages
5. ✅ Category/Brand management
6. ✅ Shopping cart functionality
7. ✅ Basic checkout flow

### Phase 2: Transactions (Weeks 5-6)
8. ✅ Payment integration (LiqPay primary)
9. ✅ Checkbox РРО integration (fiscal receipts)
10. ✅ Order management system
11. ✅ Email notifications
12. ✅ Order confirmation/tracking

### Phase 3: Customer Features (Weeks 7-8)
13. ✅ Customer account management
14. ✅ Address book
15. ✅ Order history
16. ✅ Shipping configuration
17. ✅ Discount system

### Phase 4: CMS & Content (Weeks 9-10)
18. ✅ Site settings management
19. ✅ Banner management
20. ✅ Page builder (basic)
21. ✅ SEO optimization

### Phase 5: Polish & Launch (Weeks 11-12)
22. ✅ Search & filtering
23. ✅ Analytics dashboard
24. ✅ Performance optimization
25. ✅ Security audit
26. ✅ Testing (E2E, unit)
27. ✅ Documentation

---

## Technical Implementation Notes

### Database Considerations
- Start with SQLite (suitable for MVP)
- Plan migration path to PostgreSQL for scale
- Implement proper indexing for search/filter performance
- Use JSON columns for flexible data (variants, metadata)

### API Structure
- Use SvelteKit remote functions pattern
- Organize by domain: `product.remote.ts`, `cart.remote.ts`, `order.remote.ts`, etc.
- Implement proper validation with Valibot
- Use `query()` for reads, `form()`/`command()` for writes

### File Organization
```
src/lib/
├── remotes/
│   ├── product.remote.ts
│   ├── category.remote.ts
│   ├── cart.remote.ts
│   ├── order.remote.ts
│   ├── payment.remote.ts
│   ├── checkbox.remote.ts
│   ├── shipping.remote.ts
│   ├── discount.remote.ts
│   └── settings.remote.ts
├── components/
│   ├── admin/
│   │   └── features/
│   │       ├── product-management/
│   │       ├── order-management/
│   │       ├── customer-management/
│   │       ├── discount-management/
│   │       ├── banner-management/
│   │       ├── checkbox-management/
│   │       └── settings-management/
│   └── client/
│       └── features/
│           ├── product-catalog/
│           ├── cart/
│           ├── checkout/
│           ├── account/
│           └── search/
├── server/
│   ├── checkbox-client.ts (Checkbox API wrapper)
    ├── db/
    │   └── schema.ts (all tables)
    ├── schemas/
    │   └── index.ts (validation schemas)
    └── checkbox-client.ts (Checkbox API integration)
```

### Third-party Services
- **Payment**: LiqPay (primary), Stripe (optional for global), PayPal (optional)
- **Fiscal Receipts**: Checkbox РРО (required for Ukraine)
- **Email**: Resend or SendGrid
- **Storage**: Cloudflare R2 (already implemented)
- **Analytics**: Google Analytics 4
- **Search**: SQLite FTS5 initially, Meilisearch for scale
- **Monitoring**: Sentry (optional)

---

## Success Metrics for MVP

- [ ] Admin can manage complete product catalog
- [ ] Customers can browse and search products
- [ ] Customers can add products to cart
- [ ] Customers can complete checkout (guest or registered)
- [ ] Payment processing works (test + live mode with LiqPay)
- [ ] Fiscal receipts generated automatically via Checkbox РРО
- [ ] Electronic receipts sent to customers (email/SMS/Viber)
- [ ] Orders are created and tracked
- [ ] Email notifications are sent
- [ ] Admin can manage orders
- [ ] Admin can view/manage Checkbox receipts and shifts
- [ ] Admin can configure site settings
- [ ] Admin can create banners/promotions
- [ ] Site is responsive (mobile, tablet, desktop)
- [ ] Site passes basic security audit
- [ ] Site complies with Ukrainian tax law (РРО requirement)
- [ ] Page load time < 3 seconds
- [ ] All E2E tests pass

---

## Post-MVP Enhancements

- Customer reviews & ratings
- Wishlist functionality
- Advanced analytics (Google Analytics integration)
- Abandoned cart recovery
- Product recommendations
- Multi-currency support
- Multiple language storefronts
- Advanced inventory (warehouse management)
- Dropshipping integration
- Subscription products
- Gift cards
- Loyalty program
- Live chat support
- Advanced email marketing automation
- Mobile app (PWA or native)

---

## Estimated Timeline

- **MVP Development**: 10-12 weeks (1 developer)
- **Testing & QA**: 2 weeks
- **Launch Preparation**: 1 week
- **Total**: ~15 weeks to production-ready MVP

This timeline assumes:
- Full-time dedicated developer
- Clear requirements
- No major scope changes
- Use of existing tech stack and patterns
