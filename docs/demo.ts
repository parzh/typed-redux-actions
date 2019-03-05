import {
	ActionCreatorFrom,
	ActionTypeFrom,
	PayloadFrom,
	ActionFrom,
} from "..";

// Actions with payload
const SET_USER_NAME = "SET_USER_NAME";
type SET_USER_NAME = "SET_USER_NAME";

const SET_USER_AGE = "SET_USER_AGE";
type SET_USER_AGE = "SET_USER_AGE";

type PayloadMap = {
	[SET_USER_NAME]: string;
	[SET_USER_AGE]: number;
};

type ActionTypeWithPayload =
	ActionTypeFrom<PayloadMap>; // "SET_USER_NAME" | "SET_USER_AGE"

// ***

// Actions without payload
const LOG_OUT = "LOG_OUT";
type LOG_OUT = "LOG_OUT";

const RELOAD_PAGE = "RELOAD_PAGE";
type RELOAD_PAGE = "RELOAD_PAGE";

type ActionTypeWithoutPayload =
	| LOG_OUT
	| RELOAD_PAGE
	; // "LOG_OUT" | "RELOAD_PAGE"

// ***

type ActionType =
	ActionTypeFrom<PayloadMap, ActionTypeWithoutPayload>; // "SET_USER_NAME" | "SET_USER_AGE" | "LOG_OUT" | "RELOAD_PAGE"

type Action<Type extends ActionType> =
	ActionFrom<PayloadMap, ActionTypeWithoutPayload, Type>;

type ActionCreator<Type extends ActionType> =
	ActionCreatorFrom<PayloadMap, ActionTypeWithoutPayload, Type>;

type Payload<Type extends ActionTypeWithPayload> =
	PayloadFrom<PayloadMap, Type>;

// ***

// Examples of errors

// @ts-ignore (Type '""' is not assignable)
const actionType0: ActionType = ""; // <- try autocompletion

// @ts-ignore (Property 'type' is missing, Type '"LAG_OUT"' does not satisfy the constraint)
const action0: Action<"LAG_OUT"> = {};

const action1: Action<"LOG_OUT"> = {
	// @ts-ignore (Type '"LAG_OUT"' is not assignable to type '"LOG_OUT"'.)
	type: "LAG_OUT",
};

// @ts-ignore (Property 'payload' is missing)
const action2: Action<"SET_USER_NAME"> = {
	type: "SET_USER_NAME",
};

const action3: Action<"SET_USER_NAME"> = {
	type: "SET_USER_NAME",
	// @ts-ignore (Type 'number' is not assignable to type 'string'.)
	payload: 42,
};

// @ts-ignore (Type 'void' is not assignable, Type '"LAG_OUT"' does not satisfy the constraint)
const actionCreator0: ActionCreator<"LAG_OUT"> = () => { };

const actionCreator1: ActionCreator<"SET_USER_NAME"> = () => ({
	// @ts-ignore (Type '"LAG_OUT"' is not assignable)
	type: "LAG_OUT",
});

// @ts-ignore (Property 'payload' is missing)
const actionCreator2: ActionCreator<"SET_USER_NAME"> = () => ({
	type: "SET_USER_NAME",
});

const actionCreator3: ActionCreator<"SET_USER_NAME"> = (name) => ({
	type: "SET_USER_NAME",
	payload: name,
});

// @ts-ignore (Argument of type '42' is not assignable)
actionCreator3(42);

// @ts-ignore (Type '"LOG_OUT"' does not satisfy the constraint)
const payload0: Payload<"LOG_OUT"> = undefined;

// @ts-ignore (Type '42' is not assignable to type 'string'.)
const payload1: Payload<"SET_USER_NAME"> = 42;

// @ts-ignore (Type '"John Doe"' is not assignable to type 'number'.)
const payload2: Payload<"SET_USER_AGE"> = "John Doe";
