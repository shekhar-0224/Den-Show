import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

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
    profilePicId: v.optional(v.string()),
    bannerPicId: v.optional(v.string()),
    language: v.string(),
    fanPassValue: v.number(),
    nsfw: v.boolean(),
    token: v.object({
      address: v.string(),
      symbol: v.string(),
      source: v.union(v.literal("zora"), v.literal("clanker")),
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
});
