import { useCallback, useState, useEffect } from "react"
import LoadingSpinner from "./loading-spinner"
import SpecCompare from "./spec-compare"
import { cn } from "../lib/utils"
import { Input } from "./input"
import { SimpleCard } from "./card"
import { Button } from "./button"
import { invoke } from '@tauri-apps/api/core';

function parseRequirements(html) {
  if (!html) {
    return {
      os: "-",
      cpu: "-",
      ramGB: "-",
      gpu: "-",
      dxVersion: "-",
      storageGB: "-"
    };
  }

  // Remove HTML tags and normalize line breaks
  const text = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .trim();

  // If the text is basically empty after cleaning, return placeholders
  if (!text || text === "Minimum:" || text === "Recommended:") {
    return {
      os: "-",
      cpu: "-",
      ramGB: "-",
      gpu: "-",
      dxVersion: "-",
      storageGB: "-"
    };
  }

  const lines = text
    .split(/\n|\r/)
    .map(l => l.trim())
    .filter(Boolean);

  const req = {};

  lines.forEach(line => {
    if (/^OS:/i.test(line)) req.os = line.replace(/^OS:/i, "").trim();
    if (/^Processor:/i.test(line)) req.cpu = line.replace(/^Processor:/i, "").trim();
    if (/^Memory:/i.test(line))
      req.ramGB = line.replace(/^Memory:/i, "").replace(/GB.*$/, "").trim();
    if (/^Graphics:/i.test(line)) req.gpu = line.replace(/^Graphics:/i, "").trim();
    if (/^DirectX:/i.test(line))
      req.dxVersion = line.replace(/^DirectX:/i, "").replace(/Version/i, "").trim();
    if (/^Storage:/i.test(line))
      req.storageGB = line.replace(/^Storage:/i, "").replace(/GB.*$/, "").trim();
  });

  // Convert ramGB and storageGB to numbers if possible
  if (req.ramGB && req.ramGB !== "-") {
    req.ramGB = Number(req.ramGB.replace(/[^\d.]/g, ""));
  }
  if (req.storageGB && req.storageGB !== "-") {
    req.storageGB = Number(req.storageGB.replace(/[^\d.]/g, ""));
  }

  // Ensure all expected fields exist, fallback to "-"
  const fields = ["os", "cpu", "ramGB", "gpu", "dxVersion", "storageGB"];
  fields.forEach(f => {
    if (req[f] === undefined || req[f] === "") req[f] = "-";
  });

  return req;
}


function ErrorPage({ error }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
      <p className="text-base text-gray-700 mb-2">{error}</p>
      <p className="text-sm text-gray-400">Please try again or check your internet connection.</p>
    </div>
  );
}

export default function SpecChecker() {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [osWarning, setOsWarning] = useState(null)

  const [userSpecs, setUserSpecs] = useState({
    cpu: null,
    gpu: null,
    ramGB: null,
    storageGB: null,
    os: null,
    dxVersion: "12",
  });

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    setOsWarning(null)

    try {
      // Find closest match in local cache
      const appid = await invoke('search_local_game', { query: query.trim() })
      if (!appid) {
        setError("No matching game found in local cache.")
        setLoading(false)
        return
      }

      // Fetch game details from Steam
      const detailsResp = await invoke('steam_app_details', { appid: String(appid) })
      const detailsObj = detailsResp[String(appid)]
      if (!detailsObj || !detailsObj.success || !detailsObj.data) {
        setError("Steam API failed to return game details. Please try again later.")
        setLoading(false)
        return
      }

      const details = detailsObj.data
      if (!details || !details.name) {
        setError("Could not fetch game details from Steam.")
        setLoading(false)
        return
      }

      // Extract core info
      let minimum = {}, recommended = {}
      const thumbnail = details.header_image || null
      const publishers = details.publishers || []
      const developers = details.developers || []
      const platforms = details.platforms || {}
      const releaseDate = details.release_date || {}

      // 🧭 Determine OS mapping
      const osMap = {
        Windows_NT: "windows",
        Darwin: "mac",
        Linux: "linux",
      }
      const userOsKey = osMap[userSpecs.os] || null

      // ⚠️ OS compatibility check
      if (userOsKey && platforms[userOsKey] === false) {
        setOsWarning(`Your Operating System (${userSpecs.os}) is not compatible with this game.`)
      } else {
        setOsWarning(null)
      }

      // 🧩 Pick correct requirement section
      let osRequirements = null
      if (userOsKey === "windows") {
        osRequirements = details.pc_requirements
      } else if (userOsKey === "mac") {
        osRequirements = details.mac_requirements
      } else if (userOsKey === "linux") {
        osRequirements = details.linux_requirements
      }

      if (osRequirements) {
        minimum = parseRequirements(osRequirements.minimum)
        recommended = parseRequirements(osRequirements.recommended)
      }

      setResult({
        title: details.name,
        minimum,
        recommended,
        thumbnail,
        publishers,
        developers,
        platforms,
        releaseDate,
      })
    } catch (e) {
      console.log(e)
      setError("Failed to fetch game details. Please check your connection or try again later.")
    }

    setLoading(false)
  }, [query, userSpecs])

  useEffect(() => {
    const fetchSpecs = async () => {
      try {
        const specs = await invoke("get_user_system_specs");

        setUserSpecs({
          cpu: specs.cpu_brand ?? null,
          gpu: specs.gpu ?? null,
          ramGB: specs.total_ram_gb ?? null,
          storageGB: specs.total_storage_gb ?? null,
          os: specs.os ?? null,
          dxVersion: "12", // placeholder
        });
      } catch (err) {
        console.error("Failed to fetch system specs:", err);
      }
    };

    fetchSpecs();
  }, []);

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

      {/* Error Page */}
      {error && <ErrorPage error={error} />}

      {/* Loading State */}
      {!error && loading && (
        <div className="flex items-center justify-center py-10">
          <div className="inline-flex items-center gap-3">
            <LoadingSpinner size={24} />
            <span className="text-gray-500">Loading game requirements…</span>
          </div>
        </div>
      )}

      {/* Result */}
      {!error && result && (
        <>
          {osWarning ? (
            <p className="text-center text-red-600 font-medium">
              {osWarning}
            </p>
          ) : (
            <SpecCompare
              user={userSpecs}
              minimum={result.minimum}
              recommended={result.recommended}
              gameTitle={result.title}
              thumbnail={result.thumbnail}
              publishers={result.publishers}
              developers={result.developers}
              platforms={result.platforms}
              releaseDate={result.releaseDate}
            />
          )}
        </>
      )}
    </section>
  )
}
