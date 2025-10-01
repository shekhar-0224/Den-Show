import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserFromCtx } from "./model/users";

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const createChannel = mutation({
  args: {
    name: v.string(),
    bio: v.string(),
    handle: v.string(),
    profilePicId: v.optional(v.string()),
    bannerPicId: v.optional(v.string()),
    language: v.optional(v.string()),
    fanPassValue: v.number(),
    nsfw: v.boolean(),
    token: v.object({
      address: v.string(),
      symbol: v.string(),
      source: v.union(v.literal("zora"), v.literal("clanker")),
    }),
  },
  handler: async (ctx, args) => {
    const user = await getUserFromCtx(ctx);

    if (!user) {
      throw new Error("Not authenticated");
    }

    const existingChannel = await ctx.db
      .query("channels")
      .withIndex("by_handle", (q) => q.eq("handle", args.handle))
      .first();

    if (existingChannel) {
      throw new Error("Handle already taken");
    }

    if (args.name.length > 50) throw new Error("Name too long");
    if (args.bio.length > 160) throw new Error("Bio too long");
    if (args.handle.length > 30) throw new Error("Handle too long");

    await ctx.db.insert("channels", {
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
    });
  },
});

export const getMyChannel = query({
  handler: async (ctx) => {
    const user = await getUserFromCtx(ctx);

    if (!user) {
      throw new Error("Not authenticated");
    }

    const channel = await ctx.db
      .query("channels")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    return channel ?? null;
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

    return channel;
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
