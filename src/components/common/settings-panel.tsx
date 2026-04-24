import { Moon, Palette, Sun } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/use-app-store'

const toggleSettings = [
	[
		'soundEnabled',
		'Sound effects',
		'Play success and mistake cues during lessons.',
	],
	[
		'speechPlaybackEnabled',
		'Speech playback',
		'Allow browser audio for phrases and prompts.',
	],
	[
		'microphoneEnabled',
		'Microphone prompts',
		'Show speaking and dictation input options when available.',
	],
	[
		'reducedMotion',
		'Reduced motion',
		'Tone down celebratory animations and motion-heavy transitions.',
	],
] as const

export function SettingsPanel() {
	const snapshot = useAppStore((state) => state.snapshot)
	const updateSettings = useAppStore((state) => state.updateSettings)

	return (
		<div className="space-y-4">
			<div className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5">
				<div className="mb-4 flex items-start gap-3">
					<div className="flex size-11 items-center justify-center rounded-2xl bg-white text-sky-600 shadow-sm dark:bg-white/10 dark:text-sky-200">
						<Palette className="size-5" />
					</div>
					<div>
						<p className="font-semibold text-slate-900 dark:text-white">
							Appearance
						</p>
						<p className="text-sm leading-6 text-slate-600 dark:text-white/70">
							Pick the color mode that feels best for your sessions.
						</p>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-3">
					{(['light', 'dark'] as const).map((theme) => (
						<Button
							key={theme}
							type="button"
							variant={
								snapshot.settings.theme === theme ? 'default' : 'outline'
							}
							className={cn(
								'h-12 justify-start gap-3 rounded-2xl px-4 capitalize',
								snapshot.settings.theme === theme
									? 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-white/90'
									: 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-[#13212a] dark:text-white/80 dark:hover:bg-[#182733]'
							)}
							onClick={() =>
								void updateSettings({
									...snapshot.settings,
									theme,
								})
							}
						>
							{theme === 'light' ? (
								<Sun className="size-4" />
							) : (
								<Moon className="size-4" />
							)}
							{theme}
						</Button>
					))}
				</div>
			</div>

			<div className="rounded-[28px] border border-slate-200 bg-white/80 p-4 dark:border-white/10 dark:bg-[#13212a]/80">
				<div className="mb-3">
					<p className="font-semibold text-slate-900 dark:text-white">
						Learning preferences
					</p>
					<p className="text-sm leading-6 text-slate-600 dark:text-white/70">
						These settings stay local on this device for now.
					</p>
				</div>

				<div className="space-y-3">
					{toggleSettings.map(([key, label, description]) => (
						<label
							key={key}
							className="flex items-start justify-between gap-4 rounded-[24px] border border-slate-200 bg-slate-50/70 px-4 py-3 dark:border-white/10 dark:bg-white/5"
						>
							<div className="space-y-1">
								<span className="block font-medium text-slate-900 dark:text-white">
									{label}
								</span>
								<span className="block text-sm leading-6 text-slate-600 dark:text-white/65">
									{description}
								</span>
							</div>
							<input
								type="checkbox"
								className="mt-1 size-4 shrink-0 accent-sky-500"
								checked={snapshot.settings[key]}
								onChange={(event) =>
									void updateSettings({
										...snapshot.settings,
										[key]: event.target.checked,
									})
								}
							/>
						</label>
					))}
				</div>
			</div>
		</div>
	)
}
