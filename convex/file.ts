import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getUserFromCtx } from "./utils/users";

export const generateUploadUrl = mutation({
  args: {
    size: v.number(),
    contentType: v.string(),
  },
  handler: async (ctx, args) => {
    const { size, contentType } = args;

    if (size > 1 * 1024 * 1024) {
      throw new Error("File size exceeds 1MB limit");
    }

    if (!["image/png", "image/jpeg", "image/gif"].includes(contentType)) {
      throw new Error("Unsupported file type");
    }

    const user = await getUserFromCtx(ctx);

    if (!user) {
      throw new Error("Not authenticated");
    }

    return await ctx.storage.generateUploadUrl();
  },
});
