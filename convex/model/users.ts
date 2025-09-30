import type { QueryCtx } from "../_generated/server";

export const getUserFromCtx = async (ctx: QueryCtx) => {
  try {
    const userIdentity = await ctx.auth.getUserIdentity();

    console.log({ userIdentity });

    if (userIdentity === null) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_privyId", (q) =>
        q.eq("privyId", userIdentity.tokenIdentifier)
      )
      .first();

    return user;
  } catch (error) {
    console.log("Error parsing linked accounts:", error);
    return null;
  }
};
