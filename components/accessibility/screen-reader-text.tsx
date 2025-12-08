import type React from "react"
export function ScreenReaderText({ children }: { children: React.ReactNode }) {
  return <span className="sr-only">{children}</span>
}

export function VisuallyHidden({ children }: { children: React.ReactNode }) {
  return <span className="absolute w-1 h-1 p-0 -m-1 overflow-hidden clip-path-inset">{children}</span>
}
