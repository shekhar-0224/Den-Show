import { mutation } from "./_generated/server";
import { getUserFromCtx } from "./utils/users";

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const user = await getUserFromCtx(ctx);

    if (!user) {
      throw new Error("Not authenticated");
    }

    return await ctx.storage.generateUploadUrl();
  },
});
