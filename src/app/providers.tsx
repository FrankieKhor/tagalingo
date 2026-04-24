import { type ReactNode, useEffect } from 'react'

import { useAuthStore } from '@/store/use-auth-store'
import { useAppStore } from '@/store/use-app-store'

export function AppProviders({ children }: { children: ReactNode }) {
	const initialize = useAppStore((state) => state.initialize)
	const initializeAuth = useAuthStore((state) => state.initialize)
	const theme = useAppStore((state) => state.snapshot.settings.theme)

	useEffect(() => {
		return initializeAuth((user) => {
			void initialize(user)
		})
	}, [initialize, initializeAuth])

	useEffect(() => {
		const root = document.documentElement
		root.classList.toggle('dark', theme === 'dark')
	}, [theme])

	return children
}
