export type ActionTypeFrom<
	ActionTypeToPayloadTypeMap extends object,
	ActionTypeWithoutPayload extends string,
> = (keyof ActionTypeToPayloadTypeMap) | ActionTypeWithoutPayload;

export type PayloadFrom<
	ActionTypeToPayloadTypeMap extends object,
	Type extends ActionTypeFrom<ActionTypeToPayloadTypeMap, never>,
> = ActionTypeToPayloadTypeMap[Type];

export type ActionFrom<
	ActionTypeToPayloadTypeMap extends object,
	ActionTypeWithoutPayload extends string,
	Type extends ActionTypeFrom<ActionTypeToPayloadTypeMap, ActionTypeWithoutPayload>,
> = {
	type: Type;
} & (Type extends (keyof ActionTypeToPayloadTypeMap) ? {
	payload: PayloadFrom<ActionTypeToPayloadTypeMap, Type>;
} : {});

export type ActionCreatorFrom<
	ActionTypeToPayloadTypeMap extends object,
	ActionTypeWithoutPayload extends string,
	Type extends ActionTypeFrom<ActionTypeToPayloadTypeMap, ActionTypeWithoutPayload>,
> = {
	(
		...arg: (Type extends (keyof ActionTypeToPayloadTypeMap) ? [ ActionTypeToPayloadTypeMap[Type] ] : [])
	): ActionFrom<ActionTypeToPayloadTypeMap, ActionTypeWithoutPayload, Type>;
};
