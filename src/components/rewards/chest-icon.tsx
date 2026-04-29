import type { ComponentPropsWithoutRef } from 'react'

type ChestIconProps = ComponentPropsWithoutRef<'svg'> & {
	showLatch?: boolean
}

export function ChestIcon({ showLatch = true, ...props }: ChestIconProps) {
	return (
		<svg
			viewBox="0 0 64 64"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			{...props}
		>
			<path
				d="M12 29h40v22a5 5 0 0 1-5 5H17a5 5 0 0 1-5-5V29Z"
				fill="currentColor"
				opacity="0.9"
			/>
			<path
				d="M16 29v-5c0-8.84 7.16-16 16-16s16 7.16 16 16v5"
				fill="currentColor"
				opacity="0.72"
			/>
			<path
				d="M8 29h48M17 56h30a5 5 0 0 0 5-5V29H12v22a5 5 0 0 0 5 5ZM16 29v-5c0-8.84 7.16-16 16-16s16 7.16 16 16v5M32 29v27"
				stroke="currentColor"
				strokeWidth="4"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			{showLatch ? (
				<rect
					x="25"
					y="34"
					width="14"
					height="12"
					rx="3"
					fill="rgba(15, 23, 42, 0.72)"
				/>
			) : null}
			<path
				d="M23 11h18M9 43h46"
				stroke="rgba(255, 255, 255, 0.65)"
				strokeWidth="3"
				strokeLinecap="round"
			/>
		</svg>
	)
}

export function InactiveChestIcon(props: ComponentPropsWithoutRef<'svg'>) {
	return (
		<svg
			viewBox="0 0 64 64"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			{...props}
		>
			<path
				d="M13 28h38v22a5 5 0 0 1-5 5H18a5 5 0 0 1-5-5V28Z"
				fill="currentColor"
				opacity="0.74"
			/>
			<path
				d="M16 16h32a4 4 0 0 1 4 4v9H12v-9a4 4 0 0 1 4-4Z"
				fill="currentColor"
				opacity="0.6"
			/>
			<path
				d="M12 29h40M18 55h28a5 5 0 0 0 5-5V20a4 4 0 0 0-4-4H17a4 4 0 0 0-4 4v30a5 5 0 0 0 5 5ZM22 16v39M42 16v39"
				stroke="currentColor"
				strokeWidth="4"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M14 41h36"
				stroke="rgba(255, 255, 255, 0.55)"
				strokeWidth="3"
				strokeLinecap="round"
			/>
		</svg>
	)
}

export function OpenChestIcon(props: ComponentPropsWithoutRef<'svg'>) {
	return (
		<svg
			viewBox="0 0 64 64"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			{...props}
		>
			<path
				d="M9 31 45 19l4 12-36 12-4-12Z"
				fill="currentColor"
				opacity="0.68"
			/>
			<path
				d="M12 34h40v17a5 5 0 0 1-5 5H17a5 5 0 0 1-5-5V34Z"
				fill="currentColor"
				opacity="0.9"
			/>
			<path
				d="m9 31 36-12 4 12-36 12-4-12ZM17 56h30a5 5 0 0 0 5-5V34H12v17a5 5 0 0 0 5 5ZM32 34v22M8 34h48"
				stroke="currentColor"
				strokeWidth="4"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<rect
				x="25"
				y="39"
				width="14"
				height="11"
				rx="3"
				fill="rgba(15, 23, 42, 0.72)"
			/>
			<path
				d="M18 28 39 21M9 47h46"
				stroke="rgba(255, 255, 255, 0.65)"
				strokeWidth="3"
				strokeLinecap="round"
			/>
		</svg>
	)
}
