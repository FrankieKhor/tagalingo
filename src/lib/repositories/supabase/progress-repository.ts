import type { ProgressRepository } from '@/lib/repositories/interfaces'

export function createSupabaseProgressRepository(): ProgressRepository {
	return {
		async getSnapshot() {
			throw new Error('SupabaseProgressRepository is not implemented yet.')
		},
		async saveSnapshot() {
			throw new Error('SupabaseProgressRepository is not implemented yet.')
		},
		async reset() {
			throw new Error('SupabaseProgressRepository is not implemented yet.')
		},
	}
}
