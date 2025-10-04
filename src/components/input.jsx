import * as React from "react"
import { cn } from "../lib/utils"

const Input = React.forwardRef(function Input(
  { className, type = "text", ...props },
  ref
) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm placeholder-gray-400 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})

export { Input }
