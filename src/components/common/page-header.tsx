import { type ReactNode } from 'react'

import { cn } from '@/lib/utils'

type PageHeaderProps = {
	eyebrow?: string
	title: string
	description: string
	action?: ReactNode
	className?: string
}

export function PageHeader({
	eyebrow,
	title,
	description,
	action,
	className,
}: PageHeaderProps) {
	return (
		<header
			className={cn(
				'flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between',
				className
			)}
		>
			<div className="space-y-1">
				{eyebrow ? (
					<p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">
						{eyebrow}
					</p>
				) : null}
				<h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
					{title}
				</h1>
				<p className="max-w-md text-sm leading-6 text-slate-600 dark:text-white/70">
					{description}
				</p>
			</div>
			{action}
		</header>
	)
}
