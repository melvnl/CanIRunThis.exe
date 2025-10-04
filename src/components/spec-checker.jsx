"use client"

import { useCallback, useMemo, useState } from "react"
import LoadingSpinner from "./loading-spinner"
import SpecCompare from "./spec-compare"
import { cn } from "../lib/utils"
import { Input } from "./input"
import { SimpleCard } from "./card"
import { Button } from "./button"

const GAME_DB = {
  "elden ring": {
    title: "ELDEN RING",
    minimum: {
      cpu: "Intel Core i5-8400 / Ryzen 3 3300X",
      gpu: "NVIDIA GTX 1060 3GB / AMD RX 580 4GB",
      ramGB: 12,
      storageGB: 60,
      os: "Windows 10",
      dxVersion: "12",
    },
    recommended: {
      cpu: "Intel Core i7-8700K / Ryzen 5 3600X",
      gpu: "NVIDIA RTX 2060 / AMD RX 5700 XT",
      ramGB: 16,
      storageGB: 60,
      os: "Windows 10/11",
      dxVersion: "12",
    },
  },
  "baldurs gate 3": {
    title: "Baldur's Gate 3",
    minimum: {
      cpu: "Intel i5-4690 / AMD FX 8350",
      gpu: "NVIDIA GTX 970 / AMD RX 480",
      ramGB: 8,
      storageGB: 150,
      os: "Windows 10",
      dxVersion: "11",
    },
    recommended: {
      cpu: "Intel i7-8700K / AMD Ryzen 5 3600",
      gpu: "NVIDIA RTX 2060 Super / AMD RX 5700 XT",
      ramGB: 16,
      storageGB: 150,
      os: "Windows 10/11",
      dxVersion: "12",
    },
  },
}

export default function SpecChecker() {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const userSpecs = useMemo(
    () => ({
      cpu: "Intel Core i7-9750H",
      gpu: "NVIDIA GTX 1660 Ti",
      ramGB: 16,
      storageGB: 200,
      os: "Windows 11",
      dxVersion: "12",
    }),
    [],
  )

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)

    await new Promise((r) => setTimeout(r, 700))

    const key = query.trim().toLowerCase()
    const found = GAME_DB[key]
    if (!found) {
      setError("Game not found in demo database. Try “Elden Ring” or “Baldurs Gate 3”.")
      setLoading(false)
      return
    }

    setResult({ title: found.title, minimum: found.minimum, recommended: found.recommended })
    setLoading(false)
  }, [query])

  return (
    <section className="space-y-6">
      {/* Search Card */}
      <SimpleCard title="Search for a Game">
        <form
          className="flex flex-col sm:flex-row sm:items-center sm:gap-2 gap-3"
          onSubmit={(e) => {
            e.preventDefault()
            if (!loading) handleSearch()
          }}
        >
          <label htmlFor="game" className="sr-only">
            Game title
          </label>
          <Input
            id="game"
            placeholder="e.g., Elden Ring"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
            aria-label="Game title"
            autoComplete="off"
          />
          <Button
            type="submit"
            className={cn("min-w-[7rem]")}
            disabled={!query.trim() || loading}
            aria-busy={loading ? "true" : "false"}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <LoadingSpinner size={16} /> Searching…
              </span>
            ) : (
              "Search"
            )}
          </Button>
        </form>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </SimpleCard>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-10">
          <div className="inline-flex items-center gap-3">
            <LoadingSpinner size={24} />
            <span className="text-gray-500">Loading game requirements…</span>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <SpecCompare
          user={userSpecs}
          minimum={result.minimum}
          recommended={result.recommended}
          gameTitle={result.title}
        />
      )}
    </section>
  )
}
