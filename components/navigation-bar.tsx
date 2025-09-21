"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { LogOut, User, Sun, Moon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface NavigationBarProps {
  isDarkMode: boolean
  toggleDarkMode: () => void
}

export default function NavigationBar({ isDarkMode, toggleDarkMode }: NavigationBarProps) {
  const { user, logout } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)

  if (!user) return null

  return (
    <nav className={`border-b px-6 py-4 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: App Title */}
        <div className="flex items-center">
          <h1 className={`text-2xl font-light tracking-tight ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            Todo App
          </h1>
        </div>

        {/* Right: User Profile & Controls */}
        <div className="flex items-center gap-4">
          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDarkMode}
            className={`h-9 w-9 p-0 rounded-lg transition-all duration-200 ${
              isDarkMode
                ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          {/* User Profile Dropdown */}
          <div className="relative">
            <Button
              variant="ghost"
              onClick={() => setShowDropdown(!showDropdown)}
              className={`flex items-center gap-3 h-10 px-3 rounded-lg transition-all duration-200 ${
                isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
              }`}
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden flex-shrink-0">
                {user.avatar ? (
                  <img src={user.avatar || "/placeholder.svg"} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div
                    className={`w-full h-full flex items-center justify-center ${
                      isDarkMode ? "bg-gray-600" : "bg-gray-300"
                    }`}
                  >
                    <User className={`w-4 h-4 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`} />
                  </div>
                )}
              </div>

              {/* User Name */}
              <span className={`text-sm font-medium hidden sm:block ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                {user.name}
              </span>
            </Button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className={`absolute right-0 top-12 w-64 rounded-lg shadow-lg z-50 border ${
                    isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                  }`}
                >
                  {/* User Info */}
                  <div className={`px-4 py-3 border-b ${isDarkMode ? "border-gray-700" : "border-gray-100"}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                        {user.avatar ? (
                          <img
                            src={user.avatar || "/placeholder.svg"}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div
                            className={`w-full h-full flex items-center justify-center ${
                              isDarkMode ? "bg-gray-600" : "bg-gray-300"
                            }`}
                          >
                            <User className={`w-5 h-5 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                          {user.name}
                        </p>
                        <p className={`text-xs truncate ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Logout Button */}
                  <div className="p-2">
                    <Button
                      onClick={() => {
                        logout()
                        setShowDropdown(false)
                      }}
                      variant="ghost"
                      className={`w-full justify-start h-9 px-3 rounded-md transition-all duration-200 ${
                        isDarkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Backdrop to close dropdown */}
            {showDropdown && <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />}
          </div>
        </div>
      </div>
    </nav>
  )
}
