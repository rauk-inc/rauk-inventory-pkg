import type { InventoryItem } from "./item";
import type { InventoryItemFieldValues, DotNotationPaths } from "./parser";

export type OperationUpdateItem = {
	[K in DotNotationPaths<InventoryItem>]?: InventoryItemFieldValues[K];
} & {
	entities?: never;
	locationHistory?: never;
	id?: never;
	$set?: {
		[K in DotNotationPaths<InventoryItem>]: K extends keyof InventoryItem
			? InventoryItemFieldValues[K]
			: K extends `${infer P}.${infer Q}`
				? P extends keyof InventoryItem
					? Q extends keyof InventoryItem[P]
						? InventoryItem[P][Q]
						: never
					: never
				: never;
	};
};
