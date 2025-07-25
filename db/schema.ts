// src/db/schema.ts
import { sql } from "drizzle-orm";
import { integer, text, boolean, pgTable, serial } from "drizzle-orm/pg-core";

export const tasks = pgTable("tasks", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  date: text("date").notNull(), // store YYYY‑MM‑DD
  done: boolean("done").default(false).notNull(),
  order: integer("order").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  avatar: text("avatar"),
});
