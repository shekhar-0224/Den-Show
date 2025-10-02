import { relations, sql } from "drizzle-orm";
import { index, pgTable } from "drizzle-orm/pg-core";
import { users } from "./users";

export const channelDetails = pgTable(
  "channel_details",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    userId: d
      .uuid()
      .notNull()
      .references(() => users.id),

    profileUrl: d.text(),
    bannerUrl: d.text(),

    name: d.text().notNull(),
    bio: d.text(),
    handle: d.text().unique().notNull(),
    language: d.text().notNull().default("English"),

    fanSubscriptionFee: d.real().notNull().default(0), //TODO: change to fanPass and nullable instead of default 0

    nsfw: d.boolean().notNull().default(false),

    creatorTokenAddress: d.text().notNull(),
    creatorTokenSymbol: d.text().notNull(),

    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (table) => [
    index("idx_channel_details_user_id").on(table.userId),
    index("idx_channel_details_handle").on(table.handle),
    index("idx_channel_details_created_at").on(table.createdAt),
    index("idx_channel_details_nsfw").on(table.nsfw),
  ]
);

export const channelDetailsRelations = relations(channelDetails, ({ one }) => ({
  user: one(users, {
    fields: [channelDetails.userId],
    references: [users.id],
  }),
}));
