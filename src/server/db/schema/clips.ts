import { relations, sql } from "drizzle-orm";
import { pgTable } from "drizzle-orm/pg-core";
import { streamDetails } from "./streamDetails";
import { users } from "./users";

export const clips = pgTable("clips", (d) => ({
  id: d.uuid().primaryKey().defaultRandom(),
  userId: d
    .uuid()
    .notNull()
    .references(() => users.id),
  streamId: d
    .uuid()
    .notNull()
    .references(() => streamDetails.id),

  absStart: d.real().notNull(), // seconds from stream start
  absEnd: d.real().notNull(),

  thumbnailUrl: d.text(),

  title: d.text().notNull(),

  createdAt: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
}));

export const clipsRelations = relations(clips, ({ one }) => ({
  stream: one(streamDetails, {
    fields: [clips.streamId],
    references: [streamDetails.id],
  }),
  user: one(users, {
    fields: [clips.userId],
    references: [users.id],
  }),
}));
