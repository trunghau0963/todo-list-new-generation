"use client"
import { useState, useEffect, type KeyboardEvent } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2, Plus, Edit2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { AuthProvider, useAuth } from "@/contexts/auth-context"
import NavigationBar from "@/components/navigation-bar"
import type { Todo } from "@/models/Todo"
import type { FilterType } from "@/consts/type"
import { usePersistedState } from "@/hooks/userPersistedState"

function TodoAppContent() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [todos, setTodos] = usePersistedState<Todo[]>("todos", [])
  const [isDarkMode, setIsDarkMode] = usePersistedState<boolean>("isDarkMode", false)
  const [inputValue, setInputValue] = useState("")
  const [filter, setFilter] = useState<FilterType>("all")
  const [xp, setXp] = useState(0)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState("")

  const currentLevel = Math.floor(xp / 10) + 1
  const xpInCurrentLevel = xp % 10
  const xpNeededForNextLevel = 10

  useEffect(() => {
    if (!user && !isLoading) {
      router.push("/sign-in")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDarkMode])

  useEffect(() => {
    if (user) {
      const savedTodos = localStorage.getItem(`todos-${user.id}`)
      const savedXp = localStorage.getItem(`xp-${user.id}`)

      if (savedTodos) {
        setTodos(JSON.parse(savedTodos))
      }
      if (savedXp) {
        setXp(Number.parseInt(savedXp))
      }
    } else {
      // Clear todos when user logs out
      setTodos([])
      setXp(0)
    }
  }, [user])

  useEffect(() => {
    if (user && todos.length >= 0) {
      localStorage.setItem(`todos-${user.id}`, JSON.stringify(todos))
    }
  }, [todos, user])

  useEffect(() => {
    if (user) {
      localStorage.setItem(`xp-${user.id}`, xp.toString())
    }
  }, [xp, user])

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}>
        <div className="text-center">
          <div
            className={`w-8 h-8 border-2 rounded-full animate-spin mx-auto mb-4 ${
              isDarkMode ? "border-gray-600 border-t-blue-400" : "border-gray-300 border-t-blue-500"
            }`}
          />
          <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect via useEffect
  }

  const addTodo = () => {
    if (inputValue.trim() !== "") {
      const newTodo: Todo = {
        id: Date.now(),
        text: inputValue.trim(),
        completed: false,
      }
      setTodos([...todos, newTodo])
      setInputValue("")
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addTodo()
    }
  }

  const startEditing = (id: number, text: string) => {
    setEditingId(id)
    setEditValue(text)
  }

  const saveEdit = (id: number) => {
    if (editValue.trim() !== "") {
      setTodos(todos.map((todo) => (todo.id === id ? { ...todo, text: editValue.trim() } : todo)))
    }
    setEditingId(null)
    setEditValue("")
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditValue("")
  }

  const handleEditKeyPress = (e: KeyboardEvent<HTMLInputElement>, id: number) => {
    if (e.key === "Enter") {
      saveEdit(id)
    } else if (e.key === "Escape") {
      cancelEdit()
    }
  }

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) => {
        if (todo.id === id) {
          const updatedTodo = { ...todo, completed: !todo.completed }
          if (!todo.completed && updatedTodo.completed) {
            setXp((prev) => prev + 1)
          } else if (todo.completed && !updatedTodo.completed) {
            setXp((prev) => Math.max(0, prev - 1))
          }
          return updatedTodo
        }
        return todo
      }),
    )
  }

  const deleteTodo = (id: number) => {
    const todoToDelete = todos.find((todo) => todo.id === id)
    if (todoToDelete?.completed) {
      setXp((prev) => Math.max(0, prev - 1))
    }
    setTodos(todos.filter((todo) => todo.id !== id))
  }

  const deleteAllTasks = () => {
    const tasksToDelete = filteredTodos
    const completedTasksToDelete = tasksToDelete.filter((todo) => todo.completed)

    if (completedTasksToDelete.length > 0) {
      setXp((prev) => Math.max(0, prev - completedTasksToDelete.length))
    }

    setTodos(todos.filter((todo) => !tasksToDelete.some((filtered) => filtered.id === todo.id)))
  }

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed
    if (filter === "completed") return todo.completed
    return true
  })

  const remainingTasks = todos.filter((todo) => !todo.completed).length

  const XPProgressBar = () => (
    <div className={`px-8 py-6 border-b ${isDarkMode ? "border-gray-700" : "border-gray-100"}`}>
      <div className="flex items-center justify-between mb-3">
        <span className={`text-sm font-medium ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
          Level {currentLevel}
        </span>
        <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
          XP: {xpInCurrentLevel}/{xpNeededForNextLevel}
        </span>
      </div>
      <div className={`w-full rounded-full h-2 overflow-hidden ${isDarkMode ? "bg-gray-700" : "bg-gray-100"}`}>
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(xpInCurrentLevel / xpNeededForNextLevel) * 100}%` }}
          transition={{ type: "spring", bounce: 0.3, duration: 0.8 }}
        />
      </div>
    </div>
  )

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <NavigationBar isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />

      <div className="max-w-2xl mx-auto py-8 px-4">
        <div
          className={`border rounded-xl shadow-sm ${
            isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <XPProgressBar />

          <div className={`px-8 py-6 border-b ${isDarkMode ? "border-gray-700" : "border-gray-100"}`}>
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
                onClick={addTodo}
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
            <div className={`px-8 py-4 border-b ${isDarkMode ? "border-gray-700" : "border-gray-100"}`}>
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
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
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
                    Delete All {filter === "all" ? "" : filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="px-8">
            {todos.length === 0 ? (
              <div className="text-center py-16">
                <p className={`text-lg font-light mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-400"}`}>
                  No tasks yet
                </p>
                <p className={`text-sm ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                  Add a task above to get started
                </p>
              </div>
            ) : filteredTodos.length === 0 ? (
              <div className="text-center py-16">
                <p className={`text-lg font-light mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-400"}`}>
                  No {filter} tasks
                </p>
                <p className={`text-sm ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
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
                      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    >
                      <div
                        className={`group py-4 border-b rounded-sm transition-all duration-200 ${
                          isDarkMode ? "border-gray-700 hover:bg-gray-700/50" : "border-gray-100 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => toggleTodo(todo.id)}
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
                                className={`w-2.5 h-2.5 ${isDarkMode ? "text-gray-900" : "text-white"}`}
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
                            <span
                              className={`flex-1 text-lg font-normal transition-all duration-200 ${
                                todo.completed
                                  ? isDarkMode
                                    ? "line-through text-gray-500"
                                    : "line-through text-gray-400"
                                  : isDarkMode
                                    ? "text-white"
                                    : "text-gray-900"
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
                                  ? "text-gray-500 hover:text-gray-300 hover:bg-gray-600"
                                  : "text-gray-300 hover:text-gray-500 hover:bg-gray-100"
                              }`}
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
            <div className={`px-8 py-6 border-t ${isDarkMode ? "border-gray-700" : "border-gray-100"}`}>
              <div className="text-center">
                <p className={`text-sm font-light ${isDarkMode ? "text-gray-400" : "text-gray-400"}`}>
                  {remainingTasks === 0 ? "All tasks completed!" : `${remainingTasks} tasks left`}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function TodoApp() {
  return (
    <AuthProvider>
      <TodoAppContent />
    </AuthProvider>
  )
}
