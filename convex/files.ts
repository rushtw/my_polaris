import { ConvexError, v } from "convex/values";

import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { verifyAuth } from "./auth";

// Shared check: the signed-in user must own the project. Returns the project.
const getOwnedProject = async (ctx: QueryCtx | MutationCtx, projectId: Id<"projects">) => {
  const identity = await verifyAuth(ctx);
  const project = await ctx.db.get(projectId);
  if (!project || project.ownerId !== identity.subject) {
    throw new Error("Project not found");
  }
  return project;
};

// All items of one folder (no parentId = the project's root)
const getChildren = (
  ctx: QueryCtx | MutationCtx,
  projectId: Id<"projects">,
  parentId: Id<"files"> | undefined,
) =>
  ctx.db
    .query("files")
    .withIndex("by_project_parent", (q) => q.eq("projectId", projectId).eq("parentId", parentId))
    .collect();

// Rejects a second file (or folder) with the same name in the same folder.
// ConvexError carries a readable message to the browser.
const assertNameIsFree = async (
  ctx: MutationCtx,
  projectId: Id<"projects">,
  parentId: Id<"files"> | undefined,
  name: string,
  type: "file" | "folder",
  ignoreId?: Id<"files">,
) => {
  const siblings = await getChildren(ctx, projectId, parentId);
  const taken = siblings.some((s) => s.name === name && s.type === type && s._id !== ignoreId);
  if (taken) {
    throw new ConvexError(`A ${type} named "${name}" already exists here`);
  }
};

// Any change to a file also counts as a change to its project
// (keeps the landing list order and the Navbar's "Saved … ago" correct)
const touchProject = (ctx: MutationCtx, projectId: Id<"projects">, now: number) =>
  ctx.db.patch(projectId, { updatedAt: now });

// A file the signed-in user may see, or null (missing, deleted, or someone else's).
// Returning null instead of throwing keeps an editor tab of a deleted file from crashing.
const getOwnedFileOrNull = async (ctx: QueryCtx | MutationCtx, fileId: Id<"files">) => {
  const identity = await verifyAuth(ctx);
  const file = await ctx.db.get(fileId);
  if (!file) return null;
  const project = await ctx.db.get(file.projectId);
  if (!project || project.ownerId !== identity.subject) return null;
  return file;
};

// All files and folders of a project (used by the preview, Chapter 14)
export const getFiles = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    await getOwnedProject(ctx, args.projectId);
    return await ctx.db
      .query("files")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

// One file with its content (the editor), or null if it no longer exists
export const getFile = query({
  args: { id: v.id("files") },
  handler: async (ctx, args) => {
    return await getOwnedFileOrNull(ctx, args.id);
  },
});

// The path from the root down to a file, for breadcrumbs, by walking up parentId:
// e.g. [{ name: "src" }, { name: "app" }, { name: "page.tsx" }]. null if the file is gone.
export const getFilePath = query({
  args: { id: v.id("files") },
  handler: async (ctx, args) => {
    const file = await getOwnedFileOrNull(ctx, args.id);
    if (!file) return null;

    const path: { _id: Id<"files">; name: string }[] = [];
    let current: typeof file | null = file;
    while (current) {
      path.unshift({ _id: current._id, name: current.name });
      current = current.parentId ? await ctx.db.get(current.parentId) : null;
    }
    return path;
  },
});

// Save a text file's content (the editor's auto-save)
export const updateFile = mutation({
  args: {
    id: v.id("files"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const file = await getOwnedFileOrNull(ctx, args.id);
    if (!file) throw new Error("File not found");

    const now = Date.now();
    await ctx.db.patch(args.id, { content: args.content, updatedAt: now });
    await touchProject(ctx, file.projectId, now);
  },
});

// One folder's contents, sorted: folders first, then files, each alphabetically
export const getFolderContents = query({
  args: {
    projectId: v.id("projects"),
    parentId: v.optional(v.id("files")),
  },
  handler: async (ctx, args) => {
    await getOwnedProject(ctx, args.projectId);
    const items = await getChildren(ctx, args.projectId, args.parentId);

    return items.sort((a, b) => {
      if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  },
});

export const createFile = mutation({
  args: {
    projectId: v.id("projects"),
    parentId: v.optional(v.id("files")),
    name: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await getOwnedProject(ctx, args.projectId);
    await assertNameIsFree(ctx, args.projectId, args.parentId, args.name, "file");

    const now = Date.now();
    await ctx.db.insert("files", {
      projectId: args.projectId,
      parentId: args.parentId,
      name: args.name,
      type: "file",
      content: args.content,
      updatedAt: now,
    });
    await touchProject(ctx, args.projectId, now);
  },
});

export const createFolder = mutation({
  args: {
    projectId: v.id("projects"),
    parentId: v.optional(v.id("files")),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    await getOwnedProject(ctx, args.projectId);
    await assertNameIsFree(ctx, args.projectId, args.parentId, args.name, "folder");

    const now = Date.now();
    await ctx.db.insert("files", {
      projectId: args.projectId,
      parentId: args.parentId,
      name: args.name,
      type: "folder",
      updatedAt: now,
    });
    await touchProject(ctx, args.projectId, now);
  },
});

export const renameFile = mutation({
  args: {
    id: v.id("files"),
    newName: v.string(),
  },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.id);
    if (!file) throw new Error("File not found");
    await getOwnedProject(ctx, file.projectId);
    await assertNameIsFree(ctx, file.projectId, file.parentId, args.newName, file.type, file._id);

    const now = Date.now();
    await ctx.db.patch(args.id, { name: args.newName, updatedAt: now });
    await touchProject(ctx, file.projectId, now);
  },
});

// Deletes a file, or a folder together with everything inside it
export const deleteFile = mutation({
  args: {
    id: v.id("files"),
  },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.id);
    if (!file) throw new Error("File not found");
    await getOwnedProject(ctx, file.projectId);

    // Recursive: delete a folder's children (and their children…) first
    const deleteRecursive = async (fileId: Id<"files">) => {
      const item = await ctx.db.get(fileId);
      if (!item) return;

      if (item.type === "folder") {
        for (const child of await getChildren(ctx, item.projectId, fileId)) {
          await deleteRecursive(child._id);
        }
      }
      if (item.storageId) {
        await ctx.storage.delete(item.storageId); // binary content, if any
      }
      await ctx.db.delete(fileId);
    };

    await deleteRecursive(args.id);
    await touchProject(ctx, file.projectId, Date.now());
  },
});
