import { curriculumUnits } from "@/content"
import type { CurriculumRepository } from "@/lib/repositories/interfaces"

export function createLocalCurriculumRepository(): CurriculumRepository {
  return {
    getUnits() {
      return curriculumUnits
    },
    getLessonById(lessonId) {
      return curriculumUnits
        .flatMap((unit) => unit.categories.flatMap((category) => category.lessons))
        .find((lesson) => lesson.id === lessonId)
    },
  }
}
