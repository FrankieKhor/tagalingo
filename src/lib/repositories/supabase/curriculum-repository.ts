import type { CurriculumRepository } from "@/lib/repositories/interfaces"

export function createSupabaseCurriculumRepository(): CurriculumRepository {
  return {
    getUnits() {
      throw new Error("SupabaseCurriculumRepository is not implemented yet.")
    },
    getLessonById() {
      throw new Error("SupabaseCurriculumRepository is not implemented yet.")
    },
  }
}
