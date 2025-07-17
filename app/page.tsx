"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/calendar";
import { TodoDetail } from "@/components/todoDetail";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTasksByMonth,
  addTask,
  toggleTask,
  deleteTask,
  editTask,
  updateTask,
} from "@/actions/tasks";
export interface Todo {
  id: string;
  title: string;
  done: boolean;
  date: string;
  order: number;
}

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const qc = useQueryClient();

  // Derive YYYY‑MM string
  const monthKey = `${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1
  ).padStart(2, "0")}`;

  // 1) Fetch for current month
  const { data: monthTasks = [] } = useQuery({
    queryKey: ["todos", monthKey],
    queryFn: () => getTasksByMonth(monthKey),
  });

  // 2) Prefetch next/prev month on month change
  useEffect(() => {
    const next = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      1
    );
    const prev = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1
    );
    [next, prev].forEach((d) => {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      qc.prefetchQuery({
        queryKey: ["todos", key],
        queryFn: () => getTasksByMonth(key),
      });
    });
  }, [currentDate, qc]);

  // 3) Mutations
  const addMut = useMutation({
    mutationFn: ({
      date,
      title,
      order,
    }: {
      date: string;
      title: string;
      order: number;
    }) => addTask(date, title, order),

    onSuccess: () => qc.invalidateQueries({ queryKey: ["todos", monthKey] }),
  });
  const toggleMut = useMutation({
    mutationFn: ({ id, done }: { id: string; done: boolean }) =>
      toggleTask(id, done),

    onSuccess: () => qc.invalidateQueries({ queryKey: ["todos", monthKey] }),
  });
  const delMut = useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["todos", monthKey] }),
  });
  const editMut = useMutation<
    void,
    Error,
    {
      id: string;
      updates: { title?: string; date?: string };
    }
  >({
    mutationFn: ({ id, updates }) => editTask(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["todos", monthKey] }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Todo> }) =>
      updateTask(id, updates),
    // 1. cancel any outgoing fetches
    onMutate: async ({ id, updates }) => {
      await qc.cancelQueries({ queryKey: ["todos", monthKey] });
      // 2. snapshot previous
      const previous = qc.getQueryData<Todo[]>(["todos", monthKey]);
      // 3. optimistically update the cache
      qc.setQueryData<Todo[]>(["todos", monthKey], (old) =>
        old ? old.map((t) => (t.id === id ? { ...t, ...updates } : t)) : []
      );
      // 4. return context for rollback
      return { previous };
    },
    onError: (_err, _vars, context) => {
      // rollback
      if (context?.previous) {
        qc.setQueryData(["todos", monthKey], context.previous);
      }
    },
    onSettled: () => {
      // finally re‑sync from server if needed
      qc.invalidateQueries({ queryKey: ["todos", monthKey] });
    },
  });

  // Helpers for calendar
  const todosByDate = monthTasks.reduce<Record<string, any[]>>(
    (acc: any, t: any) => {
      acc[t.date] = acc[t.date] ?? [];
      acc[t.date].push(t);
      return acc;
    },
    {}
  );

  const hasActive = (date: string) =>
    (todosByDate[date] ?? []).some((t: any) => !t.done);
  const hasCompleted = (date: string) => {
    const list = todosByDate[date] ?? [];
    return list.length > 0 && list.every((t: any) => t.done);
  };

  if (selectedDate) {
    const list = todosByDate[selectedDate] ?? [];
    return (
      <TodoDetail
        date={selectedDate}
        todos={list}
        onBack={() => setSelectedDate(null)}
        onAddTodo={(text: string, order: number) =>
          addMut.mutate({ date: selectedDate, title: text, order })
        }
        onUpdateTodo={(id, upd) => {
          updateMut.mutate({ id, updates: upd });
        }}
        onDeleteTodo={(id) => delMut.mutate(id)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* … header … */}
        <Calendar
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          onDateClick={setSelectedDate}
          hasActiveTodos={hasActive}
          hasCompletedTodos={hasCompleted}
        />
      </div>
    </div>
  );
}
