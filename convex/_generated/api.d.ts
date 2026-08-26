/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as emails_joinRequest from "../emails/joinRequest.js";
import type * as events from "../events.js";
import type * as health from "../health.js";
import type * as joinRequests from "../joinRequests.js";
import type * as validaciones from "../validaciones.js";
import type * as workshops from "../workshops.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "emails/joinRequest": typeof emails_joinRequest;
  events: typeof events;
  health: typeof health;
  joinRequests: typeof joinRequests;
  validaciones: typeof validaciones;
  workshops: typeof workshops;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
