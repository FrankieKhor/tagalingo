import type {
  SpeakingAttempt,
  VoiceCapability,
} from "@/lib/domain/models"
import { scoreTranscript } from "@/lib/utils/exercise"

export function detectVoiceCapability(): VoiceCapability {
  if (typeof window === "undefined") {
    return {
      synthesisAvailable: false,
      recognitionAvailable: false,
      microphoneAvailable: false,
    }
  }

  return {
    synthesisAvailable: "speechSynthesis" in window,
    recognitionAvailable:
      typeof window.SpeechRecognition !== "undefined" ||
      typeof window.webkitSpeechRecognition !== "undefined",
    microphoneAvailable:
      typeof navigator !== "undefined" &&
      !!navigator.mediaDevices &&
      !!navigator.mediaDevices.getUserMedia,
  }
}

export function evaluateSpeakingAttempt(
  expectedText: string,
  transcript: string,
  capabilityUsed: SpeakingAttempt["capabilityUsed"]
): SpeakingAttempt {
  return {
    id: `speak-${crypto.randomUUID()}`,
    expectedText,
    transcript,
    score: scoreTranscript(expectedText, transcript),
    createdAt: new Date().toISOString(),
    capabilityUsed,
  }
}
