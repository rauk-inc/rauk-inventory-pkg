import type { QueryInventoryItem } from "./item";
import type { DotNotationPaths, QueryInventoryItemFieldValues } from "./parser";

type NullableValue<T> = T | null;
type ComparableValue<T> = T extends number | string | Date ? T : never;

// MongoDB operator types
interface MongoOperator<T> {
	$eq?: NullableValue<T>;
	$ne?: NullableValue<T>;
	$gt?: ComparableValue<T>;
	$gte?: ComparableValue<T>;
	$lt?: ComparableValue<T>;
	$lte?: ComparableValue<T>;
	$in?: Array<NullableValue<T>>;
	$nin?: Array<NullableValue<T>>;
	$exists?: boolean;
	$regex?: string;
	$options?: string;
	$elemMatch?: Record<string, unknown>;
	$size?: number;
	$type?: string | number;
	$mod?: [number, number];
	$text?: {
		$search: string;
		$language?: string;
		$caseSensitive?: boolean;
		$diacriticSensitive?: boolean;
	};
	$expr?: Record<string, unknown>;
	// Add other operators as needed
}

// Flexible query type supporting dot notation and operators
export type OperationQuery = {
	[K in DotNotationPaths<QueryInventoryItem>]?:
		| QueryInventoryItemFieldValues[K]
		| MongoOperator<QueryInventoryItemFieldValues[K]>;
} & {
	$or?: OperationQuery[];
	$and?: OperationQuery[];
	$nor?: OperationQuery[];
	$not?: OperationQuery;
};
