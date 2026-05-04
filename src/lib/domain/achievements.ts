import { achievementCatalog } from '@/content'
import type { UserProfile } from '@/lib/domain/models'

export function getRemainingAchievementCount(profile: UserProfile) {
	return achievementCatalog.filter(
		(achievement) => !profile.achievements.includes(achievement.id)
	).length
}
