"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  Check,
  X,
  Edit2,
  Trash2,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import type { Todo } from "@/app/page";

import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface TodoDetailProps {
  date: string;
  todos: Todo[];
  onBack: () => void;
  onAddTodo: (text: string, order: number) => void;
  onUpdateTodo: (todoId: string, updates: Partial<Todo>) => void;
  onDeleteTodo: (todoId: string) => void;
}

interface DraggableTodoItemProps {
  todo: Todo;
  isEditing: boolean;
  editText: string;
  onEditStart: (todo: Todo) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onEditTextChange: (text: string) => void;
  onToggle: (checked: boolean) => void;
  onDelete: () => void;
}

function DraggableTodoItem({
  todo,
  isEditing,
  editText,
  onEditStart,
  onEditSave,
  onEditCancel,
  onEditTextChange,
  onToggle,
  onDelete,
}: DraggableTodoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 p-3 rounded-lg transition-colors
        ${todo.done ? "bg-green-50" : "bg-gray-50"}
        ${isDragging ? "opacity-50 shadow-lg" : ""}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200 rounded touch-none"
      >
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>

      <Checkbox checked={todo.done} onCheckedChange={onToggle} />

      {isEditing ? (
        <div className="flex-1 flex gap-2">
          <Input
            value={editText}
            onChange={(e) => onEditTextChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onEditSave();
              if (e.key === "Escape") onEditCancel();
            }}
            className="flex-1"
            autoFocus
          />
          <Button size="sm" onClick={onEditSave}>
            <Check className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onEditCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <>
          <span
            className={`flex-1 ${
              todo.done ? "text-gray-600 line-through" : "text-gray-800"
            }`}
          >
            {todo.title}
          </span>
          {!todo.done && (
            <Button size="sm" variant="ghost" onClick={() => onEditStart(todo)}>
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={onDelete}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
}

export function TodoDetail({
  date,
  todos,
  onBack,
  onAddTodo,
  onUpdateTodo,
  onDeleteTodo,
}: TodoDetailProps) {
  // Local optimistic copy
  const [items, setItems] = useState<Todo[]>([]);
  const [newTodoText, setNewTodoText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  // Sync when props.todos changes
  useEffect(() => {
    const sorted = [...todos].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    setItems(sorted);
  }, [todos]);

  // Drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 8 },
    })
  );

  const formatDate = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const handleAddTodo = () => {
    const text = newTodoText.trim();
    if (!text) return;
    const maxOrder = items.reduce((max, t) => Math.max(max, t.order ?? 0), 0);
    onAddTodo(text, maxOrder + 1);
    setNewTodoText("");
  };

  const handleEditStart = (t: Todo) => {
    setEditingId(t.id);
    setEditText(t.title);
  };
  const handleEditSave = () => {
    if (editingId && editText.trim()) {
      onUpdateTodo(editingId, { title: editText.trim() });
      setEditingId(null);
    }
  };
  const handleEditCancel = () => setEditingId(null);

  const handleDragStart = (e: DragStartEvent) =>
    setActiveId(e.active.id as string);

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const aId = active.id as string;
    const oId = over.id as string;
    const aTodo = items.find((t) => t.id === aId);
    const oTodo = items.find((t) => t.id === oId);
    if (!aTodo || !oTodo) return;

    // helper to update list & persist
    const updateList = (list: Todo[]) => {
      // update local
      setItems((prev) => {
        const others = prev.filter((t) => t.done !== list[0].done);
        return [...list, ...others];
      });
      // persist
      list.forEach((t, idx) =>
        onUpdateTodo(t.id, { order: idx, done: t.done })
      );
    };

    // same-list
    if (aTodo.done === oTodo.done) {
      const same = items
        .filter((t) => t.done === aTodo.done)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      const oldIdx = same.findIndex((t) => t.id === aId);
      const newIdx = same.findIndex((t) => t.id === oId);
      const moved = arrayMove(same, oldIdx, newIdx);
      updateList(moved);
      return;
    }

    // cross-list
    const from = items
      .filter((t) => t.done === aTodo.done)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .filter((t) => t.id !== aId);
    const to = items
      .filter((t) => t.done === oTodo.done)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    // calculate new lists
    const mergeList = [...from, ...to];
    const insertIdx = to.findIndex((t) => t.id === oId);
    const movedItem = { ...aTodo, done: oTodo.done };
    to.splice(insertIdx, 0, movedItem);

    updateList(from);
    updateList(to);
  };

  // split for render
  const pending = items.filter((t) => !t.done);
  const completed = items.filter((t) => t.done);
  const activeTodo = items.find((t) => t.id === activeId) ?? null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-10 w-10" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Todos</h1>
              <p className="text-gray-600">{formatDate(date)}</p>
            </div>
          </div>

          {/* Add */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex gap-3">
              <Input
                placeholder="Add a new todo..."
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTodo()}
                className="flex-1"
              />
              <Button onClick={handleAddTodo} className="shrink-0">
                <Plus className="h-4 w-4 mr-2" /> Add
              </Button>
            </div>
          </div>

          {/* Pending */}
          {pending.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-400" />
                Pending ({pending.length})
              </h2>
              <SortableContext
                items={pending.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {pending.map((todo) => (
                    <DraggableTodoItem
                      key={todo.id}
                      todo={todo}
                      isEditing={editingId === todo.id}
                      editText={editText}
                      onEditStart={handleEditStart}
                      onEditSave={handleEditSave}
                      onEditCancel={handleEditCancel}
                      onEditTextChange={setEditText}
                      onToggle={(c) => onUpdateTodo(todo.id, { done: c })}
                      onDelete={() => onDeleteTodo(todo.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </div>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-400" />
                Completed ({completed.length})
              </h2>
              <SortableContext
                items={completed.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {completed.map((todo) => (
                    <DraggableTodoItem
                      key={todo.id}
                      todo={todo}
                      isEditing={editingId === todo.id}
                      editText={editText}
                      onEditStart={handleEditStart}
                      onEditSave={handleEditSave}
                      onEditCancel={handleEditCancel}
                      onEditTextChange={setEditText}
                      onToggle={(c) => onUpdateTodo(todo.id, { done: c })}
                      onDelete={() => onDeleteTodo(todo.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </div>
          )}

          {/* Empty */}
          {items.length === 0 && (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="text-gray-400 mb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Plus className="h-8 w-8" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                No todos yet
              </h3>
              <p className="text-gray-500">
                Add your first todo to get started!
              </p>
            </div>
          )}
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeTodo && (
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-lg border-2 border-blue-200">
              <GripVertical className="h-4 w-4 text-gray-400" />
              <Checkbox checked={activeTodo.done} />
              <span className={activeTodo.done ? "line-through" : ""}>
                {activeTodo.title}
              </span>
            </div>
          )}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
