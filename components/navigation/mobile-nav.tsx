"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, BarChart3, Settings, Home } from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard", label: "Calendar", icon: Calendar },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:hidden">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-3 px-2 text-xs font-medium transition-colors ${
                isActive ? "text-primary border-t-2 border-primary" : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label={item.label}
            >
              <Icon className="w-6 h-6 mb-1" />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
