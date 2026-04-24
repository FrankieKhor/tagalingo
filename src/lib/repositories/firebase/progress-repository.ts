import {
	addDoc,
	collection,
	doc,
	getDoc,
	serverTimestamp,
	setDoc,
} from 'firebase/firestore'

import type { AuthUser } from '@/lib/firebase/auth'
import { firestore } from '@/lib/firebase/client'
import type { ProgressSnapshot } from '@/lib/domain/models'
import { createInitialSnapshot, hydrateDailyState } from '@/lib/domain/progress'
import type {
	LessonAttemptRecord,
	ProgressRepository,
	XpEventRecord,
} from '@/lib/repositories/interfaces'
import { createLocalProgressRepository } from '@/lib/repositories/local/progress-repository'

const PROGRESS_SCHEMA_VERSION = 1

function progressRef(uid: string) {
	return doc(firestore, 'users', uid, 'progress', 'current')
}

function userRef(uid: string) {
	return doc(firestore, 'users', uid)
}

function createUserSnapshot(user: AuthUser): ProgressSnapshot {
	const initial = createInitialSnapshot()

	return {
		...initial,
		profile: {
			...initial.profile,
			id: user.uid,
			displayName:
				user.displayName ?? user.email?.split('@')[0] ?? 'Tagalingo Learner',
		},
	}
}

function mergeStoredSnapshot(snapshot: ProgressSnapshot, user: AuthUser) {
	const userSnapshot = createUserSnapshot(user)

	return hydrateDailyState({
		...userSnapshot,
		...snapshot,
		profile: {
			...userSnapshot.profile,
			...snapshot.profile,
			id: user.uid,
			displayName:
				snapshot.profile.displayName === 'Local Learner'
					? (user.displayName ??
						user.email?.split('@')[0] ??
						snapshot.profile.displayName)
					: snapshot.profile.displayName,
			dailyGoal: {
				...userSnapshot.profile.dailyGoal,
				...snapshot.profile.dailyGoal,
			},
		},
	})
}

export function createFirebaseProgressRepository(): ProgressRepository & {
	setUser(user: AuthUser | null): Promise<ProgressSnapshot>
} {
	const localRepository = createLocalProgressRepository()
	let user: AuthUser | null = null
	let cachedSnapshot: ProgressSnapshot | null = null

	async function writeUserDocument(currentUser: AuthUser) {
		const userDocument = {
			...(currentUser.displayName
				? { displayName: currentUser.displayName }
				: {}),
			...(currentUser.email ? { email: currentUser.email } : {}),
			...(currentUser.photoURL ? { photoURL: currentUser.photoURL } : {}),
			updatedAt: serverTimestamp(),
			createdAt: serverTimestamp(),
		}

		await setDoc(userRef(currentUser.uid), userDocument, { merge: true })
	}

	async function saveCloudSnapshot(snapshot: ProgressSnapshot) {
		if (!user) {
			cachedSnapshot = snapshot
			return
		}

		await Promise.all([
			writeUserDocument(user),
			setDoc(progressRef(user.uid), {
				...snapshot,
				schemaVersion: PROGRESS_SCHEMA_VERSION,
				updatedAt: serverTimestamp(),
			}),
		])
		cachedSnapshot = snapshot
	}

	async function readCloudSnapshot(currentUser: AuthUser) {
		await writeUserDocument(currentUser)

		const snapshotDocument = await getDoc(progressRef(currentUser.uid))

		if (snapshotDocument.exists()) {
			const data = snapshotDocument.data()
			const snapshot = { ...data }
			delete snapshot.schemaVersion
			delete snapshot.updatedAt
			return mergeStoredSnapshot(snapshot as ProgressSnapshot, currentUser)
		}

		const localSnapshot = await localRepository.getSnapshot()
		const importedSnapshot = mergeStoredSnapshot(localSnapshot, currentUser)
		await saveCloudSnapshot(importedSnapshot)
		return importedSnapshot
	}

	return {
		async setUser(nextUser) {
			user = nextUser
			cachedSnapshot = null

			if (!user) {
				const snapshot = createInitialSnapshot()
				cachedSnapshot = snapshot
				return snapshot
			}

			const snapshot = await readCloudSnapshot(user)
			cachedSnapshot = snapshot
			return snapshot
		},
		async getSnapshot() {
			if (cachedSnapshot) {
				return cachedSnapshot
			}

			if (!user) {
				const snapshot = cachedSnapshot ?? createInitialSnapshot()
				cachedSnapshot = snapshot
				return snapshot
			}

			const snapshot = await readCloudSnapshot(user)
			cachedSnapshot = snapshot
			return snapshot
		},
		async saveSnapshot(snapshot) {
			await saveCloudSnapshot(snapshot)
		},
		async reset() {
			const initial = user ? createUserSnapshot(user) : createInitialSnapshot()
			await saveCloudSnapshot(initial)
			return initial
		},
		async recordLessonAttempt(record: LessonAttemptRecord) {
			if (!user) {
				return
			}

			await addDoc(collection(firestore, 'users', user.uid, 'lessonAttempts'), {
				...record,
				createdAt: record.createdAt,
			})
		},
		async recordXpEvent(record: XpEventRecord) {
			if (!user || record.amount <= 0) {
				return
			}

			await addDoc(collection(firestore, 'users', user.uid, 'xpEvents'), record)
		},
	}
}
