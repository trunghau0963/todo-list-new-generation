"use client";
import { useState, useEffect, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Edit2, GripVertical, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import NavigationBar from "@/components/navigation-bar";
import type { Todo } from "@/models/Todo";
import type { FilterType } from "@/consts/type";
import { usePersistedState } from "@/hooks/usePersistedState";
import { useTodos } from "@/hooks/useTodo";
import { addTodo, deleteTodo, toggleTodo, updateTodo } from "@/lib/todos";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { TaskEditDialog } from "@/components/task-edit-dialog";
import { TaskViewDialog } from "@/components/task-view-dialog";
import { TaskItem } from "@/components/task-item";
import { SortableItem } from "@/components/custom/sortable-item";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function TodoApp() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TodoAppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

function TodoAppContent() {
  // Create a client
  const { user, isLoading } = useAuth();
  const router = useRouter();
  // const [todos, setTodos] = usePersistedState<Todo[]>("todos", []);
  const { data: todos = [] } = useTodos(user?.id);
  const [isDarkMode, setIsDarkMode] = usePersistedState<boolean>(
    "isDarkMode",
    false
  );
  const [inputValue, setInputValue] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [xp, setXp] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const currentLevel = Math.floor(xp / 10) + 1;
  const xpInCurrentLevel = xp % 10;
  const xpNeededForNextLevel = 10;

  useEffect(() => {
    if (!user && !isLoading) {
      router.push("/sign-in");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (user) {
      const savedTodos = localStorage.getItem(`todos-${user.id}`);
      const savedXp = localStorage.getItem(`xp-${user.id}`);

      if (savedTodos) {
        // setTodos(JSON.parse(savedTodos));
      }
      if (savedXp) {
        setXp(Number.parseInt(savedXp));
      }
    } else {
      // Clear todos when user logs out
      // setTodos([]);
      setXp(0);
    }
  }, [user]);

  useEffect(() => {
    if (user && todos.length >= 0) {
      localStorage.setItem(`todos-${user.id}`, JSON.stringify(todos));
    }
  }, [todos, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`xp-${user.id}`, xp.toString());
    }
  }, [xp, user]);

  if (isLoading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="text-center">
          <div
            className={`w-8 h-8 border-2 rounded-full animate-spin mx-auto mb-4 ${
              isDarkMode
                ? "border-gray-600 border-t-blue-400"
                : "border-gray-300 border-t-blue-500"
            }`}
          />
          <p
            className={`text-sm ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  const handleAdd = async () => {
    if (!inputValue.trim()) return;
    await addTodo(user.id, inputValue);
    setInputValue("");
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // addTodo();
      handleAdd();
    }
  };

  const startEditing = (id: string, text: string) => {
    setEditingId(id);
    setEditValue(text);
  };

  const saveEdit = (id: string) => {
    if (editValue.trim() !== "") {
      const updatedTodos = todos.map((todo) =>
        todo.id === id ? { ...todo, title: editValue } : todo
      );
      // setTodos(updatedTodos);
      updateTodo(user.id, id, { title: editValue });
      toast.success("Task updated");
    }
    setEditingId(null);
    setEditValue("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const handleEditKeyPress = (
    e: KeyboardEvent<HTMLInputElement>,
    id: string
  ) => {
    if (e.key === "Enter") {
      saveEdit(id);
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  };

  const handleToggle = async (id: string, completed: boolean) => {
    try {
      if (user) await toggleTodo(user.id, id, completed);
      toast.success(`Task marked as ${completed ? "completed" : "incomplete"}`);

      todos.map((todo) => {
        if (todo.id === id) {
          const updatedTodo = { ...todo, completed: !todo.completed };
          if (!todo.completed && updatedTodo.completed) {
            setXp((prev) => prev + 1);
          } else if (todo.completed && !updatedTodo.completed) {
            setXp((prev) => Math.max(0, prev - 1));
          }
          return updatedTodo;
        }
        return todo;
      });
    } catch (error) {
      console.error("Error toggling task:", error);
      toast.error("Failed to toggle task");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (user) await deleteTodo(user.id, id);
      setXp((prevXp) => (prevXp > 0 ? prevXp + 2 : 0));
      toast.success("Task deleted!");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  const deleteAllTasks = () => {
    try {
      const tasksToDelete = todos.filter((todo) => {
        if (filter === "active") return !todo.completed;
        if (filter === "completed") return todo.completed;
        return true;
      });
      tasksToDelete.forEach((todo) => deleteTodo(user.id, todo.id));
      toast.success("Tasks deleted successfully");
    } catch (error) {
      console.error("Error deleting tasks:", error);
      toast.error("Failed to delete tasks");
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // const handleDragEnd = (event: DragEndEvent) => {
  //   const { active, over } = event;

  //   if (over && active.id !== over.id) {
  //     setTodos((items) => {
  //       const oldIndex = items.findIndex((item) => item.id === active.id);
  //       const newIndex = items.findIndex((item) => item.id === over.id);

  //       const newItems = arrayMove(items, oldIndex, newIndex);
  //       return newItems.map((item, index) => ({
  //         ...item,
  //         priority: newItems.length - index,
  //       }));
  //     });
  //   }

  //   setActiveId(null);
  // };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = todos.findIndex((item) => item.id === active.id);
    const newIndex = todos.findIndex((item) => item.id === over.id);

    const reordered = arrayMove(todos, oldIndex, newIndex);

    reordered.forEach(async (item, index) => {
      await updateTodo(user.id, item.id, {
        priority: reordered.length - index,
      });
    });

    setActiveId(null);
  };

  const handleViewTask = (todo: Todo) => {
    setSelectedTodo(todo);
    setViewDialogOpen(true);
  };

  const handleEditTask = (todo: Todo) => {
    setSelectedTodo(todo);
    setEditDialogOpen(true);
  };

  // const handleSaveTask = (updatedTodo: Todo) => {
  //   setTodos(
  //     todos.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo))
  //   );
  //   setEditDialogOpen(false);
  //   setSelectedTodo(null);
  // };

  const handleSaveTask = async (updatedTodo: Todo) => {
    if (user) {
      await updateTodo(user.id, updatedTodo.id, {
        title: updatedTodo.title,
        description: updatedTodo.description,
        completed: updatedTodo.completed,
        dueDate: updatedTodo.dueDate,
      });
    }
    setEditDialogOpen(false);
    toast.success(`Task ${updatedTodo.priority} updated successfully!`);
    setSelectedTodo(null);
  };

  const sortedTodos = [...todos].sort(
    (a, b) => (b.priority || 0) - (a.priority || 0)
  );

  const filteredTodos = sortedTodos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const remainingTasks = todos.filter((todo) => !todo.completed).length;

  const XPProgressBar = () => (
    <div
      className={`px-8 py-6 border-b ${
        isDarkMode ? "border-gray-700" : "border-gray-100"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className={`text-sm font-medium ${
            isDarkMode ? "text-gray-200" : "text-gray-700"
          }`}
        >
          Level {currentLevel}
        </span>
        <span
          className={`text-xs ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          XP: {xpInCurrentLevel}/{xpNeededForNextLevel}
        </span>
      </div>
      <div
        className={`w-full rounded-full h-2 overflow-hidden ${
          isDarkMode ? "bg-gray-700" : "bg-gray-100"
        }`}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
          initial={{ width: 0 }}
          animate={{
            width: `${(xpInCurrentLevel / xpNeededForNextLevel) * 100}%`,
          }}
          transition={{ type: "spring", bounce: 0.3, duration: 0.8 }}
        />
      </div>
    </div>
  );

  const activeTodo = activeId
    ? filteredTodos.find((todo) => todo.id === activeId)
    : null;
  const activeIndex = activeTodo
    ? filteredTodos.findIndex((todo) => todo.id === activeId)
    : -1;

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
    >
      <NavigationBar
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      <div className="max-w-2xl mx-auto py-8 px-4">
        <div
          className={`border rounded-xl shadow-sm ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <XPProgressBar />

          <div
            className={`px-8 py-6 border-b ${
              isDarkMode ? "border-gray-700" : "border-gray-100"
            }`}
          >
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Add a task..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className={`w-full text-lg font-normal bg-transparent border-0 border-b pb-2 transition-all duration-200 focus:outline-none ${
                    isDarkMode
                      ? "border-gray-600 text-white placeholder-gray-400 focus:border-gray-400"
                      : "border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-400"
                  }`}
                />
              </div>
              <Button
                onClick={handleAdd}
                variant="ghost"
                className={`h-10 px-3 rounded-md transition-all duration-200 ${
                  isDarkMode
                    ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {todos.length > 0 && (
            <div
              className={`px-8 py-4 border-b ${
                isDarkMode ? "border-gray-700" : "border-gray-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex gap-6">
                  {[
                    ["all", "All"],
                    ["active", "Active"],
                    ["completed", "Completed"],
                  ].map(([filterType, label]) => (
                    <button
                      key={filterType}
                      onClick={() => setFilter(filterType as FilterType)}
                      className={`relative text-sm font-medium transition-all duration-200 pb-2 ${
                        filter === filterType
                          ? isDarkMode
                            ? "text-white"
                            : "text-gray-900"
                          : isDarkMode
                          ? "text-gray-400 hover:text-gray-200"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {label}
                      {filter === filterType && (
                        <motion.div
                          layoutId="activeTab"
                          className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                            isDarkMode ? "bg-white" : "bg-gray-900"
                          }`}
                          transition={{
                            type: "spring",
                            bounce: 0.2,
                            duration: 0.6,
                          }}
                        />
                      )}
                    </button>
                  ))}
                </div>

                {filteredTodos.length > 0 && (
                  <Button
                    onClick={deleteAllTasks}
                    variant="ghost"
                    size="sm"
                    className={`text-xs px-3 py-1 rounded-md transition-all duration-200 ${
                      isDarkMode
                        ? "text-gray-400 hover:text-red-400 hover:bg-red-900/20"
                        : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                    }`}
                  >
                    Delete All{" "}
                    {filter === "all"
                      ? ""
                      : filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="px-8">
            {todos.length === 0 ? (
              <div className="text-center py-16">
                <p
                  className={`text-lg font-light mb-2 ${
                    isDarkMode ? "text-gray-400" : "text-gray-400"
                  }`}
                >
                  No tasks yet
                </p>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  Add a task above to get started
                </p>
              </div>
            ) : filteredTodos.length === 0 ? (
              <div className="text-center py-16">
                <p
                  className={`text-lg font-light mb-2 ${
                    isDarkMode ? "text-gray-400" : "text-gray-400"
                  }`}
                >
                  No {filter} tasks
                </p>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  {filter === "active" && "All tasks are completed"}
                  {filter === "completed" && "No completed tasks yet"}
                </p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={filteredTodos.map((todo) => todo.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-0">
                    <AnimatePresence mode="popLayout">
                      {filteredTodos.map((todo, index) => (
                        <SortableItem
                          key={todo.id}
                          todo={todo}
                          index={index}
                          isDarkMode={isDarkMode}
                          editingId={editingId}
                          editValue={editValue}
                          setEditValue={setEditValue}
                          toggleTodo={handleToggle}
                          deleteTodo={handleDelete}
                          startEditing={startEditing}
                          saveEdit={saveEdit}
                          cancelEdit={cancelEdit}
                          handleEditKeyPress={handleEditKeyPress}
                          onViewTask={handleViewTask}
                          onEditTask={handleEditTask}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </SortableContext>
                <DragOverlay>
                  {activeTodo ? (
                    <div
                      className={`transform rotate-3 scale-105 ${
                        isDarkMode
                          ? "bg-gray-800 border-gray-600"
                          : "bg-white border-gray-200"
                      } border rounded-lg shadow-2xl p-4 cursor-grabbing`}
                    >
                      <TaskItem
                        todo={activeTodo}
                        index={activeIndex}
                        isDarkMode={isDarkMode}
                        editingId={editingId}
                        editValue={editValue}
                        setEditValue={setEditValue}
                        toggleTodo={handleToggle}
                        deleteTodo={handleDelete}
                        startEditing={startEditing}
                        saveEdit={saveEdit}
                        cancelEdit={cancelEdit}
                        handleEditKeyPress={handleEditKeyPress}
                        onViewTask={handleViewTask}
                        onEditTask={handleEditTask}
                        isDragging={true}
                      />
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            )}
          </div>

          {todos.length > 0 && (
            <div
              className={`px-8 py-6 border-t ${
                isDarkMode ? "border-gray-700" : "border-gray-100"
              }`}
            >
              <div className="text-center">
                <p
                  className={`text-sm font-light ${
                    isDarkMode ? "text-gray-400" : "text-gray-400"
                  }`}
                >
                  {remainingTasks === 0
                    ? "All tasks completed!"
                    : `${remainingTasks} tasks left`}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedTodo && (
        <>
          <TaskEditDialog
            todo={selectedTodo}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onSave={handleSaveTask}
            isDarkMode={isDarkMode}
          />
          <TaskViewDialog
            todo={selectedTodo}
            open={viewDialogOpen}
            onOpenChange={setViewDialogOpen}
            isDarkMode={isDarkMode}
          />
        </>
      )}
    </div>
  );
}
