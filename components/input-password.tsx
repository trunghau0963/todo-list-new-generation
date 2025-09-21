"use client"
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

interface PasswordInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  isDarkMode: boolean
  className?: string
}

export function PasswordInput({
  value,
  onChange,
  placeholder = "Password",
  required = false,
  isDarkMode,
  className = "",
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className={`relative ${className}`}>
      <input
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={`w-full px-4 py-3 pr-12 rounded-lg border transition-colors ${
          isDarkMode
            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-gray-500"
            : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-gray-400"
        } focus:outline-none`}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
          isDarkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"
        } transition-colors`}
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  )
}
