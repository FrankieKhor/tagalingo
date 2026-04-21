import { createLocalCurriculumRepository } from "@/lib/repositories/local/curriculum-repository"
import { createLocalProgressRepository } from "@/lib/repositories/local/progress-repository"
import { createLocalSettingsRepository } from "@/lib/repositories/local/settings-repository"
import { createEconomyService } from "@/lib/services/economy-service"
import { createLessonService } from "@/lib/services/lesson-service"
import { createProfileService } from "@/lib/services/profile-service"
import { createReviewService } from "@/lib/services/review-service"
import { createSoundEffectsService } from "@/lib/services/sound-effects-service"
import { createVoiceService } from "@/lib/services/voice-service"

const progressRepository = createLocalProgressRepository()
const curriculumRepository = createLocalCurriculumRepository()
const settingsRepository = createLocalSettingsRepository()

export const appServices = {
  lessonService: createLessonService(curriculumRepository, progressRepository),
  reviewService: createReviewService(progressRepository),
  profileService: createProfileService(progressRepository, settingsRepository),
  economyService: createEconomyService(progressRepository),
  soundEffectsService: createSoundEffectsService(),
  voiceService: createVoiceService(),
  progressRepository,
  curriculumRepository,
  settingsRepository,
}
