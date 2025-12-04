import { RaukInventoryClient } from "../src/index";
import type {
	OperationCreateItem,
	OperationQuery,
	OperationUpdateItem,
} from "../src/types/operations";

describe("RaukInventoryClient", () => {
	const config = {
		apiKeyId: "123456789012345678901234", // 24 characters
		apiSecret:
			"1234567890123456789012345678901234567890123456789012345678901234", // 64 characters
		apiPublicKey: "12345678901234567890123456789012", // 32 characters
		apiBaseUrl: "https://inventory.rauk.local",
	};

	beforeEach(() => {
		jest.spyOn(global, "fetch").mockResolvedValue({
			ok: true,
			json: async () => ({ data: { sku: "ITEM-002", qty: 5 } }),
		} as Response);
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it("should create an item", async () => {
		const client = new RaukInventoryClient(config);
		const item: OperationCreateItem = {
			entities: { factoryId: "789", brandId: "101" },
			sku: "ITEM-002",
			transitTo: { id: "warehouse-2" },
			qty: 5,
			color: { name: "Blue", id: "101" },
			currLoc: { id: "warehouse-2" },
			brandDetails: { id: "101", name: "Brand 1", type: "Brand" },
			factoryDetails: { id: "789", type: "Factory" },
		};
		const result = await client.create(item);
		expect(result).toEqual({ sku: "ITEM-002", qty: 5 });
	});

	describe("TypeScript type checking for nested properties", () => {
		it("should accept nested properties in find queries", async () => {
			const client = new RaukInventoryClient(config);
			const query: OperationQuery = {
				"availability.produced.orderId": "order-123",
				"availability.reserved.temporary": true,
				"color.name": "Blue",
				"entities.factoryId": "factory-123",
				"currLoc.id": "warehouse-1",
			};

			jest.spyOn(global, "fetch").mockResolvedValue({
				ok: true,
				json: async () => ({ data: [] }),
			} as Response);

			await client.find(query);
			expect(fetch).toHaveBeenCalled();
		});

		it("should accept nested properties with operators in find queries", async () => {
			const client = new RaukInventoryClient(config);
			const query: OperationQuery = {
				"availability.produced.orderId": { $ne: null },
				"availability.reserved.expiration": {
					$gte: new Date("2025-01-01"),
				},
				"color.name": { $regex: "Blue", $options: "i" },
				"entities.brandId": { $in: ["brand-1", "brand-2"] },
			};

			jest.spyOn(global, "fetch").mockResolvedValue({
				ok: true,
				json: async () => ({ data: [] }),
			} as Response);

			await client.find(query);
			expect(fetch).toHaveBeenCalled();
		});

		it("should accept nested properties in findOne queries", async () => {
			const client = new RaukInventoryClient(config);
			const query: OperationQuery = {
				"availability.reserved.temporary": true,
				"color.id": "color-123",
				"brandDetails.type": "Brand",
			};

			jest.spyOn(global, "fetch").mockResolvedValue({
				ok: true,
				json: async () => ({ data: [] }),
			} as Response);

			await client.findOne(query);
			expect(fetch).toHaveBeenCalled();
		});

		it("should accept nested properties in update operations", async () => {
			const client = new RaukInventoryClient(config);
			const query: OperationQuery = { sku: "ITEM-001" };
			const update: OperationUpdateItem = {
				"availability.reserved.temporary": false,
				"availability.reserved.expiration": new Date("2025-01-25"),
				"color.name": "Traffic Red",
				"currLoc.id": "warehouse-2",
				"brandDetails.name": "Updated Brand",
			};

			jest.spyOn(global, "fetch").mockResolvedValue({
				ok: true,
				json: async () => ({
					data: { matchedCount: 1, modifiedCount: 1 },
				}),
			} as Response);

			await client.update(query, update);
			expect(fetch).toHaveBeenCalled();
		});

		it("should accept nested properties in updateMany operations", async () => {
			const client = new RaukInventoryClient(config);
			const query: OperationQuery = {
				"entities.factoryId": "factory-123",
			};
			const update: OperationUpdateItem = {
				"availability.produced.orderId": "order-456",
				"availability.produced.date": new Date("2025-01-01"),
				"currLoc.name": "Updated Warehouse",
				"factoryDetails.name": "Updated Factory",
			};

			jest.spyOn(global, "fetch").mockResolvedValue({
				ok: true,
				json: async () => ({
					data: { matchedCount: 5, modifiedCount: 5 },
				}),
			} as Response);

			await client.updateMany(query, update);
			expect(fetch).toHaveBeenCalled();
		});

		it("should accept nested properties in bulkWrite operations", async () => {
			const client = new RaukInventoryClient(config);
			const operations = [
				{
					updateOne: {
						filter: {
							"availability.reserved.temporary": true,
							"color.name": "Red",
						} as OperationQuery,
						update: {
							"availability.reserved.expiration": new Date("2025-01-25"),
							"currLoc.id": "warehouse-3",
						} as OperationUpdateItem,
					},
				},
				{
					updateOne: {
						filter: {
							"entities.brandId": "brand-123",
							"brandDetails.type": "Brand",
						} as OperationQuery,
						update: {
							"brandDetails.name": "New Brand Name",
							"color.id": "color-456",
						} as OperationUpdateItem,
					},
				},
			];

			jest.spyOn(global, "fetch").mockResolvedValue({
				ok: true,
				json: async () => ({
					data: { matchedCount: 2, modifiedCount: 2 },
				}),
			} as Response);

			await client.bulkWrite(operations);
			expect(fetch).toHaveBeenCalled();
		});

		it("should accept nested properties in updateBatch operations", async () => {
			const client = new RaukInventoryClient(config);
			const updates: [OperationQuery, OperationUpdateItem][] = [
				[
					{ "availability.reserved.temporary": true },
					{
						"availability.reserved.expiration": new Date("2025-01-25"),
						"currLoc.id": "warehouse-1",
					},
				],
				[
					{ "color.name": "Red" },
					{
						"color.id": "color-123",
						"brandDetails.name": "Brand Name",
					},
				],
			];

			jest.spyOn(global, "fetch").mockResolvedValue({
				ok: true,
				json: async () => ({
					data: { matchedCount: 2, modifiedCount: 2 },
				}),
			} as Response);

			await client.updateBatch(updates);
			expect(fetch).toHaveBeenCalled();
		});

		it("should accept nested properties in aggregate match stage", async () => {
			const client = new RaukInventoryClient(config);
			const pipeline = [
				{
					$match: {
						"availability.produced.orderId": { $ne: null },
						"availability.reserved.temporary": true,
						"color.name": "Traffic Red",
						"entities.factoryId": "factory-123",
					} as OperationQuery,
				},
				{
					$group: {
						_id: "$color.name",
						count: { $sum: 1 },
					},
				},
			];

			jest.spyOn(global, "fetch").mockResolvedValue({
				ok: true,
				json: async () => ({ data: [] }),
			} as Response);

			await client.aggregate(pipeline);
			expect(fetch).toHaveBeenCalled();
		});

		it("should accept nested properties in delete queries", async () => {
			const client = new RaukInventoryClient(config);
			const query: OperationQuery = {
				"entities.factoryId": "factory-123",
				"color.name": "Red",
				"availability.sold.orderId": { $ne: null },
			};

			jest.spyOn(global, "fetch").mockResolvedValue({
				ok: true,
				json: async () => ({
					data: { matchedCount: 1, modifiedCount: 1 },
				}),
			} as Response);

			await client.delete(query);
			expect(fetch).toHaveBeenCalled();
		});

		it("should accept nested properties in deleteOne queries", async () => {
			const client = new RaukInventoryClient(config);
			const query: OperationQuery = {
				"availability.reserved.temporary": true,
				"color.id": "color-123",
			};

			jest.spyOn(global, "fetch").mockResolvedValue({
				ok: true,
				json: async () => ({ data: { deletedCount: 1 } }),
			} as Response);

			await client.deleteOne(query);
			expect(fetch).toHaveBeenCalled();
		});

		it("should accept nested properties in deleteMany queries", async () => {
			const client = new RaukInventoryClient(config);
			const query: OperationQuery = {
				"entities.brandId": "brand-123",
				"brandDetails.type": "Brand",
			};

			jest.spyOn(global, "fetch").mockResolvedValue({
				ok: true,
				json: async () => ({ data: { deletedCount: 5 } }),
			} as Response);

			await client.deleteMany(query);
			expect(fetch).toHaveBeenCalled();
		});

		it("should accept deeply nested availability properties", async () => {
			const client = new RaukInventoryClient(config);
			const query: OperationQuery = {
				"availability.produced.orderId": "order-123",
				"availability.produced.date": new Date("2025-01-01"),
				"availability.reserved.temporary": true,
				"availability.reserved.expiration": new Date("2025-01-25"),
				"availability.reserved.orderId": "res-order-456",
				"availability.reserved.date": new Date("2025-01-20"),
				"availability.sold.orderId": "sold-order-789",
				"availability.sold.date": new Date("2025-01-15"),
			};

			jest.spyOn(global, "fetch").mockResolvedValue({
				ok: true,
				json: async () => ({ data: [] }),
			} as Response);

			await client.find(query);
			expect(fetch).toHaveBeenCalled();
		});

		it("should accept nested properties with $or operator", async () => {
			const client = new RaukInventoryClient(config);
			const query: OperationQuery = {
				$or: [
					{
						"availability.reserved.temporary": true,
						"color.name": "Red",
					},
					{
						"availability.produced.orderId": { $ne: null },
						"entities.factoryId": "factory-123",
					},
				],
			};

			jest.spyOn(global, "fetch").mockResolvedValue({
				ok: true,
				json: async () => ({ data: [] }),
			} as Response);

			await client.find(query);
			expect(fetch).toHaveBeenCalled();
		});

		it("should accept nested properties with $and operator", async () => {
			const client = new RaukInventoryClient(config);
			const query: OperationQuery = {
				$and: [
					{
						"availability.reserved.temporary": true,
					},
					{
						"color.name": "Red",
						"entities.brandId": "brand-123",
					},
				],
			};

			jest.spyOn(global, "fetch").mockResolvedValue({
				ok: true,
				json: async () => ({ data: [] }),
			} as Response);

			await client.find(query);
			expect(fetch).toHaveBeenCalled();
		});
	});
});
