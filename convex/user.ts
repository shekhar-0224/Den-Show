import { query } from "./_generated/server";
import { getUserFromCtx } from "./model/users";

export const getCurrentUser = query({
  handler: async (ctx) => {
    const user = await getUserFromCtx(ctx);
    return user;
  },
});
