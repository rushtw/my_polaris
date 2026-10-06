import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    name: v.string(),
    ownerId: v.string(),
    updatedAt: v.number(),
    // Only set for projects imported from GitHub (Phase 2)
    importStatus: v.optional(
      v.union(v.literal("importing"), v.literal("completed"), v.literal("failed")),
    ),
  })
    // Finds one user's projects, sorted by last update.
    // Named by_owner like Polaris, so its queries work unchanged.
    .index("by_owner", ["ownerId", "updatedAt"]),
});
