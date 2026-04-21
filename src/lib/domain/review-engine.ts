import type { Exercise, ReviewItem } from "@/lib/domain/models"
import { isDue } from "@/lib/utils/dates"
import { normalizeText } from "@/lib/utils/exercise"

export function createReviewItem(
  lessonId: string,
  exercise: Exercise,
  answer: string
): ReviewItem {
  return {
    id: `review-${lessonId}-${exercise.id}`,
    sourceLessonId: lessonId,
    sourceExerciseId: exercise.id,
    prompt: exercise.prompt,
    answer,
    type: exercise.type,
    dueAt: new Date().toISOString(),
    intervalDays: 1,
    easeFactor: 2.3,
    successCount: 0,
    failureCount: 0,
  }
}

export function updateReviewItem(
  item: ReviewItem,
  correct: boolean,
  now = new Date()
): ReviewItem {
  if (!correct) {
    return {
      ...item,
      dueAt: now.toISOString(),
      intervalDays: 1,
      failureCount: item.failureCount + 1,
      easeFactor: Math.max(1.3, item.easeFactor - 0.2),
    }
  }

  const nextInterval = Math.max(1, Math.round(item.intervalDays * item.easeFactor))
  const due = new Date(now)
  due.setDate(due.getDate() + nextInterval)

  return {
    ...item,
    dueAt: due.toISOString(),
    intervalDays: nextInterval,
    successCount: item.successCount + 1,
    easeFactor: Math.min(3, item.easeFactor + 0.1),
  }
}

export function dueReviewItems(items: ReviewItem[], now = new Date()): ReviewItem[] {
  return items.filter((item) => isDue(item.dueAt, now))
}

export function mergeReviewItems(
  current: ReviewItem[],
  incoming: ReviewItem[]
): ReviewItem[] {
  const map = new Map(current.map((item) => [item.id, item]))

  incoming.forEach((item) => {
    const existing = map.get(item.id)
    map.set(item.id, existing ? { ...existing, ...item } : item)
  })

  return Array.from(map.values()).sort((a, b) =>
    normalizeText(a.prompt).localeCompare(normalizeText(b.prompt))
  )
}
