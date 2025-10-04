/* eslint-disable react-refresh/only-export-components */
import * as React from "react"
import { cn } from "../lib/utils"

const BASE =
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium " +
  "transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

const VARIANTS = {
  default: "bg-blue-500 text-white hover:bg-blue-600",
  secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
  outline: "border border-gray-300 bg-white hover:bg-gray-50 hover:text-gray-900",
  ghost: "bg-transparent hover:bg-gray-50 hover:text-gray-900",
  destructive: "bg-red-500 text-white hover:bg-red-600",
  link: "text-blue-500 underline-offset-2 hover:underline",
}

const SIZES = {
  default: "h-9 px-4 py-2",
  sm: "h-8 px-3 text-xs",
  lg: "h-10 px-8",
  icon: "h-9 w-9 p-0",
}

export function buttonVariants({ variant = "default", size = "default", className } = {}) {
  return cn(BASE, VARIANTS[variant] ?? VARIANTS.default, SIZES[size] ?? SIZES.default, className)
}

export const Button = React.forwardRef(function Button(
  { className, variant = "default", size = "default", ...props },
  ref
) {
  return <button className={buttonVariants({ variant, size, className })} ref={ref} {...props} />
})
