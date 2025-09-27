import { relations } from "drizzle-orm";
import { index, pgTable } from "drizzle-orm/pg-core";
import { channelDetails } from "./channelDetails";
import { users } from "./users";

export const channelMetrics = pgTable(
  "channel_metrics",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    channelId: d
      .uuid()
      .notNull()
      .references(() => channelDetails.id),
    userId: d
      .uuid()
      .notNull()
      .references(() => users.id),

    fanCount: d.integer().notNull().default(0),
    tipsEarnings: d.real().notNull().default(0),
    videos: d.integer().notNull().default(0),
    rewardVault: d.real().notNull().default(0),
  }),
  (table) => [
    index("idx_channel_metrics_channel_id").on(table.channelId),
    index("idx_channel_metrics_user_id").on(table.userId),
    index("idx_channel_metrics_fan_count").on(table.fanCount),
  ],
);

export const channelMetricsRelations = relations(channelMetrics, ({ one }) => ({
  channel: one(channelDetails, {
    fields: [channelMetrics.channelId],
    references: [channelDetails.id],
  }),
  user: one(users, {
    fields: [channelMetrics.userId],
    references: [users.id],
  }),
}));
