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
});
