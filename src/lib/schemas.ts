import * as v from 'valibot';

export enum SortOptions {
	TITLE_ASC = 'title:asc',
	PRICE_ASC = 'price:asc',
	PRICE_DESC = 'price:desc',
	CREATED_AT_DESC = 'createdAt:desc'
}

export const productSearchSchema = v.object({
	page: v.optional(v.pipe(v.number(), v.minValue(1))),
	sortBy: v.optional(v.enum(SortOptions)),
    query: v.optional(v.string()),
    category: v.optional(v.string())
});
