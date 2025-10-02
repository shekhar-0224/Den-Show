import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalMutation, mutation, query } from "./_generated/server";
import { streamStates } from "./schema";
import { getUserFromCtx } from "./utils/users";

export const getCurrentLiveStreams = query({
  handler: async (ctx) => {
    const streams = await ctx.db
      .query("streams")
      .withIndex("by_state_lastUpdatedAt", (q) => q.eq("state", "live"))
      .order("desc")
      .collect();

    const data = await Promise.all(
      streams.map(async (stream) => {
        const channel = await ctx.db.get(stream.channelId);

        if (!channel) {
          throw new Error("Channel not found");
        }

        let profilePicUrl = null;
        let thumbnailPicUrl = null;

        if (channel.profilePicId)
          profilePicUrl = await ctx.storage.getUrl(channel.profilePicId);
        if (stream.thumbnailPicId)
          thumbnailPicUrl = await ctx.storage.getUrl(stream.thumbnailPicId);

        return {
          stream: {
            ...stream,
            thumbnailPicUrl,
          },
          channel: {
            handle: channel.handle,
            name: channel.name,
            profilePicUrl,
          },
        };
      })
    );

    return data;
  },
});

export const getStream = query({
  args: {
    streamId: v.id("streams"),
  },
  handler: async (ctx, args) => {
    const stream = await ctx.db.get(args.streamId);

    if (!stream) {
      return null;
    }

    const channel = await ctx.db.get(stream.channelId);

    if (!channel) {
      throw new Error("Channel not found");
    }

    let profilePicUrl = null;
    let thumbnailPicUrl = null;

    if (channel.profilePicId)
      profilePicUrl = await ctx.storage.getUrl(channel.profilePicId);
    if (stream.thumbnailPicId)
      thumbnailPicUrl = await ctx.storage.getUrl(stream.thumbnailPicId);

    return {
      stream: {
        ...stream,
        thumbnailPicUrl,
      },
      channel: {
        ...channel,
        profilePicUrl,
      },
    };
  },
});

export const createStream = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    tags: v.array(v.string()),
    thumbnailPicId: v.optional(v.id("_storage")),
    accessType: v.union(v.literal("everyone"), v.literal("fans")),
    allowClipping: v.boolean(),
    scheduledStartTime: v.optional(v.number()), // ISO string
  },
  handler: async (ctx, args) => {
    const user = await getUserFromCtx(ctx);

    if (!user) {
      throw new Error("Not authenticated");
    }

    const channel = await ctx.db
      .query("channels")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    if (!channel) {
      throw new Error("User has no channel");
    }

    const creds = await ctx.db
      .query("channelCreds")
      .withIndex("by_channelId", (q) => q.eq("channelId", channel._id))
      .first();

    if (!creds) {
      throw new Error("Channel has no streaming credentials");
    }

    const newStreamId = await ctx.db.insert("streams", {
      channelId: channel._id,
      userId: user._id,
      title: args.title,
      description: args.description,
      tags: args.tags,
      thumbnailPicId: args.thumbnailPicId,
      accessType: args.accessType,
      allowClipping: args.allowClipping,
      state: args.scheduledStartTime ? "scheduled" : "pending",
      scheduledStartTime: args.scheduledStartTime,
      lastUpdatedAt: Date.now(),
    });

    if (
      !args.scheduledStartTime ||
      args.scheduledStartTime - Date.now() < 5 * 60 * 1000
    ) {
      await ctx.scheduler.runAfter(0, internal.mux.changeLiveStreamState, {
        muxStreamId: creds.streamId,
        state: "enable",
      });

      await ctx.scheduler.runAt(
        Date.now() + 15 * 60 * 1000, // 15 minutes later
        internal.mux.changeLiveStreamState,
        {
          muxStreamId: creds.streamId,
          state: "disable",
        }
      );
    } else {
      await ctx.scheduler.runAt(
        args.scheduledStartTime - 5 * 60 * 1000, // 5 minutes before
        internal.mux.changeLiveStreamState,
        {
          muxStreamId: creds.streamId,
          state: "enable",
        }
      );

      await ctx.scheduler.runAt(
        args.scheduledStartTime - 5 * 60 * 1000, // 5 minutes before
        internal.stream.updateStreamStatus,
        {
          streamId: newStreamId,
          newState: "pending",
        }
      );

      // Disable after 15mins
      await ctx.scheduler.runAt(
        args.scheduledStartTime + 15 * 60 * 1000,
        internal.mux.changeLiveStreamState,
        {
          muxStreamId: creds.streamId,
          state: "disable",
        }
      );
    }

    return newStreamId;
  },
});

export const updateStreamStatus = internalMutation({
  args: {
    streamId: v.id("streams"),
    newState: streamStates,
  },
  handler: async (ctx, args) => {
    const stream = await ctx.db.get(args.streamId);

    if (!stream) {
      throw new Error("Stream not found");
    }

    await ctx.db.patch(args.streamId, {
      state: args.newState,
      lastUpdatedAt: Date.now(),
    });
  },
});
