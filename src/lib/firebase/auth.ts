import {
	createUserWithEmailAndPassword,
	GoogleAuthProvider,
	onAuthStateChanged,
	signInWithEmailAndPassword,
	signInWithPopup,
	signOut,
	type User,
} from 'firebase/auth'

import { firebaseAuth } from '@/lib/firebase/client'

const googleProvider = new GoogleAuthProvider()

export type AuthUser = Pick<User, 'uid' | 'displayName' | 'email' | 'photoURL'>

export function toAuthUser(user: User | null): AuthUser | null {
	if (!user) {
		return null
	}

	return {
		uid: user.uid,
		displayName: user.displayName,
		email: user.email,
		photoURL: user.photoURL,
	}
}

export function subscribeToAuth(callback: (user: AuthUser | null) => void) {
	return onAuthStateChanged(firebaseAuth, (user) => callback(toAuthUser(user)))
}

export async function signInWithEmail(email: string, password: string) {
	await signInWithEmailAndPassword(firebaseAuth, email, password)
}

export async function createAccountWithEmail(email: string, password: string) {
	await createUserWithEmailAndPassword(firebaseAuth, email, password)
}

export async function signInWithGoogle() {
	await signInWithPopup(firebaseAuth, googleProvider)
}

export async function signOutUser() {
	await signOut(firebaseAuth)
}
