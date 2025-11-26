import type { InventoryItem, UpdateInventoryItem } from "./item";
import type {
	InventoryItemFieldValues,
	DotNotationPaths,
	UpdateInventoryItemFieldValues,
} from "./parser";

export type OperationUpdateItem = {
	[K in DotNotationPaths<UpdateInventoryItem>]?: UpdateInventoryItemFieldValues[K];
} & {
	entities?: never;
	locationHistory?: never;
	id?: never;
};
