import { achievementCatalog } from '@/content'
import { buildLessonPath } from '@/lib/domain/progress'
import type { AppSettings } from '@/lib/domain/models'
import type {
	ProgressRepository,
	SettingsRepository,
} from '@/lib/repositories/interfaces'

export type ProfileService = ReturnType<typeof createProfileService>

export function createProfileService(
	progressRepository: ProgressRepository,
	settingsRepository: SettingsRepository
) {
	return {
		async getDashboard() {
			const snapshot = await progressRepository.getSnapshot()
			const path = buildLessonPath(snapshot)

			return {
				snapshot,
				completedLessons: path.filter((node) => node.completed).length,
				unlockedLessons: path.filter((node) => node.unlocked).length,
				achievements: achievementCatalog.map((achievement) => ({
					...achievement,
					unlocked: snapshot.profile.achievements.includes(achievement.id),
				})),
			}
		},
		async updateSettings(settings: AppSettings) {
			const saved = settingsRepository.saveSettings(settings)
			const snapshot = await progressRepository.getSnapshot()
			const updated = { ...snapshot, settings: saved }
			await progressRepository.saveSnapshot(updated)
			return updated
		},
	}
}
