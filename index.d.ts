export type ActionTypeFrom<
	PayloadMap extends object,
	WithoutPayload_ActionType extends string,
> =
	| keyof PayloadMap
	| WithoutPayload_ActionType
	;

// ***

export type PayloadFrom<
	PayloadMap extends object,
	Type extends ActionTypeFrom<PayloadMap, never>,
> =
	| PayloadMap[Type];

// ***

export type ActionFrom<
	PayloadMap extends object,
	WithoutPayload_ActionType extends string,
	Type extends ActionTypeFrom<PayloadMap, WithoutPayload_ActionType>,
> = {
	type: Type;
} & (Type extends keyof PayloadMap ? {
	payload: PayloadFrom<PayloadMap, Type>;
} : {});

// ***

export type ActionCreatorFrom<
	PayloadMap extends object,
	WithoutPayload_ActionType extends string,
	Type extends ActionTypeFrom<PayloadMap, WithoutPayload_ActionType>,
> = {
	(
		...arg: (Type extends keyof PayloadMap ? [ PayloadMap[Type] ] : [])
	): ActionFrom<PayloadMap, WithoutPayload_ActionType, Type>;
};
