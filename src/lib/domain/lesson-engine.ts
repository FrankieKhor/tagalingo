import type {
  Exercise,
  ExerciseAnswer,
  ExerciseResult,
  SpeakingAttempt,
} from "@/lib/domain/models"
import { createReviewItem } from "@/lib/domain/review-engine"
import {
  normalizeText,
  scoreTranscript,
  sentenceFromTokens,
} from "@/lib/utils/exercise"

function extractCanonicalAnswer(exercise: Exercise): string {
  switch (exercise.type) {
    case "tap-translation":
    case "sentence-reorder":
      return sentenceFromTokens(exercise.correctSequence)
    case "word-matching":
      return exercise.pairs.map((pair) => `${pair.left}:${pair.right}`).join(", ")
    case "fill-in-the-blank":
    case "dictation":
      return exercise.acceptableAnswers[0] ?? ""
    case "listening-mcq":
      return exercise.correctAnswer
    case "listen-repeat":
    case "speaking-prompt":
      return exercise.expectedTranscript
  }
}

function extractWeakWords(exercise: Exercise): string[] {
  return exercise.vocabularyFocus ?? normalizeText(extractCanonicalAnswer(exercise)).split(" ")
}

export function getExerciseCanonicalAnswer(exercise: Exercise) {
  return extractCanonicalAnswer(exercise)
}

export function isSpeakingExercise(exercise: Exercise) {
  return exercise.type === "listen-repeat" || exercise.type === "speaking-prompt"
}

export function createSkippedSpeakingResult(exercise: Exercise): ExerciseResult {
  const canonicalAnswer = extractCanonicalAnswer(exercise)

  return {
    exerciseId: exercise.id,
    correct: true,
    earnedXp: 0,
    heartsDelta: 0,
    feedback: "Speaking skipped for now. We'll count this one as complete.",
    correctAnswer: canonicalAnswer,
    weakWords: [],
    reviewItems: [],
    normalizedAnswer: "skipped-speaking",
    answer: "",
  }
}

export function createSkippedExerciseResult(
  lessonId: string,
  exercise: Exercise
): ExerciseResult {
  const canonicalAnswer = extractCanonicalAnswer(exercise)

  return {
    exerciseId: exercise.id,
    correct: false,
    earnedXp: 0,
    heartsDelta: -1,
    feedback:
      exercise.type === "word-matching"
        ? "Skipped for now. Match each prompt to the correct partner."
        : `Skipped. Answer: ${canonicalAnswer}`,
    correctAnswer: canonicalAnswer,
    weakWords: extractWeakWords(exercise).filter(Boolean),
    reviewItems: [createReviewItem(lessonId, exercise, canonicalAnswer)],
    normalizedAnswer: "skipped",
    answer: "",
  }
}

export function evaluateExercise(
  lessonId: string,
  exercise: Exercise,
  answer: ExerciseAnswer,
  speakingAttempt?: SpeakingAttempt
): ExerciseResult {
  const canonicalAnswer = extractCanonicalAnswer(exercise)
  const normalizedCanonical = normalizeText(canonicalAnswer)
  let normalizedAnswer = ""
  let correct = false

  switch (exercise.type) {
    case "tap-translation":
    case "sentence-reorder": {
      const sequence = Array.isArray(answer) ? sentenceFromTokens(answer) : ""
      normalizedAnswer = normalizeText(sequence)
      correct = normalizedAnswer === normalizedCanonical
      break
    }
    case "word-matching": {
      const pairs = typeof answer === "object" && !Array.isArray(answer) ? answer : {}
      const expected = Object.fromEntries(exercise.pairs.map((pair) => [pair.left, pair.right]))
      normalizedAnswer = JSON.stringify(pairs)
      correct =
        Object.keys(expected).length === Object.keys(pairs).length &&
        Object.entries(expected).every(([left, right]) => pairs[left] === right)
      break
    }
    case "fill-in-the-blank":
    case "dictation": {
      normalizedAnswer = normalizeText(typeof answer === "string" ? answer : "")
      correct = exercise.acceptableAnswers.some(
        (option) => normalizeText(option) === normalizedAnswer
      )
      break
    }
    case "listening-mcq": {
      normalizedAnswer = normalizeText(typeof answer === "string" ? answer : "")
      correct = normalizedAnswer === normalizeText(exercise.correctAnswer)
      break
    }
    case "listen-repeat":
    case "speaking-prompt": {
      normalizedAnswer = normalizeText(typeof answer === "string" ? answer : "")
      correct = scoreTranscript(canonicalAnswer, normalizedAnswer) >= 0.75
      break
    }
  }

  const feedback =
    correct
      ? "Nice work!"
      : exercise.type === "word-matching"
        ? "Match each prompt to the correct partner."
        : `Answer: ${canonicalAnswer}`

  return {
    exerciseId: exercise.id,
    correct,
    earnedXp: correct ? exercise.xp : Math.max(1, Math.round(exercise.xp / 4)),
    heartsDelta: correct ? 0 : -1,
    feedback,
    correctAnswer: canonicalAnswer,
    weakWords: correct ? [] : extractWeakWords(exercise).filter(Boolean),
    reviewItems: correct ? [] : [createReviewItem(lessonId, exercise, canonicalAnswer)],
    normalizedAnswer,
    answer,
    speakingAttempt,
  }
}
