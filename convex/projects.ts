import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { verifyAuth } from "./auth";

export const create = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await verifyAuth(ctx);

    const projectId = await ctx.db.insert("projects", {
      name: args.name,
      ownerId: identity.subject,
      updatedAt: Date.now(),
    });

    return projectId;
  },
});

// All of the user's projects, most recently updated first
export const get = query({
  args: {},
  handler: async (ctx) => {
    const identity = await verifyAuth(ctx);

    return await ctx.db
      .query("projects")
      .withIndex("by_owner", (q) => q.eq("ownerId", identity.subject))
      .order("desc")
      .collect();
  },
});

// One project by ID, only if it belongs to the signed-in user.
// The ID comes from the URL, so it's a plain string: an invalid ID, a missing
// project, or someone else's project all return null (without saying which).
export const getById = query({
  args: {
    id: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await verifyAuth(ctx);

    const projectId = ctx.db.normalizeId("projects", args.id);
    if (!projectId) return null; // not a valid project ID, e.g. /projects/banana

    const project = await ctx.db.get(projectId);
    if (!project || project.ownerId !== identity.subject) return null;

    return project;
  },
});

// Only the `limit` most recently updated projects
export const getPartial = query({
  args: {
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await verifyAuth(ctx);

    return await ctx.db
      .query("projects")
      .withIndex("by_owner", (q) => q.eq("ownerId", identity.subject))
      .order("desc")
      .take(args.limit);
  },
});
