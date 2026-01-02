"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase-client"
import { DashboardHeader } from "@/components/dashboard/header"

interface LayoutWithNavProps {
  children: React.ReactNode
}

export function LayoutWithNav({ children }: LayoutWithNavProps) {
    const router = useRouter()
    const supabase = getSupabaseClient()
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkAuthAndFetchData = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user) {
                router.push("/login")
                return
            }

            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();

            const { data: prefsData } = await supabase
                .from('user_preferences')
                .select('profile_picture_url')
                .eq('user_id', user.id)
                .single();
            
            setProfile({ ...user, ...profileData, ...prefsData });
            setLoading(false)
        }

        checkAuthAndFetchData()
    }, [supabase, router])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push("/")
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-muted-foreground">Cargando...</div>
            </div>
        )
    }

  return (
    <div>
        <DashboardHeader profile={profile} onLogout={handleLogout} />
        <main>
            {children}
        </main>
    </div>
  )
}
