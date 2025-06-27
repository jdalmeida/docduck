import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";

// Simple user registration
export const register = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, { email, password, name }) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (existingUser) {
      throw new ConvexError("User already exists");
    }

    // In a real app, you'd hash the password
    // For demo purposes, storing plaintext (NEVER do this in production)
    const userId = await ctx.db.insert("users", {
      email,
      password, // Hash this in production!
      name: name || email.split("@")[0],
      createdAt: Date.now(),
    });

    return { userId, email, name: name || email.split("@")[0] };
  },
});

// Simple user login
export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, { email, password }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (!user || user.password !== password) {
      throw new ConvexError("Invalid credentials");
    }

    return {
      userId: user._id,
      email: user.email,
      name: user.name,
    };
  },
});

// Get current user by ID
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }
    return {
      _id: user._id,
      email: user.email,
      name: user.name,
    };
  },
}); 