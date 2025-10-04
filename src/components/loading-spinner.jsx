export default function LoadingSpinner({ size = 20, className }) {
  const dim = `${size}px`

  return (
    <span
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className={[
        "inline-block animate-spin rounded-full border-2",
        "border-gray-300 border-t-blue-500",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ width: dim, height: dim }}
    />
  )
}
