"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type React from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { motion } from "framer-motion";
import { usePersistedState } from "@/hooks/userPersistedState";
import { toast } from "sonner";

import { Eye, EyeOff } from "lucide-react";
import { PasswordInput } from "@/components/input-password";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = usePersistedState<boolean>(
    "isDarkMode",
    false
  );

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warning("Please fill in all fields", {
        description: "All fields are required to log in.",
        action: {
          label: "Close",
          onClick: () => {},
        },
      });
      return;
    }

    try {
      setError("");
      const result = await login(email, password);
      if (!result) {
        toast.error("Login failed. Please try again.", {
          description: "Invalid email or password.",
          action: {
            label: "Retry",
            onClick: () => handleEmailLogin(e),
          },
          cancel: { label: "Dismiss", onClick: () => {} },
        });
        return;
      }
      router.push("/");
      toast.success("Logged in successfully!");
    } catch (err) {
      toast.error("Login failed. Please try again.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError("");
      const success = await loginWithGoogle();
      if (!success) {
        toast.error("Google login failed. Please try again.");
        return;
      }
      router.push("/");
      toast.success("Logged in with Google successfully!");
    } catch (err) {
      toast.error("Google login failed. Please try again.");
    }
  };

  const handleSwitchToSignUp = () => {
    router.push("/sign-up");
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
              Todo App
            </h1>
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Sign in to manage your tasks
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

          <form onSubmit={handleEmailLogin} className="space-y-4 mb-4">
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
                "Login"
              )}
            </Button>
          </form>

          {/* Google Login Button */}
          <Button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className={`w-full mb-6 h-12 font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-3 ${
              isDarkMode
                ? "bg-gray-700 hover:bg-gray-600 text-white border border-gray-600"
                : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
            }`}
          >
            {isLoading ? (
              <div
                className={`w-5 h-5 border-2 rounded-full animate-spin ${
                  isDarkMode
                    ? "border-gray-400 border-t-white"
                    : "border-gray-300 border-t-gray-600"
                }`}
              />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Login with Google
              </>
            )}
          </Button>

          <div className="text-center">
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Don't have an account?{" "}
              <button
                onClick={handleSwitchToSignUp}
                className={`font-medium transition-colors duration-200 ${
                  isDarkMode
                    ? "text-blue-400 hover:text-blue-300"
                    : "text-blue-600 hover:text-blue-500"
                }`}
                disabled={isLoading}
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
