"use client";

import { useAuth } from "@/contexts/auth-context";
import { useTodos } from "@/hooks/useTodo";
import { addTodo, toggleTodo, deleteTodo } from "@/lib/todos";
import { useState } from "react";

export default function TodoList() {
  const { user } = useAuth();
  const { data: todos = [] } = useTodos(user?.id);
  const [input, setInput] = useState("");

  if (!user) return <p>Please login</p>;

  const handleAdd = async () => {
    if (!input.trim()) return;
    await addTodo(user.id, input);
    setInput("");
  };

  return (
    <div>
      <h2>My Todos</h2>
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={handleAdd}>Add</button>

      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(user.id, todo.id, !todo.completed)}
            />
            {todo.title}
            <button onClick={() => deleteTodo(user.id, todo.id)}>x</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
