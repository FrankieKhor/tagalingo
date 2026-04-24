import { create } from 'zustand'

import {
	createAccountWithEmail,
	signInWithEmail,
	signInWithGoogle,
	signOutUser,
	subscribeToAuth,
	type AuthUser,
} from '@/lib/firebase/auth'
import { firebaseConfigured } from '@/lib/firebase/client'

type AuthMode = 'idle' | 'signing-in' | 'signing-up' | 'signing-out'

type AuthState = {
	user: AuthUser | null
	loading: boolean
	mode: AuthMode
	error?: string
	initialize: (onUserChange?: (user: AuthUser | null) => void) => () => void
	signIn: (email: string, password: string) => Promise<void>
	signUp: (email: string, password: string) => Promise<void>
	signInWithGoogle: () => Promise<void>
	signOut: () => Promise<void>
}

async function runAuthAction(
	set: (partial: Partial<AuthState>) => void,
	mode: AuthMode,
	action: () => Promise<void>
) {
	set({ mode, error: undefined })

	try {
		await action()
		set({ mode: 'idle' })
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Authentication failed.'
		set({ mode: 'idle', error: message })
		throw error
	}
}

export const useAuthStore = create<AuthState>((set) => ({
	user: null,
	loading: firebaseConfigured,
	mode: 'idle',
	initialize: (onUserChange) => {
		if (!firebaseConfigured) {
			set({
				user: null,
				loading: false,
				error:
					'Firebase is not configured yet. Add your Vite Firebase env vars.',
			})
			onUserChange?.(null)
			return () => undefined
		}

		return subscribeToAuth((user) => {
			set({ user, loading: false, error: undefined })
			onUserChange?.(user)
		})
	},
	signIn: (email, password) =>
		runAuthAction(set, 'signing-in', () => signInWithEmail(email, password)),
	signUp: (email, password) =>
		runAuthAction(set, 'signing-up', () =>
			createAccountWithEmail(email, password)
		),
	signInWithGoogle: () => runAuthAction(set, 'signing-in', signInWithGoogle),
	signOut: () => runAuthAction(set, 'signing-out', signOutUser),
}))
