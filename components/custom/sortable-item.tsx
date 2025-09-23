"use client";
import { useState, useEffect, type KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Todo } from "@/models/Todo";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskItem } from "@/components/task-item";

export function SortableItem({
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
  const {
    attributes: sortableAttributes,
    listeners: sortableListeners,
    setNodeRef,
    transform,
    transition,
    isDragging: itemDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
      className={itemDragging ? "opacity-30" : ""}
    >
      <TaskItem
        todo={todo}
        index={index}
        isDarkMode={isDarkMode}
        editingId={editingId}
        editValue={editValue}
        setEditValue={setEditValue}
        toggleTodo={toggleTodo}
        deleteTodo={deleteTodo}
        startEditing={startEditing}
        saveEdit={saveEdit}
        cancelEdit={cancelEdit}
        handleEditKeyPress={handleEditKeyPress}
        onViewTask={onViewTask}
        onEditTask={onEditTask}
        attributes={attributes || sortableAttributes}
        listeners={listeners || sortableListeners}
        isDragging={isDragging || itemDragging}
      />
    </motion.div>
  );
}