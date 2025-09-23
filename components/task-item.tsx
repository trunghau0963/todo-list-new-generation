"use client";
import { useState, useEffect, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Edit2, GripVertical, Eye } from "lucide-react";

import type { Todo } from "@/models/Todo";

export function TaskItem({
  todo,
  index,
  isDarkMode,
  editingId,
  editValue,
  setEditValue,
  toggleTodo,
  deleteTodo,
  startEditing,
  saveEdit,
  cancelEdit,
  handleEditKeyPress,
  onViewTask,
  onEditTask,
  attributes,
  listeners,
  isDragging,
}: {
  todo: Todo;
  index: number;
  isDarkMode: boolean;
  editingId: string | null;
  editValue: string;
  setEditValue: (value: string) => void;
  toggleTodo: (id: string, completed: boolean) => void;
  deleteTodo: (id: string) => void;
  startEditing: (id: string, text: string) => void;
  saveEdit: (id: string) => void;
  cancelEdit: () => void;
  handleEditKeyPress: (e: KeyboardEvent<HTMLInputElement>, id: string) => void;
  onViewTask: (todo: Todo) => void;
  onEditTask: (todo: Todo) => void;
  attributes?: any;
  listeners?: any;
  isDragging?: boolean;
}) {
  return (
    <div
      className={`group py-4 border-b rounded-sm transition-all duration-200 ${
        isDarkMode
          ? "border-gray-700 hover:bg-gray-700/50"
          : "border-gray-100 hover:bg-gray-50"
      } ${isDragging ? "shadow-lg" : ""}`}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-medium w-6 text-center ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {index + 1}
          </span>
          <button
            {...attributes}
            {...listeners}
            className={`cursor-grab active:cursor-grabbing p-1 rounded transition-colors ${
              isDarkMode
                ? "text-gray-500 hover:text-gray-300 hover:bg-gray-700"
                : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            }`}
          >
            <GripVertical className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => toggleTodo(todo.id, !todo.completed)}
          className={`w-4 h-4 border rounded-sm transition-all duration-200 hover:shadow-sm flex items-center justify-center ${
            todo.completed
              ? isDarkMode
                ? "bg-white border-white"
                : "bg-gray-900 border-gray-900"
              : isDarkMode
              ? "bg-gray-800 hover:bg-gray-700 border-gray-600 hover:border-gray-500"
              : "bg-white hover:bg-gray-50 border-gray-300 hover:border-gray-400"
          }`}
        >
          {todo.completed && (
            <svg
              className={`w-2.5 h-2.5 ${
                isDarkMode ? "text-gray-900" : "text-white"
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>

        {editingId === todo.id ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => handleEditKeyPress(e, todo.id)}
            onBlur={() => saveEdit(todo.id)}
            className={`flex-1 text-lg font-normal bg-transparent border-0 border-b pb-1 transition-all duration-200 focus:outline-none ${
              isDarkMode
                ? "border-gray-500 text-white focus:border-gray-400"
                : "border-gray-300 text-gray-900 focus:border-gray-500"
            }`}
            autoFocus
          />
        ) : (
          <button
            onClick={() => onViewTask(todo)}
            className={`flex-1 text-left text-lg font-normal transition-all duration-200 hover:opacity-80 ${
              todo.completed
                ? isDarkMode
                  ? "line-through text-gray-500"
                  : "line-through text-gray-400"
                : isDarkMode
                ? "text-white"
                : "text-gray-900"
            }`}
          >
            {todo.title}
            {todo.description && (
              <div
                className={`text-sm mt-1 ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {todo.description.length > 50
                  ? `${todo.description.substring(0, 50)}...`
                  : todo.description}
              </div>
            )}
          </button>
        )}

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewTask(todo)}
            className={`h-8 w-8 p-0 rounded-md transition-all duration-200 ${
              isDarkMode
                ? "text-gray-500 hover:text-gray-300 hover:bg-gray-600"
                : "text-gray-300 hover:text-gray-500 hover:bg-gray-100"
            }`}
          >
            <Eye className="w-4 h-4" />
          </Button>
          {editingId !== todo.id && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditTask(todo)}
              className={`h-8 w-8 p-0 rounded-md transition-all duration-200 ${
                isDarkMode
                  ? "text-gray-500 hover:text-gray-300 hover:bg-gray-600"
                  : "text-gray-300 hover:text-gray-500 hover:bg-gray-100"
              }`}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteTodo(todo.id)}
            className={`h-8 w-8 p-0 rounded-md transition-all duration-200 ${
              isDarkMode
                ? "text-gray-500 hover:text-red-400 hover:bg-red-900/20"
                : "text-gray-400 hover:text-red-500 hover:bg-red-50"
            }`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}