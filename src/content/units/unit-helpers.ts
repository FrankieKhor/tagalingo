import type {
	ChoiceOption,
	Exercise,
	Lesson,
	LessonIntroCard,
	MatchPair,
} from '@/lib/domain/models'

type GeneratedLessonConfig = {
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
	matchPairs: MatchPair[]
	buildPrompt: string
	buildOptions: string[]
	correctSequence: string[]
	blankPrompt: string
	sentenceTemplate: string
	acceptableAnswers: string[]
	placeholder: string
	listeningPrompt: string
	audioText: string
	listeningOptions: string[]
	correctAnswer: string
	speakingPrompt: string
	expectedTranscript: string
	referenceTranslation: string
	finalExercise?: 'speaking-prompt' | 'listen-repeat' | 'dictation'
}

function choices(options: string[]): ChoiceOption[] {
	return options.map((option, index) => ({
		id: String.fromCharCode(97 + index),
		label: option,
		value: option,
	}))
}

export function createGeneratedLesson(config: GeneratedLessonConfig): Lesson {
	const finalExerciseType = config.finalExercise ?? 'speaking-prompt'
	const finalExercise: Exercise =
		finalExerciseType === 'listen-repeat'
			? {
					id: `${config.id}-5`,
					type: 'listen-repeat',
					prompt: config.speakingPrompt,
					instructions: 'Listen, then repeat or type the phrase.',
					xp: 8,
					audioText: config.expectedTranscript,
					expectedTranscript: config.expectedTranscript,
				}
			: finalExerciseType === 'dictation'
				? {
						id: `${config.id}-5`,
						type: 'dictation',
						prompt: 'Write what you hear.',
						instructions: 'Listen and type the Tagalog phrase.',
						xp: 7,
						audioText: config.expectedTranscript,
						acceptableAnswers: [
							config.expectedTranscript,
							config.expectedTranscript.toLowerCase(),
						],
					}
				: {
						id: `${config.id}-5`,
						type: 'speaking-prompt',
						prompt: config.speakingPrompt,
						instructions: 'Speak or type the phrase.',
						xp: 8,
						expectedTranscript: config.expectedTranscript,
						referenceTranslation: config.referenceTranslation,
					}

	return {
		id: config.id,
		unitId: config.unitId,
		categoryId: config.categoryId,
		order: config.order,
		title: config.title,
		subtitle: config.subtitle,
		description: config.description,
		grammarNote: config.grammarNote,
		color: config.color,
		introCards: config.introCards,
		exercises: [
			{
				id: `${config.id}-1`,
				type: 'word-matching',
				prompt: 'Match the useful phrases.',
				instructions: 'Pair English and Tagalog.',
				xp: 5,
				pairs: config.matchPairs,
			},
			{
				id: `${config.id}-2`,
				type: 'tap-translation',
				prompt: config.buildPrompt,
				instructions: 'Tap the tiles in order.',
				xp: 6,
				options: choices(config.buildOptions),
				correctSequence: config.correctSequence,
				vocabularyFocus: config.correctSequence,
			},
			{
				id: `${config.id}-3`,
				type: 'fill-in-the-blank',
				prompt: config.blankPrompt,
				instructions: 'Type the missing word or phrase.',
				xp: 6,
				sentenceTemplate: config.sentenceTemplate,
				acceptableAnswers: config.acceptableAnswers,
				placeholder: config.placeholder,
			},
			{
				id: `${config.id}-4`,
				type: 'listening-mcq',
				prompt: config.listeningPrompt,
				instructions: 'Listen, then choose the meaning.',
				xp: 6,
				audioText: config.audioText,
				options: choices(config.listeningOptions),
				correctAnswer: config.correctAnswer,
			},
			finalExercise,
		],
	}
}
