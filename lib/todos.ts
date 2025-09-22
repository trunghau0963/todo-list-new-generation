import { db } from "@/firebase/config";
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp
} from "firebase/firestore";
import { Todo } from "@/models/Todo";

export async function getTodos(uid: string): Promise<Todo[]> {
  const ref = collection(db, "users", uid, "todos");
  const snapshot = await getDocs(ref);
  return snapshot.docs.map(docSnap => ({
    id: docSnap.id,
    ...docSnap.data(),
    createdAt: docSnap.data().createdAt?.toDate() ?? new Date(),
  })) as Todo[];
}

export async function addTodo(uid: string, text: string) {
  const ref = collection(db, "users", uid, "todos");
  await addDoc(ref, {
    title: text,
    description: "",
    completed: false,
    dueDate: null,
    createdAt: Timestamp.now(),
  });
}

export async function toggleTodo(uid: string, id: string, completed: boolean) {
  const ref = doc(db, "users", uid, "todos", id);
  await updateDoc(ref, { completed });
}

export async function deleteTodo(uid: string, id: string) {
  const ref = doc(db, "users", uid, "todos", id);
  await deleteDoc(ref);
}

export async function updateTodo(uid: string, id: string, updates: Partial<Omit<Todo, 'id' | 'createdAt'>>) {
  const ref = doc(db, "users", uid, "todos", id);
  await updateDoc(ref, updates);
}
