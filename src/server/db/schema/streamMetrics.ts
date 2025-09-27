import { relations } from "drizzle-orm";
import { index, pgTable } from "drizzle-orm/pg-core";
import { channelDetails } from "./channelDetails";
import { streamDetails } from "./streamDetails";

export const streamMetrics = pgTable(
  "stream_metrics",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    streamId: d
      .uuid()
      .notNull()
      .references(() => streamDetails.id),
    channelId: d
      .uuid()
      .notNull()
      .references(() => channelDetails.id),
    ingressId: d.text().notNull(),
    egressId: d.text(),
    streamUrl: d.text().notNull(),
    streamKey: d.text().notNull(),
    views: d.integer().notNull().default(0),
    likes: d.integer().notNull().default(0),
    tipsEarnings: d.real().notNull().default(0),
    duration: d.integer().default(0),
    startedAt: d.timestamp({ withTimezone: true }),
    endedAt: d.timestamp({ withTimezone: true }),
  }),
  (table) => [
    index("idx_stream_metrics_stream_id").on(table.streamId),
    index("idx_stream_metrics_channel_id").on(table.channelId),
    index("idx_stream_metrics_channel_started_at").on(
      table.channelId,
      table.startedAt,
    ),
    index("idx_stream_metrics_views").on(table.views),
    index("idx_stream_metrics_started_at").on(table.startedAt),
  ],
);

export const streamMetricsRelations = relations(streamMetrics, ({ one }) => ({
  details: one(streamDetails, {
    fields: [streamMetrics.streamId],
    references: [streamDetails.id],
  }),
  channel: one(channelDetails, {
    fields: [streamMetrics.channelId],
    references: [channelDetails.id],
  }),
}));
