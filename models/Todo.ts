export type Todo = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority?: number;
  dueDate?: Date;
  createdAt: Date;
};