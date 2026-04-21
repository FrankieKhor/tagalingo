function createTone(
  context: AudioContext,
  {
    frequency,
    type,
    startTime,
    duration,
    gainFrom,
    gainTo,
  }: {
    frequency: number
    type: OscillatorType
    startTime: number
    duration: number
    gainFrom: number
    gainTo: number
  }
) {
  const oscillator = context.createOscillator()
  const gainNode = context.createGain()

  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, startTime)
  gainNode.gain.setValueAtTime(gainFrom, startTime)
  gainNode.gain.exponentialRampToValueAtTime(Math.max(gainTo, 0.0001), startTime + duration)

  oscillator.connect(gainNode)
  gainNode.connect(context.destination)

  oscillator.start(startTime)
  oscillator.stop(startTime + duration)
}

export type SoundEffectsService = ReturnType<typeof createSoundEffectsService>

export function createSoundEffectsService() {
  let context: AudioContext | null = null

  function getContext() {
    if (typeof window === "undefined") {
      return null
    }

    const AudioContextCtor = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext

    if (!AudioContextCtor) {
      return null
    }

    context ??= new AudioContextCtor()
    return context
  }

  async function ensureRunning() {
    const ctx = getContext()

    if (!ctx) {
      return null
    }

    if (ctx.state === "suspended") {
      try {
        await ctx.resume()
      } catch {
        return null
      }
    }

    return ctx
  }

  return {
    isSupported() {
      return getContext() !== null
    },
    async playCorrect() {
      const ctx = await ensureRunning()

      if (!ctx) {
        return
      }

      const start = ctx.currentTime
      createTone(ctx, {
        frequency: 880,
        type: "triangle",
        startTime: start,
        duration: 0.12,
        gainFrom: 0.12,
        gainTo: 0.001,
      })
      createTone(ctx, {
        frequency: 1174,
        type: "sine",
        startTime: start + 0.08,
        duration: 0.18,
        gainFrom: 0.11,
        gainTo: 0.001,
      })
    },
    async playWrong() {
      const ctx = await ensureRunning()

      if (!ctx) {
        return
      }

      const start = ctx.currentTime
      createTone(ctx, {
        frequency: 300,
        type: "sawtooth",
        startTime: start,
        duration: 0.12,
        gainFrom: 0.09,
        gainTo: 0.001,
      })
      createTone(ctx, {
        frequency: 220,
        type: "sawtooth",
        startTime: start + 0.14,
        duration: 0.16,
        gainFrom: 0.08,
        gainTo: 0.001,
      })
    },
  }
}
