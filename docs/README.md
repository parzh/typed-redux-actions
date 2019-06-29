# `@parzh/typed-redux-actions`
Type definitions for creating type-safe Redux actions.

# 1. Definitions
## 1.1 Action
**Action** is the central concept in the Flux architecture. In Redux, it is an (almost) arbitrary object that represents an action. Action object may or may not hold additional information about the action (for example, its payload).

Here are the examples of actions:

```js
// Update user name to "John Doe"
const setUserName = {
  type: "SET_USER_NAME",
  payload: "John Doe",
};
```

```js
// Log out from the site
const logOut = {
  type: "LOG_OUT",
};
```

## 1.2 Action Type
**Action type** is just a string, although a special one: it uniquely identifies the action among all other actions in the Redux-driven application. Action type is always non-ambiguously specified in the `.type` property of an object representing the action.

Examples of action type in the previous paragraph are the `"SET_USER_NAME"` and `"LOG_OUT"` strings. Notice how these strings represent names of the actions in constant case.

## 1.3 Action Creator
If action is an arbitrary object, then **action creator** is a function, that returns an arbitrary object. If necessary, action creators may have a payload parameter, the value of which goes to the `.payload` property of the action object (see section 1.1).

An example of action creator:

```js
const setUserName = (name) => ({
    type: "SET_USER_NAME",
    payload: name,
});
```

```js
const logOut = () => ({
    type: "LOG_OUT",
});
```

## 1.4 Payload
**Payload** is whatever the additional data is required by an action. As stated, an action may or may not require additional payload.

The action of setting user's name requires the new name; which is why the `setUserName` object has `.payload` property (`"John Doe"`). By contrast, the action of logging out does not require any payload, so the `logOut` object does not have any additional properties.

# 2. Type-safety Roadmap
All this can be implemented in a type-safe manner, if implemented properly in a TypeScript application. One very useful fact that we will use heavily is that any action is uniquely identified by its type, which is a string, and in TypeScript every string is of its own type.

Let's imagine, what it might look like.

## 2.1 Action types
For **action types**, we might raise compile errors when the action type is unrecognized or misspelled:

```ts
const actionType: ActionType = "SET_NAME";
//    ^^^^^^^^^^
// [ts] Type '"SET_NAME"' is not assignable to type '"SET_USER_NAME" | "LOG_OUT"'.
```

## 2.2 Actions
For **actions** both type and payload should be constrained properly:

```ts
const action: Action<"SET_NAME"> = {};
//                   ^^^^^^^^^^
// [ts] Type '"SET_NAME"' is not assignable to type '"SET_USER_NAME" | "LOG_OUT"'.
```

```ts
const action: Action<"LOG_OUT"> = {};
//    ^^^^^^
// [ts] Type '{}' is missing the following properties: type
```

```ts
const action: Action<"LOG_OUT"> = {
    type: "SIGN_OUT",
//  ^^^^
// [ts] Type '"SIGN_OUT"' is not assignable to type '"LOG_OUT"'.
};
```

```ts
const action: Action<"SET_USER_NAME"> = {
    type: "SET_USER_NAME",
    payload: 42,
//  ^^^^^^^
// [ts] Type 'number' is not assignable to type 'string'.
};
```

## 2.3 Action creators
Similar constraints would be useful for **action creators**:

```ts
const setUserName: ActionCreator<"SET_NAME"> = () => ({ /* ... */ });
//                               ^^^^^^^^^^
// [ts] Type '"SET_NAME"' is not assignable to type '"SET_USER_NAME" | "LOG_OUT"'.
```

```ts
const setUserName: ActionCreator<"SET_USER_NAME"> = () => ({
    type: "SET_NAME",
//  ^^^^
// [ts] Type '"SET_NAME"' is not assignable to type '"SET_USER_NAME"'.
});
```

```ts
const setUserName: ActionCreator<"SET_USER_NAME"> = () => ({
    type: "SET_USER_NAME",
});
// [ts] Property 'payload' is missing
```

```ts
const setUserName: ActionCreator<"SET_USER_NAME"> = (name) => ({
    type: "SET_USER_NAME",
    payload: name,
});

setUserName(42);
//          ^^
// [ts] Type 'number' is not assignable to type 'string'.
```

## 2.4 Payload
Constraints for **payload** might also be useful in some situations:

```ts
const payload: Payload<"LOG_OUT"> = undefined;
//                     ^^^^^^^^^
// [ts] Type '"LOG_OUT"' is not assignable to type '"SET_USER_NAME"'.
```

```ts
const payload: Payload<"SET_USER_NAME"> = 42;
//    ^^^^^^^
// [ts] Type 'number' is not assignable to type 'string'.
```

# 3. Implementing type-safety

### TL;DR:
1. Create symbols for action types;
1. Create payload info;
1. Create useful generics;

***

## 3.1 Create symbols for action types
To add type-safety and start taking advantages from it, first we must predefine both value and type for all action types in the application:

```ts
const SET_USER_NAME = "SET_USER_NAME"; // this is the JavaScript string (value)
type SET_USER_NAME = "SET_USER_NAME"; // this is the TypeScript string literal (type)

// Let's throw in another action type for diversity
const SET_USER_AGE = "SET_USER_AGE"; // this is the JavaScript string (value)
type SET_USER_AGE = "SET_USER_AGE"; // this is the TypeScript string literal (type)

// ***

// I recommend keeping apart
// types of action with payload
// and types of action without one

const LOG_OUT = "LOG_OUT"; // this is the JavaScript string (value)
type LOG_OUT = "LOG_OUT"; // this is the TypeScript string literal (type)
```

## 3.2 Create payload info
Then, for all the actions that require payload we have to specify its type. The mapping of action type to payload type is done using an interface or an object-like type:

```ts
type PayloadMap = {
    // The "SET_USER_NAME" action requires string as a payload
    [SET_USER_NAME]: string;

    // The "SET_USER_AGE" action requires number as a payload
    [SET_USER_AGE]: number;

    // The fact that the "LOG_OUT" action type is not present here 
    // indicates that this action does not require any payload
};
```

## 3.3 Create useful generics
In the "**2. Type-safety Roadmap**" section, types `Action<…>`, `ActionCreator<…>` and `Payload<…>` are [generic types], while the `ActionType` is just a union of all given action types.

All these models have to be created though. In order to do that, the `@parzh/typed-redux-actions` package provides several generics; but let's call them "utilities", so that creators are not confused with creations. The utilities have convenient similarities: all end with "`…From`" suffix and all obey the same scheme of type parameters:

```ts
<PayloadMap, ActionTypeWithoutPayload /* (if needed) */, Type extends ActionType /* (if needed) */>
```

### 3.3.1 ActionType

The `ActionTypeFrom<…>` utility, provided by the `@parzh/typed-redux-actions` package, creates union of all action types. It takes action types from keys of payload map and unites them with the string literal union of non-payloaded action types, provided as the second type parameter.

```ts
// Types of actions without payload are listed manually
type ActionTypeWithoutPayload =
    | LOG_OUT
    | RELOAD_PAGE
    ;
```

```ts
import { ActionTypeFrom } from "@parzh/typed-redux-actions";

export type ActionType =
    ActionTypeFrom<PayloadMap, ActionTypeWithoutPayload>;
```

### 3.3.2 Action

With the help of newly created `ActionType` union, along with `PayloadMap` and `ActionTypeWithoutPayload`, we create `Action<…>` generic, using `ActionFrom<…>` utility. In the section "**2.2 Actions**", we described a constraint that helped us intercept errors while specifying action type; the `<Type extends ActionType>` type guard does exactly that.

```ts
import { ActionFrom } from "@parzh/typed-redux-actions";

export type Action<Type extends ActionType> =
    ActionFrom<PayloadMap, ActionTypeWithoutPayload, Type>;
```

### 3.3.3 ActionCreator

This code is extremely similar to the one in the previous section. Again, we use previously created types, generics, and symbols, but this time we move a step further, and define the `ActionCreator<…>` generic, using `ActionCreatorFrom<…>` utility. It will have the behavior described in the section "**2.3 Action creators**".

```ts
import { ActionCreatorFrom } from "@parzh/typed-redux-actions";

export type ActionCreator<Type extends ActionType> =
    ActionCreatorFrom<PayloadMap, ActionTypeWithoutPayload, Type>;
```

### 3.3.4 Payload

The `Payload<…>` generic shows slightly different picture, because it cares only about actions with payload. That's why, when creating it with `PayloadFrom<…>` utility, in type guard we use more specific `ActionTypeFrom<PayloadMap>` (omitting the second type parameter) instead of simply `ActionType` which unnecessarily adds actions without payload.

```ts
import { PayloadFrom } from "@parzh/typed-redux-actions";

export type Payload<Type extends ActionTypeFrom<PayloadMap>> =
    PayloadFrom<PayloadMap, Type>;
```

See also [demo].

  [generic types]: https://www.typescriptlang.org/docs/handbook/generics.html
  [demo]: /docs/demo.ts
