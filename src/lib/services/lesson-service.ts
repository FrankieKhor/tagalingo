import type {
  ExerciseAnswer,
  Exercise,
  ExerciseResult,
  LearnUnitViewModel,
  Lesson,
  ProgressSnapshot,
} from "@/lib/domain/models"
import { evaluateExercise } from "@/lib/domain/lesson-engine"
import {
  applyLessonSummary,
  buildLearnUnits,
  buildLessonPath,
  updateSpeakingSkipUntil,
} from "@/lib/domain/progress"
import type {
  CurriculumRepository,
  ProgressRepository,
} from "@/lib/repositories/interfaces"

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
      return buildLessonPath(snapshot ?? progressRepository.getSnapshot())
    },
    getLearnUnits(snapshot?: ProgressSnapshot): LearnUnitViewModel[] {
      return buildLearnUnits(snapshot ?? progressRepository.getSnapshot())
    },
    getLesson(lessonId: string): Lesson | undefined {
      return curriculumRepository.getLessonById(lessonId)
    },
    evaluate(
      lessonId: string,
      exercise: Exercise,
      answer: ExerciseAnswer,
      speakingAttempt?: ExerciseResult["speakingAttempt"]
    ) {
      return evaluateExercise(lessonId, exercise, answer, speakingAttempt)
    },
    completeLesson(lesson: Lesson, results: ExerciseResult[]) {
      const current = progressRepository.getSnapshot()
      const updated = applyLessonSummary(current, lesson, results)
      progressRepository.saveSnapshot(updated)
      return updated
    },
    setSpeakingSkipUntil(speakingSkipUntil?: string) {
      const current = progressRepository.getSnapshot()
      const updated = updateSpeakingSkipUntil(current, speakingSkipUntil)
      progressRepository.saveSnapshot(updated)
      return updated
    },
  }
}
