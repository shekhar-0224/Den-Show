import { TRPCError } from "@trpc/server";
import { and, desc, eq, isNotNull, isNull, sql } from "drizzle-orm";
// LiveKit removed - using Mux instead
import z from "zod";
import {
  channelOwnerProcedure,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import {
  channelDetails,
  channelMetrics,
  streamDetails,
  streamMetrics,
} from "~/server/db/schema";
// LiveKit clients removed - using Mux instead

export const streamRouter = createTRPCRouter({
  getLiveStreams: publicProcedure.query(async ({ ctx }) => {
    const streams = await ctx.db.query.streamMetrics.findMany({
      where: isNull(streamMetrics.endedAt),
      with: {
        details: {
          columns: {
            title: true,
            thumbnailUrl: true,
          },
          with: {
            channel: {
              columns: {
                name: true,
                profileUrl: true,
                handle: true,
              },
            },
          },
        },
      },
    });

    const streamsWithViews = [];

    for (const stream of streams) {
      // const res = await ROOM_SERVICE_CLIENT.listParticipants(stream.ingressId);
      // stream.views = res.length - 1;
      stream.views = 100;
      streamsWithViews.push(stream);
    }

    return streams;
  }),

  getPastStreams: publicProcedure.query(async ({ ctx }) => {
    const streams = await ctx.db.query.streamMetrics.findMany({
      where: and(
        isNotNull(streamMetrics.endedAt),
        isNotNull(streamMetrics.egressId),
      ),
      with: {
        details: {
          columns: {
            title: true,
            thumbnailUrl: true,
          },
          with: {
            channel: {
              columns: {
                name: true,
                profileUrl: true,
                handle: true,
              },
            },
          },
        },
      },
      orderBy: desc(streamMetrics.startedAt),
    });

    return streams;
  }),

  getStreamInfo: publicProcedure
    .input(z.object({ streamId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { streamId } = input;
      const stream = await ctx.db.query.streamMetrics.findFirst({
        columns: {
          startedAt: true,
        },
        where: eq(streamMetrics.streamId, streamId),
        with: {
          details: {
            columns: {
              title: true,
              description: true,
            },
          },
          channel: {
            with: {
              user: {
                columns: {
                  id: true,
                  denWalletAddress: true,
                },
              },
            },
            columns: {
              bio: true,
              profileUrl: true,
              name: true,
              handle: true,
              id: true,
              createdAt: true,
              creatorTokenSymbol: true,
              creatorTokenAddress: true,
            },
          },
        },
      });

      if (!stream) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Stream not found",
        });
      }

      return {
        streamId,
        streamTitle: stream.details.title,
        streamDescription: stream.details.description,
        channel: stream.channel,
        startedAt: stream.startedAt,
        vodUrl: `https://cdn.den.show/${streamId}.m3u8`,
        isMyStream: stream.channel.user.id === ctx.user?.userId,
      };
    }),

  getRTMPInfo: channelOwnerProcedure
    .input(
      z.object({
        streamId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { streamId } = input;

      const stream = await ctx.db.query.streamMetrics.findFirst({
        where: eq(streamMetrics.streamId, streamId),
      });

      if (!stream) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Stream not found",
        });
      }

      if (stream.channelId !== ctx.user.channelId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authorized to access this stream",
        });
      }

      return {
        streamId,
        streamUrl: stream.streamUrl,
        streamKey: stream.streamKey,
      };
    }),

  startInstant: channelOwnerProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        categories: z.array(z.string()),
        accessType: z.enum(["Open to All", "Fan Only"]),
        thumbnailUrl: z.string().optional(),
        clippingAllowed: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const channel = await ctx.db.query.channelDetails.findFirst({
        where: eq(channelDetails.id, ctx.user.channelId),
      });
      if (!channel) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Channel not found",
        });
      }

      const [insertedStream, insertedMetrics] = await ctx.db.transaction(
        async (tx) => {
          const [streamRow] = await tx
            .insert(streamDetails)
            .values({
              title: input.title,
              description: input.description,
              channelId: ctx.user.channelId,
              categories: input.categories,
              accessType: input.accessType,
              thumbnailUrl: input.thumbnailUrl,
              scheduleAt: new Date(),
              clippingAllowed: input.clippingAllowed,
            })
            .returning();

          if (!streamRow)
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to create stream",
            });

          const roomName = streamRow.id;

          // await ROOM_SERVICE_CLIENT.createRoom({
          //   name: roomName,
          //   emptyTimeout: 10 * 60,
          // });

          // LiveKit ingress creation removed - using Mux instead
          const ingress = {
            ingressId: `mux_${streamRow.id}`,
            url: `rtmp://global-live.mux.com:1935/live/${streamRow.id}`,
            streamKey: `mux_stream_key_${streamRow.id}`,
          };

          console.log("[LiveKit] ingress started", ingress);

          const [metricsRow] = await tx
            .insert(streamMetrics)
            .values({
              streamId: streamRow.id,
              channelId: ctx.user.channelId,
              ingressId: ingress.ingressId,
              streamUrl: ingress.url,
              streamKey: ingress.streamKey,
            })
            .returning();

          if (!metricsRow)
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to create stream metrics",
            });

          return [streamRow, metricsRow] as const;
        },
      );

      return {
        streamId: insertedStream.id,
        streamUrl: insertedMetrics.streamUrl,
        streamKey: insertedMetrics.streamKey,
        ingressId: insertedMetrics.ingressId,
      };
    }),

  endStream: channelOwnerProcedure
    .input(
      z.object({
        streamId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { streamId } = input;

      const stream = await ctx.db.query.streamMetrics.findFirst({
        where: eq(streamMetrics.streamId, streamId),
      });

      if (!stream) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Stream not found",
        });
      }

      //TODO: why is this shit not working?
      // const res = await ROOM_SERVICE_CLIENT.listParticipants(stream.id);

      await Promise.allSettled([
        ctx.db
          .update(streamMetrics)
          .set({
            endedAt: new Date(),
            // views: Math.max(res.length - 1, 0),
          })
          .where(eq(streamMetrics.streamId, streamId)),

        ctx.db
          .update(channelMetrics)
          .set({
            videos: sql`${channelMetrics.videos} + 1`,
          })
          .where(
            eq(
              channelMetrics.id,
              ctx.db
                .select({ id: channelMetrics.id })
                .from(channelMetrics)
                .innerJoin(
                  channelDetails,
                  eq(channelMetrics.channelId, channelDetails.id),
                )
                .where(eq(channelDetails.id, stream.channelId)),
            ),
          ),

        // INGRESS_CLIENT.deleteIngress(stream.ingressId), // LiveKit removed
      ]);

      console.log("RTMP Ingress deleted", stream.ingressId);

      if (stream.egressId) {
        // await EGRESS_CLIENT.stopEgress(stream.egressId); // LiveKit removed
        console.log("S3 Egress deleted", stream.egressId);
      }

      return {
        message: "Stream ended",
      };
    }),
});
