import { cn } from "../lib/utils"

function SimpleCard({
  title,
  description,
  action,
  footer,
  className,
  headerClassName,
  contentClassName,
  footerClassName,
  children,
  ...props
}) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-white text-gray-900 flex flex-col gap-6 rounded-xl border border-gray-200 py-6 shadow-sm",
        className
      )}
      {...props}
    >
      {(title || description || action) && (
        <div
          data-slot="card-header"
          className={cn(
            "grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6",
            headerClassName
          )}
        >
          <div data-slot="card-title" className="leading-none font-semibold">
            {title}
          </div>
          {description && (
            <div data-slot="card-description" className="text-gray-500 text-sm">
              {description}
            </div>
          )}
          {action && (
            <div
              data-slot="card-action"
              className="col-start-2 row-span-2 row-start-1 self-start justify-self-end"
            >
              {action}
            </div>
          )}
        </div>
      )}

      <div data-slot="card-content" className={cn("px-6", contentClassName)}>
        {children}
      </div>

      {footer && (
        <div data-slot="card-footer" className={cn("flex items-center px-6 pt-6", footerClassName)}>
          {footer}
        </div>
      )}
    </div>
  )
}

function Card({ className, ...props }) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-white text-gray-900 flex flex-col gap-6 rounded-xl border border-gray-200 py-6 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }) {
  return (
    <div
      data-slot="card-header"
      className={cn("grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pb-6", className)}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }) {
  return <div data-slot="card-title" className={cn("leading-none font-semibold", className)} {...props} />
}

function CardDescription({ className, ...props }) {
  return <div data-slot="card-description" className={cn("text-gray-500 text-sm", className)} {...props} />
}

function CardAction({ className, ...props }) {
  return (
    <div
      data-slot="card-action"
      className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }) {
  return <div data-slot="card-content" className={cn("px-6", className)} {...props} />
}

function CardFooter({ className, ...props }) {
  return <div data-slot="card-footer" className={cn("flex items-center px-6 pt-6", className)} {...props} />
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent, SimpleCard }
