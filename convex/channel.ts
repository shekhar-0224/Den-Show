import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalMutation, mutation, query } from "./_generated/server";
import { getUserFromCtx } from "./utils/users";

export const updateTokenAddress = internalMutation({
  args: {
    channelId: v.id("channels"),
    address: v.string(),
    symbol: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.channelId, {
      token: {
        address: args.address,
        symbol: args.symbol,
        source: "clanker",
      },
    });
  },
});

export const createChannel = mutation({
  args: {
    name: v.string(),
    bio: v.string(),
    handle: v.string(),
    profilePicId: v.optional(v.id("_storage")),
    bannerPicId: v.optional(v.id("_storage")),
    language: v.optional(v.string()),
    fanPassValue: v.number(),
    nsfw: v.boolean(),
    token: v.object({
      address: v.string(),
      symbol: v.string(),
      source: v.union(v.literal("other"), v.literal("clanker")),
    }),
    creatorAddress: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getUserFromCtx(ctx);

    if (!user) {
      throw new Error("Not authenticated");
    }

    if (args.handle.includes(" "))
      throw new Error("Handle cannot contain spaces");

    if (args.name.length > 50) throw new Error("Name too long");
    if (args.bio.length > 160) throw new Error("Bio too long");
    if (args.handle.length > 30) throw new Error("Handle too long");

    const existingChannel = await ctx.db
      .query("channels")
      .withIndex("by_handle", (q) => q.eq("handle", args.handle))
      .first();

    if (existingChannel) {
      throw new Error("Handle already taken");
    }

    const channelId = await ctx.db.insert("channels", {
      userId: user._id,
      name: args.name,
      bio: args.bio,
      handle: args.handle,
      profilePicId: args.profilePicId,
      bannerPicId: args.bannerPicId,
      fanPassValue: args.fanPassValue,
      nsfw: args.nsfw,
      language: args.language ?? "en",
      token: args.token,
      playbackId: "",
    });

    await ctx.scheduler.runAfter(0, internal.mux.createMuxStreamKey, {
      channelId,
    });

    // TODO: update this default URL
    const profilePicUrl = args.profilePicId
      ? ((await ctx.storage.getUrl(args.profilePicId)) ??
        "https://den-lilac.vercel.app/images/default-channel-logo.png")
      : "https://den-lilac.vercel.app/images/default-channel-logo.png";

    if (args.token.source === "clanker") {
      await ctx.scheduler.runAfter(0, internal.token.deployToken, {
        creatorAddress: args.creatorAddress,
        ticker: args.token.symbol,
        channelId,
        channelName: args.name,
        profilePicUrl,
      });
    }
  },
});

export const createChannelCreds = internalMutation({
  args: {
    channelId: v.id("channels"),
    muxStreamId: v.string(),
    muxStreamKey: v.string(),
    playbackId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("channelCreds", {
      channelId: args.channelId,
      muxStreamId: args.muxStreamId,
      muxStreamKey: args.muxStreamKey,
    });

    await ctx.db.patch(args.channelId, {
      playbackId: args.playbackId,
    });
  },
});

export const getMyChannel = query({
  handler: async (ctx) => {
    const user = await getUserFromCtx(ctx);

    if (!user) {
      return null;
    }

    const channel = await ctx.db
      .query("channels")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    if (!channel) {
      return null;
    }

    const creds = await ctx.db
      .query("channelCreds")
      .withIndex("by_channelId", (q) => q.eq("channelId", channel._id))
      .first();

    return { ...channel, creds };
  },
});

export const getMyStreamingCreds = query({
  handler: async (ctx) => {
    const user = await getUserFromCtx(ctx);

    if (!user) {
      return null;
    }

    const channel = await ctx.db
      .query("channels")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    if (!channel) {
      return null;
    }

    const creds = await ctx.db
      .query("channelCreds")
      .withIndex("by_channelId", (q) => q.eq("channelId", channel._id))
      .first();

    return creds;
  },
});

export const getChannelByHandle = query({
  args: {
    handle: v.string(),
  },
  handler: async (ctx, args) => {
    const channel = await ctx.db
      .query("channels")
      .withIndex("by_handle", (q) => q.eq("handle", args.handle))
      .first();

    if (!channel) {
      return null;
    }

    const profilePicUrl = channel.profilePicId
      ? await ctx.storage.getUrl(channel.profilePicId)
      : null;

    const bannerPicUrl = channel.bannerPicId
      ? await ctx.storage.getUrl(channel.bannerPicId)
      : null;

    const user = await ctx.db.get(channel.userId);

    return { ...channel, profilePicUrl, bannerPicUrl, user };
  },
});

export const searchChannel = query({
  args: {
    key: v.string(),
  },
  handler: async (ctx, args) => {
    const channelsByName = await ctx.db
      .query("channels")
      .withSearchIndex("search_channel_by_name", (q) =>
        q.search("name", args.key)
      )
      .take(10);

    const channelsByHandle = await ctx.db
      .query("channels")
      .withSearchIndex("search_channel_by_handle", (q) =>
        q.search("handle", args.key)
      )
      .take(10);

    const channelMap = new Map<string, (typeof channelsByName)[0]>();

    for (const channel of channelsByName) {
      channelMap.set(channel.handle, channel);
    }

    for (const channel of channelsByHandle) {
      channelMap.set(channel.handle, channel);
    }

    return Array.from(channelMap.values());
  },
});

export const getTrendingChannels = query({
  handler: async (ctx) => {
    const channels = await ctx.db.query("channels").order("desc").take(10);

    return await Promise.all(
      channels.map(async (channel) => {
        const profilePicUrl = channel.profilePicId
          ? await ctx.storage.getUrl(channel.profilePicId)
          : null;

        return {
          ...channel,
          profilePicUrl,
        };
      })
    );
  },
});
