import SpecChecker from './components/spec-checker'

function App() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-balance text-2xl font-semibold">Can You Run This?</h1>
        <p className="mt-2 text-gray-600">
          Compare your PC specs against a game&apos;s minimum and recommended requirements.
        </p>
      </header>
      <SpecChecker />
    </main>
  )
}

export default App
