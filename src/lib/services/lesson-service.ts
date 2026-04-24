import type {
	ExerciseAnswer,
	Exercise,
	ExerciseResult,
	LearnUnitViewModel,
	Lesson,
	ProgressSnapshot,
} from '@/lib/domain/models'
import { evaluateExercise } from '@/lib/domain/lesson-engine'
import {
	applyLessonSummary,
	buildLearnUnits,
	buildLessonPath,
	createInitialSnapshot,
	updateSpeakingSkipUntil,
} from '@/lib/domain/progress'
import type {
	CurriculumRepository,
	ProgressRepository,
} from '@/lib/repositories/interfaces'

export type LessonService = ReturnType<typeof createLessonService>

export function createLessonService(
	curriculumRepository: CurriculumRepository,
	progressRepository: ProgressRepository
) {
	return {
		getUnits() {
			return curriculumRepository.getUnits()
		},
		getPath(snapshot?: ProgressSnapshot) {
			return buildLessonPath(snapshot ?? createInitialSnapshot())
		},
		getLearnUnits(snapshot?: ProgressSnapshot): LearnUnitViewModel[] {
			return buildLearnUnits(snapshot ?? createInitialSnapshot())
		},
		getLesson(lessonId: string): Lesson | undefined {
			return curriculumRepository.getLessonById(lessonId)
		},
		evaluate(
			lessonId: string,
			exercise: Exercise,
			answer: ExerciseAnswer,
			speakingAttempt?: ExerciseResult['speakingAttempt']
		) {
			return evaluateExercise(lessonId, exercise, answer, speakingAttempt)
		},
		async completeLesson(lesson: Lesson, results: ExerciseResult[]) {
			const current = await progressRepository.getSnapshot()
			const updated = applyLessonSummary(current, lesson, results)
			await progressRepository.saveSnapshot(updated)

			const latestResults = Array.from(
				new Map(results.map((result) => [result.exerciseId, result])).values()
			)
			const score = Math.round(
				(latestResults.filter((result) => result.correct).length /
					lesson.exercises.length) *
					100
			)
			const earnedXp = results.reduce((sum, result) => sum + result.earnedXp, 0)
			const heartsLost = results.reduce(
				(sum, result) => sum + Math.abs(Math.min(result.heartsDelta, 0)),
				0
			)
			const createdAt = new Date().toISOString()

			await Promise.all([
				progressRepository.recordLessonAttempt?.({
					lessonId: lesson.id,
					score,
					earnedXp,
					heartsLost,
					completed: score >= 70,
					createdAt,
				}),
				progressRepository.recordXpEvent?.({
					source: 'lesson',
					amount: earnedXp,
					lessonId: lesson.id,
					createdAt,
				}),
			])

			return updated
		},
		async setSpeakingSkipUntil(speakingSkipUntil?: string) {
			const current = await progressRepository.getSnapshot()
			const updated = updateSpeakingSkipUntil(current, speakingSkipUntil)
			await progressRepository.saveSnapshot(updated)
			return updated
		},
	}
}
