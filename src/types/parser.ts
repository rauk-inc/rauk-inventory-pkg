import type { InventoryItem, QueryInventoryItem } from "./item";

export type DotNotationPaths<T, Prefix extends string = ""> = T extends object
	? {
			[K in keyof T & string]: T[K] extends object
				? `${Prefix}${K}` | DotNotationPaths<T[K], `${Prefix}${K}.`>
				: `${Prefix}${K}`;
		}[keyof T & string]
	: never;

// Map InventoryItem fields to their types
export type InventoryItemFieldValues = {
	[K in DotNotationPaths<InventoryItem>]: K extends keyof InventoryItem
		? InventoryItem[K]
		: K extends `${infer P}.${infer Q}`
			? P extends keyof InventoryItem
				? Q extends keyof InventoryItem[P]
					? InventoryItem[P][Q]
					: never
				: never
			: never;
};

export type QueryInventoryItemFieldValues = {
	[K in DotNotationPaths<QueryInventoryItem>]: K extends keyof QueryInventoryItem
		? QueryInventoryItem[K]
		: K extends `${infer P}.${infer Q}`
			? P extends keyof QueryInventoryItem
				? Q extends keyof QueryInventoryItem[P]
					? QueryInventoryItem[P][Q]
					: never
				: never
			: never;
};
