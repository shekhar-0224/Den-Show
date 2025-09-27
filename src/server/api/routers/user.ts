import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { AccessToken } from "livekit-server-sdk";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { env } from "~/env";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { streamMetrics, users } from "~/server/db/schema";

export const userRouter = createTRPCRouter({
  me: protectedProcedure.query(async ({ ctx }) => {
    return ctx.user;
  }),

  linkEmail: protectedProcedure
    .input(z.object({ email: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db
        .update(users)
        .set({ email: input.email })
        .where(eq(users.id, ctx.user.userId));

      return user;
    }),

  linkSocialAccount: protectedProcedure
    .input(
      z.object({
        type: z.enum(["twitter", "farcaster"]),
        id: z.string(),
        username: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.type === "twitter") {
        const user = await ctx.db
          .update(users)
          .set({
            xSubject: input.id,
            xHandle: input.username,
          })
          .where(eq(users.id, ctx.user.userId));

        return user;
      }
      if (input.type === "farcaster") {
        const user = await ctx.db
          .update(users)
          .set({
            farcasterId: input.id,
            farcasterHandle: input.username,
          })
          .where(eq(users.id, ctx.user.userId));

        return user;
      }

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid type",
      });
    }),

  createRoomToken: publicProcedure
    .input(
      z.object({
        room: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const room = input.room;

      let displayName = ctx.user?.username ?? `Guest-${uuidv4()}`;

      if (ctx.user?.channelId) {
        // use channel name for stream owner
        const stream = await ctx.db.query.streamMetrics.findFirst({
          where: eq(streamMetrics.id, room),
          with: {
            channel: true,
          },
        });
        if (stream?.channelId === ctx.user?.channelId) {
          displayName = stream?.channel?.name;
        }
      }

      const at = new AccessToken(env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET, {
        identity: displayName,
        metadata: JSON.stringify({
          color: `#${Math.floor(Math.random() * 16777215)
            .toString(16)
            .padStart(6, "0")}`,
        }),
      });

      at.addGrant({
        room,
        roomJoin: true,
        canPublish: false,
        canSubscribe: true,
        canPublishData: !!ctx.user?.userId,
      });

      const token = await at.toJwt();

      return token;
    }),
});
