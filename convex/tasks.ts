import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createTask = mutation({
  args: {
    title: v.string(),
    documentId: v.optional(v.id("documents")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const task = await ctx.db.insert("tasks", {
      title: args.title,
      documentId: args.documentId,
      userId,
      status: "pending",
    });

    return task;
  },
});

export const getTasks = query({
  args: {
    documentId: v.optional(v.id("documents")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const query = ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId));

    if (args.documentId) {
      return await query
        .filter((q) => q.eq(q.field("documentId"), args.documentId))
        .collect();
    }

    return await query.collect();
  },
});

export const updateTaskStatus = mutation({
  args: {
    taskId: v.id("tasks"),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("completed")
    ),
  },
  handler: async (ctx, { taskId, status }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const task = await ctx.db.get(taskId);
    if (!task) throw new Error("Task not found");

    if (task.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    const patch: Partial<typeof task> = { status };

    if (status === "in_progress" && task.status !== "in_progress") {
      patch.startTime = Date.now();
      patch.endTime = undefined;
    } else if (status === "completed" && task.status === "in_progress") {
      patch.endTime = Date.now();
    } else if (status === "pending") {
      patch.startTime = undefined;
      patch.endTime = undefined;
    }

    await ctx.db.patch(taskId, patch);
  },
});

export const updateTaskTitle = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.string(),
  },
  handler: async (ctx, { taskId, title }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const task = await ctx.db.get(taskId);
    if (!task) throw new Error("Task not found");

    if (task.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(taskId, { title });
  },
});

export const deleteTask = mutation({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, { taskId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const task = await ctx.db.get(taskId);
    if (!task) throw new Error("Task not found");

    if (task.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(taskId);
  },
}); 