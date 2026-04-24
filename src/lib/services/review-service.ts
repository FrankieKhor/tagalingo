import { dueReviewItems, updateReviewItem } from '@/lib/domain/review-engine'
import { applyReviewResult } from '@/lib/domain/progress'
import type { ProgressRepository } from '@/lib/repositories/interfaces'

export type ReviewService = ReturnType<typeof createReviewService>

export function createReviewService(progressRepository: ProgressRepository) {
	return {
		async getDueItems() {
			const snapshot = await progressRepository.getSnapshot()
			return dueReviewItems(snapshot.reviewQueue)
		},
		async submitReview(reviewId: string, correct: boolean) {
			const snapshot = await progressRepository.getSnapshot()
			const updatedQueue = snapshot.reviewQueue.map((item) =>
				item.id === reviewId ? updateReviewItem(item, correct) : item
			)
			const updated = applyReviewResult(snapshot, updatedQueue, correct)
			await progressRepository.saveSnapshot(updated)
			await progressRepository.recordXpEvent?.({
				source: 'review',
				amount: correct ? 4 : 1,
				createdAt: new Date().toISOString(),
			})
			return updated
		},
	}
}
