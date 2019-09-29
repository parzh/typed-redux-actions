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

/** @private */
type _WithPayload_Action<
	PayloadMap extends object,
	Type extends ActionTypeFrom<PayloadMap, never>,
> = {
	type: Type;
	payload: PayloadFrom<PayloadMap, Type>;
};

/** @private */
type _WithoutPayload_Action<
	WithoutPayload_ActionType extends string,
	Type extends ActionTypeFrom<never, WithoutPayload_ActionType>,
> = {
	type: Type;
};

export type ActionFrom<
	PayloadMap extends object,
	WithoutPayload_ActionType extends string,
	Type extends ActionTypeFrom<PayloadMap, WithoutPayload_ActionType>,
> =
	Type extends keyof PayloadMap ?
		_WithPayload_Action<PayloadMap, Type>
	:
	Type extends WithoutPayload_ActionType ?
		_WithoutPayload_Action<WithoutPayload_ActionType, Type>
	:
		never;

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
