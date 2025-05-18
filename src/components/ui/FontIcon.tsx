import * as React from "react"

export const FontIcon = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
  ({ className, ...props }, ref) => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        ref={ref}
        {...props}
      >
        <path d="M17 3v12h-5m5 0H7m5 0v12"/>
      </svg>
    )
  }
)
FontIcon.displayName = "FontIcon"
