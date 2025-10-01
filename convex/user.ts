import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { action, internalMutation, query } from "./_generated/server";
import { getUserFromCtx } from "./model/users";
import { linkedAccountsSchema } from "./validators";

export const getCurrentUser = query({
  handler: async (ctx) => {
    const user = await getUserFromCtx(ctx);

    return user;
  },
});

export const insertUser = internalMutation({
  args: {
    loginMethod: v.union(
      v.literal("email"),
      v.literal("farcaster"),
      v.literal("x")
    ),
    privyId: v.string(),
    username: v.string(),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("users", {
      loginMethod: args.loginMethod,
      privyId: args.privyId,
      username: args.username,
      email: args.email,
    });
  },
});

export const setupUser = action({
  handler: async (ctx) => {
    try {
      const userIdentity = await ctx.auth.getUserIdentity();

      console.log({ dsfsdfdsgs: userIdentity });

      if (!userIdentity || typeof userIdentity.subject !== "string") {
        return false;
      }

      const existingUser = await ctx.runQuery(api.user.getCurrentUser);

      if (existingUser) {
        return true;
      }

      const user = await fetch(
        `https://api.privy.io/v1/users/${userIdentity.subject}`,
        {
          method: "GET",
          headers: {
            Authorization: `Basic ${btoa(`${process.env.PRIVY_APP_ID}:${process.env.PRIVY_APP_SECRET}`)}`,
            "Content-Type": "application/json",
            "privy-app-id": process.env.PRIVY_APP_ID ?? "",
          },
        }
      )
        .then((res) => res.json())
        .then((data) => linkedAccountsSchema.parse(data?.linked_accounts));

      const email = user.find((account) => account.type === "email")?.address;

      const loginAcc = user.find((account) => account.type !== "wallet");

      if (!loginAcc) {
        throw new Error("No login account found");
      }

      const { type: loginMethod } = loginAcc;
      const username =
        // biome-ignore lint/style/noNonNullAssertion: its fine
        loginMethod === "email" ? email?.split("@")[0]! : loginAcc.username;

      await ctx.runMutation(internal.user.insertUser, {
        loginMethod: loginMethod === "twitter_oauth" ? "x" : loginMethod,
        privyId: userIdentity.subject,
        username,
        email,
      });

      return true;
    } catch (error) {
      console.error("Error in setupUser", error);
      return false;
    }
  },
});
