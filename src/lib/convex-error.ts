import { ConvexError } from "convex/values";

// A readable message for a failed Convex call. Messages thrown on the server with
// `new ConvexError("...")` reach the browser as-is; any other error is generic.
export const getErrorMessage = (error: unknown) =>
  error instanceof ConvexError ? String(error.data) : "Something went wrong. Please try again.";
