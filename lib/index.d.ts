export type ActionTypeFrom<
	PayloadMap extends object,
	WithoutPayload_ActionType extends string,
> =
	| keyof PayloadMap
	| WithoutPayload_ActionType
	;

// ***

/** @private */
type _WithoutPayload_Action<
	WithoutPayload_ActionType extends string,
	Type extends ActionTypeFrom<never, WithoutPayload_ActionType>,
> = {
	type: Type;
};

/** @private */
type _WithPayload_Action<
	PayloadMap extends object,
	Type extends ActionTypeFrom<PayloadMap, never>,
> = {
	type: Type;
	payload: PayloadMap[Type];
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

/** @private */
type _WithoutPayload_ActionCreator<
	WithoutPayload_ActionType extends string,
	Type extends ActionTypeFrom<never, WithoutPayload_ActionType>,
> = {
	(): _WithoutPayload_Action<WithoutPayload_ActionType, Type>;
};

/** @private */
type _WithPayload_ActionCreator<
	PayloadMap extends object,
	Type extends ActionTypeFrom<PayloadMap, never>,
> = {
	(payload: PayloadMap[Type]): _WithPayload_Action<PayloadMap, Type>;
};

export type ActionCreatorFrom<
	PayloadMap extends object,
	WithoutPayload_ActionType extends string,
	Type extends ActionTypeFrom<PayloadMap, WithoutPayload_ActionType>,
> =
	Type extends keyof PayloadMap ?
		_WithPayload_ActionCreator<PayloadMap, Type>
	:
	Type extends WithoutPayload_ActionType ?
		_WithoutPayload_ActionCreator<WithoutPayload_ActionType, Type>
	:
		never;
