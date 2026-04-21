import { Mic, Volume2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { Exercise, ExerciseAnswer, VoiceCapability } from "@/lib/domain/models"
import { cn } from "@/lib/utils"

type ExerciseRendererProps = {
  exercise: Exercise
  answer: ExerciseAnswer
  onChange: (value: ExerciseAnswer) => void
  onSpeak: (text: string) => void
  onUseMic: () => void
  onSkipSpeaking?: () => void
  voiceCapability: VoiceCapability
  listening: boolean
  audioMeaning?: string
}

function shuffleValues(values: string[]) {
  const shuffled = [...values]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]]
  }

  return shuffled
}

function ChoiceChip({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition",
        selected
          ? "border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-400/40 dark:bg-sky-500/10 dark:text-sky-200"
          : "border-slate-200 bg-white text-slate-700 hover:border-sky-200 hover:bg-sky-50/60 dark:border-white/10 dark:bg-[#182733] dark:text-white/85 dark:hover:border-sky-400 dark:hover:bg-[#1d3140]"
      )}
    >
      {label}
    </button>
  )
}

function TokenChip({
  label,
  disabled,
  onClick,
}: {
  label: string
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "min-h-12 rounded-2xl border px-4 py-3 text-sm font-bold shadow-sm transition",
        disabled
          ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white/30"
          : "border-sky-200 bg-white text-slate-800 hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-50 dark:border-white/10 dark:bg-[#182733] dark:text-white dark:hover:border-sky-400 dark:hover:bg-[#1d3140]"
      )}
    >
      {label}
    </button>
  )
}

function MatchCard({
  index,
  label,
  selected,
  matched,
  dimmed,
  onClick,
}: {
  index: number
  label: string
  selected?: boolean
  matched?: boolean
  dimmed?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-14 items-center gap-3 rounded-2xl border px-4 py-3 text-left transition",
        selected
          ? "border-sky-400 bg-sky-50 text-sky-900 ring-2 ring-sky-200 dark:bg-sky-500/10 dark:text-white dark:ring-sky-300/40"
          : matched
            ? "border-emerald-300 bg-emerald-50 text-emerald-900 dark:bg-emerald-500/10 dark:text-white"
            : "border-slate-200 bg-white text-slate-800 hover:border-sky-300 hover:bg-sky-50 dark:border-white/10 dark:bg-[#182733] dark:text-white dark:hover:border-sky-400 dark:hover:bg-[#1d3140]",
        dimmed && "opacity-55"
      )}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-xs font-black text-slate-500 dark:border-white/10 dark:bg-[#13212a] dark:text-white/75">
        {index + 1}
      </span>
      <span className="text-lg font-semibold">{label}</span>
    </button>
  )
}

function normalizeSupportText(value: string) {
  return value
    .toLowerCase()
    .replace(/[.,!?]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function AudioTranscriptHint({
  transcript,
  meaning,
}: {
  transcript: string
  meaning?: string
}) {
  const showMeaningHint =
    typeof meaning === "string" &&
    meaning.trim().length > 0 &&
    normalizeSupportText(transcript) !== normalizeSupportText(meaning)

  const transcriptClassName =
    "text-left text-base font-semibold text-slate-900 underline decoration-dotted underline-offset-4 dark:text-white"

  return (
    <div className="rounded-[24px] border border-sky-100 bg-sky-50/80 px-4 py-4 dark:border-sky-400/20 dark:bg-sky-500/10">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-200">
        Text support
      </p>
      <div className="mt-2">
        {showMeaningHint ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className={transcriptClassName}>
                {transcript}
              </button>
            </TooltipTrigger>
            <TooltipContent>{meaning}</TooltipContent>
          </Tooltip>
        ) : (
          <p className={transcriptClassName}>{transcript}</p>
        )}
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-white/55">
        {showMeaningHint
          ? "Hover over the Tagalog text to see the English meaning."
          : "Written out in case audio is unavailable."}
      </p>
    </div>
  )
}

export function ExerciseRenderer({
  exercise,
  answer,
  onChange,
  onSpeak,
  onUseMic,
  onSkipSpeaking,
  voiceCapability,
  listening,
  audioMeaning,
}: ExerciseRendererProps) {
  const showAudio = "audioText" in exercise && !!exercise.audioText
  const showMic =
    exercise.type === "listen-repeat" || exercise.type === "speaking-prompt"
  const audioTranscript =
    exercise.type === "listen-repeat"
      ? exercise.expectedTranscript
      : "audioText" in exercise && exercise.audioText
        ? exercise.audioText
        : undefined
  const matchingOptions = useMemo(
    () =>
      exercise.type === "word-matching"
        ? shuffleValues(exercise.pairs.map((pair) => pair.right))
        : [],
    [exercise]
  )
  const [pendingMatchLeft, setPendingMatchLeft] = useState<string | null>(null)

  useEffect(() => {
    setPendingMatchLeft(null)
  }, [exercise.id])

  const matchingAnswer =
    exercise.type === "word-matching" && typeof answer === "object" && !Array.isArray(answer)
      ? answer
      : {}

  function handleMatchRightSelect(rightValue: string) {
    if (exercise.type !== "word-matching" || !pendingMatchLeft) {
      return
    }

    const nextAnswer = { ...matchingAnswer }
    const existingLeft = Object.entries(nextAnswer).find(([, value]) => value === rightValue)?.[0]

    if (existingLeft) {
      delete nextAnswer[existingLeft]
    }

    nextAnswer[pendingMatchLeft] = rightValue
    onChange(nextAnswer)
    setPendingMatchLeft(null)
  }

  return (
    <Card className="border-none bg-white/90 dark:bg-[#17252f]">
      <CardContent className="space-y-5 p-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600 dark:text-sky-300">
            {exercise.instructions}
          </p>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {exercise.prompt}
          </h2>
          {exercise.helperText ? (
            <p className="text-sm leading-6 text-slate-600 dark:text-white/70">{exercise.helperText}</p>
          ) : null}
        </div>

        {(showAudio || showMic || audioTranscript) && (
          <TooltipProvider>
            <div className="space-y-3">
              {(showAudio || showMic) && (
                <div className="flex gap-3">
                  {showAudio ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-12 rounded-2xl"
                          onClick={() => onSpeak(exercise.audioText ?? "")}
                        >
                          <Volume2 className="size-4" />
                          Play audio
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Uses browser speech playback in Filipino.</TooltipContent>
                    </Tooltip>
                  ) : null}

                  {showMic ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-12 rounded-2xl"
                          onClick={onUseMic}
                          disabled={!voiceCapability.recognitionAvailable || listening}
                        >
                          <Mic className="size-4" />
                          {listening ? "Listening..." : "Use mic"}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {voiceCapability.recognitionAvailable
                          ? "Capture a quick browser speech transcript."
                          : "Speech recognition is unavailable, so type your answer instead."}
                      </TooltipContent>
                    </Tooltip>
                  ) : null}

                  {showMic && onSkipSpeaking ? (
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-12 rounded-2xl text-slate-600 dark:text-white/70"
                      onClick={onSkipSpeaking}
                    >
                      Skip speaking
                    </Button>
                  ) : null}
                </div>
              )}

              {audioTranscript ? (
                <AudioTranscriptHint transcript={audioTranscript} meaning={audioMeaning} />
              ) : null}
            </div>
          </TooltipProvider>
        )}

        {exercise.type === "tap-translation" || exercise.type === "sentence-reorder" ? (
          <div className="space-y-4">
            <div className="min-h-20 rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-base font-semibold text-slate-700 dark:border-white/10 dark:bg-[#101c24] dark:text-white/85">
              {Array.isArray(answer) && answer.length > 0 ? answer.join(" ") : "Tap words below"}
            </div>
            <div className="flex flex-wrap gap-3">
              {(
                exercise.type === "tap-translation"
                  ? exercise.options.map((item) => item.value)
                  : exercise.tokens
              ).map((token, index) => {
                const selectedCount = Array.isArray(answer)
                  ? answer.filter((item) => item === token).length
                  : 0
                const sourceCount = (
                  exercise.type === "tap-translation"
                    ? exercise.options.map((item) => item.value)
                    : exercise.tokens
                ).filter((item) => item === token).length
                const disabled = selectedCount >= sourceCount

                return (
                  <TokenChip
                    key={`${token}-${index}`}
                    label={token}
                    disabled={disabled}
                    onClick={() =>
                      onChange(Array.isArray(answer) ? [...answer, token] : [token])
                    }
                  />
                )
              })}
            </div>
            <Button
              type="button"
              variant="ghost"
              className="h-10 rounded-2xl text-slate-600 dark:text-white/70"
              onClick={() => onChange([])}
            >
              Clear
            </Button>
          </div>
        ) : null}

        {exercise.type === "word-matching" ? (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                {exercise.pairs.map((pair, index) => (
                  <MatchCard
                    key={pair.left}
                    index={index}
                    label={pair.left}
                    selected={pendingMatchLeft === pair.left}
                    matched={Boolean(matchingAnswer[pair.left])}
                    onClick={() =>
                      setPendingMatchLeft((current) => (current === pair.left ? null : pair.left))
                    }
                  />
                ))}
              </div>
              <div className="space-y-3">
                {matchingOptions.map((option, index) => {
                  const matchedLeft = Object.entries(matchingAnswer).find(
                    ([, value]) => value === option
                  )?.[0]

                  return (
                    <MatchCard
                      key={option}
                      index={index}
                      label={option}
                      selected={pendingMatchLeft !== null && matchingAnswer[pendingMatchLeft] === option}
                      matched={Boolean(matchedLeft)}
                      dimmed={Boolean(matchedLeft) && !pendingMatchLeft}
                      onClick={() => handleMatchRightSelect(option)}
                    />
                  )
                })}
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600 dark:border-white/10 dark:bg-[#101c24] dark:text-white/75">
              {pendingMatchLeft ? (
                <span>
                  Pair <span className="font-semibold text-slate-900 dark:text-white">{pendingMatchLeft}</span> with its match on the right.
                </span>
              ) : (
                "Select a prompt on the left, then tap its matching answer on the right."
              )}
            </div>

            <Button
              type="button"
              variant="ghost"
              className="h-10 rounded-2xl text-slate-600 dark:text-white/70"
              onClick={() => {
                onChange({})
                setPendingMatchLeft(null)
              }}
            >
              Clear pairs
            </Button>
          </div>
        ) : null}

        {exercise.type === "fill-in-the-blank" ? (
          <div className="space-y-3">
            <div className="rounded-[24px] bg-slate-50 px-4 py-4 text-base font-semibold text-slate-800 dark:bg-[#101c24] dark:text-white">
              {exercise.sentenceTemplate}
            </div>
            <Input
              placeholder={exercise.placeholder}
              value={typeof answer === "string" ? answer : ""}
              onChange={(event) => onChange(event.target.value)}
            />
          </div>
        ) : null}

        {exercise.type === "listening-mcq" ? (
          <div className="grid gap-3">
            {exercise.options.map((option) => (
              <ChoiceChip
                key={option.id}
                label={option.label}
                selected={answer === option.value}
                onClick={() => onChange(option.value)}
              />
            ))}
          </div>
        ) : null}

        {exercise.type === "dictation" ||
        exercise.type === "listen-repeat" ||
        exercise.type === "speaking-prompt" ? (
          <div className="space-y-3">
            <Input
              placeholder="Type your answer"
              value={typeof answer === "string" ? answer : ""}
              onChange={(event) => onChange(event.target.value)}
            />
            {exercise.type === "speaking-prompt" && exercise.referenceTranslation ? (
              <p className="text-xs text-slate-500 dark:text-white/55">
                Reference: {exercise.referenceTranslation}
              </p>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
