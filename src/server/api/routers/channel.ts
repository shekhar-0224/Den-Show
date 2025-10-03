import { TRPCError } from "@trpc/server";
import { desc, eq, ilike, or } from "drizzle-orm";
import z from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import {
  channelMetrics,
  streamDetails,
  streamMetrics,
} from "~/server/db/schema";
import { channelDetails } from "~/server/db/schema/channelDetails";
import { deployCreatorToken } from "~/server/lib/clanker";
import { createAndSetToken } from "~/server/lib/server-utils";

export const channelRouter = createTRPCRouter({
  searchChannels: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ ctx, input }) => {
      const channels = await ctx.db.query.channelDetails.findMany({
        where: or(
          ilike(channelDetails.name, `%${input.query}%`),
          ilike(channelDetails.handle, `%${input.query}%`)
        ),
        orderBy: desc(channelDetails.createdAt),
        columns: {
          id: true,
          name: true,
          handle: true,
          profileUrl: true,
          creatorTokenSymbol: true,
        },
      });

      return channels;
    }),

  getTrendingChannels: publicProcedure.query(async ({ ctx }) => {
    const channels = await ctx.db.query.channelDetails.findMany();
    return channels;
  }),

  getMyChannel: protectedProcedure.query(async ({ ctx }) => {
    const channel = await ctx.db.query.channelDetails.findFirst({
      where: eq(channelDetails.userId, ctx.user.userId),
    });
    return channel;
  }),

  getPublicChannelDetails: publicProcedure
    .input(
      z.object({
        handle: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const details = await ctx.db.query.channelDetails.findFirst({
        where: eq(channelDetails.handle, input.handle),
        with: {
          user: {
            columns: {
              xHandle: true,
              farcasterHandle: true,
              denWalletAddress: true,
            },
          },
        },
      });

      if (!details) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Channel not found",
        });
      }

      const metrics = await ctx.db.query.channelMetrics.findFirst({
        where: eq(channelMetrics.channelId, details.id),
      });

      if (!metrics) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Channel metrics not found",
        });
      }

      return {
        ...details,
        ...metrics,
      };
    }),

  getPublicChannelStreams: publicProcedure
    .input(z.object({ channelId: z.string() }))
    .query(async ({ ctx, input }) => {
      const streams = await ctx.db
        .select({
          streamId: streamDetails.id,
          title: streamDetails.title,
          thumbnailUrl: streamDetails.thumbnailUrl,
          createdAt: streamDetails.createdAt,
          startedAt: streamMetrics.startedAt,
          endedAt: streamMetrics.endedAt,
          channelName: channelDetails.name,
          channelProfileUrl: channelDetails.profileUrl,
          channelHandle: channelDetails.handle,
          views: streamMetrics.views,
        })
        .from(streamDetails)
        .innerJoin(streamMetrics, eq(streamDetails.id, streamMetrics.streamId))
        .innerJoin(
          channelDetails,
          eq(streamDetails.channelId, channelDetails.id)
        )
        .where(eq(streamDetails.channelId, input.channelId))
        .orderBy(desc(streamDetails.createdAt));

      return streams;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().nonempty(),
        bio: z.string(),
        handle: z.string(),
        nsfw: z.boolean(),
        bannerUrl: z.string().optional(),
        profileUrl: z.string().optional(),
        fanSubscriptionFee: z.number(),
        language: z.string(),
        token: z.object({
          isClanker: z.boolean(),
          address: z.string().optional(),
          symbol: z.string(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const {
        name,
        bio,
        handle,
        nsfw,
        bannerUrl,
        profileUrl,
        fanSubscriptionFee,
        token,
        language,
      } = input;

      let tokenAddress = "";

      try {
        if (token.isClanker) {
          const creatorTokenAddress = await deployCreatorToken({
            channelName: name,
            pfpUrl:
              profileUrl ??
              "https://den-lilac.vercel.app/images/default-channel-logo.png",
            creatorAddress: ctx.user.address,
            ticker: token.symbol,
          });

          if (!creatorTokenAddress) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to deploy creator token",
            });
          }

          tokenAddress = creatorTokenAddress;
        } else {
          const creatorTokenAddress = token.address;

          if (!creatorTokenAddress) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Token address is required",
            });
          }

          tokenAddress = creatorTokenAddress;
        }

        const [channel] = await ctx.db.transaction(async (tx) => {
          const channel = await tx
            .insert(channelDetails)
            .values({
              userId: ctx.user.userId,
              handle,
              name,
              bio,
              nsfw,
              bannerUrl,
              profileUrl,
              fanSubscriptionFee,
              creatorTokenAddress: tokenAddress,
              creatorTokenSymbol: token.symbol,
              language,
            })
            .returning();

          const insertedChannel = channel[0];

          if (!insertedChannel) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to create channel",
            });
          }

          const metrics = await tx
            .insert(channelMetrics)
            .values({
              channelId: insertedChannel.id,
              userId: ctx.user.userId,
            })
            .returning();

          const insertedMetrics = metrics[0];

          if (!insertedMetrics) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to create channel metrics",
            });
          }

          return [insertedChannel, insertedMetrics];
        });

        await createAndSetToken({
          address: ctx.user.address as `0x${string}`,
          userId: ctx.user.userId,
          username: ctx.user.username,
          channelId: channel.id,
        });

        return channel;
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create channel",
        });
      }
    }),

  checkIfHandleIsAvailable: publicProcedure
    .input(z.object({ handle: z.string() }))
    .query(async ({ ctx, input }) => {
      const channel = await ctx.db.query.channelDetails.findFirst({
        where: eq(channelDetails.handle, input.handle),
      });

      return !channel;
    }),
});
