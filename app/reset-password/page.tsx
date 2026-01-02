"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { AlertCircle, Calendar, Check } from "lucide-react"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isValidToken, setIsValidToken] = useState(true)
  const supabase = getSupabaseClient()

  useEffect(() => {
    // Check if user is logged in via reset link
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        setIsValidToken(false)
      }
    }

    checkAuth()
  }, [supabase])

  const passwordsMatch = password === confirmPassword && password.length > 0
  const passwordLengthValid = password.length >= 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasNumbers = /[0-9]/.test(password)
  const isFormValid = password && confirmPassword && passwordsMatch && passwordLengthValid && hasUpperCase && hasNumbers

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!passwordsMatch) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) {
        setError(updateError.message)
      } else {
        setSuccess(true)
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <Card className="border border-border bg-card p-8">
            <h1 className="text-2xl font-bold text-foreground mb-4">Enlace Invalido o Expirado</h1>
            <p className="text-muted-foreground mb-6">
              Este enlace de restablecimiento de contraseña no es válido o ha expirado. Por favor, solicita un nuevo enlace.
            </p>
            <Button onClick={() => router.push("/forgot-password")} className="w-full bg-primary hover:bg-primary/90">
              Solicitar Nuevo Enlace
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Calendar className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-foreground">Equilibria</span>
        </div>

        <Card className="border border-border bg-card p-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Escriba una nueva contraseña</h1>
          <p className="text-muted-foreground mb-6">Ingrese su nueva contraseña a continuación.</p>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-md flex gap-2 items-start">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100/10 border border-green-300/30 rounded-md flex gap-2 items-start">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-600">¡Contraseña actualizada exitosamente! Redirigiendo...</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                Nueva Contraseña
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || success}
                required
              />
              <div className="mt-2 space-y-1 text-xs">
                <p className="flex items-center gap-2">
                  {passwordLengthValid ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <span className="w-4 h-4 text-muted-foreground">○</span>
                  )}
                  <span className={passwordLengthValid ? "text-green-600" : "text-muted-foreground"}>
                    Almenos 8 caracteres
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  {hasUpperCase ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <span className="w-4 h-4 text-muted-foreground">○</span>
                  )}
                  <span className={hasUpperCase ? "text-green-600" : "text-muted-foreground"}>
                    Al menos una letra mayúscula
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  {hasNumbers ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <span className="w-4 h-4 text-muted-foreground">○</span>
                  )}
                  <span className={hasNumbers ? "text-green-600" : "text-muted-foreground"}>Al menos un número</span>
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1">
                Confirmar Contraseña
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading || success}
                required
              />
              {confirmPassword && (
                <p className="mt-2 text-xs flex items-center gap-2">
                  {passwordsMatch ? (
                    <>
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-green-600">Las Contraseñas Coinciden</span>
                    </>
                  ) : (
                    <>
                      <span className="w-4 h-4 text-destructive">✕</span>
                      <span className="text-destructive">Las Contraseñas no coinciden</span>
                    </>
                  )}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={loading || success || !isFormValid}
            >
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
