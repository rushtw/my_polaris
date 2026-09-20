import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create1 = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("projects", {
      name: args.name,
      ownerId: identity.subject,
      importStatus: "importing",
    });
  },
});

export const get1 = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    return await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("ownerId"), identity.subject))
      .collect();
  },
});

