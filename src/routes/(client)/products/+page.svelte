<script lang="ts">
        import { browseProducts } from '$lib/remotes/product.remote';
        import { Input } from '$lib/components/ui/input';
        import { WishlistButton } from '$lib/components/client/features/wishlist';
        import SeoHead from '$lib/components/common/utility/seo-head.svelte';
        import * as m from '$lib/paraglide/messages';
        import { ShoppingCart } from '@lucide/svelte';

        let { data } = $props();
        let searchQuery = $state('');
        let sortBy = $state<'newest' | 'price-asc' | 'price-desc' | 'name'>('newest');
        let currentPage = $state(1);

        const seo = data?.seo;
        const structuredData = data?.structuredData;

        // Helper to format price in cents to display format
        function formatPrice(cents: number) {
                return (cents / 100).toFixed(2);
        }
</script>

<!-- SEO Head with server-side data -->
{#if seo}
        <SeoHead
                title={seo.title}
                description={seo.description}
                keywords={seo.keywords}
                image={seo.image}
                imageAlt={seo.imageAlt}
                type={seo.type}
                canonical={seo.canonical}
                noindex={seo.noindex}
                nofollow={seo.nofollow}
                locale={seo.locale}
                alternateLocales={seo.alternateLocales}
                structuredData={structuredData?.breadcrumb}
                breadcrumbs={[
                        { name: 'Home', url: '/' },
                        { name: 'Products', url: '/products' }
                ]}
        />
{/if}