export function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    // Check if we're running in a browser environment
    if (typeof window !== 'undefined') {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : defaultValue;
    }
    return defaultValue;
  } catch (error) {
    console.error("Error loading from localStorage", error);
    return defaultValue;
  }
}

export function saveToLocalStorage<T>(key: string, value: T): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (error) {
    console.error("Error saving to localStorage", error);
  }
}