import { BookOpenText, Volume2 } from "lucide-react"

import type { LessonIntroCard } from "@/lib/domain/models"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type LessonIntroCardProps = {
  card: LessonIntroCard
  index: number
  total: number
  onSpeak: (text: string) => void
  onContinue: () => void
}

const emojiMap: Record<string, string> = {
  Sunrise: "🌅",
  Wave: "👋",
  Thanks: "🙏",
  Sun: "🌞",
  Moon: "🌙",
  Night: "🌃",
  Smile: "😊",
  Okay: "👌",
  Chat: "💬",
  Respect: "🙇",
  Spark: "✨",
  Ask: "🙋",
  Open: "👐",
  Question: "❓",
  Kind: "💛",
  Warm: "🤝",
  Me: "🙋",
  You: "🫵",
  Tag: "🏷️",
  Your: "🪪",
  Name: "✍️",
  Book: "📘",
  Friend: "🫶",
  School: "🏫",
  Happy: "😄",
  Tired: "😮‍💨",
  Sad: "😔",
  Excited: "🤩",
  Bright: "🌟",
  Quiet: "🤫",
  Heart: "💖",
  House: "🏠",
  Food: "🍲",
  Store: "🏪",
  Room: "🛋️",
  Teacher: "🧑‍🏫",
  Table: "🪑",
  Bag: "👜",
  Eat: "🍽️",
  Drink: "🥤",
  Walk: "🚶",
  Study: "📚",
  Work: "💼",
  Focus: "🎯",
  Sleep: "😴",
  Read: "📖",
}

function resolveCardEmoji(value?: string) {
  if (!value) {
    return "✨"
  }

  return emojiMap[value] ?? value
}

export function LessonIntroCard({
  card,
  index,
  total,
  onSpeak,
  onContinue,
}: LessonIntroCardProps) {
  const isLast = index === total - 1

  return (
    <Card className="border-none bg-white/90 dark:bg-[#17252f]">
      <CardContent className="space-y-6 p-6 sm:p-8">
        <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-fuchsia-500">
          <BookOpenText className="size-4" />
          {card.kind === "phrase" ? "New phrase" : "New word"}
        </div>

        <div className="space-y-4 text-center">
          <div className="mx-auto flex size-28 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-100 to-sky-100 text-6xl shadow-inner dark:from-fuchsia-500/20 dark:to-sky-500/20">
            {resolveCardEmoji(card.emoji)}
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              {card.tagalog}
            </h2>
            <p className="text-xl font-semibold text-slate-600 dark:text-white/75">
              {card.meaning}
            </p>
          </div>
        </div>

        {card.example ? (
          <div className="rounded-[24px] bg-slate-50 px-5 py-4 text-center text-sm leading-6 text-slate-700 dark:bg-[#101c24] dark:text-white/75">
            {card.example}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="h-12 flex-1 rounded-2xl dark:border-white/10 dark:bg-[#101c24] dark:text-white dark:hover:bg-[#162833]"
            onClick={() => onSpeak(card.audioText ?? card.tagalog)}
          >
            <Volume2 className="size-4" />
            Hear it
          </Button>
          <Button
            type="button"
            className="h-12 flex-1 rounded-2xl bg-sky-500 text-white hover:bg-sky-600"
            onClick={onContinue}
          >
            {isLast ? "Start lesson" : "Continue"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
