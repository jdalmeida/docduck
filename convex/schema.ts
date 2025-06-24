import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  documents: defineTable({
    title: v.string(),
    userId: v.string(),
    content: v.optional(v.string()),
    isArchived: v.boolean(),
    parentDocument: v.optional(v.id("documents")),
    icon: v.optional(v.string()),
    coverImage: v.optional(v.string()),
  }).index("by_user", ["userId"]).index("by_user_parent", ["userId", "parentDocument"]),

  tasks: defineTable({
    title: v.string(),
    userId: v.string(),
    documentId: v.optional(v.id("documents")),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("completed")
    ),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  knowledge_articles: defineTable({
    title: v.string(),
    url: v.string(),
    source: v.string(),
    sourceId: v.string(),
    score: v.optional(v.number()),
  }).index("by_source_id", ["sourceId"]),
}); 