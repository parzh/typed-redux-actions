/** @private @see https://stackoverflow.com/a/54520829/4554883 */
type _PickPropsTypedNever<
	Obj extends object,
> = {
	[Key in keyof Obj]: Obj[Key] extends never ? Key : never;
};

// ***

export type ActionTypeFrom<
	PayloadMap extends object,
> =
	| keyof PayloadMap
	;

/** @private */
type _WithoutPayload_ActionType<
	PayloadMap extends object,
> =
	| _PickPropsTypedNever<PayloadMap>[ActionTypeFrom<PayloadMap>]
	;

/** @private */
type _WithPayload_ActionType<
	PayloadMap extends object,
> =
	| Exclude<ActionTypeFrom<PayloadMap>, _WithoutPayload_ActionType<PayloadMap>>
	;

// ***

/** @private */
type _WithoutPayload_Action<
	PayloadMap extends object,
	Type extends _WithoutPayload_ActionType<PayloadMap>,
> = {
	type: Type;
};

/** @private */
type _WithPayload_Action<
	PayloadMap extends object,
	Type extends _WithPayload_ActionType<PayloadMap>,
> = {
	type: Type;
	payload: PayloadMap[Type];
};

export type ActionFrom<
	PayloadMap extends object,
	Type extends ActionTypeFrom<PayloadMap>,
> =
	Type extends _WithPayload_ActionType<PayloadMap> ?
		_WithPayload_Action<PayloadMap, Type>
	:
	Type extends _WithoutPayload_ActionType<PayloadMap> ?
		_WithoutPayload_Action<PayloadMap, Type>
	:
		never;

// ***

/** @private */
type _WithoutPayload_ActionCreator<
	PayloadMap extends object,
	Type extends _WithoutPayload_ActionType<PayloadMap>,
> = {
	(): _WithoutPayload_Action<PayloadMap, Type>;
};

/** @private */
type _WithPayload_ActionCreator<
	PayloadMap extends object,
	Type extends _WithPayload_ActionType<PayloadMap>,
> = {
	(payload: PayloadMap[Type]): _WithPayload_Action<PayloadMap, Type>;
};

export type ActionCreatorFrom<
	PayloadMap extends object,
	Type extends ActionTypeFrom<PayloadMap>,
> =
	Type extends _WithPayload_ActionType<PayloadMap> ?
		_WithPayload_ActionCreator<PayloadMap, Type>
	:
	Type extends _WithoutPayload_ActionType<PayloadMap> ?
		_WithoutPayload_ActionCreator<PayloadMap, Type>
	:
		never;
