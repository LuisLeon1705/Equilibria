"use client"

import Link from "next/link"
import { Calendar, LogOut, BookOpen, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface DashboardHeaderProps {
  profile?: any
  onLogout: () => void
}

export function DashboardHeader({ profile, onLogout }: DashboardHeaderProps) {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Calendar className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">Equilibria</span>
        </Link>

        <nav className="hidden sm:flex items-center gap-6">
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Panel
          </Link>
          <Link href="/reports" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Reportes
          </Link>
          <Link
            href="/instructions"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <BookOpen className="w-4 h-4" />
            Guía
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={profile?.profile_picture_url} />
            <AvatarFallback>{profile?.full_name?.[0] || profile?.email?.[0]}</AvatarFallback>
          </Avatar>
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">{profile?.full_name || profile?.email}</p>
            <p className="text-xs text-muted-foreground">{profile?.field_of_study || 'Estudiante-Trabajador'}</p>
          </div>
          <Link href="/profile">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <Settings className="w-4 h-4" />
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={onLogout} className="text-muted-foreground hover:text-foreground">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
