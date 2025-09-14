"use client";
import { useState, useEffect, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Sun, Moon, Edit2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

type FilterType = "all" | "active" | "completed";

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { setTheme } = useTheme();
  const [xp, setXp] = useState(0);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const currentLevel = Math.floor(xp / 10) + 1;
  const xpInCurrentLevel = xp % 10;
  const xpNeededForNextLevel = 10;

  useEffect(() => {
    if (isDarkMode) {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }, [isDarkMode]);

  const addTodo = () => {
    if (inputValue.trim() !== "") {
      const newTodo: Todo = {
        id: Date.now(),
        text: inputValue.trim(),
        completed: false,
      };
      setTodos([...todos, newTodo]);
      setInputValue("");
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addTodo();
    }
  };

  const startEditing = (id: number, text: string) => {
    setEditingId(id);
    setEditValue(text);
  };

  const saveEdit = (id: number) => {
    if (editValue.trim() !== "") {
      setTodos(
        todos.map((todo) =>
          todo.id === id ? { ...todo, text: editValue.trim() } : todo
        )
      );
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
    id: number
  ) => {
    if (e.key === "Enter") {
      saveEdit(id);
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(
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
      })
    );
  };

  const deleteTodo = (id: number) => {
    const todoToDelete = todos.find((todo) => todo.id === id);
    if (todoToDelete?.completed) {
      setXp((prev) => Math.max(0, prev - 1));
    }
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const deleteAllTasks = () => {
    const tasksToDelete = filteredTodos;
    const completedTasksToDelete = tasksToDelete.filter(
      (todo) => todo.completed
    );

    // Subtract XP for completed tasks being deleted
    if (completedTasksToDelete.length > 0) {
      setXp((prev) => Math.max(0, prev - completedTasksToDelete.length));
    }

    // Remove filtered tasks from the main todos array
    setTodos(
      todos.filter(
        (todo) => !tasksToDelete.some((filtered) => filtered.id === todo.id)
      )
    );
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const remainingTasks = todos.filter((todo) => !todo.completed).length;

  const NotionCheckbox = ({
    checked,
    onChange,
  }: {
    checked: boolean;
    onChange: () => void;
  }) => (
    <button
      onClick={onChange}
      className={`w-4 h-4 border border-primary-300 rounded-sm transition-all duration-200 hover:border-primary-400 hover:shadow-sm flex items-center justify-center ${
        checked ? "bg-gray-900 border-primary-900" : "bg-gray dark:bg-gray-400 hover:bg-gray-50"
      }`}
    >
      {checked && (
        <svg
          className="w-2.5 h-2.5 text-white"
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
  );

  const XPProgressBar = () => (
    <div className="px-8 py-6 border-b border-primary-100">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-300">
          Level {currentLevel}
        </span>
        <span className="text-xs  text-gray-500 dark:text-gray-300">
          XP: {xpInCurrentLevel}/{xpNeededForNextLevel}
        </span>
      </div>
      <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
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

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className=" border border-primary-100 rounded-xl shadow-sm">
          <div className="text-center py-8 px-8 relative border-b border-primary-100">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="absolute top-6 right-6 h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-all duration-200"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>
            <h1 className="text-3xl font-light text-gray-900 dark:text-gray-100 tracking-tight">
              Todo App
            </h1>
          </div>

          <XPProgressBar />

          <div className="px-8 py-6 border-b border-primary-100">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Add a task..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full text-lg font-normal bg-transparent border-0 border-b border-primary-200 text-gray-900 dark:text-gray-50 placeholder-gray-400 dark:placeholder-gray-400 focus:border-primary-400 focus:outline-none pb-2 transition-all duration-200"
                />
              </div>
              <Button
                onClick={addTodo}
                variant="ghost"
                className="h-10 px-3 text-gray-500 dark:text-gray-300 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {todos.length > 0 && (
            <div className="px-8 py-4 border-b border-primary-100">
              <div className="flex items-center justify-between">
                <div className="flex gap-6">
                  {(
                    [
                      ["all", "All"],
                      ["active", "Active"],
                      ["completed", "Completed"],
                    ] as [FilterType, string][]
                  ).map(([filterType, label]) => (
                    <button
                      key={filterType}
                      onClick={() => setFilter(filterType)}
                      className={`relative text-sm font-medium transition-all duration-200 pb-2 ${
                        filter === filterType
                          ? "text-gray-900 dark:text-gray-50"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {label}
                      {filter === filterType && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 dark:bg-gray-50 rounded-full"
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
                    className="text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 px-3 py-1 rounded-md transition-all duration-200"
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
                <p className="text-lg text-gray-400 font-light mb-2">
                  No tasks yet
                </p>
                <p className="text-sm text-gray-400">
                  Add a task above to get started
                </p>
              </div>
            ) : filteredTodos.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-lg text-gray-400 font-light mb-2">
                  No {filter} tasks
                </p>
                <p className="text-sm text-gray-400">
                  {filter === "active" && "All tasks are completed"}
                  {filter === "completed" && "No completed tasks yet"}
                </p>
              </div>
            ) : (
              <div className="space-y-0">
                <AnimatePresence mode="popLayout">
                  {filteredTodos.map((todo) => (
                    <motion.div
                      key={todo.id}
                      layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{
                        opacity: 0,
                        scale: 0.95,
                        transition: { duration: 0.15 },
                      }}
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.4,
                      }}
                    >
                      <div className="group py-4 border-b border-primary-100 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-200 rounded-sm">
                        <div className="flex items-center gap-4">
                          <NotionCheckbox
                            checked={todo.completed}
                            onChange={() => toggleTodo(todo.id)}
                          />
                          {editingId === todo.id ? (
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => handleEditKeyPress(e, todo.id)}
                              onBlur={() => saveEdit(todo.id)}
                              className="flex-1 text-lg font-normal bg-transparent border-0 border-b border-primary-300 text-gray-900 dark:text-gray-100 focus:border-primary-500 focus:outline-none pb-1 transition-all duration-200"
                              autoFocus
                            />
                          ) : (
                            <span
                              className={`flex-1 text-lg font-normal transition-all duration-200 ${
                                todo.completed
                                  ? "line-through text-gray-400"
                                  : "text-gray-900 dark:text-gray-100"
                              }`}
                            >
                              {todo.text}
                            </span>
                          )}
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                            {editingId !== todo.id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => startEditing(todo.id, todo.text)}
                                className="h-8 w-8 p-0 text-gray-300 hover:text-gray-500 hover:bg-gray-100 rounded-md transition-all duration-200"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteTodo(todo.id)}
                              className="h-8 w-8 p-0 text-gray-300 hover:text-gray-500 hover:bg-gray-100 rounded-md transition-all duration-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {todos.length > 0 && (
            <div className="px-8 py-6 border-t border-primary-100">
              <div className="text-center">
                <p className="text-sm text-gray-400 font-light">
                  {remainingTasks === 0
                    ? "All tasks completed! 🎉"
                    : `${remainingTasks} tasks left`}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
