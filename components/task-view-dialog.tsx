import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Circle } from "lucide-react"
import type { Todo } from "@/models/Todo"

interface TaskViewDialogProps {
  todo: Todo
  open: boolean
  onOpenChange: (open: boolean) => void
  isDarkMode: boolean
}

export function TaskViewDialog({ todo, open, onOpenChange, isDarkMode }: TaskViewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`sm:max-w-[425px] ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className={`text-lg font-semibold flex-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              {todo.title}
            </DialogTitle>
            <Badge
              variant={todo.completed ? "default" : "secondary"}
              className={`ml-3 flex items-center gap-1 ${
                todo.completed
                  ? isDarkMode
                    ? "bg-green-900 text-green-100 hover:bg-green-800"
                    : "bg-green-100 text-green-800 hover:bg-green-200"
                  : isDarkMode
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {todo.completed ? (
                <>
                  <CheckCircle className="w-3 h-3" />
                  Completed
                </>
              ) : (
                <>
                  <Circle className="w-3 h-3" />
                  Pending
                </>
              )}
            </Badge>
          </div>
        </DialogHeader>

        <div className="py-4">
          {todo.description ? (
            <div className="space-y-2">
              <h4 className={`text-sm font-medium ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>Description</h4>
              <div
                className={`text-sm leading-relaxed p-3 rounded-md ${
                  isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-50 text-gray-600"
                }`}
              >
                {todo.description}
              </div>
            </div>
          ) : (
            <div className={`text-sm italic text-center py-8 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
              No description provided
            </div>
          )}
        </div>

        <div className={`pt-4 border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
          <div className="flex items-center justify-between text-xs">
            <span className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Priority: #{todo.priority || 1}</span>
            <span className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>ID: {todo.id}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
