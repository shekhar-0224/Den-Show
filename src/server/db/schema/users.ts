import { sql } from "drizzle-orm";
import { index, pgEnum, pgTable } from "drizzle-orm/pg-core";

export const loginMethodEnum = pgEnum("loginMethod", [
  "email",
  "farcaster",
  "x",
]);

export const users = pgTable(
  "users",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),

    username: d.text().unique().notNull(),
    displayName: d.text(),
    loginMethod: loginMethodEnum().notNull(),

    email: d.text().unique(),

    farcasterHandle: d.text().unique(),
    farcasterId: d.text().unique(),

    xHandle: d.text().unique(),
    xSubject: d.text().unique(),

    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),

    denWalletAddress: d.text().unique().notNull(),

    totalSpending: d.real().notNull().default(0),
    totalEarnings: d.real().notNull().default(0),

    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("username_idx").on(t.username)],
);
