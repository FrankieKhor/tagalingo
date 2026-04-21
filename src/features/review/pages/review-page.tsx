import { Brain } from "lucide-react"
import { useState } from "react"

import { PageHeader } from "@/components/common/page-header"
import { ReviewCard } from "@/components/review/review-card"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { appServices } from "@/lib/services/app-services"
import { useAppStore } from "@/store/use-app-store"

export function ReviewPage() {
  const snapshot = useAppStore((state) => state.snapshot)
  const submitReview = useAppStore((state) => state.submitReview)
  const [now] = useState(() => Date.now())

  const dueItems = snapshot.reviewQueue.filter(
    (item) => new Date(item.dueAt).getTime() <= now
  )

  function handleReviewAnswer(reviewId: string, correct: boolean) {
    if (snapshot.settings.soundEnabled) {
      if (correct) {
        void appServices.soundEffectsService.playCorrect()
      } else {
        void appServices.soundEffectsService.playWrong()
      }
    }

    submitReview(reviewId, correct)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Review"
        title="Memory refresh"
        description="Spaced repetition keeps tricky words and phrases in your active memory."
      />

      <Tabs defaultValue="due">
        <TabsList>
          <TabsTrigger value="due">Due now</TabsTrigger>
          <TabsTrigger value="weak">Weak words</TabsTrigger>
        </TabsList>
        <TabsContent value="due" className="space-y-4">
          {dueItems.length > 0 ? (
            dueItems.map((item) => (
              <ReviewCard
                key={item.id}
                item={item}
                onAnswer={(correct) => handleReviewAnswer(item.id, correct)}
              />
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
                <Brain className="size-10 text-sky-500" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">No due cards right now.</p>
                  <p className="text-sm text-slate-600 dark:text-white/70">
                    Finish another lesson and your review stack will grow automatically.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="weak" className="space-y-3">
          {snapshot.weakWords.length > 0 ? (
            snapshot.weakWords.slice(0, 8).map((word) => (
              <Card key={word.term}>
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{word.term}</p>
                    <p className="text-sm text-slate-500 dark:text-white/55">
                      Last seen {new Date(word.lastSeenAt).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="rounded-full bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-600 dark:bg-rose-500/10 dark:text-rose-200">
                    {word.mistakes} misses
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-6 text-sm text-slate-600 dark:text-white/70">
                Your weak-word list will fill in as the app spots recurring mistakes.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
