"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onDateClick: (dateString: string) => void;
  hasActiveTodos: (dateString: string) => boolean;
  hasCompletedTodos: (dateString: string) => boolean;
}

export function Calendar({
  currentDate,
  onDateChange,
  onDateClick,
  hasActiveTodos,
  hasCompletedTodos,
}: CalendarProps) {
  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and calculate offset
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const daysInMonth = lastDay.getDate();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const goToPreviousMonth = () => {
    onDateChange(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    onDateChange(new Date(year, month + 1, 1));
  };

  const formatDateString = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
  };

  const isToday = (day: number) => {
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
  };

  // Create array of calendar cells
  const calendarCells = [];

  // Add empty cells for offset
  for (let i = 0; i < startOffset; i++) {
    calendarCells.push(<div key={`empty-${i}`} className="aspect-square" />);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateString = formatDateString(day);
    const isCurrentDay = isToday(day);
    const hasActive = hasActiveTodos(dateString);
    const hasCompleted = hasCompletedTodos(dateString);

    calendarCells.push(
      <button
        key={day}
        onClick={() => onDateClick(dateString)}
        className={`
          aspect-square flex items-center justify-center text-lg font-medium rounded-lg
          transition-all duration-200 hover:scale-105 hover:shadow-md relative
          ${
            isCurrentDay
              ? "bg-blue-500 text-white shadow-lg"
              : "bg-white text-gray-700 hover:bg-blue-50"
          }
          ${hasActive ? "ring-2 ring-orange-400" : ""}
          ${hasCompleted && !hasActive ? "ring-2 ring-green-400" : ""}
        `}
      >
        {day}
        {(hasActive || hasCompleted) && (
          <div
            className={`absolute bottom-1 right-1 w-2 h-2 rounded-full ${
              hasActive ? "bg-orange-400" : "bg-green-400"
            }`}
          />
        )}
      </button>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPreviousMonth}
          className="hover:bg-blue-50"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <h2 className="text-2xl font-bold text-gray-800">
          {monthNames[month]} {year}
        </h2>

        <Button
          variant="ghost"
          size="icon"
          onClick={goToNextMonth}
          className="hover:bg-blue-50"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-gray-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">{calendarCells}</div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-400"></div>
          <span>Has pending todos</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
          <span>All todos completed</span>
        </div>
      </div>
    </div>
  );
}
