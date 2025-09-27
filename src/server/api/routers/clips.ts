import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { clips, streamMetrics } from "~/server/db/schema";

export const clipsRouter = createTRPCRouter({
  getClipById: publicProcedure
    .input(z.object({ clipId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.clips.findFirst({
        where: eq(clips.id, input.clipId),
        with: {
          stream: {
            columns: {
              id: true,
              title: true,
              description: true,
            },
            with: {
              channel: {
                columns: {
                  name: true,
                  id: true,
                  createdAt: true,
                  profileUrl: true,
                  bio: true,
                  handle: true,
                  creatorTokenAddress: true,
                  creatorTokenSymbol: true,
                },
                with: {
                  user: {
                    columns: {
                      denWalletAddress: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    }),

  getClipsByUser: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.clips.findMany({
      where: eq(clips.userId, ctx.user.userId),
      with: {
        stream: {
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
  }),

  // createClipFromDuration: protectedProcedure
  //   .input(
  //     z.object({
  //       streamId: z.string().uuid(),
  //       durationSeconds: z.number().positive().max(300),
  //       title: z.string().min(1).max(255).optional(),
  //       clickedAt: z.string().datetime().optional(),
  //       thumbnailUrl: z.string().optional(),
  //     }),
  //   )
  //   .mutation(async ({ ctx, input }) => {
  //     const { streamId, durationSeconds, title, clickedAt, thumbnailUrl } =
  //       input;

  //     console.log("thumbnailUrl", thumbnailUrl);

  //     const stream = await ctx.db.query.streamMetrics.findFirst({
  //       where: eq(streamMetrics.streamId, streamId),
  //     });

  //     if (!stream || !stream.startedAt) {
  //       throw new TRPCError({
  //         code: "NOT_FOUND",
  //         message: "Stream not found or hasn't started",
  //       });
  //     }

  //     const streamStartTime = stream.startedAt;

  //     const referenceTime = clickedAt ? new Date(clickedAt) : new Date();
  //     const totalElapsedSeconds =
  //       (referenceTime.getTime() - stream.startedAt.getTime()) / 1000;

  //     const clipEndTime = totalElapsedSeconds;
  //     const clipStartTime = Math.max(0, clipEndTime - durationSeconds);

  //     const startSegmentIndex = Math.floor(clipStartTime / 2);

  //     const segmentsNeeded = Math.ceil(durationSeconds / 2);
  //     const endSegmentIndex = startSegmentIndex + segmentsNeeded - 1;

  //     const startOffset = clipStartTime % 2;
  //     const endOffset = (clipStartTime + durationSeconds) % 2;

  //     const clipStartTimestamp = new Date(
  //       streamStartTime.getTime() + clipStartTime * 1000,
  //     );
  //     const clipEndTimestamp = new Date(
  //       streamStartTime.getTime() + clipEndTime * 1000,
  //     );

  //     const [newClip] = await ctx.db
  //       .insert(clips)
  //       .values({
  //         userId: ctx.user.userId,
  //         streamId,
  //         startTimestamp: clipStartTimestamp,
  //         endTimestamp: clipEndTimestamp,
  //         startSegmentIndex,
  //         endSegmentIndex,
  //         startOffset,
  //         endOffset,
  //         title: title || `${durationSeconds}s clip`,
  //         thumbnailUrl,
  //       })
  //       .returning();

  //     return newClip;
  //   }),

  // createClipFromTimeRange: protectedProcedure
  //   .input(
  //     z.object({
  //       streamId: z.string().uuid(),
  //       startTimeSeconds: z.number().min(0),
  //       endTimeSeconds: z.number().positive(),
  //       title: z.string().min(1).max(255).optional(),
  //       windowStartPosition: z.number().min(0), // The absolute start position of the trimmer window
  //       windowEndPosition: z.number().positive(), // The absolute end position of the trimmer window
  //       thumbnailUrl: z.string().optional(),
  //     }),
  //   )
  //   .mutation(async ({ ctx, input }) => {
  //     const {
  //       streamId,
  //       startTimeSeconds,
  //       endTimeSeconds,
  //       title,
  //       windowStartPosition,
  //       windowEndPosition,
  //       thumbnailUrl,
  //     } = input;

  //     console.log("Creating clip with params:", {
  //       streamId,
  //       startTimeSeconds,
  //       endTimeSeconds,
  //       windowStartPosition,
  //       windowEndPosition,
  //       title,
  //     });

  //     // Validate that end time is after start time
  //     if (endTimeSeconds <= startTimeSeconds) {
  //       throw new TRPCError({
  //         code: "BAD_REQUEST",
  //         message: "End time must be after start time",
  //       });
  //     }

  //     const durationSeconds = endTimeSeconds - startTimeSeconds;

  //     // Validate duration doesn't exceed 5 minutes
  //     if (durationSeconds > 300) {
  //       throw new TRPCError({
  //         code: "BAD_REQUEST",
  //         message: "Clip duration cannot exceed 5 minutes",
  //       });
  //     }

  //     const stream = await ctx.db.query.streamMetrics.findFirst({
  //       where: eq(streamMetrics.streamId, streamId),
  //     });

  //     if (!stream || !stream.startedAt) {
  //       throw new TRPCError({
  //         code: "NOT_FOUND",
  //         message: "Stream not found or hasn't started",
  //       });
  //     }

  //     const streamStartTime = stream.startedAt;

  //     // Convert trimmer selection to absolute stream times
  //     // The frontend passes us the exact window positions, so we can directly calculate
  //     const clipStartTime = windowStartPosition + startTimeSeconds;
  //     const clipEndTime = windowStartPosition + endTimeSeconds;

  //     console.log("Final clip times:", {
  //       clipStartTime,
  //       clipEndTime,
  //       duration: clipEndTime - clipStartTime,
  //     });

  //     // Validate the final clip makes sense
  //     if (clipEndTime <= clipStartTime) {
  //       throw new TRPCError({
  //         code: "BAD_REQUEST",
  //         message: "Invalid clip selection - please try again",
  //       });
  //     }

  //     // Ensure we don't go negative (shouldn't happen with proper frontend validation)
  //     const finalStartTime = Math.max(0, clipStartTime);
  //     const finalEndTime = Math.max(finalStartTime + 1, clipEndTime);

  //     const actualDuration = finalEndTime - finalStartTime;

  //     const startSegmentIndex = Math.floor(finalStartTime / 2);
  //     const segmentsNeeded = Math.ceil(actualDuration / 2);
  //     const endSegmentIndex = startSegmentIndex + segmentsNeeded - 1;

  //     const startOffset = finalStartTime % 2;
  //     const endOffset = finalEndTime % 2;

  //     const clipStartTimestamp = new Date(
  //       streamStartTime.getTime() + finalStartTime * 1000,
  //     );
  //     const clipEndTimestamp = new Date(
  //       streamStartTime.getTime() + finalEndTime * 1000,
  //     );

  //     const [newClip] = await ctx.db
  //       .insert(clips)
  //       .values({
  //         userId: ctx.user.userId,
  //         streamId,
  //         startTimestamp: clipStartTimestamp,
  //         endTimestamp: clipEndTimestamp,
  //         startSegmentIndex,
  //         endSegmentIndex,
  //         startOffset,
  //         endOffset,
  //         title: title || `${actualDuration.toFixed(1)}s clip`,
  //         thumbnailUrl,
  //       })
  //       .returning();

  //     console.log("Created clip:", newClip);

  //     return newClip;
  //   }),

  deleteClip: protectedProcedure
    .input(
      z.object({
        clipId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const clip = await ctx.db.query.clips.findFirst({
        where: eq(clips.id, input.clipId),
      });

      if (!clip) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Clip not found",
        });
      }

      if (clip.userId !== ctx.user.userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized: You can only delete your own clips",
        });
      }

      await ctx.db.delete(clips).where(eq(clips.id, input.clipId));

      return { success: true };
    }),

  createClipMizan: protectedProcedure
    .input(
      z.object({
        streamId: z.string().uuid(),
        absStart: z.number().min(0),
        absEnd: z.number().min(1),
        thumbnailUrl: z.string().optional(),
        title: z.string().min(1).max(255).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { streamId, absStart, absEnd, thumbnailUrl, title } = input;

      if (absEnd <= absStart) {
        throw new Error("Clip end must be after start");
      }

      const [clip] = await ctx.db
        .insert(clips)
        .values({
          streamId,
          userId: ctx.user.userId,
          absStart,
          absEnd,
          title: title || `${absStart}-${absEnd}s clip`,
          thumbnailUrl: thumbnailUrl || "",
        })
        .returning();

      return clip;
    }),
});
