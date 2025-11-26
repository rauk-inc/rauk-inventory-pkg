import type {
	OperationCreateItem,
	OperationQuery,
	OperationBulkWrite,
	OperationAggregatePipeline,
	OperationRequestOptions,
	OperationDeleteResult,
	OperationUpdateResult,
	OperationUpdateItem,
} from "./types/operations";
import type { InventoryItem } from "./types/item";
import { RaukInventoryClient } from "./core/rauk-client";
import {
	RaukError,
	RaukValidationError,
	RaukAuthenticationError,
	RaukNetworkError,
	RaukApiError,
	ValidationErrorDetail,
	RaukApiErrorResponse,
	RaukErrorOptions,
	isRaukError,
	isValidationError,
	isAuthenticationError,
	isNetworkError,
} from "./utils/errors";

export class RaukInventory extends RaukInventoryClient {
	private static instance: RaukInventory | null = null;

	/**
	 * Constructor for RaukInventory
	 * @param config - Configuration object
	 * @param config.apiKeyId - API key ID
	 * @param config.apiSecret - API secret
	 * @param config.apiPublicKey - API public key
	 * @param config.apiBaseUrl - API base URL optional, will default to the standard Rauk Inventory API endpoint
	 */
	constructor(config: {
		apiKeyId: string;
		apiSecret: string;
		apiPublicKey: string;
		apiBaseUrl?: string;
	}) {
		super(config); // Pass config to RaukInventoryClient
		if (RaukInventory.instance) {
			throw new Error(
				"RaukInventory is already initialized. Use the existing instance.",
			);
		}
		RaukInventory.instance = this;
	}

	public static setConfig(config: {
		apiKeyId: string;
		apiSecret: string;
		apiPublicKey: string;
		apiBaseUrl?: string;
	}) {
		if (!RaukInventory.instance) {
			throw new Error(
				'RaukInventory must be initialized with "new RaukInventory(config)" before calling static methods.',
			);
		}
		RaukInventory.instance.setConfig(config);
	}
	/**
	 * Create a new inventory item
	 * @example
	 * // Basic item creation
	 * const newItem = await raukInventory.create({
	 *   entities: {
	 *     apiId: "item-api-123",
	 *     entityId: "item-entity-456",
	 *     factoryId: "factory-789",
	 *     brandId: "brand-101"
	 *   },
	 *   sku: "ITEM-001",
	 *   packageQuantity: 10,
	 *   color: { name: "Red" },
	 *   currentLocation: { id: "warehouse-1" }
	 * });
	 *
	 * // With options
	 * const newItemWithOptions = await raukInventory.create({
	 *   entities: { apiId: "123", entityId: "456", factoryId: "789", brandId: "101" },
	 *   sku: "ITEM-002",
	 *   packageQuantity: 5,
	 *   color: { name: "Blue" },
	 *   currentLocation: { id: "warehouse-2" }
	 * }, {
	 *   select: { sku: 1, color: 1 }
	 * });
	 */
	public static async create(
		item: OperationCreateItem,
		options?: OperationRequestOptions,
	): Promise<InventoryItem> {
		if (!RaukInventory.instance) {
			throw new Error(
				'RaukInventory must be initialized with "new RaukInventory(config)" before calling static methods.',
			);
		}
		return RaukInventory.instance.create(item, options);
	}

	/**
	 * Find multiple inventory items
	 * @example
	 * // Find items by SKU
	 * const items = await raukInventory.find({
	 *   sku: "ITEM-001"
	 * });
	 *
	 * // Find items with structured query
	 * const items = await raukInventory.find({
	 *   entities: { factoryId: "factory-789" },
	 *   packageQuantity: { $gte: 10 }
	 * }, {
	 *   limit: 20,
	 *   sort: { createdAt: -1 },
	 *   select: { sku: 1, packageQuantity: 1, color: 1 }
	 * });
	 */
	public static async find(
		query: OperationQuery,
		options?: OperationRequestOptions,
	): Promise<InventoryItem[]> {
		if (!RaukInventory.instance) {
			throw new Error(
				'RaukInventory must be initialized with "new RaukInventory(config)" before calling static methods.',
			);
		}
		return RaukInventory.instance.find(query, options);
	}

	/**
	 * Find a single inventory item
	 * @example
	 * // Find one item by SKU
	 * const item = await raukInventory.findOne({
	 *   sku: "ITEM-001"
	 * });
	 *
	 * // Find one item with options
	 * const item = await raukInventory.findOne({
	 *   entities: { factoryId: "factory-789" }
	 * }, {
	 *   select: { sku: 1, color: 1, packageQuantity: 1 }
	 * });
	 */
	public static async findOne(
		query: OperationQuery,
		options?: OperationRequestOptions,
	): Promise<InventoryItem | null> {
		if (!RaukInventory.instance) {
			throw new Error(
				'RaukInventory must be initialized with "new RaukInventory(config)" before calling static methods.',
			);
		}
		return RaukInventory.instance.findOne(query, options);
	}
	/**
	 * Update inventory items
	 * @example
	 * // Update one item by SKU
	 * const result = await raukInventory.update(
	 *   { sku: "ITEM-001" },
	 *   { packageQuantity: 20, currentLocation: { id: "warehouse-2" } }
	 * );
	 *
	 * // Update with options
	 * const result = await raukInventory.update(
	 *   { entities: { factoryId: "factory-789" } },
	 *   { { color: { name: "Blue" } } },
	 *   { select: { sku: 1, color: 1 } }
	 * );
	 */
	public static async update(
		query: OperationQuery,
		update: OperationUpdateItem,
		options?: OperationRequestOptions,
	): Promise<InventoryItem> {
		if (!RaukInventory.instance) {
			throw new Error(
				'RaukInventory must be initialized with "new RaukInventory(config)" before calling static methods.',
			);
		}
		return RaukInventory.instance.update(query, update, options);
	}

	/**
	 * Delete inventory items (marks as deleted, doesn't remove)
	 * @example
	 * // Mark items as deleted by SKU
	 * const result = await raukInventory.delete({
	 *   sku: "ITEM-001"
	 * });
	 *
	 * // Mark multiple items as deleted
	 * const result = await raukInventory.delete({
	 *   entities: { factoryId: "factory-789" }
	 * }, {
	 *   select: { sku: 1, deleted: 1 }
	 * });
	 */
	public static async delete(
		query: OperationQuery,
		options?: OperationRequestOptions,
	): Promise<OperationDeleteResult> {
		if (!RaukInventory.instance) {
			throw new Error(
				'RaukInventory must be initialized with "new RaukInventory(config)" before calling static methods.',
			);
		}
		return RaukInventory.instance.delete(query, options);
	}

	/**
	 * Perform aggregation operations
	 * @example
	 * await raukInventory.aggregate([
	 *   { $match: { "entities.factoryId": "factory-123" } },
	 *   { $group: { _id: "$sku", count: { $sum: 1 } } },
	 *   { $sort: { count: -1 } }
	 * ]);
	 */
	public static async aggregate(
		pipeline: OperationAggregatePipeline,
		options?: OperationRequestOptions,
	): Promise<any[]> {
		if (!RaukInventory.instance) {
			throw new Error(
				'RaukInventory must be initialized with "new RaukInventory(config)" before calling static methods.',
			);
		}
		return RaukInventory.instance.aggregate(pipeline, options);
	}

	/**
	 * Bulk write operations
	 * @example
	 * // Multiple update operations
	 * const operations = [
	 *   {
	 *     updateOne: {
	 *       filter: { sku: "ITEM-001" },
	 *       update: { packageQuantity: 20 }
	 *     }
	 *   },
	 *   {
	 *     updateOne: {
	 *       filter: { sku: "ITEM-002" },
	 *       update: { currentLocation: { id: "warehouse-2" } }
	 *     }
	 *   }
	 * ];
	 * const result = await raukInventory.bulkWrite(operations, {
	 *   includeDeleted: false
	 * });
	 */
	public static async bulkWrite(
		operations: OperationBulkWrite,
		options?: OperationRequestOptions,
	): Promise<any> {
		if (!RaukInventory.instance) {
			throw new Error(
				'RaukInventory must be initialized with "new RaukInventory(config)" before calling static methods.',
			);
		}
		return RaukInventory.instance.bulkWrite(operations, options);
	}

	/**
	 * Update multiple inventory items
	 * @example
	 * // Update all items from a specific factory
	 * const result = await raukInventory.updateMany(
	 *   { "entities.factoryId": "factory-789" },
	 *   { "currentLocation.id": "warehouse-2" }
	 * );
	 *
	 * // Update with options
	 * const result = await raukInventory.updateMany(
	 *   { packageQuantity: { $lte: 10 } },
	 *   { packageQuantity: 20 },
	 *   { select: { sku: 1, packageQuantity: 1 } }
	 * );
	 */
	public static async updateMany(
		query: OperationQuery,
		update: OperationUpdateItem,
		options?: OperationRequestOptions,
	): Promise<OperationUpdateResult> {
		if (!RaukInventory.instance) {
			throw new Error(
				'RaukInventory must be initialized with "new RaukInventory(config)" before calling static methods.',
			);
		}
		return RaukInventory.instance.updateMany(query, update, options);
	}

	/**
	 * Delete a single inventory item
	 * @example
	 * // Delete one item by SKU
	 * const result = await raukInventory.deleteOne({
	 *   sku: "ITEM-001"
	 * });
	 *
	 * // Delete with options
	 * const result = await raukInventory.deleteOne({
	 *   entities: { factoryId: "factory-789" }
	 * }, {
	 *   select: { sku: 1 }
	 * });
	 */
	public static async deleteOne(
		query: OperationQuery,
		options?: OperationRequestOptions,
	): Promise<OperationDeleteResult> {
		if (!RaukInventory.instance) {
			throw new Error(
				'RaukInventory must be initialized with "new RaukInventory(config)" before calling static methods.',
			);
		}
		return RaukInventory.instance.deleteOne(query, options);
	}

	/**
	 * Delete multiple inventory items
	 * @example
	 * // Delete all items from a factory
	 * const result = await raukInventory.deleteMany({
	 *   entities: { factoryId: "factory-789" }
	 * });
	 *
	 * // Delete with options
	 * const result = await raukInventory.deleteMany({
	 *   packageQuantity: { $lte: 5 }
	 * }, {
	 *   select: { sku: 1, packageQuantity: 1 }
	 * });
	 */
	public static async deleteMany(
		query: OperationQuery,
		options?: OperationRequestOptions,
	): Promise<OperationDeleteResult> {
		if (!RaukInventory.instance) {
			throw new Error(
				'RaukInventory must be initialized with "new RaukInventory(config)" before calling static methods.',
			);
		}
		return RaukInventory.instance.deleteMany(query, options);
	}

	/**
	 * Batch update multiple items with a simplified interface
	 * This is a wrapper around the bulkWrite method
	 * @example
	 * // Update multiple items in batch
	 * const batchUpdates = [
	 *   [{ sku: "ITEM-001" }, { packageQuantity: 20 } ],
	 *   [{ sku: "ITEM-002" }, { currentLocation: { id: "warehouse-2" } } ],
	 *   [{ entities: { factoryId: "factory-789" } }, { color: { name: "Blue" } } ]
	 * ];
	 * const result = await raukInventory.updateBatch(batchUpdates);
	 */
	public static async updateBatch(
		updates: [OperationQuery, OperationUpdateItem][],
		options?: OperationRequestOptions,
	): Promise<any> {
		if (!RaukInventory.instance) {
			throw new Error(
				'RaukInventory must be initialized with "new RaukInventory(config)" before calling static methods.',
			);
		}
		return RaukInventory.instance.updateBatch(updates, options);
	}
}

export default RaukInventory;
export * from "./types/operations";
export * from "./types/item";
export { RaukInventoryClient };

// Export error handling utilities
export {
	RaukError,
	RaukValidationError,
	RaukAuthenticationError,
	RaukNetworkError,
	RaukApiError,
	ValidationErrorDetail,
	RaukApiErrorResponse,
	RaukErrorOptions,
	isRaukError,
	isValidationError,
	isAuthenticationError,
	isNetworkError,
};
