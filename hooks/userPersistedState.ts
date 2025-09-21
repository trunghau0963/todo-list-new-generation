import { loadFromLocalStorage, saveToLocalStorage } from "@/utils/localStorage";
import { useEffect, useState } from "react";

export function usePersistedState<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(() => {
    return loadFromLocalStorage<T>(key, initialValue);
  });

  useEffect(() => {
    saveToLocalStorage(key, state);
  }, [key, state]);

    return [state, setState] as const; // 'as const' ensures the tuple type is preserved
                                    // it means the return type is a tuple of [T, React.Dispatch<React.SetStateAction<T>>]
}
