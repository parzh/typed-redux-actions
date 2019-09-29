import {
	ActionCreatorFrom,
	ActionFrom,
} from "../lib";

// Actions with payload
const SET_USER_NAME = "SET_USER_NAME";
type SET_USER_NAME = "SET_USER_NAME";

const SET_USER_AGE = "SET_USER_AGE";
type SET_USER_AGE = "SET_USER_AGE";

// Actions without payload
const LOG_OUT = "LOG_OUT";
type LOG_OUT = "LOG_OUT";

const RELOAD_PAGE = "RELOAD_PAGE";
type RELOAD_PAGE = "RELOAD_PAGE";

interface PayloadMap {
	// Actions with payload
	[SET_USER_NAME]: string;
	[SET_USER_AGE]: number;

	// Actions without payload (all typed `never`)
	[LOG_OUT]: never;
	[RELOAD_PAGE]: never;
}

// ***

type Action<Type extends keyof PayloadMap> =
	ActionFrom<PayloadMap, Type>;

type ActionCreator<Type extends keyof PayloadMap> =
	ActionCreatorFrom<PayloadMap, Type>;

// ***

// Examples of errors

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
