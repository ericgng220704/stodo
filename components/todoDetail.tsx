"use client";

import { useState } from "react";
import { ArrowLeft, Plus, Check, X, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import type { Todo } from "@/app/page";

interface TodoDetailProps {
  date: string;
  todos: Todo[];
  onBack: () => void;
  onAddTodo: (text: string) => void;
  onUpdateTodo: (todoId: string, updates: Partial<Todo>) => void;
  onDeleteTodo: (todoId: string) => void;
}

export function TodoDetail({
  date,
  todos,
  onBack,
  onAddTodo,
  onUpdateTodo,
  onDeleteTodo,
}: TodoDetailProps) {
  const [newTodoText, setNewTodoText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleAddTodo = () => {
    if (newTodoText.trim()) {
      onAddTodo(newTodoText.trim());
      setNewTodoText("");
    }
  };

  const handleEditStart = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.title);
  };

  const handleEditSave = () => {
    if (editingId && editText.trim()) {
      onUpdateTodo(editingId, { title: editText.trim() });
      setEditingId(null);
      setEditText("");
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditText("");
  };

  const completedTodos = todos.filter((todo) => todo.done);
  const pendingTodos = todos.filter((todo) => !todo.done);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="hover:bg-white/50"
          >
            <ArrowLeft className="h-10 w-10" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Todos</h1>
            <p className="text-gray-600">{formatDate(date)}</p>
          </div>
        </div>

        {/* Add new todo */}
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
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </div>

        {/* Pending todos */}
        {pendingTodos.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-400"></div>
              Pending ({pendingTodos.length})
            </h2>
            <div className="space-y-3">
              {pendingTodos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <Checkbox
                    checked={todo.done}
                    onCheckedChange={(checked) =>
                      onUpdateTodo(todo.id, { done: checked as boolean })
                    }
                  />

                  {editingId === todo.id ? (
                    <div className="flex-1 flex gap-2">
                      <Input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleEditSave();
                          if (e.key === "Escape") handleEditCancel();
                        }}
                        className="flex-1"
                        autoFocus
                      />
                      <Button size="sm" onClick={handleEditSave}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleEditCancel}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="flex-1 text-gray-800">{todo.title}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditStart(todo)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDeleteTodo(todo.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed todos */}
        {completedTodos.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              Completed ({completedTodos.length})
            </h2>
            <div className="space-y-3">
              {completedTodos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center gap-3 p-3 bg-green-50 rounded-lg"
                >
                  <Checkbox
                    checked={todo.done}
                    onCheckedChange={(checked) =>
                      onUpdateTodo(todo.id, { done: checked as boolean })
                    }
                  />
                  <span className="flex-1 text-gray-600 line-through">
                    {todo.title}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeleteTodo(todo.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {todos.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-gray-400 mb-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Plus className="h-8 w-8" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              No todos yet
            </h3>
            <p className="text-gray-500">Add your first todo to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
