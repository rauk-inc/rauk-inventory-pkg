import type {
	InventoryItem,
	QueryInventoryItem,
	UpdateInventoryItem,
} from "./item";

type Primitive =
	| string
	| number
	| boolean
	| bigint
	| symbol
	| null
	| undefined
	| Date;

type NonNullish<T> = T extends null | undefined ? never : T;

type HasIndexSignature<T> = T extends object
	? string extends keyof T
		? true
		: number extends keyof T
			? true
			: symbol extends keyof T
				? true
				: false
	: false;

type DepthMap = {
	0: 0;
	1: 0;
	2: 1;
	3: 2;
	4: 3;
	5: 4;
	6: 5;
	7: 6;
	8: 7;
	9: 8;
	10: 9;
};

type DepthValue = keyof DepthMap;
type DecrementDepth<D extends DepthValue> = DepthMap[D];
type MaxDepth = 6;

export type DotNotationPaths<
	T,
	Prefix extends string = "",
	Depth extends DepthValue = MaxDepth,
> = Depth extends 0
	? never
	: NonNullish<T> extends Primitive
		? never
		: NonNullish<T> extends ReadonlyArray<infer U>
			? DotNotationPaths<U, Prefix, Depth>
			: {
					[K in keyof NonNullish<T> & string]: NonNullish<
						NonNullish<T>[K]
					> extends Primitive
						? `${Prefix}${K}`
						: NonNullish<NonNullish<T>[K]> extends ReadonlyArray<infer U2>
							?
									| `${Prefix}${K}`
									| DotNotationPaths<
											U2,
											`${Prefix}${K}.`,
											DecrementDepth<Depth>
									  >
							: HasIndexSignature<NonNullish<T>[K]> extends true
								? `${Prefix}${K}`
								:
										| `${Prefix}${K}`
										| DotNotationPaths<
												NonNullish<T>[K],
												`${Prefix}${K}.`,
												DecrementDepth<Depth>
										  >;
				}[keyof NonNullish<T> & string];

type DotNotationValue<
	T,
	Path extends string,
	Depth extends DepthValue = MaxDepth,
> = Depth extends 0
	? never
	: NonNullish<T> extends ReadonlyArray<infer U>
		? DotNotationValue<U, Path, Depth>
		: NonNullish<T> extends Primitive
			? never
			: Path extends `${infer Key}.${infer Rest}`
				? Key extends keyof NonNullish<T>
					? NonNullish<NonNullish<T>[Key]> extends ReadonlyArray<infer U2>
						? DotNotationValue<U2, Rest, DecrementDepth<Depth>>
						: HasIndexSignature<NonNullish<T>[Key]> extends true
							? never
							: DotNotationValue<
									NonNullish<T>[Key],
									Rest,
									DecrementDepth<Depth>
								>
					: never
				: Path extends keyof NonNullish<T>
					? NonNullish<T>[Path]
					: never;

export type InventoryItemFieldValues = {
	[K in DotNotationPaths<InventoryItem>]: DotNotationValue<InventoryItem, K>;
};

export type UpdateInventoryItemFieldValues = {
	[K in DotNotationPaths<UpdateInventoryItem>]: DotNotationValue<
		UpdateInventoryItem,
		K
	>;
};

export type QueryInventoryItemFieldValues = {
	[K in DotNotationPaths<QueryInventoryItem>]: DotNotationValue<
		QueryInventoryItem,
		K
	>;
};
