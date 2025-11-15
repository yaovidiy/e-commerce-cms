import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate a URL-friendly slug from a string with Cyrillic transliteration support
 * @param name - The string to convert to a slug
 * @returns A URL-friendly slug
 * @example
 * generateSlug("Hello World") // "hello-world"
 * generateSlug("Новий продукт") // "noviy-produkt"
 * generateSlug("Київ 2024") // "kiyiv-2024"
 */
export function generateSlug(name: string): string {
	// Transliteration map for Cyrillic to Latin
	const translitMap: Record<string, string> = {
		а: 'a',
		б: 'b',
		в: 'v',
		г: 'g',
		д: 'd',
		е: 'e',
		ж: 'zh',
		з: 'z',
		и: 'i',
		й: 'y',
		к: 'k',
		л: 'l',
		м: 'm',
		н: 'n',
		о: 'o',
		п: 'p',
		р: 'r',
		с: 's',
		т: 't',
		у: 'u',
		ф: 'f',
		х: 'kh',
		ц: 'ts',
		ч: 'ch',
		ш: 'sh',
		щ: 'shch',
		ь: '',
		ю: 'yu',
		я: 'ya',
		// Ukrainian specific
		є: 'ye',
		і: 'i',
		ї: 'yi',
		ґ: 'g',
		// Uppercase
		А: 'a',
		Б: 'b',
		В: 'v',
		Г: 'g',
		Д: 'd',
		Е: 'e',
		Ё: 'yo',
		Ж: 'zh',
		З: 'z',
		И: 'i',
		Й: 'y',
		К: 'k',
		Л: 'l',
		М: 'm',
		Н: 'n',
		О: 'o',
		П: 'p',
		Р: 'r',
		С: 's',
		Т: 't',
		У: 'u',
		Ф: 'f',
		Х: 'kh',
		Ц: 'ts',
		Ч: 'ch',
		Ш: 'sh',
		Щ: 'shch',
		Ь: '',
		Ю: 'yu',
		Я: 'ya',
		Є: 'ye',
		І: 'i',
		Ї: 'yi',
		Ґ: 'g'
	};

	return name
		.split('')
		.map((char) => translitMap[char] || char)
		.join('')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };
