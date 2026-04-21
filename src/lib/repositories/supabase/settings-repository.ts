import type { SettingsRepository } from "@/lib/repositories/interfaces"

export function createSupabaseSettingsRepository(): SettingsRepository {
  return {
    getSettings() {
      throw new Error("SupabaseSettingsRepository is not implemented yet.")
    },
    saveSettings() {
      throw new Error("SupabaseSettingsRepository is not implemented yet.")
    },
  }
}
