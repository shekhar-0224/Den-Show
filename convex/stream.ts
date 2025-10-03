import { v } from "convex/values";
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

    return newStreamId;
  },
});

export const updateStreamStatus = internalMutation({
  args: {
    muxStreamId: v.string(),
    newState: streamStates,
    assetId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const creds = await ctx.db
      .query("channelCreds")
      .withIndex("by_muxStreamId", (q) => q.eq("muxStreamId", args.muxStreamId))
      .first();

    if (!creds) {
      return;
    }

    const stream =
      args.newState === "live"
        ? await ctx.db
            .query("streams")
            .withIndex("by_channelId_state_lastUpdatedAt", (q) =>
              q.eq("channelId", creds.channelId).eq("state", "pending")
            )
            .order("desc")
            .first()
        : await ctx.db
            .query("streams")
            .withIndex("by_channelId_state_lastUpdatedAt", (q) =>
              q.eq("channelId", creds.channelId).eq("state", "live")
            )
            .order("desc")
            .first();

    if (!stream) {
      return;
    }

    if (args.assetId)
      await ctx.db.patch(stream._id, {
        state: args.newState,
        assetId: args.assetId,
        lastUpdatedAt: Date.now(),
      });
    else
      await ctx.db.patch(stream._id, {
        state: args.newState,
        lastUpdatedAt: Date.now(),
      });
  },
});

export const updateStreamByAssetId = internalMutation({
  args: {
    assetId: v.string(),
    playbackId: v.string(),
  },
  handler: async (ctx, args) => {
    const stream = await ctx.db
      .query("streams")
      .withIndex("by_assetId", (q) => q.eq("assetId", args.assetId))
      .first();

    if (!stream) {
      console.warn("No stream found for assetId", args.assetId);
      return;
    }

    await ctx.db.patch(stream._id, {
      playbackId: args.playbackId,
      lastUpdatedAt: Date.now(),
    });
  },
});

export const getStreamsByChannel = query({
  args: {
    channelId: v.id("channels"),
  },
  handler: async (ctx, args) => {
    const streams = await ctx.db
      .query("streams")
      .withIndex("by_channelId", (q) => q.eq("channelId", args.channelId))
      .order("desc")
      .collect();

    const data = await Promise.all(
      streams.map(async (stream) => {
        const thumbnailPicUrl = stream.thumbnailPicId
          ? await ctx.storage.getUrl(stream.thumbnailPicId)
          : null;

        return {
          ...stream,
          thumbnailPicUrl,
        };
      })
    );

    return data;
  },
});
