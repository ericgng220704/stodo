"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db/drizzle";
import { tasks } from "@/db/schema";
import { eq, ilike } from "drizzle-orm";

// Fetch all tasks for a given month (YYYY‑MM)
export async function getTasksByMonth(month: string) {
  return db
    .select()
    .from(tasks)
    .where(ilike(tasks.date, `${month}-%`));
}

// Add a new task
export async function addTask(date: string, title: string) {
  type NewTask = typeof tasks.$inferInsert;
  const newTask: NewTask = { date, title, done: false };
  await db.insert(tasks).values(newTask);
  revalidatePath("/"); // so SSR will refresh if you use it
}

// Toggle done
export async function toggleTask(id: string, done: boolean) {
  await db.update(tasks).set({ done }).where(eq(tasks.id, id));
  revalidatePath("/");
}

// Delete
export async function deleteTask(id: string) {
  await db.delete(tasks).where(eq(tasks.id, id));
  revalidatePath("/");
}

export async function editTask(
  id: string,
  update: {
    title?: string;
    date?: string;
  }
) {
  const dataToUpdate: Partial<{ title: string; date: string }> = {};
  if (update.title !== undefined) dataToUpdate.title = update.title;
  if (update.date !== undefined) dataToUpdate.date = update.date;

  // If there's nothing to update, bail out early
  if (Object.keys(dataToUpdate).length === 0) {
    return;
  }
  await db.update(tasks).set(update).where(eq(tasks.id, id));
  revalidatePath("/");
}
