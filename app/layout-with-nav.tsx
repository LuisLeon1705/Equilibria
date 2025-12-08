"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { MobileNav } from "@/components/navigation/mobile-nav"

interface LayoutWithNavProps {
  children: React.ReactNode
}

export function LayoutWithNav({ children }: LayoutWithNavProps) {
  const pathname = usePathname()
  const showNav = !["/login", "/signup", "/"].includes(pathname)

  return (
    <>
      {children}
      {showNav && <MobileNav />}
    </>
  )
}
