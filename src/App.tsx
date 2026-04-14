export default function App() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-20 text-slate-50">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <span className="w-fit rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-300">
          Frankie Stack
        </span>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-6xl">
          Vite, React, TypeScript, and a clean starting point.
        </h1>
        <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
          Start building from an opinionated scaffold instead of the default Vite demo.
        </p>
        <div className="flex flex-wrap gap-3 text-sm text-slate-300">
          <span className="rounded-full bg-slate-800 px-3 py-1">React</span>
          <span className="rounded-full bg-slate-800 px-3 py-1">TypeScript</span>
          <span className="rounded-full bg-slate-800 px-3 py-1">Tailwind CSS</span>
        </div>
      </div>
    </main>
  )
}
