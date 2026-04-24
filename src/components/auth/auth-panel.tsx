import { LogIn, LogOut, Mail, UserPlus } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/store/use-auth-store'

export function AuthPanel() {
	const user = useAuthStore((state) => state.user)
	const loading = useAuthStore((state) => state.loading)
	const mode = useAuthStore((state) => state.mode)
	const error = useAuthStore((state) => state.error)
	const signIn = useAuthStore((state) => state.signIn)
	const signUp = useAuthStore((state) => state.signUp)
	const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle)
	const signOut = useAuthStore((state) => state.signOut)
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')

	const busy = loading || mode !== 'idle'

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		await signUp(email, password)
	}

	async function handleSignIn() {
		await signIn(email, password)
	}

	if (user) {
		return (
			<Card>
				<CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<p className="text-sm font-black uppercase tracking-[0.16em] text-sky-600 dark:text-sky-300">
							Cloud sync
						</p>
						<p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
							{user.displayName ?? user.email ?? 'Signed in'}
						</p>
						<p className="text-sm text-slate-600 dark:text-white/65">
							Your progress is syncing with Firebase.
						</p>
					</div>
					<Button
						type="button"
						variant="outline"
						className="h-11 rounded-2xl"
						disabled={busy}
						onClick={() => void signOut()}
					>
						<LogOut className="size-4" />
						Sign out
					</Button>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card>
			<CardContent className="space-y-4 p-5">
				<div>
					<p className="text-sm font-black uppercase tracking-[0.16em] text-sky-600 dark:text-sky-300">
						Cloud sync
					</p>
					<h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
						Sign up to start learning
					</h2>
					<p className="mt-1 text-sm leading-6 text-slate-600 dark:text-white/65">
						Your hearts, XP, lesson progress, quests, and settings are saved
						to your account.
					</p>
				</div>

				<form
					className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
					onSubmit={handleSubmit}
				>
					<Input
						type="email"
						autoComplete="email"
						placeholder="Email"
						value={email}
						onChange={(event) => setEmail(event.target.value)}
						required
					/>
					<Input
						type="password"
						autoComplete="current-password"
						placeholder="Password"
						value={password}
						minLength={6}
						onChange={(event) => setPassword(event.target.value)}
						required
					/>
					<Button type="submit" className="h-12 rounded-2xl" disabled={busy}>
						<UserPlus className="size-4" />
						Create account
					</Button>
				</form>

				<div className="flex flex-col gap-3 sm:flex-row">
					<Button
						type="button"
						variant="outline"
						className="h-11 rounded-2xl"
						disabled={busy || !email || password.length < 6}
						onClick={() => void handleSignIn()}
					>
						<LogIn className="size-4" />
						Sign in instead
					</Button>
					<Button
						type="button"
						variant="outline"
						className="h-11 rounded-2xl"
						disabled={busy}
						onClick={() => void signInWithGoogle()}
					>
						<Mail className="size-4" />
						Continue with Google
					</Button>
				</div>

				{error ? (
					<p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100">
						{error}
					</p>
				) : null}
			</CardContent>
		</Card>
	)
}
