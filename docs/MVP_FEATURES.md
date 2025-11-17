# MVP Features List - E-commerce CMS

## Overview
This document outlines the minimum viable product (MVP) features required for a fully functional e-commerce website with an admin panel for content management without code changes.

---

## Current Implementation Status

> **⚠️ IMPORTANT REMINDER**: After implementing each feature, it MUST be tested thoroughly before marking the testing checkbox. All features should be manually tested in both development and production-like environments.

### ✅ Completed Features (⚠️ Testing Required)

#### 1. **User Authentication & Management**
- [ ] **Tested**: User registration/login
- [ ] **Tested**: Session management (SHA-256 hashed tokens)
- [ ] **Tested**: Admin/user roles
- [ ] **Tested**: User CRUD operations in admin panel
- [ ] **Tested**: Password hashing with Argon2
- [ ] **Tested**: Session auto-renewal (15 days threshold)

#### 2. **Blog Management**
- [ ] **Tested**: Blog post creation/editing/deletion
- [ ] **Tested**: Rich text editor
- [ ] **Tested**: Admin panel for blog management
- [ ] **Tested**: Slug generation
- [ ] **Tested**: Author tracking

#### 3. **Asset Management**
- [ ] **Tested**: Image upload to Cloudflare R2
- [ ] **Tested**: Image optimization with Sharp
- [ ] **Tested**: Thumbnail generation (300x300)
- [ ] **Tested**: Asset library in admin panel
- [ ] **Tested**: MIME type validation
- [ ] **Tested**: File size tracking

#### 4. **Internationalization (i18n)**
- [ ] **Tested**: Multi-language support (English, Ukrainian)
- [ ] **Tested**: Compile-time translations with Paraglide
- [ ] **Tested**: Route localization

#### 5. **Product Management** ✅
- [ ] **Tested**: Product database schema with full fields
- [ ] **Tested**: Product CRUD operations
- [ ] **Tested**: Admin panel for product management
- [ ] **Tested**: Product listing with search/filter/pagination
- [ ] **Tested**: Image gallery support (JSON array)
- [ ] **Tested**: Product variants support (JSON)
- [ ] **Tested**: Inventory tracking
- [ ] **Tested**: SKU/barcode management
- [ ] **Tested**: SEO fields (title, description)
- [ ] **Tested**: Status management (draft, active, archived)
- [ ] **Tested**: Price and compare-at-price (sale pricing)

#### 6. **Category Management** ✅
- [ ] **Tested**: Category database schema
- [ ] **Tested**: Category CRUD operations
- [ ] **Tested**: Admin panel for category management
- [ ] **Tested**: Hierarchical categories (parent-child)
- [ ] **Tested**: Category images
- [ ] **Tested**: Display order management
- [ ] **Tested**: Visibility toggle
- [ ] **Tested**: SEO optimization fields
- [ ] **Tested**: Slug generation

#### 7. **Brand Management** ✅
- [ ] **Tested**: Brand database schema
- [ ] **Tested**: Brand CRUD operations
- [ ] **Tested**: Admin panel for brand management
- [ ] **Tested**: Brand logo upload
- [ ] **Tested**: Visibility toggle
- [ ] **Tested**: Slug generation

#### 8. **Shopping Cart System** ✅
- [ ] **Tested**: Cart database schema with session/user support
- [ ] **Tested**: Cart remote functions (getCart, addToCart, updateCartItem, removeFromCart, clearCart)
- [ ] **Tested**: Session-based cart for guest users
- [ ] **Tested**: User-based cart for logged-in users
- [ ] **Tested**: Cart item management with product details
- [ ] **Tested**: Inventory checking on add-to-cart
- [ ] **Tested**: Real-time cart totals calculation
- [ ] **Tested**: Cart item count tracking

#### 9. **Order Management System** ✅
- [ ] **Tested**: Order database schema with full order lifecycle
- [ ] **Tested**: Order remote functions (getAllOrders, getOrder, getMyOrders, checkout)
- [ ] **Tested**: Order number generation (ORD-TIMESTAMP-RANDOM)
- [ ] **Tested**: Guest checkout support
- [ ] **Tested**: Customer information capture
- [ ] **Tested**: Shipping and billing address management
- [ ] **Tested**: Order status tracking (pending, processing, shipped, delivered, cancelled, refunded)
- [ ] **Tested**: Inventory deduction on order creation
- [ ] **Tested**: Order cancellation with inventory restoration
- [ ] **Tested**: Admin order management
- [ ] **Tested**: Customer order history

#### 10. **Customer Product Browsing** ✅
- [ ] **Tested**: Customer-facing product browsing query with filters
- [ ] **Tested**: Search by product name
- [ ] **Tested**: Filter by category and brand
- [ ] **Tested**: Sort by newest, price (asc/desc), name
- [ ] **Tested**: Pagination support
- [ ] **Tested**: Only shows active products

#### 11. **Product Listing Page** ✅
- [ ] **Tested**: Customer-facing product grid at `/products`
- [ ] **Tested**: Search functionality
- [ ] **Tested**: Sort dropdown (newest, price, name)
- [ ] **Tested**: Responsive grid layout (1-4 columns)
- [ ] **Tested**: Product cards with images, name, description, price
- [ ] **Tested**: Sale badge for discounted products
- [ ] **Tested**: Stock status indicators
- [ ] **Tested**: Loading skeletons
- [ ] **Tested**: Empty state messaging

#### 12. **Product Detail Page** ✅
- [ ] **Tested**: Dynamic product detail page at `/products/[slug]`
- [ ] **Tested**: Product image gallery with thumbnails
- [ ] **Tested**: Product name, description, price display
- [ ] **Tested**: Sale pricing with compare-at-price
- [ ] **Tested**: Stock status warnings
- [ ] **Tested**: Quantity selector with +/- buttons
- [ ] **Tested**: Add to cart functionality
- [ ] **Tested**: Product metadata (SKU, barcode)
- [ ] **Tested**: Loading and error states
- [ ] **Tested**: Out-of-stock prevention

#### 13. **Cart Drawer Component** ✅
- [ ] **Tested**: Slide-out sheet drawer UI implementation
- [ ] **Tested**: Real-time cart item display with product images
- [ ] **Tested**: Item quantity controls (+/- buttons)
- [ ] **Tested**: Stock validation on quantity changes
- [ ] **Tested**: Sale price display with compare-at-price
- [ ] **Tested**: Remove individual items functionality
- [ ] **Tested**: Clear entire cart with confirmation
- [ ] **Tested**: Real-time subtotal and total calculations
- [ ] **Tested**: Empty cart state with friendly messaging
- [ ] **Tested**: Loading states with skeleton loaders
- [ ] **Tested**: Proceed to checkout navigation
- [ ] **Tested**: Continue shopping functionality
- [ ] **Tested**: Cart button with real-time item count badge
- [ ] **Tested**: Badge displays "99+" for counts > 99
- [ ] **Tested**: Integration in main layout header

#### 14. **Checkout Page** ✅
- [ ] **Tested**: Multi-step checkout form (3 steps)
- [ ] **Tested**: Visual progress indicator with step navigation
- [ ] **Tested**: Step 1 - Customer information (firstName, lastName, email, phone)
- [ ] **Tested**: Step 2 - Shipping address (6 fields: address1, address2, city, state, postalCode, country)
- [ ] **Tested**: Step 2 - Optional billing address with "same as shipping" checkbox
- [ ] **Tested**: Step 3 - Payment method selection (COD, Card via radio buttons)
- [ ] **Tested**: Step 3 - Order notes textarea for special instructions
- [ ] **Tested**: Real-time form validation with error messages
- [ ] **Tested**: Field validation before step progression
- [ ] **Tested**: Order summary sidebar with cart items
- [ ] **Tested**: Real-time totals display (subtotal, total)
- [ ] **Tested**: Responsive layout (stacks on mobile, sidebar on desktop)
- [ ] **Tested**: Empty cart detection with "Continue Shopping" redirect
- [ ] **Tested**: Loading states during cart fetch
- [ ] **Tested**: Previous/Continue/Place Order button navigation
- [ ] **Tested**: Integration with checkout() remote function

#### 15. **Customer Account Management** ✅
- [ ] **Tested**: Extended user schema with profile fields (firstName, lastName, phone, marketingOptIn, lastLoginAt)
- [ ] **Tested**: Address table with full address management (14 fields)
- [ ] **Tested**: Profile remote functions (getMyProfile, updateProfile)
- [ ] **Tested**: Address remote functions (getMyAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress)
- [ ] **Tested**: 5 validation schemas (UpdateProfileSchema, CreateAddressSchema, UpdateAddressSchema, DeleteAddressSchema, SetDefaultAddressSchema)
- [ ] **Tested**: CustomerSidebar navigation component with logout
- [ ] **Tested**: Dashboard layout with responsive sidebar
- [ ] **Tested**: Profile management page at /dashboard with form
- [ ] **Tested**: Address book page at /dashboard/addresses with CRUD dialogs
- [ ] **Tested**: Order history page at /dashboard/orders with order display
- [ ] **Tested**: Default address logic (auto-set for first address, promote on delete)
- [ ] **Tested**: Marketing opt-in checkbox functionality
- [ ] **Tested**: Auto-refresh pattern using $effect() watching form.result
- [ ] **Tested**: 40+ translation keys added (English + Ukrainian)

#### 16. **Shipping Configuration** ✅
- [ ] **Tested**: Database schema with shipping_zone and shipping_rate tables
- [ ] **Tested**: ShippingZone table (id, name, countries JSON, timestamps)
- [ ] **Tested**: ShippingRate table (id, zoneId, name, description, price, minOrderAmount, maxOrderAmount, estimatedDays, isActive, timestamps)
- [ ] **Tested**: Shipping zone remote functions (getAllZones, createZone, updateZone, deleteZone)
- [ ] **Tested**: Shipping rate remote functions (getAllRates, getRatesByZone, createRate, updateRate, deleteRate, getApplicableRates)
- [ ] **Tested**: 6 validation schemas (CreateShippingZoneSchema, UpdateShippingZoneSchema, DeleteShippingZoneSchema, CreateShippingRateSchema, UpdateShippingRateSchema, GetApplicableRatesSchema)
- [ ] **Tested**: Admin shipping zones page at /admin/shipping/zones with CRUD
- [ ] **Tested**: Admin shipping rates page at /admin/shipping/rates with CRUD
- [ ] **Tested**: Multi-country selection with checkboxes (26 European countries)
- [ ] **Tested**: Zone-based rate configuration with price, min/max order amounts
- [ ] **Tested**: Estimated delivery days field
- [ ] **Tested**: Active/inactive rate toggle
- [ ] **Tested**: Shipping menu item in AdminSidebar with Truck icon
- [ ] **Tested**: 40+ shipping translation keys (English + Ukrainian)
- [ ] **Tested**: Rate applicability based on country and order amount
- [ ] **Tested**: TypeScript compilation (@lucide/svelte imports, type safety)
- [ ] **Tested**: Form submission handlers with proper type assertions
- [ ] **Tested**: Select component with proper value binding

#### 17. **Email Settings Management** ✅
- [ ] **Tested**: Email configuration page at /admin/email-settings
- [ ] **Tested**: Configure sender information (from email, from name, reply-to)
- [ ] **Tested**: Toggle email notifications (order confirmation, shipped, delivered, cancelled, password reset, welcome)
- [ ] **Tested**: Test email functionality with live email sending
- [ ] **Tested**: Integration with Resend API
- [ ] **Tested**: Form object properly attached (fixed duplicate form issue)
- [ ] **Tested**: Real-time validation and error handling
- [ ] **Tested**: Settings persistence in database

#### 18. **Internationalization (i18n) Configuration** ✅
- [ ] **Tested**: Ukrainian (uk) set as default language
- [ ] **Tested**: English (en) available as secondary language
- [ ] **Tested**: Route localization working (/en/... for English)
- [ ] **Tested**: Paraglide compile-time translations
- [ ] **Tested**: Translation message regeneration on dev server start
- [ ] **Tested**: All shipping translation keys available in both languages

#### 19. **Discount System** ✅
- [ ] **Tested**: Database schema with discount table (15 fields)
- [ ] **Tested**: Discount table (id, code, type, value, minOrderAmount, maxUsesTotal, maxUsesPerCustomer, currentUses, startsAt, endsAt, isActive, applicableProducts, applicableCategories, description, timestamps)
- [ ] **Tested**: Discount remote functions (getAllDiscounts, getDiscount, createDiscount, updateDiscount, deleteDiscount, validateDiscount, applyDiscount)
- [ ] **Tested**: 5 validation schemas (CreateDiscountSchema, UpdateDiscountSchema, DeleteDiscountSchema, ValidateDiscountSchema, ApplyDiscountSchema)
- [ ] **Tested**: Admin discount management page at /admin/discounts with full CRUD
- [ ] **Tested**: Discount type selection (percentage, fixed amount, free shipping)
- [ ] **Tested**: Usage limit configuration (total uses, per-customer uses)
- [ ] **Tested**: Date range validity (start date, end date)
- [ ] **Tested**: Minimum order amount requirement
- [ ] **Tested**: Product/category applicability (JSON arrays)
- [ ] **Tested**: Active/inactive status toggle
- [ ] **Tested**: Current usage tracking
- [ ] **Tested**: Discount validation logic (dates, usage limits, order amount)
- [ ] **Tested**: Discounts menu item in AdminSidebar with Percent icon
- [ ] **Tested**: 47+ discount translation keys (English + Ukrainian)
- [ ] **Tested**: TypeScript compilation (icon imports, Select component, Checkbox component)
- [ ] **Tested**: Form submission with proper field handling
- [ ] **Tested**: Search functionality with real-time filtering

#### 20. **Wishlist/Favorites System** ✅
- [ ] **Tested**: Database schema with wishlist table (one-to-one with users)
- [ ] **Tested**: Wishlist table (id, userId unique, items JSON array, createdAt, updatedAt)
- [ ] **Tested**: Wishlist remote functions (getWishlist, getWishlistCount, addToWishlist, removeFromWishlist, clearWishlist, moveToCart)
- [ ] **Tested**: 3 validation schemas (AddToWishlistSchema, RemoveFromWishlistSchema, MoveToCartSchema)
- [ ] **Tested**: Wishlist page at /dashboard/wishlist with product grid
- [ ] **Tested**: Product cards with images, names, prices on wishlist page
- [ ] **Tested**: Remove buttons for each wishlist item (visible on hover)
- [ ] **Tested**: Move to cart with quantity selector dialog
- [ ] **Tested**: Clear wishlist with confirmation dialog
- [ ] **Tested**: Empty state with "Continue Shopping" link
- [ ] **Tested**: Loading skeleton states for wishlist page
- [ ] **Tested**: Stock and availability checks on wishlist items
- [ ] **Tested**: WishlistButton component (reusable heart icon toggle)
- [ ] **Tested**: Filled/outlined heart states based on wishlist status
- [ ] **Tested**: Wishlist buttons on product listing page (top-left on hover)
- [ ] **Tested**: Wishlist button on product detail page (next to Add to Cart)
- [ ] **Tested**: WishlistHeaderButton with item count badge
- [ ] **Tested**: Wishlist counter in main header (shows "99+" if > 99 items)
- [ ] **Tested**: Wishlist menu item in CustomerSidebar (between Dashboard and Addresses)
- [ ] **Tested**: Item count badge in sidebar navigation
- [ ] **Tested**: 22 wishlist translation keys (English + Ukrainian)
- [ ] **Tested**: Auto-refresh after add/remove operations
- [ ] **Tested**: Real-time count updates across all components
- [ ] **Tested**: TypeScript compilation (no errors in wishlist components)
- [ ] **Tested**: Accessibility (ARIA labels, keyboard navigation)
- [ ] **Tested**: Responsive design (mobile, tablet, desktop)

#### 21. **Site Settings Management** ✅
- [ ] **Tested**: Database schema with siteSetting table (key-value store with type information)
- [ ] **Tested**: SiteSetting table (key PK, value, type, category, label, description, updatedAt)
- [ ] **Tested**: 6 setting categories (general, store, checkout, email, seo, advanced)
- [ ] **Tested**: 11 validation schemas (GetSettingSchema, UpdateSettingSchema, 6 category-specific schemas, etc.)
- [ ] **Tested**: 15 remote functions (queries, forms, commands, helpers)
- [ ] **Tested**: 53 default settings with sensible defaults across all categories
- [ ] **Tested**: General settings (9): store name, logo, favicon, email, phone, timezone, currency, symbol, language
- [ ] **Tested**: Store info settings (11): address fields, social media URLs (Facebook, Instagram, Twitter, YouTube, LinkedIn)
- [ ] **Tested**: Checkout settings (7): guest checkout toggle, phone requirement, order notes, policy URLs, newsletter
- [ ] **Tested**: Email settings (8): SMTP configuration (host, port, username, password, secure), from/reply-to addresses
- [ ] **Tested**: SEO settings (9): meta tags (title, description, keywords), OG image, analytics IDs (GA, Search Console, FB Pixel), structured data/sitemap toggles
- [ ] **Tested**: Advanced settings (7): maintenance mode and message, custom scripts (head/body), debug mode, caching settings
- [ ] **Tested**: Admin settings page at /admin/settings with comprehensive tabbed interface
- [ ] **Tested**: 6 tabbed sections matching categories with complete forms
- [ ] **Tested**: Initialize button for first-time setup (seeds 53 default settings)
- [ ] **Tested**: Form validation with error display for all fields
- [ ] **Tested**: Help text for every field using translation keys
- [ ] **Tested**: Loading states on submit buttons
- [ ] **Tested**: Responsive grid layouts (2-column where appropriate)
- [ ] **Tested**: State management with $state and $effect
- [ ] **Tested**: Settings menu item in AdminSidebar with Settings icon
- [ ] **Tested**: 67 settings translation keys (English + Ukrainian)
- [ ] **Tested**: TypeScript compilation (no errors)
- [ ] **Tested**: Form submission handlers with proper validation
- [ ] **Tested**: Helper functions (parseSettingValue, stringifySettingValue)
- [ ] **Tested**: Empty state handling with initialize functionality

#### 22. **Banner Management** ✅
- [ ] **Tested**: Banner database schema (13 fields)
- [ ] **Tested**: Validation schemas (5 schemas with custom checks)
- [ ] **Tested**: Remote functions (9 total: queries, forms, commands)
- [ ] **Tested**: Translation keys (67 banner + 5 common per language)
- [ ] **Tested**: Admin banner management page at /admin/banners
- [ ] **Tested**: Banner list table with search, filters (position, status), pagination
- [ ] **Tested**: Create banner dialog with comprehensive form (3 sections)
- [ ] **Tested**: Edit banner dialog with field pre-population
- [ ] **Tested**: Delete banner confirmation dialog
- [ ] **Tested**: Toggle banner active/inactive status
- [ ] **Tested**: Banner position types (5): home_hero, home_secondary, category_top, product_sidebar, footer
- [ ] **Tested**: Display order management
- [ ] **Tested**: Scheduled banner support (startsAt, endsAt timestamps)
- [ ] **Tested**: Dual image support (asset FK + direct URL fallback)
- [ ] **Tested**: Link and link text (CTA button)
- [ ] **Tested**: Status badges (active, scheduled, expired, inactive)
- [ ] **Tested**: Position badges with variants
- [ ] **Tested**: Customer-facing BannerHero component with auto-rotation
- [ ] **Tested**: Customer-facing BannerSecondary component for smaller banners
- [ ] **Tested**: Navigation arrows and pagination dots on carousel
- [ ] **Tested**: Responsive design (mobile, tablet, desktop)
- [ ] **Tested**: Lazy loading images
- [ ] **Tested**: Smooth transitions and hover effects
- [ ] **Tested**: Banners menu item in AdminSidebar (Frame icon)
- [ ] **Tested**: Database migration applied (banner table created)
- [ ] **Tested**: TypeScript compilation (no errors)
- [ ] **Tested**: Active banner filtering with date-based logic
- [ ] **Tested**: Image URL validation
- [ ] **Tested**: Date validation (startsAt < endsAt)
- [ ] **Tested**: Image requirement check (imageId OR imageUrl required)

#### 23. **Page Builder (Content Management)** ✅
- [ ] **Tested**: Database schema with page table (10 fields: id, title, slug, content JSON, template, status, seoTitle, seoDescription, timestamps)
- [ ] **Tested**: 5 validation schemas (CreatePageSchema, UpdatePageSchema, DeletePageSchema, PublishPageSchema, FilterPagesSchema)
- [ ] **Tested**: 7 remote functions (getAllPages with pagination, getPageById, getPageBySlug, createPage, updatePage, deletePage, togglePageStatus)
- [ ] **Tested**: 60+ page builder translation keys (English + Ukrainian)
- [ ] **Tested**: Admin page management at /admin/pages with full CRUD
- [ ] **Tested**: PageListTable with search, status filter, template filter, pagination
- [ ] **Tested**: CreatePageDialog with 3 sections (Basic Info, Content Blocks, SEO Settings)
- [ ] **Tested**: EditPageDialog with pre-population and 3 sections
- [ ] **Tested**: DeletePageDialog with confirmation
- [ ] **Tested**: Publish/Unpublish toggle functionality
- [ ] **Tested**: ContentBlockEditor component with add/edit/delete/reorder
- [ ] **Tested**: BlockTypeSelector dialog for choosing block types
- [ ] **Tested**: 6 block editor components (Hero, Text, Image, Gallery, Video, HTML)
- [ ] **Tested**: Hero block editor with background image, heading, subheading, CTA
- [ ] **Tested**: Text block editor with rich text HTML support
- [ ] **Tested**: Image block editor with alt text and caption
- [ ] **Tested**: Gallery block editor with multiple images and individual alt texts
- [ ] **Tested**: Video block editor with YouTube/Vimeo embed URL parsing
- [ ] **Tested**: HTML block editor for custom code
- [ ] **Tested**: AssetBrowser integration in block editors
- [ ] **Tested**: Inline block editing with save/cancel
- [ ] **Tested**: Block reordering (move up/down buttons)
- [ ] **Tested**: Block deletion with confirmation
- [ ] **Tested**: JSON serialization/deserialization for content storage
- [ ] **Tested**: Customer-facing page renderer at /pages/[slug]
- [ ] **Tested**: 6 client-side block renderers (HeroBlock, TextBlock, ImageBlock, GalleryBlock, VideoBlock, HtmlBlock)
- [ ] **Tested**: Dynamic block rendering based on type
- [ ] **Tested**: SEO meta tags (title, description, Open Graph)
- [ ] **Tested**: 404 handling for unpublished/missing pages
- [ ] **Tested**: Loading states with spinner
- [ ] **Tested**: Error boundaries with friendly messages
- [ ] **Tested**: Empty state for pages without content blocks
- [ ] **Tested**: Responsive design (mobile, tablet, desktop)
- [ ] **Tested**: Pages menu item in AdminSidebar with Layout icon
- [ ] **Tested**: TypeScript compilation (all errors fixed)
- [ ] **Tested**: lucide-svelte icon imports corrected
- [ ] **Tested**: Asset schema compatibility (altText handling)

---

## 🚧 Required MVP Features

### 1. **Product Management** ✅ COMPLETED

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

#### 10.1 Site Settings ✅ **COMPLETED**
**Database Schema:**
- ✅ `site_setting` table:
  - key (unique, primary key)
  - value (text)
  - type (string, number, boolean, json)
  - category (general, store, checkout, email, seo, advanced)
  - label, description
  - updatedAt

**Configurable Settings:** (53 total)
- ✅ **General** (9): Store name, logo, favicon, email, phone, timezone, currency, currency symbol, language
- ✅ **Store Info** (11): Address fields (address1, address2, city, state, postal code, country), social media URLs (Facebook, Instagram, Twitter, YouTube, LinkedIn)
- ✅ **Checkout** (7): Guest checkout toggle, phone requirement, order notes, policy URLs (terms, privacy, returns), newsletter signup
- ✅ **Email** (8): SMTP configuration (host, port, username, password, secure toggle), from name, from address, reply-to address
- ✅ **SEO** (9): Default title, description, keywords, OG image, Google Analytics ID, Search Console ID, Facebook Pixel ID, structured data toggle, sitemap toggle
- ✅ **Advanced** (7): Maintenance mode toggle and message, custom head scripts, custom body scripts, debug mode toggle, caching toggle, cache duration

**Admin Features:**
- ✅ Settings management interface at /admin/settings
- ✅ Tabbed UI with 6 categories
- ✅ Logo/favicon URL configuration
- ✅ Initialize button for default settings setup
- ✅ Form validation with error display
- ✅ Help text for all fields
- ✅ Loading states on save
- ✅ Settings menu in AdminSidebar

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

### 13. **Email Notifications** (Priority: HIGH) ✅

**Required Email Templates:**
- ✅ Order confirmation
- ✅ Order shipped
- ✅ Order delivered
- ✅ Order cancelled/refunded
- ✅ Password reset
- ✅ Welcome email
- Account verification (optional - not implemented)

**Implementation:**
- ✅ Use Resend for email delivery (3,000 free emails/month)
- ✅ HTML email templates with inline CSS
- ✅ Non-blocking email sending (operations succeed even if email fails)
- ✅ Admin email notification settings
  - ✅ Database-driven email configuration
  - ✅ Toggle switches for each email type
  - ✅ Custom from/reply-to email addresses
  - ✅ Test email functionality
  - ✅ Admin UI at `/admin/email-settings`

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

### 15. **Wishlist / Favorites** (Priority: MEDIUM)

**Database Schema:**
- `wishlist` table:
  - id, userId
  - items (JSON array of product IDs with metadata)
  - createdAt, updatedAt

- `wishlist_item` table (alternative normalized approach):
  - id, wishlistId, productId
  - addedAt

**Features:**
- Add/remove products to wishlist
- Wishlist page with product grid
- Wishlist counter in header
- Move items from wishlist to cart
- Share wishlist (public link)
- Email wishlist to self
- Wishlist persistence (user-based for logged in, localStorage for guests)
- Convert guest wishlist to user wishlist on login

**Admin Features:**
- View popular wishlisted products
- Track wishlist-to-purchase conversion rate
- Send promotional emails for wishlisted items

**Customer Benefits:**
- Save products for later
- Track price changes (optional)
- Quick access to favorite items
- Share gift ideas with friends/family

---

### 16. **Customer Reviews & Ratings** (Priority: LOW - Post-MVP)

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
- DDoS protection (Layer 3/4 and Layer 7)
- PCI DSS compliance (payment gateway handles this)
- GDPR compliance:
  - Cookie consent
  - Privacy policy
  - Data export/deletion
- Session security
- Input sanitization

#### 19.1 DDoS Protection Strategy

**Layer 3/4 Protection (Network/Transport Layer):**
- SYN flood protection
- UDP flood protection
- ICMP flood protection
- Connection rate limiting

**Layer 7 Protection (Application Layer):**
- HTTP flood protection
- Slowloris attack mitigation
- Request rate limiting per IP
- Challenge-based verification (CAPTCHA)

**Implementation Options:**

**Option 1: Cloudflare (Recommended) - Free Tier ✅**
- Automatic DDoS mitigation (up to millions of requests)
- WAF (Web Application Firewall) with managed rulesets
- Bot protection
- Rate limiting (100 rules free)
- SSL/TLS encryption
- CDN with caching
- Analytics and threat monitoring

**Setup:**
1. Add domain to Cloudflare
2. Update DNS nameservers
3. Enable "Under Attack Mode" when needed
4. Configure firewall rules:
   - Block known bad IPs
   - Challenge suspicious traffic
   - Rate limit API endpoints

**Free Tier Limits:**
- Unlimited DDoS mitigation
- 5 page rules
- 100 rate limiting rules
- 5 WAF rules
- Basic analytics

**Option 2: Railway Built-in (Basic)**
- Automatic DDoS detection
- Traffic filtering
- No additional configuration needed
- Included in all plans

**Option 3: Application-Level Rate Limiting**

**Database Schema:**
```typescript
// src/lib/server/db/schema.ts
export const rateLimitLog = sqliteTable('rate_limit_log', {
  id: text('id').primaryKey(),
  ip: text('ip').notNull(),
  endpoint: text('endpoint').notNull(),
  requestCount: integer('request_count').notNull().default(1),
  windowStart: integer('window_start', { mode: 'timestamp' }).notNull(),
  isBlocked: integer('is_blocked', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});
```

**Rate Limiting Middleware:**
```typescript
// src/lib/server/rate-limit.ts
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';
import { eq, and, gte } from 'drizzle-orm';

const RATE_LIMITS = {
  api: { requests: 100, window: 60 }, // 100 req/min
  auth: { requests: 5, window: 60 },  // 5 req/min
  checkout: { requests: 10, window: 60 } // 10 req/min
};

export async function checkRateLimit(
  ip: string,
  endpoint: string,
  limitType: keyof typeof RATE_LIMITS = 'api'
): Promise<boolean> {
  const limit = RATE_LIMITS[limitType];
  const windowStart = new Date(Date.now() - limit.window * 1000);
  
  // Get recent requests
  const [recentLog] = await db.select()
    .from(tables.rateLimitLog)
    .where(
      and(
        eq(tables.rateLimitLog.ip, ip),
        eq(tables.rateLimitLog.endpoint, endpoint),
        gte(tables.rateLimitLog.windowStart, windowStart)
      )
    )
    .limit(1);
  
  if (!recentLog) {
    // First request in window
    await db.insert(tables.rateLimitLog).values({
      id: crypto.randomUUID(),
      ip,
      endpoint,
      requestCount: 1,
      windowStart: new Date(),
      createdAt: new Date()
    });
    return true;
  }
  
  if (recentLog.requestCount >= limit.requests) {
    // Rate limit exceeded
    await db.update(tables.rateLimitLog)
      .set({ isBlocked: true })
      .where(eq(tables.rateLimitLog.id, recentLog.id));
    return false;
  }
  
  // Increment counter
  await db.update(tables.rateLimitLog)
    .set({ requestCount: recentLog.requestCount + 1 })
    .where(eq(tables.rateLimitLog.id, recentLog.id));
  
  return true;
}
```

**Usage in hooks.server.ts:**
```typescript
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { checkRateLimit } from '$lib/server/rate-limit';

export const handle: Handle = async ({ event, resolve }) => {
  const ip = event.getClientAddress();
  const path = event.url.pathname;
  
  // Apply rate limiting to sensitive endpoints
  if (path.startsWith('/api/')) {
    const allowed = await checkRateLimit(ip, path, 'api');
    if (!allowed) {
      return new Response('Too Many Requests', { 
        status: 429,
        headers: { 'Retry-After': '60' }
      });
    }
  }
  
  if (path.startsWith('/auth/')) {
    const allowed = await checkRateLimit(ip, path, 'auth');
    if (!allowed) {
      return new Response('Too Many Requests', { 
        status: 429,
        headers: { 'Retry-After': '60' }
      });
    }
  }
  
  return resolve(event);
};
```

**Admin Features:**
- View rate limit logs
- Block/unblock IP addresses manually
- Configure rate limit thresholds
- Real-time DDoS attack monitoring
- Email alerts on suspicious activity

**Recommended Stack for MVP:**
1. **Cloudflare Free Tier** (primary DDoS protection)
2. **Application-level rate limiting** (secondary protection)
3. **Railway built-in protection** (baseline)

**This multi-layer approach provides enterprise-grade DDoS protection at zero additional cost!**

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
8. ✅ Payment integration (LiqPay primary) - **IMPLEMENTED**
9. ✅ Checkbox РРО integration (fiscal receipts) - **IMPLEMENTED**
10. ✅ Order management system - **IMPLEMENTED**
11. ✅ Email notifications - **IMPLEMENTED**
12. ✅ Order confirmation/tracking pages - **IMPLEMENTED**

### Phase 3: Customer Features (Weeks 7-8) ✅ **COMPLETED**
13. ✅ Customer account management - **COMPLETED** (includes profile, address book, and order history)
    - ✅ Profile management page with form
    - ✅ Address book with full CRUD operations
    - ✅ Order history with order details
    - ✅ CustomerSidebar navigation component
    - ✅ Dashboard layout with responsive sidebar
14. ✅ Shipping configuration - **COMPLETED**
    - ✅ Shipping zones with multi-country selection
    - ✅ Shipping rates with price and conditions
    - ✅ Admin pages for zones and rates management
    - ✅ Rate applicability logic for checkout
    - ✅ TypeScript errors fixed in zones and rates pages
    - ✅ JSON syntax error in uk.json fixed
    - ✅ Form object attachment issue resolved in email settings
    - ✅ Ukrainian language set as default
15. ✅ Discount system - **COMPLETED**
    - ✅ Database schema with 15 fields (code, type, value, usage limits, dates, applicability)
    - ✅ 7 remote functions (CRUD + validation + apply)
    - ✅ 5 validation schemas
    - ✅ Admin management page at /admin/discounts
    - ✅ Full CRUD interface with search/filter
    - ✅ Type-specific UI (percentage/fixed/free shipping)
    - ✅ Date range and usage limit configuration
    - ✅ Product/category applicability settings
    - ✅ 47 translation keys (EN + UK)
    - ✅ TypeScript compilation errors fixed
16. ✅ Wishlist/Favorites functionality - **COMPLETED**
    - ✅ Database schema with wishlist table (one-to-one with users, JSON array storage)
    - ✅ 6 remote functions (getWishlist, getWishlistCount, add, remove, clear, moveToCart)
    - ✅ 3 validation schemas
    - ✅ Wishlist page at /dashboard/wishlist with product grid
    - ✅ Product cards with remove buttons, move to cart functionality
    - ✅ Clear wishlist confirmation dialog
    - ✅ Empty state with call-to-action
    - ✅ WishlistButton component (reusable heart toggle)
    - ✅ Wishlist buttons on product listing and detail pages
    - ✅ WishlistHeaderButton with count badge in header
    - ✅ Wishlist menu item in CustomerSidebar with badge
    - ✅ 22 translation keys (English + Ukrainian)
    - ✅ Real-time count updates across all components
    - ✅ Stock validation on move-to-cart
    - ✅ Responsive design and accessibility

### Phase 4: CMS & Content (Weeks 9-10)
19. ✅ Site settings management - **COMPLETED**
    - ✅ Database schema with siteSetting table (8 fields)
    - ✅ 6 categories: general, store, checkout, email, seo, advanced
    - ✅ 11 validation schemas covering all operations
    - ✅ 15 remote functions (queries, forms, commands)
    - ✅ 53 default settings with sensible values
    - ✅ Admin UI with tabbed interface at /admin/settings
    - ✅ Form integration with validation and error display
    - ✅ 67 translation keys (English + Ukrainian)
    - ✅ Settings menu in AdminSidebar
20. ✅ Banner management - **COMPLETED**
    - ✅ Banner database schema (13 fields, 5 position types, scheduling)
    - ✅ 5 validation schemas with custom checks
    - ✅ 9 remote functions (queries, forms, commands)
    - ✅ 67 banner translation keys + 5 common keys per language
    - ✅ Admin UI components (list table, create/edit/delete dialogs)
    - ✅ Customer-facing components (BannerHero, BannerSecondary)
    - ✅ Banners menu item in AdminSidebar
    - ✅ Database migration applied
21. ✅ Page builder (basic) - **COMPLETED**
    - ✅ Page database schema (10 fields: id, title, slug, content JSON, template, status, seoTitle, seoDescription, timestamps)
    - ✅ 5 validation schemas (CreatePageSchema, UpdatePageSchema, DeletePageSchema, PublishPageSchema, FilterPagesSchema)
    - ✅ 7 remote functions (getAllPages with pagination, getPageById, getPageBySlug, createPage, updatePage, deletePage, togglePageStatus)
    - ✅ 60+ page builder translation keys (English + Ukrainian)
    - ✅ Admin UI at /admin/pages with full CRUD operations
    - ✅ PageListTable with search, status/template filters, pagination
    - ✅ CreatePageDialog and EditPageDialog with 3 sections (Basic Info, Content, SEO)
    - ✅ DeletePageDialog with confirmation
    - ✅ ContentBlockEditor with 6 block types (Hero, Text, Image, Gallery, Video, HTML)
    - ✅ Block type selector dialog for adding blocks
    - ✅ Inline block editing with save/cancel
    - ✅ Block reordering (move up/down)
    - ✅ Block deletion with confirmation
    - ✅ JSON serialization/deserialization for content storage
    - ✅ Customer-facing page renderer at /pages/[slug]
    - ✅ 6 client-side block renderers (HeroBlock, TextBlock, ImageBlock, GalleryBlock, VideoBlock, HtmlBlock)
    - ✅ Dynamic block rendering based on type
    - ✅ SEO meta tags (title, description, Open Graph)
    - ✅ 404 handling for unpublished/missing pages
    - ✅ Loading states and error boundaries
    - ✅ Empty state for pages without content
    - ✅ Pages menu item in AdminSidebar with Layout icon
    - ✅ All TypeScript compilation errors fixed
22. ❌ SEO optimization - **TODO**

### Phase 5: Polish & Launch (Weeks 11-12)
23. ❌ Search & filtering - **TODO**
24. ❌ Analytics dashboard - **TODO**
25. ❌ Performance optimization - **TODO**
26. ❌ Security audit - **TODO**
27. ❌ Testing (E2E, unit) - **TODO**
28. ❌ Documentation - **TODO**

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
│   ├── wishlist.remote.ts
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
│           ├── wishlist/
│           ├── checkout/
│           ├── account/
│           └── search/
├── server/
│   ├── checkbox-client.ts (Checkbox API wrapper)
│   ├── rate-limit.ts (Rate limiting middleware)
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
- **DDoS Protection**: Cloudflare Free Tier (unlimited DDoS mitigation)
- **Analytics**: Google Analytics 4
- **Search**: SQLite FTS5 initially, Meilisearch for scale
- **Monitoring**: Sentry (optional)

---

## 🧪 FEATURE TESTING CHECKLIST

> **⚠️ CRITICAL**: Each feature MUST be tested before checking the box in the "Completed Features" section above. Testing should include both manual testing and automated tests where applicable.

### Testing Categories

#### 1. **Functional Testing**
- [ ] Feature works as designed
- [ ] All user interactions function correctly
- [ ] Data is saved/retrieved correctly
- [ ] Error handling works properly

#### 2. **UI/UX Testing**
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Loading states display correctly
- [ ] Error messages are clear and helpful
- [ ] Success feedback is shown
- [ ] Accessibility (keyboard navigation, screen readers)

#### 3. **Integration Testing**
- [ ] Feature integrates with existing features
- [ ] Database operations work correctly
- [ ] API calls succeed
- [ ] External services (R2, email, etc.) work

#### 4. **Security Testing**
- [ ] Authentication/authorization checks work
- [ ] Input validation prevents malicious data
- [ ] SQL injection protection
- [ ] XSS protection
- [ ] CSRF protection (SvelteKit built-in)

#### 5. **Performance Testing**
- [ ] Page loads in < 3 seconds
- [ ] No memory leaks
- [ ] Database queries are optimized
- [ ] Large datasets handled efficiently

### Testing Process for Each Feature

**Before marking as "Tested":**

1. **Manual Testing**
   - [ ] Test happy path (expected user flow)
   - [ ] Test edge cases (boundary conditions)
   - [ ] Test error scenarios (invalid input, network errors)
   - [ ] Test on multiple browsers (Chrome, Firefox, Safari)
   - [ ] Test on multiple devices (mobile, tablet, desktop)

2. **Automated Testing** (if applicable)
   - [ ] Unit tests pass
   - [ ] Integration tests pass
   - [ ] E2E tests pass

3. **User Acceptance Testing**
   - [ ] Feature reviewed by product owner
   - [ ] Feedback addressed
   - [ ] Documentation updated

4. **Production Readiness**
   - [ ] No console errors
   - [ ] No console warnings
   - [ ] Performance metrics meet targets
   - [ ] Security audit passed

### Feature-Specific Testing Guidelines

#### Authentication & User Management
- [ ] Can register new user
- [ ] Can login with valid credentials
- [ ] Cannot login with invalid credentials
- [ ] Session persists across page reloads
- [ ] Can logout successfully
- [ ] Admin users have elevated permissions
- [ ] Regular users cannot access admin routes

#### Product Management
- [ ] Can create product with all fields
- [ ] Can edit product
- [ ] Can delete product
- [ ] Product images upload correctly
- [ ] Product variants work
- [ ] Inventory tracking accurate
- [ ] Price formatting correct

#### Shopping Cart
- [ ] Can add product to cart
- [ ] Cart persists for guest users
- [ ] Cart persists for logged-in users
- [ ] Can update quantity
- [ ] Can remove items
- [ ] Cart totals calculate correctly
- [ ] Stock validation works

#### Checkout & Orders
- [ ] Can complete guest checkout
- [ ] Can complete logged-in checkout
- [ ] Order created successfully
- [ ] Inventory deducted correctly
- [ ] Order confirmation email sent
- [ ] Admin can view orders
- [ ] Customer can view order history

#### Product Browsing
- [ ] Product listing loads
- [ ] Search works
- [ ] Filters work
- [ ] Sorting works
- [ ] Pagination works
- [ ] Product detail page loads
- [ ] Add to cart from detail page works

### Test Data Requirements

**For testing, create:**
- [ ] At least 3 test users (admin, regular user, guest)
- [ ] At least 10 test products (various categories/brands)
- [ ] At least 3 test categories
- [ ] At least 3 test brands
- [ ] Test product images
- [ ] Test orders in various states
- [ ] Test with out-of-stock products
- [ ] Test with sale pricing
- [ ] Test with low stock warnings

### Bug Tracking

**When bugs are found:**
1. Document bug details (steps to reproduce, expected vs actual)
2. Assign priority (critical, high, medium, low)
3. Fix bug
4. Retest
5. Update testing checklist

### Regression Testing

**After fixing bugs or adding features:**
- [ ] Rerun all tests for affected features
- [ ] Verify related features still work
- [ ] Check for unintended side effects

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
- [ ] DDoS protection is enabled (Cloudflare + rate limiting)
- [ ] Rate limiting works on sensitive endpoints
- [ ] Site complies with Ukrainian tax law (РРО requirement)
- [ ] Page load time < 3 seconds
- [ ] All E2E tests pass

---

## Deployment & Hosting

### Recommended Deployment Stack

For an e-commerce CMS with the features outlined in this MVP, we need hosting that supports:
- **Node.js runtime** (SvelteKit SSR)
- **Persistent storage** (SQLite database file + volumes)
- **Static asset serving** (via CDN)
- **Environment variables** (API keys, secrets)
- **Custom domains** with SSL
- **Reasonable free tier** to start

### Option 1: Railway (Recommended for MVP) ⭐

**Why Railway:**
- Best SQLite support with persistent volumes
- Free tier: $5 credit/month (renewable trial)
- Pay-as-you-go after credits ($0.000772/vCPU-sec)
- Perfect for Node.js + SvelteKit
- Easy deployment from GitHub
- Built-in environment variables
- Custom domains included

**Free Tier Details:**
- 30-day trial with $5 credits
- After trial: $1/month minimum
- Up to 0.5 GB RAM, 1 vCPU
- 0.5 GB volume storage (perfect for SQLite)
- Global regions
- Community support

**Deployment Structure:**
```
Railway Project:
├── SvelteKit App (Node.js service)
│   ├── Volume: /data (for local.db SQLite file)
│   ├── Environment Variables:
│   │   ├── DATABASE_URL=file:/data/local.db
│   │   ├── R2_ACCOUNT_ID
│   │   ├── R2_ACCESS_KEY_ID
│   │   ├── R2_SECRET_ACCESS_KEY
│   │   ├── LIQPAY_PUBLIC_KEY
│   │   ├── LIQPAY_PRIVATE_KEY
│   │   ├── CHECKBOX_LOGIN
│   │   ├── CHECKBOX_PASSWORD
│   │   └── CHECKBOX_LICENSE_KEY
│   └── Custom domain: yourdomain.com
```

**Estimated Monthly Cost (after free tier):**
- Small store (< 1000 orders/month): ~$5-10/month
- Medium store (1000-5000 orders/month): ~$15-25/month
- Large store (5000+ orders/month): ~$30-50/month

**Deployment Steps:**
1. Push code to GitHub repository
2. Create Railway account (free)
3. Click "Deploy from GitHub"
4. Add environment variables
5. Attach persistent volume for database
6. Deploy!

**Railway.app URL:** https://railway.app/

---

### Option 2: Render

**Why Render:**
- Excellent SvelteKit support
- Free tier available (with limitations)
- PostgreSQL database (would need to migrate from SQLite)
- Auto-deploy from Git
- Custom domains with SSL

**Free Tier Details:**
- Free web service (512 MB RAM, 0.1 CPU)
- Services spin down after 15 mins of inactivity
- Free PostgreSQL database (expires after 90 days)
- 100 GB bandwidth/month
- 500 build minutes/month

**Important Notes:**
- Free tier services sleep after inactivity (not ideal for e-commerce)
- Would require SQLite → PostgreSQL migration
- Better for paid plan ($25/month Standard plan minimum)

**Not recommended for free tier** due to sleep behavior and database limitations.

**Render URL:** https://render.com/

---

### Option 3: Vercel (Not Recommended)

**Why NOT Vercel:**
- Serverless architecture incompatible with SQLite
- No persistent storage for databases
- Would require PostgreSQL/external database
- Free tier is generous but not suitable for this architecture

Vercel is excellent for static/JAMstack sites but not ideal for SQLite-based e-commerce with server-side state.

---

### Option 4: Netlify (Not Recommended)

**Why NOT Netlify:**
- Primarily for static sites and serverless functions
- No persistent storage support
- Would require complete architecture change
- Not suitable for SQLite-based applications

---

### Required External Services (All Free Tier Available)

#### 1. Cloudflare R2 (Already Implemented)
**Free Tier:**
- 10 GB storage/month
- 10 million Class A operations/month
- 100 million Class B operations/month
- **Zero egress fees** (unlimited bandwidth)

**Perfect for:**
- Product images
- Asset storage
- User uploads
- Blog images

**Cost after free tier:** ~$0.015/GB storage

---

#### 2. LiqPay (Payment Gateway)
**Costs:**
- No monthly fee
- Transaction fees: 2.8% + 5 UAH per transaction
- Instant settlement to bank account

**Required:**
- Business bank account (ФОП or ТОВ)
- Verified merchant account

---

#### 3. Checkbox РРО
**Costs:**
- 249 UAH/month per cash register
- 30-day free trial
- First cash register only (additional registers +249 UAH each)

**Required:**
- Registered business (ФОП/ТОВ)
- Digital signature (ЕЦП)

---

#### 4. Email Service (Transactional Emails)

**Option A: Resend (Recommended)**
**Free Tier:**
- 3,000 emails/month
- 1 custom domain
- API access
- Email analytics

**Cost after free tier:** $20/month (50K emails)

**Resend URL:** https://resend.com/

**Option B: SendGrid**
**Free Tier:**
- 100 emails/day (3,000/month)
- Email API
- Basic analytics

**Cost after free tier:** $19.95/month (50K emails)

---

#### 5. Domain Name

**Registrars:**
- **Cloudflare Registrar** (recommended) - At-cost pricing (~$10/year for .com)
- **Namecheap** - Competitive pricing
- **Hostinger** - Budget-friendly

**Cost:** $8-15/year for .com/.ua domain

---

### Complete Free Tier Budget Breakdown

**Month 1-2 (Using Free Tiers):**
| Service | Cost | Notes |
|---------|------|-------|
| Railway (trial) | $0 | $5 credits included |
| Cloudflare R2 | $0 | 10 GB free forever |
| LiqPay | Transaction fees only | 2.8% + 5 UAH per sale |
| Checkbox РРО (trial) | $0 | 30-day free trial |
| Resend (email) | $0 | 3,000 emails/month |
| Domain | $10/year | One-time annual cost |
| **TOTAL** | ~$0-10 | (domain only) |

**Month 3+ (Post-Trial):**
| Service | Cost | Notes |
|---------|------|-------|
| Railway | $5-10 | Pay-as-you-go |
| Cloudflare R2 | $0-5 | Depends on storage |
| LiqPay | Transaction fees | 2.8% + 5 UAH per sale |
| Checkbox РРО | 249 UAH (~$6) | Required by law |
| Resend | $0-20 | Free up to 3K emails |
| **TOTAL** | ~$11-41/month | + transaction fees |

---

### Production Deployment Checklist

**Before Launch:**
- [ ] Set up Railway account and link GitHub repo
- [ ] Configure environment variables (all API keys)
- [ ] Attach persistent volume for SQLite database
- [ ] Set up custom domain with SSL
- [ ] Configure Cloudflare R2 bucket
- [ ] Set up LiqPay merchant account
- [ ] Register Checkbox РРО account and cash register
- [ ] Configure email service (Resend/SendGrid)
- [ ] Set up monitoring/error tracking (optional: Sentry free tier)
- [ ] Run production build test
- [ ] Perform security audit
- [ ] Set up automated database backups

**Post-Launch:**
- [ ] Monitor Railway usage dashboard
- [ ] Set up billing alerts
- [ ] Configure daily database backups
- [ ] Enable Cloudflare CDN (optional)
- [ ] Set up uptime monitoring (optional: UptimeRobot free tier)

---

### Database Backup Strategy

**Railway Volumes:**
- Automatic snapshots available
- Manual backup via Railway CLI:
  ```bash
  railway run sqlite3 /data/local.db ".backup /data/backup.db"
  ```

**Recommended Backup Schedule:**
- **Daily:** Automated backup to external storage
- **Weekly:** Full database export
- **Monthly:** Archive backups

**Backup Destination Options:**
- Cloudflare R2 (encrypted)
- GitHub private repository
- External cloud storage (Google Drive, Dropbox)

---

### Scaling Path (Future Growth)

**When to Upgrade:**

1. **Railway → Railway Pro ($20/month)**
   - > 5,000 visitors/month
   - > 1,000 orders/month
   - Need for horizontal scaling

2. **SQLite → PostgreSQL**
   - > 10,000 orders/month
   - Multiple concurrent write operations
   - Need for read replicas

3. **Consider Dedicated Infrastructure**
   - > 50,000 visitors/month
   - > 10,000 orders/month
   - Move to VPS (DigitalOcean, Linode)

---

### Future Migration: Ultra-Cheap High-Load Solution

**Target Use Case:**
- High traffic (> 100,000 visitors/month)
- Limited budget (< $20/month)
- Willing to manage infrastructure

---

#### Option 1: Hetzner VPS + PostgreSQL (Best Value) ⭐

**Infrastructure:**
```
Hetzner Cloud VPS
├── CPX11: €4.49/month (~$5)
│   ├── 2 vCPU (AMD)
│   ├── 2 GB RAM
│   ├── 40 GB SSD
│   ├── 20 TB traffic
│   └── Location: Germany/Finland
├── PostgreSQL (installed locally)
├── Nginx (reverse proxy + static files)
├── PM2 (process manager)
└── Cloudflare (free CDN + DDoS protection)
```

**Cost Breakdown:**
| Item | Cost |
|------|------|
| Hetzner VPS | €4.49/month (~$5) |
| Cloudflare R2 | $0-5 (storage) |
| Domain | $10/year (~$1/month) |
| Checkbox РРО | 249 UAH (~$6) |
| Email (Resend) | $0-20 |
| **TOTAL** | **$12-37/month** |

**Why This Works:**
- ✅ PostgreSQL handles high concurrency better than SQLite
- ✅ Hetzner has best price-to-performance in Europe
- ✅ Full control over infrastructure
- ✅ Can handle 100K+ visitors easily
- ✅ 20 TB bandwidth included (no overage fees)
- ✅ SSD storage for fast DB queries

**Migration Steps:**

**Phase 1: Database Migration (SQLite → PostgreSQL)**
1. Update Drizzle ORM configuration:
   ```typescript
   // drizzle.config.ts
   import { defineConfig } from 'drizzle-kit';
   
   export default defineConfig({
     schema: './src/lib/server/db/schema.ts',
     out: './drizzle',
     dialect: 'postgresql', // Changed from 'sqlite'
     dbCredentials: {
       url: process.env.DATABASE_URL!
     }
   });
   ```

2. Update schema.ts for PostgreSQL compatibility:
   ```typescript
   // Replace sqliteTable with pgTable
   import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core';
   
   export const user = pgTable('user', {
     id: text('id').primaryKey(),
     username: text('username').notNull().unique(),
     // Change integer timestamps to timestamp type
     createdAt: timestamp('created_at').notNull().defaultNow()
   });
   ```

3. Export SQLite data:
   ```bash
   # Dump data from Railway SQLite
   sqlite3 local.db .dump > backup.sql
   ```

4. Convert and import to PostgreSQL:
   ```bash
   # Install pgloader for conversion
   brew install pgloader  # or apt-get install pgloader
   
   # Convert SQLite to PostgreSQL
   pgloader backup.sql postgresql://localhost/ecommerce
   ```

**Phase 2: VPS Setup**
1. Create Hetzner account (https://www.hetzner.com/cloud)
2. Launch CPX11 server (Ubuntu 24.04)
3. SSH into server and run setup script:

```bash
#!/bin/bash
# setup.sh - Automated VPS configuration

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL 16
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2
sudo npm install -g pm2

# Configure PostgreSQL
sudo -u postgres psql -c "CREATE DATABASE ecommerce;"
sudo -u postgres psql -c "CREATE USER ecommerceuser WITH PASSWORD 'your_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ecommerce TO ecommerceuser;"

# Configure firewall
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

4. Deploy application:
```bash
# Clone repository
git clone https://github.com/yourusername/ecommerce-cms.git
cd ecommerce-cms

# Install dependencies
npm install

# Build production bundle
npm run build

# Start with PM2
pm2 start build/index.js --name ecommerce
pm2 save
pm2 startup
```

5. Configure Nginx reverse proxy:
```nginx
# /etc/nginx/sites-available/ecommerce
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

6. Enable HTTPS:
```bash
sudo certbot --nginx -d yourdomain.com
```

**Phase 3: Migration Execution**
1. Schedule maintenance window (2-4 hours)
2. Enable read-only mode on Railway app
3. Export final SQLite data
4. Import to Hetzner PostgreSQL
5. Update DNS to point to Hetzner IP
6. Test all functionality
7. Monitor for 24-48 hours

**Automated Backup Script:**
```bash
#!/bin/bash
# backup.sh - Daily database backup to R2

# Backup PostgreSQL
pg_dump ecommerce | gzip > /tmp/backup-$(date +%Y%m%d).sql.gz

# Upload to Cloudflare R2
aws s3 cp /tmp/backup-$(date +%Y%m%d).sql.gz \
  s3://your-bucket/backups/ \
  --endpoint-url https://your-account.r2.cloudflarestorage.com

# Cleanup old backups (keep last 30 days)
find /tmp -name "backup-*.sql.gz" -mtime +30 -delete
```

Add to crontab:
```bash
0 2 * * * /home/user/backup.sh
```

---

#### Option 2: Contabo VPS (Even Cheaper, Europe/US)

**Infrastructure:**
- VPS S: €4.50/month (~$5)
- 4 vCPU cores
- 6 GB RAM
- 100 GB SSD
- Unlimited traffic

**Same setup as Hetzner, slightly more resources for same price.**

**Contabo URL:** https://contabo.com/

---

#### Option 3: Oracle Cloud Free Tier (100% Free!) 🎁

**Extremely Budget-Friendly Option:**

**Free Forever Resources:**
- 2 AMD-based VMs (1/8 OCPU, 1 GB RAM each) OR
- 1 Arm-based VM (4 OCPUs, 24 GB RAM) ⭐
- 200 GB total storage
- 10 TB outbound data transfer/month
- Oracle Autonomous Database (2 instances)

**Why This is Amazing:**
- ✅ 100% free forever (not trial)
- ✅ 24 GB RAM Arm VM is incredibly powerful
- ✅ Can run PostgreSQL + app on same VM
- ✅ 10 TB bandwidth (more than enough)
- ✅ No credit card required for free tier

**Caveats:**
- ⚠️ Free tier can be reclaimed if unused for 90 days
- ⚠️ Arm architecture (may need Node.js recompilation)
- ⚠️ Oracle Cloud UI is complex
- ⚠️ Account approval can be slow

**Perfect for:**
- Side projects
- Testing scalability
- Zero-budget startups

**Oracle Cloud URL:** https://www.oracle.com/cloud/free/

---

#### Option 4: Fly.io (Balanced Approach)

**Infrastructure:**
- 3 GB persistent volumes (free)
- Shared CPU VMs
- Global edge deployment
- Auto-scaling

**Free Tier:**
- 3 shared-cpu-1x VMs (256 MB RAM each)
- 3 GB persistent volumes
- 160 GB outbound data transfer

**Cost After Free Tier:**
- ~$10-15/month for small e-commerce
- PostgreSQL via Supabase free tier

**Why Consider:**
- ✅ Better than Railway for PostgreSQL
- ✅ Global edge deployment
- ✅ Easy scaling
- ✅ Good free tier

**Not as cheap as VPS but easier to manage.**

**Fly.io URL:** https://fly.io/

---

### Complete Migration Cost Comparison

| Solution | Monthly Cost | Setup Complexity | Performance | Scalability |
|----------|--------------|------------------|-------------|-------------|
| **Railway + SQLite** | $11-41 | ⭐ Easy | Good | Limited |
| **Hetzner + PostgreSQL** | $12-37 | ⭐⭐⭐ Advanced | Excellent | High |
| **Contabo + PostgreSQL** | $12-37 | ⭐⭐⭐ Advanced | Excellent | High |
| **Oracle Free + PostgreSQL** | $6-11 (Checkbox only) | ⭐⭐⭐⭐ Expert | Excellent | Very High |
| **Fly.io + PostgreSQL** | $15-30 | ⭐⭐ Moderate | Excellent | Very High |

---

### Recommended Migration Timeline

**Stage 1: MVP Launch (Months 0-3)**
- Use Railway + SQLite
- Focus on product validation
- Cost: $0-20/month

**Stage 2: Early Growth (Months 3-12)**
- Stay on Railway, upgrade to Pro if needed
- Add PostgreSQL if concurrent writes increase
- Cost: $20-50/month

**Stage 3: Scale & Optimize (Year 2+)**
- Migrate to Hetzner/Contabo VPS
- Self-host PostgreSQL
- Implement caching (Redis)
- Cost: $12-37/month (save 40-70%)

---

### Database Migration Considerations

**SQLite → PostgreSQL Compatibility Issues:**

1. **Data Types:**
   ```typescript
   // SQLite
   createdAt: integer('created_at', { mode: 'timestamp' })
   
   // PostgreSQL
   createdAt: timestamp('created_at').notNull().defaultNow()
   ```

2. **Auto-increment:**
   ```typescript
   // SQLite
   id: integer('id').primaryKey({ autoIncrement: true })
   
   // PostgreSQL
   id: serial('id').primaryKey()
   ```

3. **Full-text Search:**
   ```typescript
   // SQLite
   db.run("CREATE VIRTUAL TABLE products_fts USING fts5(name, description)");
   
   // PostgreSQL
   db.execute(`
     CREATE INDEX products_search_idx ON products 
     USING GIN (to_tsvector('english', name || ' ' || description))
   `);
   ```

4. **JSON Columns:**
   ```typescript
   // SQLite (stored as text)
   metadata: text('metadata')
   
   // PostgreSQL (native JSON)
   metadata: jsonb('metadata')
   ```

**Migration Script Template:**
```typescript
// migrate-to-postgres.ts
import { drizzle as sqliteDrizzle } from 'drizzle-orm/better-sqlite3';
import { drizzle as pgDrizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import Database from 'better-sqlite3';

const sqliteDb = new Database('local.db');
const sqlite = sqliteDrizzle(sqliteDb);

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const pg = pgDrizzle(client);

async function migrate() {
  console.log('Starting migration...');
  
  // Migrate users
  const users = await sqlite.select().from(sqliteTables.user);
  await pg.insert(pgTables.user).values(users);
  
  // Migrate products
  const products = await sqlite.select().from(sqliteTables.product);
  await pg.insert(pgTables.product).values(products);
  
  // ... migrate other tables
  
  console.log('Migration complete!');
}

migrate();
```

---

### Performance Optimization for High Load

**When Running on Budget VPS:**

1. **Enable Connection Pooling:**
   ```typescript
   // src/lib/server/db/index.ts
   import { Pool } from 'pg';
   
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
     max: 20, // max connections
     idleTimeoutMillis: 30000,
     connectionTimeoutMillis: 2000,
   });
   ```

2. **Add Redis for Caching:**
   ```bash
   # Install Redis
   sudo apt install redis-server
   
   # Configure in app
   npm install ioredis
   ```
   
   ```typescript
   import Redis from 'ioredis';
   
   const redis = new Redis({
     host: 'localhost',
     port: 6379,
   });
   
   // Cache product catalog
   export async function getProducts() {
     const cached = await redis.get('products:all');
     if (cached) return JSON.parse(cached);
     
     const products = await db.select().from(tables.product);
     await redis.setex('products:all', 300, JSON.stringify(products)); // 5 min cache
     return products;
   }
   ```

3. **Database Indexing:**
   ```sql
   -- Add indexes for common queries
   CREATE INDEX idx_product_slug ON product(slug);
   CREATE INDEX idx_product_category ON product(category_id);
   CREATE INDEX idx_order_user ON "order"(user_id);
   CREATE INDEX idx_order_status ON "order"(status);
   CREATE INDEX idx_order_created ON "order"(created_at DESC);
   ```

4. **Static Asset CDN:**
   - Use Cloudflare (free tier)
   - Cache product images aggressively
   - Enable Brotli/Gzip compression

5. **Nginx Caching:**
   ```nginx
   # Cache static assets
   location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|webp)$ {
       expires 365d;
       add_header Cache-Control "public, immutable";
   }
   ```

---

### Monitoring & Maintenance (Free Tools)

**Essential Monitoring:**
1. **UptimeRobot** (free) - 50 monitors, 5-min checks
   - https://uptimerobot.com/
   
2. **Netdata** (open-source) - Real-time performance monitoring
   ```bash
   bash <(curl -Ss https://my-netdata.io/kickstart.sh)
   ```
   
3. **Grafana + Prometheus** (open-source) - Advanced metrics
   - Self-hosted on same VPS

4. **Sentry** (free tier) - Error tracking
   - 5K errors/month free
   - https://sentry.io/

**Backup Strategy:**
- Daily automated backups to R2 (free tier)
- Weekly full database dumps
- 30-day retention policy

---

### Final Recommendation: Migration Path

**For Most Users:**
```
Start: Railway ($11-41/mo) 
  ↓ [after 6-12 months or 10K orders/month]
Migrate: Hetzner VPS + PostgreSQL ($12-37/mo)
  ↓ [if costs are still concern]
Optimize: Oracle Cloud Free Tier ($6/mo - Checkbox only)
```

**Best Value at Scale:**
- **Hetzner VPS €4.49/month** = Professional infrastructure at hobby prices
- Handles 100K+ visitors/month easily
- Full control, no vendor lock-in
- Save $15-30/month vs managed platforms

---

### Alternative: Self-Hosted VPS (Advanced)

**For Budget-Conscious Developers:**

**DigitalOcean Droplet:**
- $6/month (1 GB RAM, 1 vCPU, 25 GB SSD)
- Full control over infrastructure
- Manual setup required (Nginx, Node.js, PM2, SSL)

**Hetzner Cloud:**
- €4.49/month (~$5) (2 GB RAM, 1 vCPU, 20 GB SSD)
- European data centers
- Best price-to-performance ratio

**Setup Required:**
- Ubuntu server configuration
- Nginx reverse proxy
- PM2 process manager
- Let's Encrypt SSL
- Automated backups
- Security hardening

**Not recommended for MVP** - focus on shipping product first!

---

## Recommended MVP Deployment: Railway + External Services

**Why This Stack:**
1. ✅ **Lowest initial cost** - $0-10 for first month
2. ✅ **Best SQLite support** - persistent volumes
3. ✅ **Easy deployment** - GitHub integration
4. ✅ **Scalable** - pay-as-you-grow model
5. ✅ **Production-ready** - used by thousands of apps
6. ✅ **Developer-friendly** - simple UI, great DX

**Total Estimated Cost for First 6 Months:**
- Months 1-2: ~$10 (domain only)
- Months 3-6: ~$17-47/month (Railway + Checkbox + domain)
- **Average: ~$30/month** for full e-commerce infrastructure

This is **dramatically cheaper** than alternatives:
- Shopify: $39-399/month
- WooCommerce hosting: $25-100/month
- Custom hosting: $50-200/month

---

## Post-MVP Enhancements

- Customer reviews & ratings
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
