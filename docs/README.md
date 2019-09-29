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

1. Raise compile errors when the **action type** is unrecognized or misspelled:

```ts
const actionType: ActionType = "SET_NAME";
//    ^^^^^^^^^^
// [ts] Type '"SET_NAME"' is not assignable to type '"SET_USER_NAME" | "LOG_OUT"'.
```

```ts
const action: Action<"SET_NAME"> = {};
//                   ^^^^^^^^^^
// [ts] Type '"SET_NAME"' is not assignable to type '"SET_USER_NAME" | "LOG_OUT"'.
```

1. Both type and payload of an **action** should be constrained properly:

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

1. Similar constraints would be useful while working with **action creators**:

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
```

Also, one might use the following more thorough approach (though I prefer the previous one, for its visual beauty):

```ts
const SET_USER_NAME = "SET_USER_NAME";
type SET_USER_NAME = typeof SET_USER_NAME;
```

Let's throw in another couple of action types for diversity:

```ts
const SET_USER_AGE = "SET_USER_AGE";
type SET_USER_AGE = "SET_USER_AGE";

const LOG_OUT = "LOG_OUT";
type LOG_OUT = "LOG_OUT";
```

## 3.2 Create payload info
Then, for all the actions we have to specify its type. The mapping of action type to payload type is done using an interface or an object-like type. The important part is that if an action does not require a payload, it is indicated by setting its payload type to `never`:

```ts
type PayloadMap = {
    // The "SET_USER_NAME" action requires string as a payload
    [SET_USER_NAME]: string;

    // The "SET_USER_AGE" action requires number as a payload
    [SET_USER_AGE]: number;

    // The "LOG_OUT" action never requires any payload
    [LOG_OUT]: never;
};
```

I recommend keeping visual distance between types of payloaded actions and non-payloaded ones. Defining payload map using `interface` instead of a `type` might help with this, because interfaces are open and can be altered in consequent definitions:

```ts
// Actions with a payload
interface PayloadMap {
    [SET_USER_NAME]: string;
    [SET_USER_AGE]: number;
}

// Actions without payload
interface PayloadMap {
    [LOG_OUT]: never;
}
```

## 3.3 Create useful generics
In the "**2. Type-safety Roadmap**" section, types `Action<…>`, and `ActionCreator<…>` are [generic types]. In order to create these models, the `@parzh/typed-redux-actions` package provides a creator for each: `ActionFrom<…>`, and `ActionCreatorFrom<…>`. Both utilities obey the same scheme of type parameters:

```ts
// preudocode
type _From<PayloadMap extends object, Type extends keyof PayloadMap>
```

### 3.3.1 ActionType

First, defining the `ActionType` type would help a lot in the future. It should be a union of all string literals, by which actions types are represented:

```ts
export type ActionType = keyof PayloadMap;
```

Alternatively, the `ActionTypeFrom` utility could be used, though it basically does the same thing:

```ts
import { ActionTypeFrom } from "@parzh/typed-redux-actions";

export type ActionType =
    ActionTypeFrom<PayloadMap>;
```

### 3.3.2 Action

We create `Action<…>` generic, using `ActionFrom<…>` utility:

```ts
import { ActionFrom } from "@parzh/typed-redux-actions";

export type Action<Type extends ActionType> =
    ActionFrom<PayloadMap, Type>;
```

### 3.3.3 ActionCreator

This code is extremely similar to the one in the previous section:

```ts
import { ActionCreatorFrom } from "@parzh/typed-redux-actions";

export type ActionCreator<Type extends ActionType> =
    ActionCreatorFrom<PayloadMap, Type>;
```

To view these models in action, see [demo].

  [generic types]: https://www.typescriptlang.org/docs/handbook/generics.html
  [demo]: /docs/demo.ts
