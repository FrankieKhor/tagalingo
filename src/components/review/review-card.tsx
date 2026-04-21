import { Brain } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ReviewItem } from "@/lib/domain/models"

type ReviewCardProps = {
  item: ReviewItem
  onAnswer: (correct: boolean) => void
}

export function ReviewCard({ item, onAnswer }: ReviewCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 text-sky-600">
          <Brain className="size-4" />
          <span className="text-xs font-semibold uppercase tracking-[0.2em]">Review due</span>
        </div>
        <CardTitle>{item.prompt}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="rounded-3xl bg-slate-100 px-4 py-3 text-sm text-slate-700 dark:bg-[#101c24] dark:text-white/75">
          Correct answer: <span className="font-semibold text-slate-900 dark:text-white">{item.answer}</span>
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-12 rounded-2xl"
            onClick={() => onAnswer(false)}
          >
            Still tricky
          </Button>
          <Button
            className="h-12 rounded-2xl bg-emerald-500 text-white hover:bg-emerald-600"
            onClick={() => onAnswer(true)}
          >
            I got it
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
