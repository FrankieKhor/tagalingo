import { useId } from 'react'

import { getStreakTier } from '@/lib/domain/streak'
import { cn } from '@/lib/utils'

type StreakFlameProps = {
	streak: number
	className?: string
	title?: string
}

export function StreakFlame({ streak, className, title }: StreakFlameProps) {
	const tier = getStreakTier(streak)
	const reactId = useId().replace(/:/g, '')
	const gradientId = `streak-flame-${tier.id}-${reactId}`
	const coreGradientId = `streak-flame-core-${tier.id}-${reactId}`
	const sparkleGradientId = `streak-flame-sparkle-${reactId}`

	return (
		<svg
			viewBox="0 0 64 64"
			role={title ? 'img' : 'presentation'}
			aria-label={title}
			className={cn('block size-8 shrink-0 drop-shadow-sm', className)}
		>
			<defs>
				<linearGradient id={gradientId} x1="18" x2="48" y1="8" y2="58">
					<stop offset="0" stopColor={tier.secondary} />
					<stop offset="0.48" stopColor={tier.primary} />
					<stop offset="1" stopColor={tier.glow} />
				</linearGradient>
				<linearGradient id={coreGradientId} x1="27" x2="40" y1="29" y2="54">
					<stop offset="0" stopColor="#ffffff" stopOpacity="0.94" />
					<stop offset="1" stopColor={tier.secondary} />
				</linearGradient>
				{tier.id === 'diamond' ? (
					<radialGradient id={sparkleGradientId} cx="50%" cy="18%" r="80%">
						<stop offset="0" stopColor="#f0f9ff" />
						<stop offset="0.42" stopColor="#22d3ee" />
						<stop offset="0.72" stopColor="#a78bfa" />
						<stop offset="1" stopColor="#f472b6" />
					</radialGradient>
				) : null}
			</defs>
			<path
				fill={
					tier.id === 'diamond'
						? `url(#${sparkleGradientId})`
						: `url(#${gradientId})`
				}
				d="M33.5 5.5c2.6 8.7 12.9 13.9 15.7 24.1 4.1 15-6.9 28.9-21 28.9-11.3 0-19.5-8.2-19.5-19.1 0-8.6 5.1-15.1 11.1-20.6.5 5.8 3 8.7 5.7 10.2-1-8.9 2.5-16.7 8-23.5Z"
			/>
			<path
				fill="rgba(255,255,255,0.2)"
				d="M35.1 9.5c3 7.6 11 12.9 12.9 22 1.3 6.3-.4 12.1-3.7 16.5 1.4-4 1.6-8.7.4-13.2-2.1-8.2-9.5-13.8-12.4-20.6.8-1.7 1.7-3.3 2.8-4.7Z"
			/>
			<path
				fill={`url(#${coreGradientId})`}
				d="M32.6 30.5c1.4 4.8 7 7.9 8.2 13.5 1.3 6.1-3.3 11.4-9.4 11.4-5.2 0-9-3.8-9-9 0-4.4 2.8-7.5 6.2-10.5.1 3 .9 4.9 2.6 6.3-.6-4.6.1-8.5 1.4-11.7Z"
			/>
			{tier.id === 'ember' ? (
				<path
					fill="#0f172a"
					opacity="0.25"
					d="M21.2 51.1c6.2 3.7 13.6 2.8 18.2-1.8-2.1 5.3-7.9 8.7-14.4 6.8-1.5-.5-2.8-1.3-3.8-2.2v-2.8Z"
				/>
			) : null}
		</svg>
	)
}
