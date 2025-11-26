import { RaukInventory, RaukInventoryClient } from "../src/index";
import type {
	OperationCreateItem,
	OperationQuery,
	OperationUpdateItem,
} from "../src/types/operations";
import {
	RaukValidationError,
	RaukAuthenticationError,
	RaukNetworkError,
	isValidationError,
	isAuthenticationError,
	isNetworkError,
} from "../src/utils/errors";

describe("RaukInventory", () => {
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
			json: async () => ({ data: [{ sku: "ITEM-001", packageQuantity: 10 }] }),
		} as Response);
	});

	afterEach(() => {
		jest.restoreAllMocks();
		// Reset singleton for clean tests
		(
			RaukInventory as unknown as {
				instance: RaukInventory | null;
			}
		).instance = null;
	});

	it("should throw if config is incomplete", () => {
		expect(
			() =>
				new RaukInventory({ apiKeyId: "", apiSecret: "", apiPublicKey: "" }),
		).toThrow("apiKeyId, apiSecret and apiPublicKey are required");
	});

	it("should throw if instantiated twice", () => {
		new RaukInventory(config);
		expect(() => new RaukInventory(config)).toThrow(
			"RaukInventory is already initialized",
		);
	});

	it("should find items via instance method", async () => {
		const client = new RaukInventory(config);
		const query = { "color.name": "ITEM-001" };
		const items = await client.find(query);
		expect(items).toEqual([{ sku: "ITEM-001", packageQuantity: 10 }]);
		expect(fetch).toHaveBeenCalledWith(
			`${config.apiBaseUrl}/query`,
			expect.objectContaining({
				method: "POST",
				body: JSON.stringify(["find", query]),
			}),
		);
	});

	it("should find items via static method", async () => {
		new RaukInventory(config);
		const query = { sku: "ITEM-001" };
		const items = await RaukInventory.find(query);
		expect(items).toEqual([{ sku: "ITEM-001", packageQuantity: 10 }]);
		expect(fetch).toHaveBeenCalledWith(
			`${config.apiBaseUrl}/query`,
			expect.objectContaining({
				method: "POST",
				body: JSON.stringify(["find", query]),
			}),
		);
	});

	it("should throw on static method without initialization", async () => {
		await expect(RaukInventory.find({ sku: "ITEM-001" })).rejects.toThrow(
			'RaukInventory must be initialized with "new RaukInventory(config)" before calling static methods.',
		);
	});

	it("should updateBatch via static method", async () => {
		new RaukInventory(config);
		const updates: [OperationQuery, OperationUpdateItem][] = [
			[{ id: "68e7f70f8d21cb8e86067aff" }, { "color.name": "Traffic Red" }],
		];
		jest.spyOn(global, "fetch").mockResolvedValue({
			ok: true,
			json: async () => ({ data: { ok: true } }),
		} as Response);
		const result = await RaukInventory.updateBatch(updates);
		expect(result).toEqual({ ok: true });
	});

	it("should update via static method", async () => {
		new RaukInventory(config);
		const query = { sku: "ITEM-001" };
		const update = { "color.name": "Traffic Red" };
		jest.spyOn(global, "fetch").mockResolvedValue({
			ok: true,
			json: async () => ({
				data: {
					sku: "ITEM-001",
					"color.name": "Traffic Red",
					packageQuantity: 10,
				},
			}),
		} as Response);
		const result = await RaukInventory.update(query, update);
		expect(result).toEqual({
			sku: "ITEM-001",
			"color.name": "Traffic Red",
			packageQuantity: 10,
		});
		expect(fetch).toHaveBeenCalledWith(
			`${config.apiBaseUrl}/query`,
			expect.objectContaining({
				method: "POST",
				body: JSON.stringify(["findOneAndUpdate", query, update]),
			}),
		);
	});

	it("should updateMany via static method", async () => {
		new RaukInventory(config);
		const query = { "entities.factoryId": "factory-789" };
		const update = { "currentLocation.id": "warehouse-2" };
		const updateResult = {
			matchedCount: 5,
			modifiedCount: 5,
		};
		jest.spyOn(global, "fetch").mockResolvedValue({
			ok: true,
			json: async () => ({ data: updateResult }),
		} as Response);
		const result = await RaukInventory.updateMany(query, update);
		expect(result).toEqual(updateResult);
		expect(fetch).toHaveBeenCalledWith(
			`${config.apiBaseUrl}/query`,
			expect.objectContaining({
				method: "POST",
				body: JSON.stringify(["updateMany", query, update]),
			}),
		);
	});

	it("should create via static method", async () => {
		new RaukInventory(config);
		const item: OperationCreateItem = {
			entities: { factoryId: "789", brandId: "101" },
			sku: "ITEM-003",
			packageQuantity: 15,
			color: { name: "Green", id: "102" },
			currentLocation: { id: "warehouse-3" },
			brandDetails: { id: "101", name: "Brand 1", type: "Brand" },
			factoryDetails: { id: "789", type: "Factory" },
		};
		const createdItem = {
			sku: "ITEM-003",
			packageQuantity: 15,
			color: { name: "Green", id: "102" },
		};
		jest.spyOn(global, "fetch").mockResolvedValue({
			ok: true,
			json: async () => ({ data: createdItem }),
		} as Response);
		const result = await RaukInventory.create(item);
		expect(result).toEqual(createdItem);
		expect(fetch).toHaveBeenCalledWith(
			`${config.apiBaseUrl}/query`,
			expect.objectContaining({
				method: "POST",
				body: JSON.stringify(["insertOne", item]),
			}),
		);
	});

	it("should findOne via static method", async () => {
		new RaukInventory(config);
		const query = { sku: "ITEM-001" };
		const item = { sku: "ITEM-001", packageQuantity: 10 };
		jest.spyOn(global, "fetch").mockResolvedValue({
			ok: true,
			json: async () => ({ data: [item] }),
		} as Response);
		const result = await RaukInventory.findOne(query);
		expect(result).toEqual(item);
		expect(fetch).toHaveBeenCalledWith(
			`${config.apiBaseUrl}/query`,
			expect.objectContaining({
				method: "POST",
				body: JSON.stringify(["find", query, { limit: 1 }]),
			}),
		);
	});

	it("should findOne return null when no item found", async () => {
		new RaukInventory(config);
		const query = { "availability.produced.orderId": { $ne: null } };
		jest.spyOn(global, "fetch").mockResolvedValue({
			ok: true,
			json: async () => ({ data: [] }),
		} as Response);
		const result = await RaukInventory.findOne(query);
		expect(result).toBeNull();
	});

	it("should delete via static method", async () => {
		new RaukInventory(config);
		const query = { sku: "ITEM-001" };
		const deleteResult = {
			sku: "ITEM-001",
			deleted: { status: true },
		};
		jest.spyOn(global, "fetch").mockResolvedValue({
			ok: true,
			json: async () => ({ data: deleteResult }),
		} as Response);
		const result = await RaukInventory.delete(query);
		expect(result).toEqual(deleteResult);
		expect(fetch).toHaveBeenCalledWith(
			`${config.apiBaseUrl}/query`,
			expect.objectContaining({
				method: "POST",
				body: JSON.stringify([
					"findOneAndUpdate",
					query,
					{ deleted: { status: true } },
				]),
			}),
		);
	});

	it("should bulkWrite via static method", async () => {
		new RaukInventory(config);
		const operations = [
			{
				updateOne: {
					filter: { sku: "ITEM-001" },
					update: { packageQuantity: 20 },
				},
			},
			{
				updateOne: {
					filter: { sku: "ITEM-002" },
					update: { "currentLocation.id": "warehouse-2" },
				},
			},
		];
		const bulkResult = {
			matchedCount: 2,
			modifiedCount: 2,
		};
		jest.spyOn(global, "fetch").mockResolvedValue({
			ok: true,
			json: async () => ({ data: bulkResult }),
		} as Response);
		const result = await RaukInventory.bulkWrite(operations);
		expect(result).toEqual(bulkResult);
		expect(fetch).toHaveBeenCalledWith(
			`${config.apiBaseUrl}/query`,
			expect.objectContaining({
				method: "POST",
				body: JSON.stringify(["bulkWrite", operations]),
			}),
		);
	});

	it("should deleteOne via static method", async () => {
		new RaukInventory(config);
		const query = { sku: "ITEM-001" };
		const deleteResult = {
			deletedCount: 1,
		};
		jest.spyOn(global, "fetch").mockResolvedValue({
			ok: true,
			json: async () => ({ data: deleteResult }),
		} as Response);
		const result = await RaukInventory.deleteOne(query);
		expect(result).toEqual(deleteResult);
		expect(fetch).toHaveBeenCalledWith(
			`${config.apiBaseUrl}/query`,
			expect.objectContaining({
				method: "POST",
				body: JSON.stringify(["deleteOne", query]),
			}),
		);
	});

	it("should deleteMany via static method", async () => {
		new RaukInventory(config);
		const query = { "entities.factoryId": "factory-789" };
		const deleteResult = {
			deletedCount: 5,
		};
		jest.spyOn(global, "fetch").mockResolvedValue({
			ok: true,
			json: async () => ({ data: deleteResult }),
		} as Response);
		const result = await RaukInventory.deleteMany(query);
		expect(result).toEqual(deleteResult);
		expect(fetch).toHaveBeenCalledWith(
			`${config.apiBaseUrl}/query`,
			expect.objectContaining({
				method: "POST",
				body: JSON.stringify(["deleteMany", query]),
			}),
		);
	});

	it("should aggregate", async () => {
		new RaukInventory(config);
		jest.spyOn(global, "fetch").mockResolvedValue({
			ok: true,
			json: async () => ({
				data: [{ packageQuantity: 10, sku: "ITEM-001" }],
			}),
		} as Response);
		const aggregate = await RaukInventory.aggregate([
			{ $match: { "color.name": "Traffic Red" } },
		]);
		expect(aggregate).toEqual([{ packageQuantity: 10, sku: "ITEM-001" }]);
	});

	it("should throw RaukValidationError for validation failures", async () => {
		new RaukInventory(config);

		// Mock fetch to return validation error response
		jest.spyOn(global, "fetch").mockResolvedValue({
			ok: false,
			status: 400,
			json: async () => ({
				success: false,
				error: {
					errors: [
						{
							property: "brandDetails",
							constraints: ["brandDetails should not be null or undefined"],
							children: [],
						},
						{
							property: "factoryDetails",
							constraints: ["factoryDetails should not be null or undefined"],
							children: [],
						},
					],
					name: "ValidationException",
				},
			}),
		} as Response);

		await expect(RaukInventory.find({ sku: "INVALID" })).rejects.toThrow(
			RaukValidationError,
		);

		try {
			await RaukInventory.find({ sku: "INVALID" });
		} catch (error) {
			expect(isValidationError(error)).toBe(true);
			if (isValidationError(error)) {
				expect(error.validationErrors).toHaveLength(2);
				expect(error.getAllMessages()).toEqual([
					"brandDetails should not be null or undefined",
					"factoryDetails should not be null or undefined",
				]);
				expect(error.getErrorsForProperty("brandDetails")).toHaveLength(1);
				expect(error.getErrorsForProperty("factoryDetails")).toHaveLength(1);
				expect(error.statusCode).toBe(400);
				expect(error.originalError).toBeDefined();
			}
		}
	});

	it("should throw RaukAuthenticationError for auth failures", async () => {
		new RaukInventory(config);

		// Mock fetch to return authentication error
		jest.spyOn(global, "fetch").mockResolvedValue({
			ok: false,
			status: 401,
			json: async () => ({
				success: false,
				error: {
					message: "Invalid API credentials",
					name: "AuthenticationError",
				},
			}),
		} as Response);

		await expect(RaukInventory.find({ sku: "TEST" })).rejects.toThrow(
			RaukAuthenticationError,
		);

		try {
			await RaukInventory.find({ sku: "TEST" });
		} catch (error) {
			expect(isAuthenticationError(error)).toBe(true);
			if (isAuthenticationError(error)) {
				expect(error.message).toContain("Invalid API credentials");
				expect(error.statusCode).toBe(401);
			}
		}
	});

	it("should throw RaukNetworkError for server errors", async () => {
		new RaukInventory(config);

		// Mock fetch to return server error
		jest.spyOn(global, "fetch").mockResolvedValue({
			ok: false,
			status: 500,
			json: async () => ({
				success: false,
				error: {
					message: "Internal server error",
					name: "ServerError",
				},
			}),
		} as Response);

		await expect(RaukInventory.find({ sku: "TEST" })).rejects.toThrow(
			RaukNetworkError,
		);

		try {
			await RaukInventory.find({ sku: "TEST" });
		} catch (error) {
			expect(isNetworkError(error)).toBe(true);
			if (isNetworkError(error)) {
				expect(error.message).toContain("Internal server error");
				expect(error.statusCode).toBe(500);
			}
		}
	});

	it("should handle network failures gracefully", async () => {
		new RaukInventory(config);

		// Mock fetch to throw a network error
		jest
			.spyOn(global, "fetch")
			.mockRejectedValue(new TypeError("fetch failed"));

		await expect(RaukInventory.find({ sku: "TEST" })).rejects.toThrow(
			RaukNetworkError,
		);

		try {
			await RaukInventory.find({ sku: "TEST" });
		} catch (error) {
			expect(isNetworkError(error)).toBe(true);
			if (isNetworkError(error)) {
				expect(error.message).toContain("Network request failed");
				expect(error.context?.originalError).toBe("fetch failed");
			}
		}
	});

	it("should update config via static setConfig method", async () => {
		new RaukInventory(config);

		// Update config
		const newConfig = {
			apiKeyId: "987654321098765432109876", // 24 characters
			apiSecret:
				"9876543210987654321098765432109876543210987654321098765432109876", // 64 characters
			apiPublicKey: "98765432109876543210987654321098", // 32 characters
			apiBaseUrl: "https://inventory.rauk.new",
		};

		RaukInventory.setConfig(newConfig);

		// Make a request to verify new config is used
		await RaukInventory.find({ sku: "TEST" });

		expect(fetch).toHaveBeenCalledWith(
			`${newConfig.apiBaseUrl}/query`,
			expect.objectContaining({
				method: "POST",
			}),
		);
	});

	it("should update config via instance setConfig method", async () => {
		const client = new RaukInventory(config);

		// Update config via instance
		const newConfig = {
			apiKeyId: "111111111111111111111111", // 24 characters
			apiSecret:
				"1111111111111111111111111111111111111111111111111111111111111111", // 64 characters
			apiPublicKey: "11111111111111111111111111111111", // 32 characters
			apiBaseUrl: "https://inventory.rauk.updated",
		};

		client.setConfig(newConfig);

		// Make a request to verify new config is used
		await client.find({ sku: "TEST" });

		expect(fetch).toHaveBeenCalledWith(
			`${newConfig.apiBaseUrl}/query`,
			expect.objectContaining({
				method: "POST",
			}),
		);
	});

	it("should throw on static setConfig without initialization", () => {
		expect(() =>
			RaukInventory.setConfig({
				apiKeyId: "key",
				apiSecret: "secret",
				apiPublicKey: "public",
			}),
		).toThrow(
			'RaukInventory must be initialized with "new RaukInventory(config)" before calling static methods.',
		);
	});
});

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
			json: async () => ({ data: { sku: "ITEM-002", packageQuantity: 5 } }),
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
			packageQuantity: 5,
			color: { name: "Blue", id: "101" },
			currentLocation: { id: "warehouse-2" },
			brandDetails: { id: "101", name: "Brand 1", type: "Brand" },
			factoryDetails: { id: "789", type: "Factory" },
		};
		const result = await client.create(item);
		expect(result).toEqual({ sku: "ITEM-002", packageQuantity: 5 });
	});
});
