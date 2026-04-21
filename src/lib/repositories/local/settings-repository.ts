import type { AppSettings } from "@/lib/domain/models"
import type { SettingsRepository } from "@/lib/repositories/interfaces"
import {
  readStoredSettings,
  writeStoredSettings,
} from "@/lib/repositories/local/local-storage"

export function createLocalSettingsRepository(): SettingsRepository {
  return {
    getSettings() {
      return readStoredSettings()
    },
    saveSettings(settings: AppSettings) {
      writeStoredSettings(settings)
      return settings
    },
  }
}
