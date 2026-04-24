import { createInitialSnapshot, hydrateDailyState } from '@/lib/domain/progress'
import type { ProgressSnapshot } from '@/lib/domain/models'
import type { ProgressRepository } from '@/lib/repositories/interfaces'
import {
	readStoredProgress,
	writeStoredProgress,
} from '@/lib/repositories/local/local-storage'

export function createLocalProgressRepository(): ProgressRepository {
	return {
		async getSnapshot() {
			const stored = readStoredProgress()
			const hydrated = hydrateDailyState(stored)

			if (JSON.stringify(stored) !== JSON.stringify(hydrated)) {
				writeStoredProgress(hydrated)
			}

			return hydrated
		},
		async saveSnapshot(snapshot: ProgressSnapshot) {
			writeStoredProgress(snapshot)
		},
		async reset() {
			const initial = createInitialSnapshot()
			writeStoredProgress(initial)
			return initial
		},
	}
}
