import type { ProgressRepository } from "@/lib/repositories/interfaces"

export function createSupabaseProgressRepository(): ProgressRepository {
  return {
    getSnapshot() {
      throw new Error("SupabaseProgressRepository is not implemented yet.")
    },
    saveSnapshot() {
      throw new Error("SupabaseProgressRepository is not implemented yet.")
    },
    reset() {
      throw new Error("SupabaseProgressRepository is not implemented yet.")
    },
  }
}
