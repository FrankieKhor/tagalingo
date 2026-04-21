import type {
  AppSettings,
  Lesson,
  ProgressSnapshot,
  Unit,
  VoiceCapability,
} from "@/lib/domain/models"

export interface ProgressRepository {
  getSnapshot(): ProgressSnapshot
  saveSnapshot(snapshot: ProgressSnapshot): void
  reset(): ProgressSnapshot
}

export interface CurriculumRepository {
  getUnits(): Unit[]
  getLessonById(lessonId: string): Lesson | undefined
}

export interface SettingsRepository {
  getSettings(): AppSettings
  saveSettings(settings: AppSettings): AppSettings
}

export interface SpeechAdapter {
  getCapability(): VoiceCapability
  speak(text: string): void
  listenOnce(language?: string): Promise<string>
}
