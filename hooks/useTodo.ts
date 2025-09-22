import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/config";
import { getTodos } from "@/lib/todos";
import { Todo } from "@/models/Todo";

export function useTodos(uid: string | undefined) {
  const queryClient = useQueryClient();

  // Load từ cache hoặc fetch Firestore
  const query = useQuery<Todo[]>({
    queryKey: ["todos", uid],
    queryFn: () => getTodos(uid!),
    enabled: !!uid,
    staleTime: Infinity,
    initialData: () => queryClient.getQueryData(["todos", uid]) ?? [],
  });

  // Sync realtime với Firestore
  useEffect(() => {
    if (!uid) return;

    const ref = collection(db, "users", uid, "todos");
    const unsub = onSnapshot(ref, (snapshot) => {
      const todos: Todo[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() ?? new Date(),
      })) as Todo[];
      // console.log("Todos updated from Firestore:", todos);

      queryClient.setQueryData(["todos", uid], todos);
    });

    console.log("Listening to Firestore changes for user:", unsub);

    return () => unsub();
  }, [uid, queryClient]);

  return query;
}
