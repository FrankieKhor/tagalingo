import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

type AchievementCardProps = {
  title: string
  description: string
  icon: string
  unlocked: boolean
}

export function AchievementCard({
  title,
  description,
  icon,
  unlocked,
}: AchievementCardProps) {
  return (
    <Card className={unlocked ? "" : "opacity-60"}>
      <CardContent className="flex items-start gap-4 p-5">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-2xl dark:bg-[#101c24]">
          {icon}
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-slate-900 dark:text-white">{title}</p>
            <Badge variant={unlocked ? "default" : "outline"}>
              {unlocked ? "Unlocked" : "Locked"}
            </Badge>
          </div>
          <p className="text-sm text-slate-600 dark:text-white/70">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}
