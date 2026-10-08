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

  // Files AND folders of every project, as one tree: parentId points to the
  // containing folder (no parentId = the project's root)
  files: defineTable({
    projectId: v.id("projects"),
    parentId: v.optional(v.id("files")),
    name: v.string(),
    type: v.union(v.literal("file"), v.literal("folder")),
    content: v.optional(v.string()), // text files only
    storageId: v.optional(v.id("_storage")), // binary files only (GitHub import, later)
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"]) // all files of a project
    .index("by_parent", ["parentId"]) // children of a folder
    .index("by_project_parent", ["projectId", "parentId"]), // one folder's contents in a project
});
