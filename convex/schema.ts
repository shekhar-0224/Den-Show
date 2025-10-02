import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const streamStates = v.union(
  v.literal("scheduled"),
  v.literal("pending"),
  v.literal("live"),
  v.literal("ended"),
  v.literal("cancelled")
);

export default defineSchema({
  users: defineTable({
    privyId: v.string(),
    username: v.string(),
    loginMethod: v.union(
      v.literal("email"),
      v.literal("farcaster"),
      v.literal("x")
    ),
    email: v.optional(v.string()),
  })
    .index("by_privyId", ["privyId"])
    .index("by_username", ["username"])
    .index("by_email", ["email"]),

  channels: defineTable({
    userId: v.id("users"),
    name: v.string(),
    bio: v.string(),
    handle: v.string(),
    profilePicId: v.optional(v.id("_storage")),
    bannerPicId: v.optional(v.id("_storage")),
    language: v.string(),
    fanPassValue: v.number(),
    nsfw: v.boolean(),
    token: v.object({
      address: v.string(),
      symbol: v.string(),
      source: v.union(v.literal("other"), v.literal("clanker")),
    }),
  })
    .index("by_handle", ["handle"])
    .index("by_userId", ["userId"])
    .searchIndex("search_channel_by_name", {
      searchField: "name",
    })
    .searchIndex("search_channel_by_handle", {
      searchField: "handle",
    }),

  channelCreds: defineTable({
    channelId: v.id("channels"),
    streamId: v.string(),
    streamKey: v.string(),
  }).index("by_channelId", ["channelId"]),

  streams: defineTable({
    channelId: v.id("channels"),
    userId: v.id("users"),
    title: v.string(),
    description: v.string(),
    tags: v.array(v.string()),
    thumbnailPicId: v.optional(v.id("_storage")),
    accessType: v.union(v.literal("everyone"), v.literal("fans")),
    allowClipping: v.boolean(),
    state: streamStates,
    scheduledStartTime: v.optional(v.number()),
    playbackId: v.optional(v.string()), // TODO update this
    lastUpdatedAt: v.number(),
  })
    .index("by_channelId", ["channelId"])
    .index("by_userId", ["userId"])
    .index("by_state_lastUpdatedAt", ["state", "lastUpdatedAt"]),
});
