export interface StorageAdapter {
  getItem<T>(key: string, fallback: T): T
  setItem<T>(key: string, value: T): void
  removeItem(key: string): void
}

export function createBrowserStorageAdapter(): StorageAdapter {
  return {
    getItem<T>(key: string, fallback: T): T {
      if (typeof window === "undefined") {
        return fallback
      }

      try {
        const raw = window.localStorage.getItem(key)
        return raw ? (JSON.parse(raw) as T) : fallback
      } catch {
        return fallback
      }
    },
    setItem<T>(key: string, value: T) {
      if (typeof window === "undefined") {
        return
      }

      window.localStorage.setItem(key, JSON.stringify(value))
    },
    removeItem(key: string) {
      if (typeof window === "undefined") {
        return
      }

      window.localStorage.removeItem(key)
    },
  }
}
