import macCPUs from "../benchmark_data/mac/cpus.json"
import macGPUs from "../benchmark_data/mac/gpus.json"

import { SimpleCard } from "./card"

function fuzzyFindScore(modelName, cpuData) {
  if (!modelName) return null
  const lowerName = modelName.toLowerCase()

  const match = Object.keys(cpuData).find(cpuKey => {
    const key = cpuKey.toLowerCase()
    return (
      key.includes(lowerName) ||
      lowerName.includes(key) ||
      key.replace(/\s+/g, "").includes(lowerName.replace(/\s+/g, ""))
    )
  })

  return match ? cpuData[match] : null
}


function extractModelScore(s) {
  const matches = Array.from(s.toLowerCase().matchAll(/(\d{3,5})(?!\s*gb)/g)).map((m) => Number(m[1]))
  if (!matches.length) return null
  return Math.max(...matches)
}

function dxMeets(userDx, minDx) {
  if (!userDx || !minDx) return "unknown";
  const u = Number.parseInt(userDx.replace(/[^\d]/g, ""), 10);
  const m = Number.parseInt(minDx.replace(/[^\d]/g, ""), 10);
  if (Number.isNaN(u) || Number.isNaN(m)) return "unknown";
  return u >= m ? "pass" : "fail";
}

function osMeets(userOS, userOSversion, minOS) {
  if (!userOS || !userOSversion || !minOS) return "unknown";

  const normalize = (s) => s.toLowerCase().replace(/\s+/g, " ").trim();
  const u = normalize(userOS);
  const m = normalize(minOS.replace("or newer", "").replace("64-bit", "").trim());
  const has = (kw) => u.includes(kw);
  const minHas = (kw) => m.includes(kw);

  // ✅ Windows handling
  if (minHas("windows")) {
    const version = parseFloat(userOSversion);
    const match = m.match(/windows\s*(\d+(\.\d+)?)/);
    const minVersion = match ? parseFloat(match[1]) : 0;
    return version >= minVersion ? "pass" : "fail";
  }

  // ✅ macOS or Darwin handling
  if (minHas("macos") || has("darwin")) {
    const version = parseFloat(userOSversion);
    const match = m.match(/macos\s*(\d+(\.\d+)?)/);
    const minVersion = match ? parseFloat(match[1]) : 0;
    return version >= minVersion ? "pass" : "fail";
  }

  // fallback
  return "unknown";
}

function modelMeets(userOs, type, userVal, minVal) {
  const options = (minVal || "")
    .split("/")
    .map(s => s.trim())
    .filter(Boolean)

  // --- macOS special handling ---
  if (userOs == "Darwin") {
    const u = userVal.toLowerCase()

    // Rule #1: Apple Silicon always beats Intel/AMD
    if (/(apple|m1|m2|m3|m4)/.test(u)) {
      const weaker = options.some(opt =>
        /(intel|amd|quad|hd|core)/i.test(opt)
      )
      if (weaker) return "pass"
    }

    // Rule #2: Fuzzy match fallback
    var source = type === "cpu" ? macCPUs : macGPUs
    const userScore = fuzzyFindScore(userVal, source)
    const optScores = options
      .map(o => fuzzyFindScore(o, source))
      .filter(s => s != null)

    if (userScore == null || optScores.length === 0) return "unknown"
    const meetsAny = optScores.some(s => userScore >= s)
    return meetsAny ? "pass" : "fail"
  }

  // --- fallback for other OS ---
  const userScore = extractModelScore(userVal)
  const optScores = options.map(o => extractModelScore(o)).filter(n => n !== null)
  if (userScore == null || optScores.length === 0) return "unknown"
  const meetsAny = optScores.some(s => userScore >= s)
  return meetsAny ? "pass" : "fail"
}

function numericMeets(userNumberStr, minNumberStr) {
  const u = Number(userNumberStr.replace(/[^\d.]/g, ""))
  const m = Number(minNumberStr.replace(/[^\d.]/g, ""))
  if (Number.isNaN(u) || Number.isNaN(m)) return "unknown"
  return u >= m ? "pass" : "fail"
}

function statusIcon(status) {
  const common = "inline-block align-middle mr-2 h-4 w-4";

  if (status === "pass") {
    return (
      <svg
        className={`${common} text-green-500`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    );
  }

  if (status === "fail") {
    return (
      <svg
        className={`${common} text-red-500`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    );
  }

  // unknown / help
  return (
    <svg
      className={`${common} text-gray-400`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
    </svg>
  );
}


export default function SpecCompare({ user, minimum, recommended, gameTitle, thumbnail, publishers, developers, platforms, releaseDate }) {
  const cpuStatus = modelMeets(user.os, 'cpu', user.cpu, minimum.cpu,)
  const gpuStatus = modelMeets(user.os, 'gpu', user.gpu, minimum.gpu)
  const ramStatus = numericMeets(`${user.ramGB}`, `${minimum.ramGB}`)
  const storageStatus = numericMeets(`${user.storageGB}`, `${minimum.storageGB}`)
  const osStatus = osMeets(user.os, user.osVersion, minimum.os)
  const dxStatus = dxMeets(user.dxVersion, minimum.dxVersion)

  return (
    <SimpleCard
      title={
        <span className="flex gap-2 items-center text-pretty">
          {thumbnail && (
            <img
              src={thumbnail}
              alt="Game thumbnail"
              className="w-16 h-16 object-cover rounded shadow border border-gray-200"
              style={{ minWidth: 48, minHeight: 48 }}
            />
          )}
          <span>{gameTitle} — Requirements vs Your PC</span>
        </span>
      }
      contentClassName="overflow-x-auto"
    >

      {/* Game Info Section */}
      <div className="grid grid-cols-2 grid-rows-2 gap-2 text-sm mb-8">
        {/* Platforms */}
        <div className="flex items-center gap-1">
          <span className="font-medium">Platforms:</span>
          {platforms?.windows && <span title="Windows">Windows</span>}
          {platforms?.mac && <span title="Mac">MacOS</span>}
          {platforms?.linux && <span title="Linux">Linux</span>}
        </div>
        {/* Developers */}
        <div>
          <span className="font-medium">Developers:</span> {developers?.join(', ')}
        </div>
        {/* Publishers */}
        <div>
          <span className="font-medium">Publishers:</span> {publishers?.join(', ')}
        </div>
        {/* Release Date */}
        <div>
          <span className="font-medium">Release Date:</span> {releaseDate?.date || "Unknown"}
        </div>
      </div>

      {/* Requirements Table */}
      <table className="w-full border-collapse rounded-md">
        <thead>
          <tr className="text-left text-sm text-muted-foreground">
            <th scope="col" className="px-3 py-2 font-medium">
              Component
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              Your PC
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              Minimum
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              Recommended
            </th>
          </tr>
        </thead>
        <tbody className="text-sm">
          <Row label="CPU" user={user.cpu} min={minimum.cpu} rec={recommended.cpu} status={cpuStatus} />
          <Row label="GPU" user={user.gpu} min={minimum.gpu} rec={recommended.gpu} status={gpuStatus} />
          <Row
            label="RAM"
            user={`${user.ramGB} GB`}
            min={`${minimum.ramGB} GB`}
            rec={`${recommended.ramGB} GB`}
            status={ramStatus}
          />
          <Row
            label="Storage"
            user={`${user.storageGB} GB free`}
            min={`${minimum.storageGB} GB`}
            rec={`${recommended.storageGB} GB`}
            status={storageStatus}
          />
          <Row
            label="OS"
            user={`${user.os === "Darwin" ? "macOS" : user.os} ${user.osVersion}`}
            min={minimum.os}
            rec={recommended.os}
            status={osStatus}
          />
          <Row
            label="DirectX"
            user={user.dxVersion}
            min={minimum.dxVersion}
            rec={recommended.dxVersion}
            status={dxStatus}
          />
        </tbody>
      </table>

      <p className="mt-4 text-xs text-muted-foreground">
        Tip: RAM, storage, and DirectX are checked numerically. CPU/GPU/OS checks use simple heuristics; treat “unknown”
        as a hint to verify manually or enrich the comparator with benchmark data.
      </p>
    </SimpleCard>
  )
}

function Row({ label, user, min, rec, status }) {
  const sr = status === "pass" ? "Meets minimum" : status === "fail" ? "Below minimum" : "Unknown – verify manually"
  return (
    <tr className="border-b border-border last:border-b-0">
      <th scope="row" className="whitespace-nowrap px-3 py-3 text-foreground">
        {label}
      </th>
      <td className="px-3 py-3">
        <span className="inline-flex items-center">
          {statusIcon(status)}
          <span className="sr-only">{sr}: </span>
          {user}
        </span>
      </td>
      <td className="px-3 py-3">{min}</td>
      <td className="px-3 py-3">{rec}</td>
    </tr>
  )
}
