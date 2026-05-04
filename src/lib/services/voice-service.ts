import { evaluateSpeakingAttempt, detectVoiceCapability } from "@/lib/domain/voice"
import type { SpeakingAttempt, VoiceCapability } from "@/lib/domain/models"
import type { SpeechAdapter } from "@/lib/repositories/interfaces"
import { playAudioSource, stopSpeechPlayback } from "@/lib/utils/audio"

const TAGALOG_LANGUAGE_CODES = ["fil-PH", "fil", "tl-PH", "tl"]
const PHILIPPINE_ENGLISH_CODES = ["en-PH"]
const TAGALOG_KEYWORDS = ["tagalog", "filipino", "filipina", "pilipino", "philippines"]
const SPEECH_ENDPOINT_PATH = "/speech"

function normalizeVoiceLabel(value: string) {
  return value.trim().toLowerCase()
}

function scoreVoice(voice: SpeechSynthesisVoice) {
  const lang = normalizeVoiceLabel(voice.lang)
  const name = normalizeVoiceLabel(voice.name)
  let score = 0

  if (TAGALOG_LANGUAGE_CODES.includes(lang)) {
    score += 100
  }

  if (PHILIPPINE_ENGLISH_CODES.includes(lang)) {
    score += 60
  }

  if (TAGALOG_KEYWORDS.some((keyword) => name.includes(keyword))) {
    score += 35
  }

  if (TAGALOG_KEYWORDS.some((keyword) => lang.includes(keyword))) {
    score += 20
  }

  if (voice.localService) {
    score += 10
  }

  if (voice.default) {
    score += 5
  }

  return score
}

function selectBestVoice(voices: SpeechSynthesisVoice[]) {
  return [...voices].sort((left, right) => scoreVoice(right) - scoreVoice(left))[0]
}

function getSpeechEndpoint() {
  const baseUrl = import.meta.env.VITE_ELEVENLABS_SPEECH_ENDPOINT?.trim()

  if (!baseUrl) {
    return null
  }

  return new URL(SPEECH_ENDPOINT_PATH, baseUrl).toString()
}

async function speakWithGeneratedVoice(text: string) {
  const endpoint = getSpeechEndpoint()

  if (!endpoint) {
    return false
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Accept: "audio/mpeg",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
    }),
  })

  if (!response.ok) {
    const details = await response.text()
    throw new Error(details || "Generated speech request failed.")
  }

  const audioBlob = await response.blob()
  const audioUrl = URL.createObjectURL(audioBlob)

  try {
    await playAudioSource(audioUrl)
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(audioUrl), 1000)
  }

  return true
}

function speakWithBrowserVoice(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return
  }

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = "fil-PH"
  utterance.rate = 0.92

  const selectedVoice = selectBestVoice(window.speechSynthesis.getVoices())

  if (selectedVoice) {
    utterance.voice = selectedVoice
    utterance.lang = selectedVoice.lang || utterance.lang
  }

  stopSpeechPlayback()
  window.speechSynthesis.speak(utterance)
}

function createBrowserSpeechAdapter(): SpeechAdapter {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.getVoices()
  }

  return {
    getCapability() {
      return detectVoiceCapability()
    },
    speak(text: string) {
      void speakWithGeneratedVoice(text).catch((error: unknown) => {
        console.warn("Falling back to browser speech playback.", error)
        speakWithBrowserVoice(text)
      })
    },
    listenOnce(language = "fil-PH") {
      return new Promise<string>((resolve, reject) => {
        if (typeof window === "undefined") {
          reject(new Error("Speech recognition unavailable."))
          return
        }

        const Recognition =
          window.SpeechRecognition ?? window.webkitSpeechRecognition

        if (!Recognition) {
          reject(new Error("Speech recognition unavailable."))
          return
        }

        const recognition = new Recognition()
        recognition.lang = language
        recognition.maxAlternatives = 1
        recognition.interimResults = false
        recognition.continuous = false
        recognition.onerror = () => reject(new Error("Unable to capture speech."))
        recognition.onresult = (event) => {
          const transcript = event.results[0]?.[0]?.transcript ?? ""
          resolve(transcript)
        }
        recognition.start()
      })
    },
  }
}

export type VoiceService = ReturnType<typeof createVoiceService>

export function createVoiceService(adapter = createBrowserSpeechAdapter()) {
  return {
    getCapability(): VoiceCapability {
      return adapter.getCapability()
    },
    speak(text: string) {
      adapter.speak(text)
    },
    async listenOnce() {
      return adapter.listenOnce()
    },
    evaluate(expectedText: string, transcript: string, manual = false): SpeakingAttempt {
      return evaluateSpeakingAttempt(
        expectedText,
        transcript,
        manual ? "manual-entry" : "speech-recognition"
      )
    },
  }
}
