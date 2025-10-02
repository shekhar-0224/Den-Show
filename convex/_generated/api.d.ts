/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as channel from "../channel.js";
import type * as file from "../file.js";
import type * as http from "../http.js";
import type * as mux from "../mux.js";
import type * as stream from "../stream.js";
import type * as token from "../token.js";
import type * as user from "../user.js";
import type * as utils_env from "../utils/env.js";
import type * as utils_users from "../utils/users.js";
import type * as validators from "../validators.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  channel: typeof channel;
  file: typeof file;
  http: typeof http;
  mux: typeof mux;
  stream: typeof stream;
  token: typeof token;
  user: typeof user;
  "utils/env": typeof utils_env;
  "utils/users": typeof utils_users;
  validators: typeof validators;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
