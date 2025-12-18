import type { Product, ProductTier } from './db/schema';

/**
 * Calculate the discount percentage for a product based on quantity
 * Applies tiered discount if available
 */
export function getApplicableDiscount(
	quantity: number,
	tiers: ProductTier[] | null
): number {
	if (!tiers || tiers.length === 0) {
		return 0;
	}

	// Sort tiers by minQuantity in descending order
	const sortedTiers = [...tiers].sort((a, b) => b.minQuantity - a.minQuantity);

	// Find the applicable tier
	for (const tier of sortedTiers) {
		if (quantity >= tier.minQuantity) {
			return tier.discount;
		}
	}

	return 0;
}

/**
 * Calculate the unit price for a product based on quantity and discount
 * Applies tiered discounts if available
 */
export function calculateUnitPrice(
	basePrice: number,
	quantity: number,
	tiers: ProductTier[] | null
): number {
	const discountPercent = getApplicableDiscount(quantity, tiers);
	const discountAmount = basePrice * (discountPercent / 100);
	return basePrice - discountAmount;
}

/**
 * Calculate total price for a product with quantity
 */
export function calculateTotalPrice(
	basePrice: number,
	quantity: number,
	tiers: ProductTier[] | null
): number {
	const unitPrice = calculateUnitPrice(basePrice, quantity, tiers);
	return unitPrice * quantity;
}

/**
 * Get all applicable tiers for a product, sorted by minimum quantity
 */
export function getSortedTiers(tiers: ProductTier[]): ProductTier[] {
	return [...tiers].sort((a, b) => a.minQuantity - b.minQuantity);
}

/**
 * Format price unit for display
 */
export function formatPriceUnit(unit: string): string {
	const unitLabels: Record<string, string> = {
		unit: 'per unit',
		per_100g: 'per 100g',
		per_kg: 'per kg',
		per_liter: 'per liter',
		per_ml: 'per ml'
	};

	return unitLabels[unit] || unit;
}

/**
 * Get weight display text
 */
export function formatWeight(weight: number | null | undefined, unit: string): string {
	if (!weight) return '';

	if (unit === 'per_100g') {
		return `${weight}g`;
	} else if (unit === 'per_kg') {
		return `${weight / 1000}kg`;
	} else if (unit === 'per_liter' || unit === 'per_ml') {
		return `${weight}ml`;
	}

	return '';
}
