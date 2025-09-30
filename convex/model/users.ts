import type { QueryCtx } from "../_generated/server";

export async function getUserFromCtx(ctx: QueryCtx) {
  const userIdentity = await ctx.auth.getUserIdentity();

  console.log({ userIdentity });

  if (userIdentity === null) {
    return "DED";
  }
  // const user = await ctx.db.get("users", userIdentity.id);

  const user = "gg";

  return user;
}
