import { TRPCError } from "@trpc/server";
import { and, desc, eq, sum } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  channelDetails,
  channelMetrics,
  clips,
  tips,
  users,
} from "~/server/db/schema";

export const profileRouter = createTRPCRouter({
  getProfileDetails: protectedProcedure.query(async ({ ctx }) => {
    const meUser = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.user.userId),
    });

    if (!meUser) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    const myTips = await ctx.db
      .select({
        amountUSDC: sum(tips.amountUSDC),
      })
      .from(tips)
      .where(eq(tips.userId, ctx.user.userId));

    const myClips = await ctx.db
      .select()
      .from(clips)
      .where(eq(clips.userId, ctx.user.userId));

    return {
      email: meUser.email,
      username: meUser.username,
      xHandle: meUser.xHandle,
      farcasterHandle: meUser.farcasterHandle,
      xSubject: meUser.xSubject,
      fid: meUser.farcasterId,
      joinedOn: meUser.createdAt,
      // minutesWatched: undefined,
      tipped: Number(myTips[0]?.amountUSDC ?? 0.0),
      clips: myClips.length,
      // rank: undefined,
      // credibilityScore: ,
      // paidInSubscriptions: 100,
      // denEarned: 100,
      // tipsEarned: 100,
    };
  }),

  getMySubscriptions: protectedProcedure.query(async ({ ctx }) => {
    return [
      {
        channelDetails: {
          name: "Channel 1",
          profileUrl: "https://via.placeholder.com/150",
          bannerUrl: "https://via.placeholder.com/150",
        },
        channelMetrics: {
          fanCount: 100,
          videos: 100,
          rewardVault: 100,
        },
        subscription: {
          id: "1",
        },
      },
    ];
  }),
});
