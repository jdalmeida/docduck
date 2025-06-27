import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createTask = mutation({
  args: {
    title: v.string(),
    documentId: v.optional(v.id("documents")),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.insert("tasks", {
      title: args.title,
      documentId: args.documentId,
      userId: args.userId,
      status: "pending",
    });

    return task;
  },
});

export const getTasks = query({
  args: {
    documentId: v.optional(v.id("documents")),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const query = ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", args.userId));

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
    userId: v.id("users"),
  },
  handler: async (ctx, { taskId, status, userId }) => {
    const task = await ctx.db.get(taskId);
    if (!task) throw new Error("Task not found");

    if (task.userId !== userId) {
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
    userId: v.id("users"),
  },
  handler: async (ctx, { taskId, title, userId }) => {
    const task = await ctx.db.get(taskId);
    if (!task) throw new Error("Task not found");

    if (task.userId !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(taskId, { title });
  },
});

export const deleteTask = mutation({
  args: {
    taskId: v.id("tasks"),
    userId: v.id("users"),
  },
  handler: async (ctx, { taskId, userId }) => {
    const task = await ctx.db.get(taskId);
    if (!task) throw new Error("Task not found");

    if (task.userId !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(taskId);
  },
}); 