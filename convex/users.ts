import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const me = query({
  args: {},
  handler: async (ctx) => {
    try {
      const userId = await getAuthUserId(ctx);
      if (!userId) {
        return null;
      }
      
      // Return the user ID since Convex Auth manages the user data
      return { _id: userId };
    } catch (error) {
      console.error("Error in me query:", error);
      return null;
    }
  },
}); 