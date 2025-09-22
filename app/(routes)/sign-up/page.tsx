"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type React from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { motion } from "framer-motion";
import { usePersistedState } from "@/hooks/usePersistedState";
import { toast } from "sonner";

import { Eye, EyeOff } from "lucide-react";
import { PasswordInput } from "@/components/input-password";

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isDarkMode, setIsDarkMode] = usePersistedState<boolean>(
    "isDarkMode",
    false
  );

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword) {
      toast.warning("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.warning("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.warning("Password must be at least 6 characters");
      return;
    }

    try {
      setError("");
      const res = await signUp(email, password);
      if (!res) {
        toast.error("Login failed. Please try again.", {
          description: "Invalid email or password.",
          action: {
            label: "Retry",
            onClick: () => handleSignUp(e),
          },
          cancel: { label: "Dismiss", onClick: () => {} },
        });
        return;
      }
      router.push("/sign-in");
      toast.success("Account created successfully! Please log in.");
    } catch (err) {
      toast.error("Sign up failed. Please try again.");
    }
  };

  const handleSwitchToSignIn = () => {
    router.push("/sign-in");
    toast("Switched to Sign In page");
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div
          className={`rounded-xl shadow-lg border p-8 ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1
              className={`text-3xl font-light tracking-tight mb-2 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Create Account
            </h1>
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Join Todo App to manage your tasks
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Sign Up Form */}
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full h-12 px-4 rounded-lg outline-none transition-all duration-200 ${
                  isDarkMode
                    ? "border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    : "border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                }`}
                disabled={isLoading}
              />
            </div>

            <PasswordInput
              value={password}
              onChange={setPassword}
              placeholder="Password"
              required
              isDarkMode={isDarkMode}
            />

            <PasswordInput
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Confirm Password"
              required
              isDarkMode={isDarkMode}
            />
            <Button
              type="submit"
              disabled={isLoading}
              className={`w-full h-12 font-medium rounded-lg transition-all duration-200 ${
                isDarkMode
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-900 hover:bg-gray-800 text-white"
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>

          {/* Switch to Login */}
          <div className="mt-6 text-center">
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Already have an account?{" "}
              <button
                onClick={handleSwitchToSignIn}
                className={`font-medium transition-colors duration-200 ${
                  isDarkMode
                    ? "text-blue-400 hover:text-blue-300"
                    : "text-blue-600 hover:text-blue-500"
                }`}
                disabled={isLoading}
              >
                Login
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
