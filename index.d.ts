export type ActionTypeFrom<
	ActionTypeToPayloadTypeMap extends object = object,
	ActionTypeWithoutPayload extends string = never,
> = (keyof ActionTypeToPayloadTypeMap) | ActionTypeWithoutPayload;

export type PayloadFrom<
	ActionTypeToPayloadTypeMap extends object = object,
	Type extends ActionTypeFrom<ActionTypeToPayloadTypeMap> = ActionTypeFrom<ActionTypeToPayloadTypeMap>,
> = ActionTypeToPayloadTypeMap[Type];

export type ActionFrom<
	ActionTypeToPayloadTypeMap extends object = object,
	ActionTypeWithoutPayload extends string = never,
	Type extends ActionTypeFrom<ActionTypeToPayloadTypeMap, ActionTypeWithoutPayload> = ActionTypeFrom<ActionTypeToPayloadTypeMap, ActionTypeWithoutPayload>,
> = {
	type: Type;
} & (Type extends (keyof ActionTypeToPayloadTypeMap) ? {
	payload: PayloadFrom<ActionTypeToPayloadTypeMap, Type>;
} : {});

export type ActionCreatorFrom<
	ActionTypeToPayloadTypeMap extends object = object,
	ActionTypeWithoutPayload extends string = never,
	Type extends ActionTypeFrom<ActionTypeToPayloadTypeMap, ActionTypeWithoutPayload> = ActionTypeFrom<ActionTypeToPayloadTypeMap, ActionTypeWithoutPayload>,
> = {
	(
		...arg: (Type extends (keyof ActionTypeToPayloadTypeMap) ? [ ActionTypeToPayloadTypeMap[Type] ] : [])
	): ActionFrom<ActionTypeToPayloadTypeMap, ActionTypeWithoutPayload, Type>;
};
