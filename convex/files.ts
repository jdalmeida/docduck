import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Generate a short-lived upload URL.
export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

// Get the URL of a file from its storage ID.
export const getUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
}); 