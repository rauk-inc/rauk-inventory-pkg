// Base types with ObjectId replaced by string
import type { OperationQuery } from "./query";
import type { OperationUpdateItem } from "./update";
// Color types

export interface OperationColor {
	id?: string;
	name?: string;
}

// Deleted types
export interface OperationDeleted {
	status: boolean;
	deletionDate?: string;
}

// Location History Entry types
export interface OperationLocationHistoryEntry {
	id: string;
	name: string;
	date: string;
}

// Status Details types
export interface OperationStatusDetails {
	orderId?: string;
	date?: string;
	temporary?: boolean;
	expiration?: string;
}

type OperationAvailabilityMap<T> = {
	produced?: T;
	reserved?: T;
	sold?: T;
	[status: string]: T | undefined;
};

// Entities types
export interface OperationEntities {
	readonly apiId?: string;
	readonly entityId?: string;
	readonly factoryId?: string;
	readonly brandId?: string;
}

// Location types
export interface OperationLocation {
	id?: string;
	name?: string;
	details?: Record<string, any>;
}

// Transit To types
export interface OperationTransitTo {
	id?: string;
	client?: string;
}

// Brand Details types
export interface OperationBrandDetails {
	id?: string;
	name?: string;
	type?: string;
	subType?: string;
}

// Factory Details types
export interface OperationFactoryDetails {
	id?: string;
	name?: string;
	type?: string;
	subType?: string;
}

// Availability types
export type OperationAvailability =
	OperationAvailabilityMap<OperationStatusDetails>;

// Base Item types (for create/update operations)
export interface OperationBaseItem {
	hardcode?: string;
	entities?: OperationEntities;
	currentLocation?: OperationLocation;
	transitTo?: OperationTransitTo;
	availability?: OperationAvailability;
	sku?: string;
	packageQuantity?: number;
	color?: OperationColor;
	brandDetails?: OperationBrandDetails;
	factoryDetails?: OperationFactoryDetails;
	deleted?: OperationDeleted;
	locationHistory?: OperationLocationHistoryEntry[];
}

// Create operation types
export interface OperationCreateItem extends OperationBaseItem {
	currentLocation: OperationLocation;
	entities: OperationEntities & {
		factoryId: string;
		brandId: string;
	};
	sku: string;
	packageQuantity: number;
	color: OperationColor & {
		id: string;
	};
	brandDetails: OperationBrandDetails & {
		type: string;
		id: string;
	};
	factoryDetails: OperationFactoryDetails & {
		type: string;
		id: string;
	};
}

// Update operation types

// Query operation types (for filtering)
export interface OperationQueryColor {
	name?: string | Record<string, any>;
	id?: string | Record<string, any>;
}

export interface OperationQueryDeleted {
	status?: boolean | Record<string, any>;
	deletionDate?: string | Record<string, any>;
}

export interface OperationQueryEntities {
	apiId?: string | Record<string, any>;
	entityId?: string | Record<string, any>;
	factoryId?: string | Record<string, any>;
	brandId?: string | Record<string, any>;
}

export interface OperationQueryLocation {
	id?: string | Record<string, any>;
	name?: string | Record<string, any>;
	details?: Record<string, any> | Record<string, any>;
}

export interface OperationQueryTransitTo {
	id?: string | Record<string, any>;
	client?: string | Record<string, any>;
}

export interface OperationQueryBrandDetails {
	id?: string | Record<string, any>;
	name?: string | Record<string, any>;
	type?: string | Record<string, any>;
	subType?: string | Record<string, any>;
}

export interface OperationQueryFactoryDetails {
	id?: string | Record<string, any>;
	name?: string | Record<string, any>;
	type?: string | Record<string, any>;
	subType?: string | Record<string, any>;
}

export interface OperationQueryStatusDetails {
	orderId?: string | Record<string, any>;
	date?: string | Record<string, any>;
	temporary?: boolean | Record<string, any>;
	expiration?: string | Record<string, any>;
}

export type OperationQueryAvailability =
	OperationAvailabilityMap<OperationQueryStatusDetails>;

// Bulk Write operation types
export interface OperationUpdateOne {
	filter: OperationQuery;
	update: OperationUpdateItem; // MongoDB update operators like $set, $inc, etc.
}

export interface OperationInsertOne {
	document: OperationCreateItem;
}

export interface OperationDeleteOne {
	filter: OperationQuery;
}

export interface OperationReplaceOne {
	filter: OperationQuery;
	replacement: OperationCreateItem;
}

// Union type for all possible bulk operations
export type OperationBulkOperation =
	| { updateOne: OperationUpdateOne }
	| { insertOne: OperationInsertOne }
	| { deleteOne: OperationDeleteOne }
	| { replaceOne: OperationReplaceOne };

// The bulk write array
export type OperationBulkWrite = OperationBulkOperation[];

// Aggregate operation types
export type OperationAggregatePipeline = OperationAggregateStage[];

// Match stage
export interface OperationMatchStage {
	$match: OperationQuery;
}

// Group stage
export interface OperationGroupStage {
	$group: {
		_id?: string | { [key: string]: any };
		[key: string]: any;
	};
}

// Sort stage
export interface OperationSortStage {
	$sort: { [key: string]: 1 | -1 };
}

// Project stage
export interface OperationProjectStage {
	$project: { [key: string]: 0 | 1 | string | { [key: string]: any } };
}

// Limit stage
export interface OperationLimitStage {
	$limit: number;
}

// Skip stage
export interface OperationSkipStage {
	$skip: number;
}

// Unwind stage
export interface OperationUnwindStage {
	$unwind:
		| string
		| {
				path: string;
				includeArrayIndex?: string;
				preserveNullAndEmptyArrays?: boolean;
		  };
}

// AddFields stage
export interface OperationAddFieldsStage {
	$addFields: { [key: string]: any };
}

// Count stage
export interface OperationCountStage {
	$count: string;
}

// Union of all aggregate stages
export type OperationAggregateStage =
	| OperationMatchStage
	| OperationGroupStage
	| OperationSortStage
	| OperationProjectStage
	| OperationLimitStage
	| OperationSkipStage
	| OperationUnwindStage
	| OperationAddFieldsStage
	| OperationCountStage;

// Request Options types
export interface OperationRequestOptions {
	select?: Record<string, 0 | 1>;
	limit?: number;
	sort?: Record<string, 1 | -1>;
	includeDeleted?: boolean;
}

export interface OperationIncludeDeletedOnly {
	includeDeleted?: boolean;
}

// Response types
export interface OperationDeleteResult {
	deletedCount: number;
}

export interface OperationUpdateResult {
	matchedCount: number;
	modifiedCount: number;
	acknowledged: boolean;
}

export interface OperationInsertResult {
	acknowledged: boolean;
	insertedId: string;
}
export type { OperationQuery } from "./query";
export type { OperationUpdateItem } from "./update";
// Export all operation types
export type OperationTypes = {
	CreateItem: OperationCreateItem;
	UpdateItem: OperationUpdateItem;
	QueryItem: OperationQuery;
	QueryDto: OperationQuery;
	BulkWrite: OperationBulkWrite;
	BulkOperation: OperationBulkOperation;
	UpdateOne: OperationUpdateOne;
	InsertOne: OperationInsertOne;
	DeleteOne: OperationDeleteOne;
	ReplaceOne: OperationReplaceOne;
	AggregateStage: OperationAggregateStage;
	AggregatePipeline: OperationAggregateStage[];
	RequestOptions: OperationRequestOptions;
	IncludeDeletedOnly: OperationIncludeDeletedOnly;
	DeleteResult: OperationDeleteResult;
	UpdateResult: OperationUpdateResult;
	InsertResult: OperationInsertResult;
};
