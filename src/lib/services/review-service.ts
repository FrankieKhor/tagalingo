import { dueReviewItems, updateReviewItem } from "@/lib/domain/review-engine"
import { applyReviewResult } from "@/lib/domain/progress"
import type { ProgressRepository } from "@/lib/repositories/interfaces"

export type ReviewService = ReturnType<typeof createReviewService>

export function createReviewService(progressRepository: ProgressRepository) {
  return {
    getDueItems() {
      const snapshot = progressRepository.getSnapshot()
      return dueReviewItems(snapshot.reviewQueue)
    },
    submitReview(reviewId: string, correct: boolean) {
      const snapshot = progressRepository.getSnapshot()
      const updatedQueue = snapshot.reviewQueue.map((item) =>
        item.id === reviewId ? updateReviewItem(item, correct) : item
      )
      const updated = applyReviewResult(snapshot, updatedQueue, correct)
      progressRepository.saveSnapshot(updated)
      return updated
    },
  }
}
