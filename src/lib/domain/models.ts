export type ExerciseType =
  | "tap-translation"
  | "word-matching"
  | "sentence-reorder"
  | "fill-in-the-blank"
  | "listening-mcq"
  | "dictation"
  | "listen-repeat"
  | "speaking-prompt"

export type ExerciseAnswer = string | string[] | Record<string, string>

export type ChoiceOption = {
  id: string
  label: string
  value: string
  correct?: boolean
}

export type MatchPair = {
  left: string
  right: string
}

type ExerciseBase = {
  id: string
  type: ExerciseType
  prompt: string
  instructions: string
  helperText?: string
  explanation?: string
  xp: number
  audioText?: string
  vocabularyFocus?: string[]
}

export type LessonIntroCard = {
  id: string
  kind: "word" | "phrase"
  tagalog: string
  meaning: string
  audioText?: string
  example?: string
  emoji?: string
  imageHint?: string
}

export type TapTranslationExercise = ExerciseBase & {
  type: "tap-translation"
  options: ChoiceOption[]
  correctSequence: string[]
}

export type WordMatchingExercise = ExerciseBase & {
  type: "word-matching"
  pairs: MatchPair[]
}

export type SentenceReorderExercise = ExerciseBase & {
  type: "sentence-reorder"
  tokens: string[]
  correctSequence: string[]
}

export type FillBlankExercise = ExerciseBase & {
  type: "fill-in-the-blank"
  sentenceTemplate: string
  acceptableAnswers: string[]
  placeholder: string
}

export type ListeningMcqExercise = ExerciseBase & {
  type: "listening-mcq"
  audioText: string
  options: ChoiceOption[]
  correctAnswer: string
}

export type DictationExercise = ExerciseBase & {
  type: "dictation"
  audioText: string
  acceptableAnswers: string[]
}

export type ListenRepeatExercise = ExerciseBase & {
  type: "listen-repeat"
  audioText: string
  expectedTranscript: string
}

export type SpeakingPromptExercise = ExerciseBase & {
  type: "speaking-prompt"
  expectedTranscript: string
  referenceTranslation?: string
}

export type Exercise =
  | TapTranslationExercise
  | WordMatchingExercise
  | SentenceReorderExercise
  | FillBlankExercise
  | ListeningMcqExercise
  | DictationExercise
  | ListenRepeatExercise
  | SpeakingPromptExercise

export type Lesson = {
  id: string
  unitId: string
  categoryId: string
  order: number
  title: string
  subtitle: string
  description: string
  grammarNote: string
  color: string
  introCards: LessonIntroCard[]
  exercises: Exercise[]
}

export type UnitCategory = {
  id: string
  unitId: string
  order: number
  title: string
  subtitle: string
  description: string
  themeColor: string
  accentColor: string
  icon: "guidebook" | "chat" | "star" | "music" | "spark" | "trophy"
  lessons: Lesson[]
  hasGuidebook?: boolean
  hasRewardChest?: boolean
}

export type Unit = {
  id: string
  order: number
  title: string
  description: string
  theme: string
  bannerTitle: string
  bannerSubtitle: string
  categories: UnitCategory[]
}

export type DailyGoal = {
  xpTarget: number
  currentXp: number
}

export type QuestKind = "daily" | "evergreen"

export type QuestMetric =
  | "daily-lessons-completed"
  | "daily-lesson-score"
  | "daily-correct-streak"
  | "daily-reviews-completed"
  | "daily-xp-earned"
  | "total-lessons-completed"
  | "total-streak-days"
  | "total-reviews-completed"
  | "total-xp-earned"

export type Quest = {
  id: string
  templateId: string
  kind: QuestKind
  metric: QuestMetric
  title: string
  description: string
  target: number
  rewardPoints: number
  progress: number
  completed: boolean
  claimed: boolean
}

export type DailyActivityStats = {
  lessonSessionsCompleted: number
  reviewCardsCompleted: number
  bestLessonScore: number
  bestCorrectStreak: number
}

export type ShopItemId = "streak-freeze" | "heart-refill" | "heart-snack"

export type ShopItem = {
  id: ShopItemId
  name: string
  description: string
  cost: number
  type: "consumable" | "power-up"
}

export type ChestRewardSource = "path" | "daily"

export type ChestRewardType = "xp" | "points" | "hearts"

export type ChestReward = {
  chestId?: string
  source: ChestRewardSource
  rewardType: ChestRewardType
  amount: number
}

export type LessonProgress = {
  lessonId: string
  status: "not-started" | "in-progress" | "completed"
  bestScore: number
  attempts: number
  completedAt?: string
}

export type ReviewItem = {
  id: string
  sourceLessonId: string
  sourceExerciseId: string
  prompt: string
  answer: string
  type: ExerciseType
  dueAt: string
  intervalDays: number
  easeFactor: number
  successCount: number
  failureCount: number
}

export type WeakWordStat = {
  term: string
  mistakes: number
  lastSeenAt: string
}

export type SpeakingAttempt = {
  id: string
  expectedText: string
  transcript: string
  score: number
  createdAt: string
  capabilityUsed: "speech-recognition" | "manual-entry" | "unavailable"
}

export type UserProfile = {
  id: string
  displayName: string
  avatarEmoji: string
  xp: number
  points: number
  hearts: number
  streak: number
  lastActiveOn?: string
  totalLessonsCompleted: number
  totalReviewsCompleted: number
  achievements: string[]
  dailyGoal: DailyGoal
}

export type AppSettings = {
  soundEnabled: boolean
  speechPlaybackEnabled: boolean
  microphoneEnabled: boolean
  reducedMotion: boolean
  theme: "light" | "dark"
}

export type Achievement = {
  id: string
  title: string
  description: string
  icon: string
  requirement: "xp" | "lessons" | "streak" | "reviews"
  target: number
}

export type LeagueTier =
  | "bronze"
  | "silver"
  | "gold"
  | "sapphire"
  | "ruby"
  | "emerald"
  | "amethyst"
  | "pearl"
  | "obsidian"
  | "diamond"

export type LeaderboardEntry = {
  id: string
  displayName: string
  avatarEmoji: string
  isBot: boolean
  weeklyXp: number
}

export type LeaderboardCycle = {
  league: LeagueTier
  startedAt: string
  endsAt: string
  joined: boolean
  playerWeeklyXp: number
  entries: LeaderboardEntry[]
}

export type LeaderboardOutcome = "promoted" | "demoted" | "stayed"

export type LeaderboardResult = {
  finishedLeague: LeagueTier
  placement: number
  outcome: LeaderboardOutcome
  resolvedAt: string
}

export type LeaderboardState = {
  currentLeague: LeagueTier
  currentCycle?: LeaderboardCycle
  lastResult?: LeaderboardResult
}

export type ProgressSnapshot = {
  profile: UserProfile
  lessonProgress: Record<string, LessonProgress>
  currentLessonId?: string
  speakingSkipUntil?: string
  reviewQueue: ReviewItem[]
  weakWords: WeakWordStat[]
  settings: AppSettings
  speakingAttempts: SpeakingAttempt[]
  dailyStats: DailyActivityStats
  quests: Quest[]
  inventory: Partial<Record<ShopItemId, number>>
  equippedPowerUps: ShopItemId[]
  lastQuestRefreshOn?: string
  openedPathChestIds: string[]
  lastDailyChestOpenedOn?: string
  leaderboard: LeaderboardState
}

export type ExerciseResult = {
  exerciseId: string
  correct: boolean
  earnedXp: number
  heartsDelta: number
  feedback: string
  correctAnswer: string
  weakWords: string[]
  reviewItems: ReviewItem[]
  normalizedAnswer: string
  answer: ExerciseAnswer
  speakingAttempt?: SpeakingAttempt
}

export type VoiceCapability = {
  synthesisAvailable: boolean
  recognitionAvailable: boolean
  microphoneAvailable: boolean
}

export type LessonPathNode = {
  lesson: Lesson
  unit: Unit
  category: UnitCategory
  unlocked: boolean
  completed: boolean
  isCurrent: boolean
}

export type LearnPathNodeState = "locked" | "available" | "current" | "completed"

export type LearnPathNodeViewModel = {
  id: string
  unit: Unit
  category: UnitCategory
  lesson: Lesson
  state: LearnPathNodeState
  nodeType: "lesson"
  ctaLabel: string
}

export type LearnPathMarkerViewModel = {
  id: string
  unit: Unit
  category: UnitCategory
  nodeType: "guidebook" | "reward"
  label: string
  chestState?: "locked" | "ready" | "opened"
}

export type LearnPathSeparatorViewModel = {
  id: string
  unit: Unit
  category: UnitCategory
  nodeType: "category-label"
  label: string
  subtitle: string
}

export type LearnPathItemViewModel =
  | LearnPathNodeViewModel
  | LearnPathMarkerViewModel
  | LearnPathSeparatorViewModel

export type LearnUnitViewModel = {
  unit: Unit
  items: LearnPathItemViewModel[]
}

export type LeaderboardTierViewModel = {
  id: LeagueTier
  label: string
  locked: boolean
  active: boolean
}

export type LeaderboardRowViewModel = {
  id: string
  rank: number
  displayName: string
  avatarEmoji: string
  isBot: boolean
  isPlayer: boolean
  weeklyXp: number
  promotionZone: boolean
  demotionZone: boolean
}

export type LeaderboardViewModel = {
  currentLeague: LeagueTier
  currentLeagueLabel: string
  joined: boolean
  hasActiveCycle: boolean
  tiers: LeaderboardTierViewModel[]
  rows: LeaderboardRowViewModel[]
  playerRow?: LeaderboardRowViewModel
  promotionZoneIds: string[]
  demotionZoneIds: string[]
  cycleStartedAt?: string
  cycleEndsAt?: string
  timeRemainingLabel?: string
  cycleProgress: number
  lastResult?: {
    finishedLeague: LeagueTier
    finishedLeagueLabel: string
    placement: number
    outcome: LeaderboardOutcome
    title: string
    description: string
  }
}
