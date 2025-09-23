"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { Todo } from "@/models/Todo"

interface TaskEditDialogProps {
  todo: Todo
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (todo: Todo) => void
  isDarkMode: boolean
}

export function TaskEditDialog({ todo, open, onOpenChange, onSave, isDarkMode }: TaskEditDialogProps) {
  const [title, setTitle] = useState(todo.title)
  const [description, setDescription] = useState(todo.description || "")
  const [completed, setCompleted] = useState(todo.completed)

  useEffect(() => {
    setTitle(todo.title)
    setDescription(todo.description || "")
    setCompleted(todo.completed)
  }, [todo])

  const handleSave = () => {
    console.log("Saving todo:", { ...todo, title, description, completed })
    if (title.trim()) {
      onSave({
        ...todo,
        title: title.trim(),
        description: description.trim(),
        completed: completed,
      })
    }
  }

  const handleCancel = () => {
    setTitle(todo.title)
    setDescription(todo.description || "")
    setCompleted(todo.completed)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`sm:max-w-[425px] ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
      >
        <DialogHeader>
          <DialogTitle className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            Edit Task
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className={`text-sm font-medium ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title..."
              className={`${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-gray-500"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-gray-400"
              }`}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="description"
              className={`text-sm font-medium ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
            >
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description..."
              rows={3}
              className={`resize-none ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-gray-500"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-gray-400"
              }`}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="completed"
              checked={completed}
              onCheckedChange={() => setCompleted(!todo.completed)}
              className={`${
                isDarkMode
                  ? "border-gray-600 data-[state=checked]:bg-white data-[state=checked]:border-white"
                  : "border-gray-300 data-[state=checked]:bg-gray-900 data-[state=checked]:border-gray-900"
              }`}
            />
            <Label htmlFor="completed" className={`text-sm ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
              Mark as completed
            </Label>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            className={`${
              isDarkMode
                ? "border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!title.trim()}
            className={`${
              isDarkMode ? "bg-white text-gray-900 hover:bg-gray-100" : "bg-gray-900 text-white hover:bg-gray-800"
            }`}
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
