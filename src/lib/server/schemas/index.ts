import * as v from 'valibot';

// Blog schemas
export const CreateBlogSchema = v.object({
    title: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
    content: v.pipe(v.string(), v.minLength(1)),
    slug: v.pipe(v.string(), v.minLength(1), v.maxLength(200))
});

export const UpdateBlogSchema = v.object({
    id: v.string(),
    title: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
    content: v.pipe(v.string(), v.minLength(1)),
    slug: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
});

export const DeleteBlogSchema = v.object({
    id: v.string()
});

// Auth schemas
export const LoginSchema = v.object({
    username: v.pipe(
        v.string(),
        v.minLength(3, 'Username must be at least 3 characters'),
        v.maxLength(31, 'Username must be at most 31 characters'),
        v.regex(/^[a-z0-9_-]+$/, 'Username must contain only lowercase letters, numbers, dashes, and underscores')
    ),
    password: v.pipe(
        v.string(),
        v.minLength(6, 'Password must be at least 6 characters'),
        v.maxLength(255, 'Password must be at most 255 characters')
    )
});

export const RegisterSchema = v.object({
    username: v.pipe(
        v.string(),
        v.minLength(3, 'Username must be at least 3 characters'),
        v.maxLength(31, 'Username must be at most 31 characters'),
        v.regex(/^[a-z0-9_-]+$/, 'Username must contain only lowercase letters, numbers, dashes, and underscores')
    ),
    email: v.optional(v.pipe(v.string(), v.email('Invalid email address'))),
    password: v.pipe(
        v.string(),
        v.minLength(6, 'Password must be at least 6 characters'),
        v.maxLength(255, 'Password must be at most 255 characters')
    )
});

export const CreateUserSchema = v.object({
    username: v.pipe(
        v.string(),
        v.minLength(3, 'Username must be at least 3 characters'),
        v.maxLength(31, 'Username must be at most 31 characters'),
        v.regex(/^[a-z0-9_-]+$/, 'Username must contain only lowercase letters, numbers, dashes, and underscores')
    ),
    email: v.optional(v.pipe(v.string(), v.email('Invalid email address'))),
    password: v.pipe(
        v.string(),
        v.minLength(6, 'Password must be at least 6 characters'),
        v.maxLength(255, 'Password must be at most 255 characters')
    ),
    role: v.optional(v.picklist(['admin', 'user']), 'user'),
    isAdmin: v.optional(v.boolean(), false)
});

export const UpdateUserSchema = v.object({
    id: v.string(),
    username: v.optional(v.pipe(
        v.string(),
        v.minLength(3, 'Username must be at least 3 characters'),
        v.maxLength(31, 'Username must be at most 31 characters'),
        v.regex(/^[a-z0-9_-]+$/, 'Username must contain only lowercase letters, numbers, dashes, and underscores')
    )),
    email: v.optional(v.pipe(v.string(), v.email('Invalid email address'))),
    password: v.optional(v.pipe(
        v.string(),
        v.minLength(6, 'Password must be at least 6 characters'),
        v.maxLength(255, 'Password must be at most 255 characters')
    )),
    role: v.optional(v.picklist(['admin', 'user'])),
    isAdmin: v.optional(v.boolean())
});

export const DeleteUserSchema = v.object({
    id: v.string()
});

export const GetUserByIdSchema = v.object({
    id: v.string()
});

export const FilterUsersSchema = v.object({
    username: v.optional(v.string(), ''),
    page: v.optional(v.pipe(v.number(), v.minValue(1)), 1),
    pageSize: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(100)), 20),
    sortField: v.optional(v.picklist(['username', 'email', 'createdAt']), 'createdAt'),
    sortDirection: v.optional(v.picklist(['asc', 'desc']), 'desc')
});

// Asset schemas
export const DeleteAssetSchema = v.object({
    id: v.string()
});

export const FilterAssetsSchema = v.object({
    filename: v.optional(v.string(), ''),
    mimeType: v.optional(v.string(), '')
});

// Category schemas
export const CreateCategorySchema = v.object({
    name: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
    slug: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
    description: v.optional(v.string()),
    parentId: v.optional(v.string()),
    image: v.optional(v.string()),
    displayOrder: v.optional(v.number(), 0),
    isVisible: v.optional(v.boolean(), true),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string())
});

export const UpdateCategorySchema = v.object({
    id: v.string(),
    name: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(200))),
    slug: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(200))),
    description: v.optional(v.string()),
    parentId: v.optional(v.string()),
    image: v.optional(v.string()),
    displayOrder: v.optional(v.number()),
    isVisible: v.optional(v.boolean()),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string())
});

export const DeleteCategorySchema = v.object({
    id: v.string()
});

// Brand schemas
export const CreateBrandSchema = v.object({
    name: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
    slug: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
    description: v.optional(v.string()),
    logo: v.optional(v.string()),
    isVisible: v.optional(v.boolean(), true)
});

export const UpdateBrandSchema = v.object({
    id: v.string(),
    name: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(200))),
    slug: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(200))),
    description: v.optional(v.string()),
    logo: v.optional(v.string()),
    isVisible: v.optional(v.boolean())
});

export const DeleteBrandSchema = v.object({
    id: v.string()
});

// Product schemas
export const CreateProductSchema = v.object({
    name: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
    slug: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
    description: v.optional(v.string()),
    price: v.pipe(v.number(), v.minValue(0)), // in cents
    compareAtPrice: v.optional(v.pipe(v.number(), v.minValue(0))),
    sku: v.optional(v.string()),
    barcode: v.optional(v.string()),
    quantity: v.optional(v.number(), 0),
    trackInventory: v.optional(v.boolean(), true),
    lowStockThreshold: v.optional(v.number(), 10),
    allowBackorders: v.optional(v.boolean(), false),
    status: v.optional(v.picklist(['draft', 'active', 'archived']), 'draft'),
    categoryId: v.optional(v.string()),
    brandId: v.optional(v.string()),
    images: v.optional(v.string()), // JSON string
    variants: v.optional(v.string()), // JSON string
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string())
});

export const UpdateProductSchema = v.object({
    id: v.string(),
    name: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(200))),
    slug: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(200))),
    description: v.optional(v.string()),
    price: v.optional(v.pipe(v.number(), v.minValue(0))),
    compareAtPrice: v.optional(v.pipe(v.number(), v.minValue(0))),
    sku: v.optional(v.string()),
    barcode: v.optional(v.string()),
    quantity: v.optional(v.number()),
    trackInventory: v.optional(v.boolean()),
    lowStockThreshold: v.optional(v.number()),
    allowBackorders: v.optional(v.boolean()),
    status: v.optional(v.picklist(['draft', 'active', 'archived'])),
    categoryId: v.optional(v.string()),
    brandId: v.optional(v.string()),
    images: v.optional(v.string()),
    variants: v.optional(v.string()),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string())
});

export const DeleteProductSchema = v.object({
    id: v.string()
});

export const FilterProductsSchema = v.object({
    name: v.optional(v.string(), ''),
    status: v.optional(v.picklist(['draft', 'active', 'archived', 'all']), 'all'),
    categoryId: v.optional(v.string()),
    brandId: v.optional(v.string()),
    page: v.optional(v.pipe(v.number(), v.minValue(1)), 1),
    pageSize: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(100)), 20)
});

// Cart schemas
export const AddToCartSchema = v.object({
    productId: v.string(),
    quantity: v.pipe(v.number(), v.minValue(1)),
    variantId: v.optional(v.string()) // for product variants
});

export const UpdateCartItemSchema = v.object({
    productId: v.string(),
    quantity: v.pipe(v.number(), v.minValue(0)), // 0 to remove
    variantId: v.optional(v.string())
});

export const RemoveFromCartSchema = v.object({
    productId: v.string(),
    variantId: v.optional(v.string())
});

// Checkout schemas
export const CheckoutSchema = v.object({
    customerFirstName: v.pipe(v.string(), v.minLength(1), v.maxLength(100)),
    customerLastName: v.pipe(v.string(), v.minLength(1), v.maxLength(100)),
    customerEmail: v.pipe(v.string(), v.email()),
    customerPhone: v.optional(v.string()),
    shippingAddress: v.object({
        address1: v.pipe(v.string(), v.minLength(1)),
        address2: v.optional(v.string()),
        city: v.pipe(v.string(), v.minLength(1)),
        state: v.pipe(v.string(), v.minLength(1)),
        postalCode: v.pipe(v.string(), v.minLength(1)),
        country: v.pipe(v.string(), v.minLength(1))
    }),
    billingAddress: v.optional(v.object({
        address1: v.pipe(v.string(), v.minLength(1)),
        address2: v.optional(v.string()),
        city: v.pipe(v.string(), v.minLength(1)),
        state: v.pipe(v.string(), v.minLength(1)),
        postalCode: v.pipe(v.string(), v.minLength(1)),
        country: v.pipe(v.string(), v.minLength(1))
    })),
    sameAsShipping: v.optional(v.boolean(), true),
    shippingMethod: v.optional(v.string()),
    paymentMethod: v.optional(v.string(), 'cod'), // cod = cash on delivery
    notes: v.optional(v.string())
});

// Order schemas
export const UpdateOrderStatusSchema = v.object({
    id: v.string(),
    status: v.picklist(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'])
});

export const FilterOrdersSchema = v.object({
    status: v.optional(v.picklist(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'all']), 'all'),
    customerEmail: v.optional(v.string(), ''),
    orderNumber: v.optional(v.string(), ''),
    page: v.optional(v.pipe(v.number(), v.minValue(1)), 1),
    pageSize: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(100)), 20)
});

// Email settings schemas
export const UpdateEmailSettingsSchema = v.object({
    fromEmail: v.pipe(v.string(), v.email('Invalid email address')),
    fromName: v.pipe(v.string(), v.minLength(1), v.maxLength(100)),
    replyToEmail: v.optional(v.pipe(v.string(), v.email('Invalid email address'))),
    
    enableOrderConfirmation: v.boolean(),
    enableOrderShipped: v.boolean(),
    enableOrderDelivered: v.boolean(),
    enableOrderCancelled: v.boolean(),
    enablePasswordReset: v.boolean(),
    enableWelcome: v.boolean()
});

export const TestEmailSchema = v.object({
    toEmail: v.pipe(v.string(), v.email('Invalid email address'))
});

// Customer profile schemas
export const UpdateProfileSchema = v.object({
    firstName: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(100))),
    lastName: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(100))),
    email: v.optional(v.pipe(v.string(), v.email('Invalid email address'))),
    phone: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(20))),
    marketingOptIn: v.optional(v.boolean(), false)
});

// Customer address schemas
export const CreateAddressSchema = v.object({
    firstName: v.pipe(v.string(), v.minLength(1), v.maxLength(100)),
    lastName: v.pipe(v.string(), v.minLength(1), v.maxLength(100)),
    company: v.optional(v.string()),
    address1: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
    address2: v.optional(v.string()),
    city: v.pipe(v.string(), v.minLength(1), v.maxLength(100)),
    state: v.pipe(v.string(), v.minLength(1), v.maxLength(100)),
    postalCode: v.pipe(v.string(), v.minLength(1), v.maxLength(20)),
    country: v.pipe(v.string(), v.minLength(1), v.maxLength(100)),
    phone: v.pipe(v.string(), v.minLength(1), v.maxLength(20)),
    isDefault: v.optional(v.boolean(), false)
});

export const UpdateAddressSchema = v.object({
    id: v.string(),
    firstName: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(100))),
    lastName: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(100))),
    company: v.optional(v.string()),
    address1: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(200))),
    address2: v.optional(v.string()),
    city: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(100))),
    state: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(100))),
    postalCode: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(20))),
    country: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(100))),
    phone: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(20))),
    isDefault: v.optional(v.boolean())
});

export const DeleteAddressSchema = v.object({
    id: v.string()
});

export const SetDefaultAddressSchema = v.object({
    id: v.string()
});

// Shipping Zone schemas
export const CreateShippingZoneSchema = v.object({
    name: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
    countries: v.array(v.string()) // array of country codes
});

export const UpdateShippingZoneSchema = v.object({
    id: v.string(),
    name: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(200))),
    countries: v.optional(v.array(v.string()))
});

export const DeleteShippingZoneSchema = v.object({
    id: v.string()
});

// Shipping Rate schemas
export const CreateShippingRateSchema = v.object({
    zoneId: v.string(),
    name: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
    description: v.optional(v.string()),
    price: v.pipe(v.number(), v.minValue(0)), // in cents
    minOrderAmount: v.optional(v.pipe(v.number(), v.minValue(0))), // in cents
    maxOrderAmount: v.optional(v.pipe(v.number(), v.minValue(0))), // in cents
    estimatedDays: v.optional(v.string()), // e.g. "3-5" or "1-2"
    isActive: v.optional(v.boolean(), true)
});

export const UpdateShippingRateSchema = v.object({
    id: v.string(),
    zoneId: v.optional(v.string()),
    name: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(200))),
    description: v.optional(v.string()),
    price: v.optional(v.pipe(v.number(), v.minValue(0))),
    minOrderAmount: v.optional(v.pipe(v.number(), v.minValue(0))),
    maxOrderAmount: v.optional(v.pipe(v.number(), v.minValue(0))),
    estimatedDays: v.optional(v.string()),
    isActive: v.optional(v.boolean())
});

export const DeleteShippingRateSchema = v.object({
    id: v.string()
});

export const GetApplicableRatesSchema = v.object({
    country: v.string(),
    orderAmount: v.pipe(v.number(), v.minValue(0)) // in cents
});

// Discount schemas
export const CreateDiscountSchema = v.object({
    code: v.pipe(
        v.string(),
        v.minLength(1, 'Discount code is required'),
        v.maxLength(50, 'Discount code must be at most 50 characters'),
        v.regex(/^[A-Z0-9_-]+$/, 'Discount code must contain only uppercase letters, numbers, dashes, and underscores')
    ),
    type: v.picklist(['percentage', 'fixed', 'free_shipping'], 'Invalid discount type'),
    value: v.pipe(v.number(), v.minValue(0, 'Value must be non-negative')),
    minOrderAmount: v.optional(v.pipe(v.number(), v.minValue(0))), // in cents
    maxUsesTotal: v.optional(v.pipe(v.number(), v.minValue(1))),
    maxUsesPerCustomer: v.optional(v.pipe(v.number(), v.minValue(1)), 1),
    startsAt: v.pipe(v.string(), v.isoDateTime()),
    endsAt: v.optional(v.pipe(v.string(), v.isoDateTime())),
    isActive: v.optional(v.boolean(), true),
    applicableProducts: v.optional(v.string()), // JSON string of product IDs
    applicableCategories: v.optional(v.string()), // JSON string of category IDs
    description: v.optional(v.string())
});

export const UpdateDiscountSchema = v.object({
    id: v.string(),
    code: v.optional(v.pipe(
        v.string(),
        v.minLength(1),
        v.maxLength(50),
        v.regex(/^[A-Z0-9_-]+$/)
    )),
    type: v.optional(v.picklist(['percentage', 'fixed', 'free_shipping'])),
    value: v.optional(v.pipe(v.number(), v.minValue(0))),
    minOrderAmount: v.optional(v.pipe(v.number(), v.minValue(0))),
    maxUsesTotal: v.optional(v.pipe(v.number(), v.minValue(1))),
    maxUsesPerCustomer: v.optional(v.pipe(v.number(), v.minValue(1))),
    startsAt: v.optional(v.pipe(v.string(), v.isoDateTime())),
    endsAt: v.optional(v.pipe(v.string(), v.isoDateTime())),
    isActive: v.optional(v.boolean()),
    applicableProducts: v.optional(v.string()), // JSON string
    applicableCategories: v.optional(v.string()), // JSON string
    description: v.optional(v.string())
});

export const DeleteDiscountSchema = v.object({
    id: v.string()
});

export const ValidateDiscountSchema = v.object({
    code: v.pipe(v.string(), v.minLength(1)),
    cartTotal: v.pipe(v.number(), v.minValue(0)), // in cents
    userId: v.optional(v.string()), // for tracking per-customer usage
    cartItems: v.optional(v.array(v.object({
        productId: v.string(),
        categoryId: v.optional(v.string())
    })))
});

export const ApplyDiscountSchema = v.object({
    code: v.pipe(v.string(), v.minLength(1)),
    cartTotal: v.pipe(v.number(), v.minValue(0)),
    userId: v.optional(v.string())
});

// Wishlist schemas
export const AddToWishlistSchema = v.object({
    productId: v.pipe(v.string(), v.minLength(1), v.maxLength(100))
});

export const RemoveFromWishlistSchema = v.object({
    productId: v.pipe(v.string(), v.minLength(1), v.maxLength(100))
});

export const MoveToCartSchema = v.object({
    productId: v.pipe(v.string(), v.minLength(1), v.maxLength(100)),
    quantity: v.optional(v.pipe(v.number(), v.minValue(1)), 1)
});

// Site Settings schemas
export const GetSettingSchema = v.object({
    key: v.pipe(v.string(), v.minLength(1))
});

export const GetSettingsByCategorySchema = v.object({
    category: v.picklist(['general', 'store', 'checkout', 'email', 'seo', 'advanced'])
});

export const UpdateSettingSchema = v.object({
    key: v.pipe(v.string(), v.minLength(1), v.maxLength(100)),
    value: v.string(), // Always string, parsed based on type
    type: v.optional(v.picklist(['string', 'number', 'boolean', 'json']), 'string'),
    category: v.optional(v.picklist(['general', 'store', 'checkout', 'email', 'seo', 'advanced']), 'general'),
    label: v.optional(v.string()),
    description: v.optional(v.string())
});

export const UpdateMultipleSettingsSchema = v.object({
    settings: v.array(v.object({
        key: v.pipe(v.string(), v.minLength(1), v.maxLength(100)),
        value: v.string()
    }))
});

export const DeleteSettingSchema = v.object({
    key: v.pipe(v.string(), v.minLength(1))
});

// General Settings specific schemas
export const UpdateGeneralSettingsSchema = v.object({
    storeName: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(200))),
    storeLogo: v.optional(v.string()), // Asset ID or URL
    storeFavicon: v.optional(v.string()), // Asset ID or URL
    storeEmail: v.optional(v.pipe(v.string(), v.email())),
    storePhone: v.optional(v.string()),
    timezone: v.optional(v.string()), // e.g. "America/New_York"
    currency: v.optional(v.string()), // e.g. "USD"
    currencySymbol: v.optional(v.string()), // e.g. "$"
    defaultLanguage: v.optional(v.string()) // e.g. "en"
});

// Store Info Settings specific schemas
export const UpdateStoreInfoSettingsSchema = v.object({
    storeAddress1: v.optional(v.string()),
    storeAddress2: v.optional(v.string()),
    storeCity: v.optional(v.string()),
    storeState: v.optional(v.string()),
    storePostalCode: v.optional(v.string()),
    storeCountry: v.optional(v.string()),
    facebookUrl: v.optional(v.string()),
    instagramUrl: v.optional(v.string()),
    twitterUrl: v.optional(v.string()),
    youtubeUrl: v.optional(v.string()),
    linkedinUrl: v.optional(v.string())
});

// SEO Settings specific schemas
export const UpdateSeoSettingsSchema = v.object({
    seoDefaultTitle: v.optional(v.pipe(v.string(), v.maxLength(60))),
    seoDefaultDescription: v.optional(v.pipe(v.string(), v.maxLength(160))),
    seoDefaultKeywords: v.optional(v.string()),
    seoDefaultOgImage: v.optional(v.string()), // Asset ID or URL
    seoGoogleAnalyticsId: v.optional(v.string()),
    seoGoogleSearchConsoleId: v.optional(v.string()),
    seoFacebookPixelId: v.optional(v.string()),
    enableStructuredData: v.optional(v.boolean()),
    enableSitemap: v.optional(v.boolean())
});

// Checkout Settings specific schemas
export const UpdateCheckoutSettingsSchema = v.object({
    enableGuestCheckout: v.optional(v.boolean()),
    requirePhoneNumber: v.optional(v.boolean()),
    enableOrderNotes: v.optional(v.boolean()),
    termsAndConditionsUrl: v.optional(v.string()),
    privacyPolicyUrl: v.optional(v.string()),
    returnPolicyUrl: v.optional(v.string()),
    enableNewsletterSignup: v.optional(v.boolean())
});

// Email Settings specific schemas (extended from existing UpdateEmailSettingsSchema)
export const UpdateEmailConfigSettingsSchema = v.object({
    emailSmtpHost: v.optional(v.string()),
    emailSmtpPort: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(65535))),
    emailSmtpUsername: v.optional(v.string()),
    emailSmtpPassword: v.optional(v.string()),
    emailSmtpSecure: v.optional(v.boolean()),
    emailFromName: v.optional(v.pipe(v.string(), v.minLength(1))),
    emailFromAddress: v.optional(v.pipe(v.string(), v.email())),
    emailReplyToAddress: v.optional(v.pipe(v.string(), v.email()))
});

// Advanced Settings specific schemas
export const UpdateAdvancedSettingsSchema = v.object({
    maintenanceMode: v.optional(v.boolean()),
    maintenanceMessage: v.optional(v.string()),
    customHeadScripts: v.optional(v.string()), // HTML/JS to inject in <head>
    customBodyScripts: v.optional(v.string()), // HTML/JS to inject before </body>
    enableDebugMode: v.optional(v.boolean()),
    enableCaching: v.optional(v.boolean()),
    cacheDuration: v.optional(v.pipe(v.number(), v.minValue(0))) // in seconds
});

// Banner schemas
export const CreateBannerSchema = v.pipe(
    v.object({
        title: v.pipe(v.string(), v.minLength(1, 'Title is required'), v.maxLength(200, 'Title must be at most 200 characters')),
        imageId: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
        link: v.optional(v.pipe(v.string(), v.url('Must be a valid URL'))),
        linkText: v.optional(v.pipe(v.string(), v.maxLength(100, 'Link text must be at most 100 characters'))),
        position: v.optional(
            v.picklist(['home_hero', 'home_secondary', 'category_top', 'product_sidebar', 'footer'], 'Invalid position'),
            'home_hero'
        ),
        displayOrder: v.optional(v.pipe(v.number(), v.minValue(0, 'Display order must be 0 or greater')), 0),
        startsAt: v.optional(v.pipe(v.string(), v.isoDateTime('Must be a valid date'))),
        endsAt: v.optional(v.pipe(v.string(), v.isoDateTime('Must be a valid date'))),
        isActive: v.optional(v.boolean(), true)
    }),
    v.check(
        (data) => !!(data.imageId || data.imageUrl),
        'Either imageId or imageUrl is required'
    ),
    v.check(
        (data) => {
            if (data.startsAt && data.endsAt) {
                return new Date(data.startsAt) < new Date(data.endsAt);
            }
            return true;
        },
        'Start date must be before end date'
    )
);

export const UpdateBannerSchema = v.pipe(
    v.object({
        id: v.string(),
        title: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(200))),
        imageId: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
        link: v.optional(v.pipe(v.string(), v.url('Must be a valid URL'))),
        linkText: v.optional(v.pipe(v.string(), v.maxLength(100))),
        position: v.optional(v.picklist(['home_hero', 'home_secondary', 'category_top', 'product_sidebar', 'footer'])),
        displayOrder: v.optional(v.pipe(v.number(), v.minValue(0))),
        startsAt: v.optional(v.pipe(v.string(), v.isoDateTime())),
        endsAt: v.optional(v.pipe(v.string(), v.isoDateTime())),
        isActive: v.optional(v.boolean())
    }),
    v.check(
        (data) => {
            if (data.startsAt && data.endsAt) {
                return new Date(data.startsAt) < new Date(data.endsAt);
            }
            return true;
        },
        'Start date must be before end date'
    )
);

export const DeleteBannerSchema = v.object({
    id: v.string()
});

export const GetBannersByPositionSchema = v.object({
    position: v.picklist(['home_hero', 'home_secondary', 'category_top', 'product_sidebar', 'footer'], 'Invalid position'),
    includeInactive: v.optional(v.boolean(), false)
});

export const FilterBannersSchema = v.object({
    title: v.optional(v.string(), ''),
    position: v.optional(v.picklist(['home_hero', 'home_secondary', 'category_top', 'product_sidebar', 'footer', 'all']), 'all'),
    isActive: v.optional(v.picklist(['true', 'false', 'all']), 'all'),
    page: v.optional(v.pipe(v.number(), v.minValue(1)), 1),
    pageSize: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(100)), 20),
    sortField: v.optional(v.picklist(['title', 'position', 'displayOrder', 'createdAt']), 'displayOrder'),
    sortDirection: v.optional(v.picklist(['asc', 'desc']), 'asc')
});