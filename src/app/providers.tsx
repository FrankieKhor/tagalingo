import { type ReactNode, useEffect } from "react"

import { useAppStore } from "@/store/use-app-store"

export function AppProviders({ children }: { children: ReactNode }) {
  const initialize = useAppStore((state) => state.initialize)
  const theme = useAppStore((state) => state.snapshot.settings.theme)

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle("dark", theme === "dark")
  }, [theme])

  return children
}
