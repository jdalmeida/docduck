import { internalQuery } from "./_generated/server";
import { getAuthSessionId } from "@convex-dev/auth/server"; 

export const get = internalQuery({
  args: {},
  handler: async (ctx) => {
    const session = await getAuthSessionId(ctx);
    if (!session) {
      return null;
    }
    return session;
  },
}); 