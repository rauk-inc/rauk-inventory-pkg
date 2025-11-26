interface BaseStatusDetails {
	orderId?: string;
	date?: Date;
}

interface ReservedStatusDetails extends BaseStatusDetails {
	temporary?: boolean;
	expiration?: Date;
}

type AvailabilityStatuses = {
	produced?: BaseStatusDetails;
	reserved?: ReservedStatusDetails;
	sold?: BaseStatusDetails;
};

interface Entities {
	readonly apiId: string;
	readonly entityId: string;
	readonly factoryId: string;
	readonly brandId: string;
}

interface Location {
	id?: string | null;
	name?: string | null;
	details?: Record<string, any>;
}

interface TransitTo {
	id?: string | null;
	client?: string | null;
}

interface BrandDetails {
	id?: string;
	name?: string;
	type?: string;
	subType?: string;
}

interface Color {
	id?: string;
	name: string;
}

interface FactoryDetails {
	id?: string;
	name?: string;
	type?: string;
	subType?: string;
}

interface Deleted {
	status: boolean;
	deletionDate?: Date;
}

interface LocationHistoryEntry {
	id: string;
	name: string;
	date: Date;
}

export interface InventoryItem {
	hardcode?: string;
	readonly entities: Entities;
	currentLocation: Location;
	transitTo?: TransitTo;
	availability: AvailabilityStatuses;
	sku: string;
	brandDetails?: BrandDetails;
	packageQuantity: number;
	color: Color;
	factoryDetails?: FactoryDetails;
	deleted: Deleted;
	locationHistory?: LocationHistoryEntry[];
	createdAt?: Date;
	updatedAt?: Date;
	readonly id: string;
}

export interface UpdateInventoryItem {
	hardcode?: string;
	readonly entities: Entities;
	currentLocation: Location;
	transitTo?: TransitTo;
	availability: AvailabilityStatuses;
	sku: string;
	brandDetails?: BrandDetails;
	packageQuantity: number;
	color: Color;
	factoryDetails?: FactoryDetails;
	deleted: Deleted;
	locationHistory?: LocationHistoryEntry[];
	createdAt?: Date;
	updatedAt?: Date;
	readonly id: string;
}
export interface QueryInventoryItem {
	readonly hardcode: string;
	readonly entities: Entities;
	readonly currentLocation: Location;
	readonly transitTo: TransitTo;
	readonly availability: AvailabilityStatuses;
	readonly sku: string;
	readonly brandDetails: BrandDetails;
	readonly packageQuantity: number;
	readonly color: Color;
	readonly factoryDetails: FactoryDetails;
	readonly deleted: Deleted;
	readonly locationHistory: LocationHistoryEntry[];
	readonly createdAt: Date;
	readonly updatedAt: Date;
	readonly id: string;
}

