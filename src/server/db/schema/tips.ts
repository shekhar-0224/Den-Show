import { sql } from "drizzle-orm";
import { pgTable } from "drizzle-orm/pg-core";
import { streamDetails } from "./streamDetails";
import { users } from "./users";

export const tips = pgTable("tips", (d) => ({
  id: d.uuid().primaryKey().defaultRandom(),
  userId: d
    .uuid()
    .notNull()
    .references(() => users.id),
  streamId: d
    .uuid()
    // .notNull()
    .references(() => streamDetails.id),
  creatorId: d
    .uuid()
    .notNull()
    .references(() => users.id),

  amountUSDC: d.real().notNull().default(0),
  token: d.text().notNull(),
  chain: d.text().notNull(),
  amountToken: d.real().notNull().default(0),
  transactionHash: d.text().notNull(),

  createdAt: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
}));
