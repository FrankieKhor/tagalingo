let activeAudio: HTMLAudioElement | null = null

export function playAudioSource(source: string) {
  stopSpeechPlayback()

  const audio = new Audio(source)
  activeAudio = audio

  audio.onended = () => {
    if (activeAudio === audio) {
      activeAudio = null
    }
  }

  audio.onerror = () => {
    if (activeAudio === audio) {
      activeAudio = null
    }
  }

  return audio.play()
}

export function stopSpeechPlayback() {
  if (activeAudio) {
    activeAudio.pause()
    activeAudio.currentTime = 0
    activeAudio = null
  }

  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return
  }

  window.speechSynthesis.cancel()
}
