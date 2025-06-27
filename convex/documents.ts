import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getSidebar = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user_parent", (q) =>
        q.eq("userId", args.userId).eq("parentDocument", undefined)
      )
      .filter((q) => q.eq(q.field("isArchived"), false))
      .order("desc")
      .collect();

    return documents;
  },
});

export const getChildren = query({
  args: {
    parentDocument: v.id("documents"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user_parent", (q) =>
        q.eq("userId", args.userId).eq("parentDocument", args.parentDocument)
      )
      .filter((q) => q.eq(q.field("isArchived"), false))
      .order("desc")
      .collect();

    return documents;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    parentDocument: v.optional(v.id("documents")),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const document = await ctx.db.insert("documents", {
      title: args.title,
      userId: args.userId,
      isArchived: false,
      parentDocument: args.parentDocument,
    });

    return document;
  },
});

export const createWithContent = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const document = await ctx.db.insert("documents", {
      title: args.title,
      content: args.content,
      userId: args.userId,
      isArchived: false,
    });

    return document;
  },
});

export const getById = query({
  args: { 
    documentId: v.id("documents"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId);

    if (!document) {
      throw new Error("Not found");
    }

    if (document.userId !== args.userId) {
      throw new Error("Unauthorized");
    }

    return document;
  },
});

export const update = mutation({
  args: {
    id: v.id("documents"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    icon: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { id, userId, ...rest } = args;

    const existingDocument = await ctx.db.get(id);

    if (!existingDocument) {
      throw new Error("Not found");
    }

    if (existingDocument.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const document = await ctx.db.patch(id, {
      ...rest,
    });

    return document;
  },
});

export const removeCoverImage = mutation({
  args: { 
    id: v.id("documents"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existingDocument = await ctx.db.get(args.id);

    if (!existingDocument) {
      throw new Error("Not found");
    }

    if (existingDocument.userId !== args.userId) {
      throw new Error("Unauthorized");
    }
    
    if (existingDocument.coverImage) {
      await ctx.storage.delete(existingDocument.coverImage);
    }

    const document = await ctx.db.patch(args.id, {
      coverImage: undefined,
    });

    return document;
  }
});

export const archive = mutation({
  args: { 
    id: v.id("documents"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existingDocument = await ctx.db.get(args.id);

    if (!existingDocument) {
      throw new Error("Not found");
    }

    if (existingDocument.userId !== args.userId) {
      throw new Error("Unauthorized");
    }

    const recursiveArchive = async (documentId: typeof args.id) => {
      const children = await ctx.db
        .query("documents")
        .withIndex("by_user_parent", (q) =>
          q.eq("userId", args.userId).eq("parentDocument", documentId)
        )
        .collect();

      for (const child of children) {
        await ctx.db.patch(child._id, {
          isArchived: true,
        });

        await recursiveArchive(child._id);
      }
    };

    const document = await ctx.db.patch(args.id, {
      isArchived: true,
    });

    await recursiveArchive(args.id);

    return document;
  },
});

export const getGraph = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isArchived"), false))
      .collect();

    return documents;
  },
}); 