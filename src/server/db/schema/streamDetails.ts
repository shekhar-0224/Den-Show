import { relations, sql } from "drizzle-orm";
import { index, pgEnum, pgTable } from "drizzle-orm/pg-core";
import { channelDetails } from "./channelDetails";
import { streamMetrics } from "./streamMetrics";

export const accessTypeEnum = pgEnum("accessType", ["Open to All", "Fan Only"]);

export const streamDetails = pgTable(
  "stream_details",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    channelId: d
      .uuid()
      .notNull()
      .references(() => channelDetails.id),

    title: d.text().notNull(),
    description: d.text(),
    thumbnailUrl: d.text(),
    categories: d.text().array().notNull(),
    accessType: accessTypeEnum().notNull().default("Open to All"),

    clippingAllowed: d.boolean().notNull().default(false),

    scheduleAt: d.timestamp({ withTimezone: true }).notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (table) => [
    index("idx_stream_details_channel_id").on(table.channelId),
    index("idx_stream_details_schedule_at").on(table.scheduleAt),
    index("idx_stream_details_created_at").on(table.createdAt),
  ],
);

export const streamDetailsRelations = relations(streamDetails, ({ one }) => ({
  metrics: one(streamMetrics, {
    fields: [streamDetails.id],
    references: [streamMetrics.streamId],
  }),
  channel: one(channelDetails, {
    fields: [streamDetails.channelId],
    references: [channelDetails.id],
  }),
}));
