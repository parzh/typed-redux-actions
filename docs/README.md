# `typed-redux-actions`
Type definitions for creating type-safe Redux actions.

# 1. Definitions
## 1.1 Action
**Action** is the central concept in the Flux architecture. In Redux, it is an (almost) arbitrary object that represents a action. Action may or may not hold additional information about itself (for example, payload).

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
If action is an arbitrary object, then **action creator** is a function, that returns an arbitrary object. Usually, action creators have a payload parameter (if needed), the value of which simply goes to the `.payload` property of the action object.

It might work like this:

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
**Payload** is whatever the additional data is required by an action. As it was stated earlier, an action may or may not require additional payload.

In the example above, the `setUserName` object has `.payload` property (which is `"John Doe"`), because the action of setting the name of user requires payload – the new name. By contrast, the action of _logging out_ does not require any payload, so the `logOut` object does not have any additional properties.

# 2. Type-safety Roadmap
All this can be implemented in a type-safe manner, if implemented properly in a TypeScript application. One very useful fact that we will use heavily is that any action is uniquely identified by its type.

Let's imagine, what it might look like.

## 2.1 Action types
For **action types**, we might raise compile errors when the action type is unrecognized:

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

# 3. Quickstart
### TL;DR:

1. Create symbols for action types;
1. Create payload info;
1. Create useful generics;

***

## 3.1 Create symbols for action types
To add type-safety and start taking advantages from it, first we must have predefined both value and type for all action types in the application:

```ts
// this is the JavaScript string (value)
const SET_USER_NAME = "SET_USER_NAME";

// this is the TypeScript string literal (type)
type SET_USER_NAME = "SET_USER_NAME";

// ***

// this is the JavaScript string (value)
const LOG_OUT = "LOG_OUT";

// this is the TypeScript string literal (type)
type LOG_OUT = "LOG_OUT";
```

## 3.2 Create payload info
Then, for all the actions that require payload we have to specify its type:

```ts
const SET_USER_NAME = "SET_USER_NAME";
type SET_USER_NAME = "SET_USER_NAME";

// Let's throw in another action type for diversity
const SET_USER_AGE = "SET_USER_AGE";
type SET_USER_AGE = "SET_USER_AGE";

type PayloadMap = {
  // The "SET_USER_NAME" action requires string as a payload
  [SET_USER_NAME]: string;

  // The "SET_USER_AGE" action requires number as a payload
  [SET_USER_AGE]: number;
};

// ***

// I recommend keeping types of actions without
// payload apart from the ones with payload
const LOG_OUT = "LOG_OUT";
type LOG_OUT = "LOG_OUT";
```

## 3.3 Create useful generics
In the "**2. Type-safety Roadmap**" section, types `Action<…>`, `ActionCreator<…>` and `Payload<…>` are [generic types], while the `ActionType` is just a union of all strings that represent an action type. All these models have to be created.

### 3.3.1 ActionType

```ts
import { SET_USER_NAME, SET_USER_AGE, LOG_OUT, RELOAD_PAGE } from "./action-types";

// Types of actions with payload
// are accompanied with payload type
// (see section "3.2 Create payload info")
type PayloadMap = {
  [SET_USER_NAME]: string;
  [SET_USER_AGE]: number;
};

// Types of actions without payload
// are extracted and united explicitly
type ActionTypeWithoutPayload =
    | LOG_OUT
    | RELOAD_PAGE
    ;
```

```ts
import { ActionTypeFrom } from "typed-redux-actions";

export type ActionType =
    ActionTypeFrom<PayloadMap, ActionTypeWithoutPayload>;
```

The `ActionTypeFrom<…>` generic, provided by the `typed-redux-actions` package, creates union of all action types. It takes action types from keys of payload map and unites them with the string literal union of non-payloaded action types, provided as the second type parameter.

### 3.3.2 Action

```ts
import { ActionFrom } from "typed-redux-actions";

export type Action<Type extends ActionType> =
    ActionFrom<PayloadMap, ActionTypeWithoutPayload, Type>;
```

With the help of our newly created `ActionType` union along with `PayloadMap` and `ActionTypeWithoutPayload`, we create `Action<…>` generic. In the section "**2.2 Actions**", we described a constraint that helped us intercept errors while specifying action type. The `<Type extends ActionType>` part does exactly that.

### 3.3.3 ActionCreator

```ts
import { ActionCreatorFrom } from "typed-redux-actions";

export type ActionCreator<Type extends ActionType> =
    ActionCreatorFrom<PayloadMap, ActionTypeWithoutPayload, Type>;
```

This code is extremely similar to the one in the previous section. Again, we use previously created types, generics and symbols, but this time we define the `ActionCreator<…>` generic for action creators. It will have all the properties described in the section "**2.3 Action creators**".

### 3.3.4 Payload

```ts
import { PayloadFrom } from "typed-redux-actions";

export type Payload<Type extends ActionTypeFrom<PayloadMap>> =
    PayloadFrom<PayloadMap, Type>;
```

The `Payload<…>` generic shows slightly different picture, because it cares only about actions with payload. That's why we make more specific `ActionTypeFrom<PayloadMap>` instead of just `ActionType`, that also holds actions without payload.

See also [demo].

  [generic types]: https://www.typescriptlang.org/docs/handbook/generics.html
  [demo]: /docs/demo.ts