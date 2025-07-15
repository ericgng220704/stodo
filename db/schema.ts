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
});
