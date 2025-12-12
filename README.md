# Rauk Inventory SDK

A type-safe TypeScript SDK for inventory management operations with built-in validation and MongoDB-style query support.

## Installation

```bash
npm install @rauk/rauk-inventory
```

## Setup

Initialize the client with your API credentials:

```typescript
import RaukInventory from "rauk-inventory";

const client = new RaukInventory({
  apiKeyId: "your-api-key-id",
  apiSecret: "your-api-secret",
  apiPublicKey: "your-api-public-key",
});
```

### Updating Configuration

You can update the API credentials after initialization using the `setConfig` method:

```typescript
// Update configuration using static method
RaukInventory.setConfig({
  apiKeyId: "new-api-key-id",
  apiSecret: "new-api-secret",
  apiPublicKey: "new-api-public-key",
  apiBaseUrl: "https://custom-endpoint.rauk.app", // optional
});

// Or using instance method
client.setConfig({
  apiKeyId: "new-api-key-id",
  apiSecret: "new-api-secret",
  apiPublicKey: "new-api-public-key",
});
```

## Usage

### Static Method Usage (Singleton Pattern)

After initialization, you can use static methods directly.

```typescript
// Create an item
const newItem = await RaukInventory.create({
  entities: {
    apiId: "item-api-123",
    entityId: "item-entity-456",
    factoryId: "factory-789",
    brandId: "brand-101",
  },
  sku: "ITEM-001",
  qty: 10,
  color: { name: "Red" },
  currLoc: { id: "warehouse-1" },
});

// Find items
const items = await RaukInventory.find({
  sku: "ITEM-001",
});

// Update items
const result = await RaukInventory.update(
  { sku: "ITEM-001" },
  { qty: 20 }
);

// Aggregate data
const aggregated = await RaukInventory.aggregate([
  { $match: { "entities.factoryId": "factory-789" } },
  { $group: { _id: "$sku", count: { $sum: 1 } } },
]);
```

### Instance Method Usage

You can also use instance methods:

```typescript
const client = new RaukInventory({
  apiKeyId: "your-api-key-id",
  apiSecret: "your-api-secret",
  apiPublicKey: "your-api-public-key",
});

// Use instance methods
const items = await client.find({ sku: "ITEM-001" });
const item = await client.findOne({ sku: "ITEM-001" });
const result = await client.update(
  { sku: "ITEM-001" },
  { qty: 20 } 
);
```

## API Reference

### CRUD Operations

#### Create

Creates a new inventory item. All required fields must be provided.

```typescript
await RaukInventory.create(item: OperationCreateItem, options?: OperationRequestOptions): Promise<InventoryItem>
```

**Required fields:**

- `entities`: Object containing `factoryId`, `brandId`
- `currLoc`: Object with location details
- `sku`: Stock keeping unit identifier
- `qty`: Number of items in package
- `color`: Object with color information
- `brandDetails`: Object with details from the brand
- `factoryDetails`: Object with details from the brand

#### Find

Retrieves multiple items based on query criteria.

```typescript
await RaukInventory.find(query: OperationQuery, options?: OperationRequestOptions): Promise<InventoryItem[]>
```

#### Find One

Retrieves a single item based on query criteria.

```typescript
await RaukInventory.findOne(query: OperationQuery, options?: OperationRequestOptions): Promise<InventoryItem | null>
```

#### Update

Updates items matching the query criteria.

```typescript
await RaukInventory.update(query: OperationQuery, update: OperationUpdateItem, options?: OperationRequestOptions): Promise<OperationUpdateResult>
```

#### Update Many

Updates multiple items matching the query criteria.

```typescript
await RaukInventory.updateMany(query: OperationQuery, update: OperationUpdateItem, options?: OperationRequestOptions): Promise<OperationUpdateResult>
```

#### Delete

Marks items as deleted (soft delete).

```typescript
await RaukInventory.delete(query: OperationQuery, options?: OperationRequestOptions): Promise<OperationDeleteResult>
```

#### Delete One / Delete Many

Delete operations for single or multiple items.

```typescript
await RaukInventory.deleteOne(query: OperationQuery, options?: OperationRequestOptions): Promise<OperationDeleteResult>
await RaukInventory.deleteMany(query: OperationQuery, options?: OperationRequestOptions): Promise<OperationDeleteResult>
```

### Inventory Item Schema

The SDK operates on inventory items with the following comprehensive schema:

#### Core Fields

- **`id`** (readonly string): Unique identifier for the inventory item
- **`entities`** (readonly object): Immutable entity relationships
  - `apiId`: API identifier for the item
  - `entityId`: Entity identifier
  - `factoryId`: Factory/manufacturer identifier
  - `brandId`: Brand identifier
- **`sku`** (string): Stock Keeping Unit identifier
- **`qty`** (number): Number of items in this package/unit
- **`color`** (object): Color information
  - `id?`: Optional color identifier
  - `name`: Color name (required)

#### Location & Movement

- **`currLoc`** (object): Current physical location of the item
  - `id?`: Location identifier
  - `name?`: Location name
  - `details?`: Additional location metadata
- **`transitTo?`** (object): Destination information if item is in transit
  - `id?`: Destination location identifier
  - `client?`: Client/recipient information
- **`locationHistory?`** (array): Historical location changes
  - `id`: Location identifier
  - `name`: Location name
  - `date`: When the location change occurred

#### Availability & Status

- **`availability`** (Map<"produced" | "reserved" | "sold", StatusDetails>): Item availability status by type
  - Key: Status type - one of: `"produced"`, `"reserved"`, or `"sold"`
  - Value: Status details object containing:
    - `orderId?`: Associated order identifier
    - `date?`: Status assignment date
    - `temporary?`: Whether the status is temporary (only for reserved)
    - `expiration?`: When temporary status expires (only for reserved)

#### Business Details

- **`brandDetails?`** (object): Brand/manufacturer information
  - `id?`: Brand identifier
  - `name?`: Brand name
  - `type?`: Brand type classification
  - `category?`: Brand category classification
- **`factoryDetails?`** (object): Manufacturing facility information
  - `id?`: Factory identifier
  - `name?`: Factory name
  - `type?`: Factory type classification
  - `category?`: Factory category classification

#### System Fields

- **`hardcode?`** (string): Optional hardcoded identifier or reference
- **`deleted`** (object): Soft deletion status
  - `status`: Whether the item is deleted (boolean)
  - `deletionDate?`: When the item was deleted
- **`createdAt?`** (Date): Record creation timestamp
- **`updatedAt?`** (Date): Last update timestamp

#### Complete Item Example

Here's a complete example of an inventory item with all fields populated:

```javascript
const sampleInventoryItem = {
  id: "inv-12345-abcde",
  entities: {
    apiId: "api-789",
    entityId: "ent-456",
    factoryId: "factory-001",
    brandId: "brand-999",
  },
  sku: "RED-SHOES-42",
  qty: 12,
  color: {
    id: "color-red-001",
    name: "Crimson Red",
  },
  currLoc: {
    id: "warehouse-nyc",
    name: "New York Warehouse",
    details: {
      aisle: "A12",
      shelf: "S05",
      bin: "B03",
    },
  },
  transitTo: {
    id: "store-la-001",
    client: "Los Angeles Store",
  },
  availability: new Map([
    [
      "produced",
      {
        date: new Date("2024-01-15T10:00:00Z"),
      },
    ],
    [
      "reserved",
      {
        orderId: "order-xyz-789",
        date: new Date("2024-01-20T14:30:00Z"),
        temporary: true,
        expiration: new Date("2024-01-25T14:30:00Z"),
      },
    ],
  ]),
  brandDetails: {
    id: "brand-999",
    name: "Premium Footwear Co",
    type: "Fashion",
    category: "Athletic",
  },
  factoryDetails: {
    id: "factory-001",
    name: "Global Manufacturing Inc",
    type: "Production",
    category: "Assembly",
  },
  deleted: {
    status: false,
  },
  locationHistory: [
    {
      id: "factory-001",
      name: "Manufacturing Plant",
      date: new Date("2024-01-01T08:00:00Z"),
    },
    {
      id: "warehouse-nyc",
      name: "New York Warehouse",
      date: new Date("2024-01-10T09:15:00Z"),
    },
  ],
  createdAt: new Date("2024-01-01T08:00:00Z"),
  updatedAt: new Date("2024-01-20T14:30:00Z"),
};
```

### Advanced Operations

#### Aggregate

Performs MongoDB-style aggregation operations.

```typescript
await RaukInventory.aggregate(pipeline: OperationAggregatePipeline, options?: OperationRequestOptions): Promise<any[]>
```

**Example aggregation pipeline:**

```typescript
const result = await RaukInventory.aggregate([
  {
    $group: {
      _id: "$sku",
      count: { $sum: 1 },
      totalQuantity: { $sum: "$qty" },
    },
  },
  { $sort: { count: -1 } },
]);
```

#### Bulk Write

Performs multiple write operations in a single request.

```typescript
await RaukInventory.bulkWrite(operations: OperationBulkWrite, options?: OperationRequestOptions): Promise<any>
```

**Example bulk operations:**

```typescript
const operations = [
  {
    updateOne: {
      filter: { sku: "ITEM-001" },
      update: { qty: 20 },
    },
  },
  {
    insertOne: {
      document: {
        entities: {
          apiId: "123",
          entityId: "456",
          factoryId: "789",
          brandId: "101",
        },
        sku: "ITEM-003",
        qty: 5,
        color: { name: "Blue" },
        currLoc: { id: "warehouse-2" },
      },
    },
  },
];

const result = await RaukInventory.bulkWrite(operations);
```

#### Update Batch

Simplified batch update interface.

```typescript
await RaukInventory.updateBatch(updates: [OperationQuery, OperationUpdateItem][], options?: OperationRequestOptions): Promise<any>
```

**Example:**

```typescript
const batchUpdates = [
  [{ sku: "ITEM-001" }, { qty: 20 } ],
  [{ sku: "ITEM-002" }, { color: { name: "Blue" } }],
];

const result = await RaukInventory.updateBatch(batchUpdates);
```

## Query Options

All query operations support optional parameters:

```typescript
interface OperationRequestOptions {
  select?: Record<string, 0 | 1>; // Field selection
  limit?: number; // Limit results
  sort?: Record<string, 1 | -1>; // Sort order
  includeDeleted?: boolean; // Include soft-deleted items
}
```

## Type Safety

The SDK provides full TypeScript support with:

- **Compile-time validation** of all operations
- **IntelliSense support** for all methods and parameters
- **Type-safe query builders** with MongoDB-style operators
- **Strict typing** for create, update, and query operations

## Error Handling

The SDK provides structured error handling with specific error types for different scenarios:

### Error Types

- **`RaukValidationError`** - Validation failures with detailed field-level error information
- **`RaukAuthenticationError`** - Authentication/authorization issues (401/403 responses)
- **`RaukNetworkError`** - Network connectivity issues and server errors (5xx responses)
- **`RaukError`** - Base error class for all SDK errors

### Error Structure

```typescript
import {
  isValidationError,
  isAuthenticationError,
  isNetworkError,
  RaukValidationError,
} from "rauk-inventory";

// Handle errors with proper typing
try {
  const items = await RaukInventory.find({ sku: "ITEM-001" });
} catch (error) {
  if (isValidationError(error)) {
    // Access detailed validation errors
    console.log("Validation failed for properties:", error.validationErrors);
    console.log("All error messages:", error.getAllMessages());

    // Get errors for specific property
    const brandErrors = error.getErrorsForProperty("brandDetails");
    console.log("Brand errors:", brandErrors);
  } else if (isAuthenticationError(error)) {
    console.log("Authentication failed:", error.message);
  } else if (isNetworkError(error)) {
    console.log("Network error:", error.message);
  } else {
    console.log("Other error:", error.message);
  }

  // Access common error properties
  console.log("Status code:", error.statusCode);
  console.log("Request ID:", error.requestId);
  console.log("Timestamp:", error.timestamp);
  console.log("Original API response:", error.originalError);
}
```

### Error Response Format

The SDK parses API error responses and converts them into structured TypeScript errors:

```typescript
// API returns:
{
    "success": false,
    "error": {
        "errors": [
            {
                "property": "brandDetails",
                "constraints": [
                    "brandDetails should not be null or undefined"
                ],
                "children": []
            }
        ],
        "name": "ValidationException"
    }
}

// SDK converts to:
const error = new RaukValidationError(
    "Validation failed",
    [
        {
            property: "brandDetails",
            constraints: ["brandDetails should not be null or undefined"],
            children: []
        }
    ],
    { statusCode: 400 }
);
```

## Examples

See the code samples in the method documentation above for comprehensive usage examples.
