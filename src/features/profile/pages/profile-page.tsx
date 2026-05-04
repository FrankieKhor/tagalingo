import { RotateCcw, Settings2, Trophy } from 'lucide-react'
import { useState } from 'react'

import { AuthPanel } from '@/components/auth/auth-panel'
import { PageHeader } from '@/components/common/page-header'
import { SettingsSheet } from '@/components/common/settings-sheet'
import { AchievementCard } from '@/components/profile/achievement-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { achievementCatalog } from '@/content'
import { getRemainingAchievementCount } from '@/lib/domain/achievements'
import { useAppStore } from '@/store/use-app-store'

export function ProfilePage() {
	const snapshot = useAppStore((state) => state.snapshot)
	const resetProgress = useAppStore((state) => state.resetProgress)
	const saving = useAppStore((state) => state.saving)
	const [open, setOpen] = useState(false)

	const achievementView = snapshot.profile.achievements
	const remainingAchievements = getRemainingAchievementCount(snapshot.profile)

	return (
		<div className="space-y-6">
			<PageHeader
				eyebrow="Profile"
				title={snapshot.profile.displayName}
				description="Cloud sync, friendly settings, and the badges you've unlocked so far."
				action={
					<SettingsSheet>
						<Button variant="outline" className="rounded-full">
							<Settings2 className="size-4" />
						</Button>
					</SettingsSheet>
				}
			/>

			<AuthPanel />

			<div className="grid gap-4 sm:grid-cols-3">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm text-slate-500 dark:text-white/55">
							Total XP
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-3xl font-black text-slate-900 dark:text-white">
							{snapshot.profile.xp}
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm text-slate-500 dark:text-white/55">
							Current streak
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-3xl font-black text-slate-900 dark:text-white">
							{snapshot.profile.streak}
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm text-slate-500 dark:text-white/55">
							Lessons done
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-3xl font-black text-slate-900 dark:text-white">
							{snapshot.profile.totalLessonsCompleted}
						</p>
					</CardContent>
				</Card>
			</div>

			<section className="space-y-4">
				<div className="flex items-center justify-between gap-4">
					<div className="flex items-center gap-2">
						<Trophy className="size-5 text-amber-500" />
						<h2 className="text-lg font-bold text-slate-900 dark:text-white">
							Achievements
						</h2>
					</div>
					<p className="text-right text-sm text-slate-500 dark:text-white/55">
						{achievementView.length} unlocked
						{remainingAchievements > 0
							? `, ${remainingAchievements} to go`
							: ', all complete'}
					</p>
				</div>
				{achievementCatalog.map((achievement) => (
					<AchievementCard
						key={achievement.id}
						{...achievement}
						unlocked={achievementView.includes(achievement.id)}
					/>
				))}
			</section>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					<Button
						variant="outline"
						className="h-12 w-full rounded-2xl border-rose-200 text-rose-600"
					>
						<RotateCcw className="size-4" />
						Reset progress
					</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Reset everything?</DialogTitle>
						<DialogDescription>
							This clears XP, streak, hearts, lesson completion, and review
							history for the active profile.
						</DialogDescription>
					</DialogHeader>
					<Button
						className="h-12 w-full rounded-2xl bg-rose-500 text-white hover:bg-rose-600"
						disabled={saving}
						onClick={() => {
							void resetProgress()
							setOpen(false)
						}}
					>
						Reset progress
					</Button>
				</DialogContent>
			</Dialog>
		</div>
	)
}
