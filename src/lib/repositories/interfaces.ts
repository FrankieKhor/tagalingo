import type {
	AppSettings,
	ChestRewardSource,
	Lesson,
	ProgressSnapshot,
	Unit,
	VoiceCapability,
} from '@/lib/domain/models'

export type LessonAttemptRecord = {
	lessonId: string
	score: number
	earnedXp: number
	heartsLost: number
	completed: boolean
	createdAt: string
}

export type XpEventRecord = {
	source: 'lesson' | 'review' | 'chest' | 'quest'
	amount: number
	lessonId?: string
	chestSource?: ChestRewardSource
	createdAt: string
}

export interface ProgressRepository {
	getSnapshot(): Promise<ProgressSnapshot>
	saveSnapshot(snapshot: ProgressSnapshot): Promise<void>
	reset(): Promise<ProgressSnapshot>
	recordLessonAttempt?(record: LessonAttemptRecord): Promise<void>
	recordXpEvent?(record: XpEventRecord): Promise<void>
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
