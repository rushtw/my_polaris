import { MutationCtx, QueryCtx } from "./_generated/server";

// Shared sign-in check: every query and mutation starts with this.
// Returns the signed-in user's identity (identity.subject is the Clerk user ID).
export const verifyAuth = async (ctx: QueryCtx | MutationCtx) => {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Unauthorized");
  }

  return identity;
};
